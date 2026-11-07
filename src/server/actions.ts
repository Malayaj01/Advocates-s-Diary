"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { endSession, requireAdmin, requireUser, startSession } from "@/lib/auth";
import { dayFromKey, isValidDayKey } from "@/lib/dates";
import { rupees } from "@/lib/money";
import { LANG_COOKIE } from "@/i18n/server";
import { hasAnyUser } from "./queries";

// Write-side of the app. Every mutation validates input, checks the
// user's role, records an activity line, and redirects back with ?saved=1.

/** Error keys map to entries in the dictionary, so the UI can translate them. */
export type ActionState = { error?: "required" | "invalidAmount" | "wrongLogin" | "usernameTaken" } | undefined;

// ---------- helpers ----------

const text = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : v))
  .nullable()
  .optional();

const requiredText = z.string().trim().min(1);

const dayKey = z.string().refine(isValidDayKey);

const rupeeAmount = z.coerce.number().int().positive().max(100_000_000);

function form(fd: FormData) {
  return Object.fromEntries(fd.entries()) as Record<string, string>;
}

async function log(userId: string, action: string, detail: string) {
  await db.activity.create({ data: { userId, action, detail } });
}

function done(path: string): never {
  revalidatePath("/", "layout");
  redirect(`${path}${path.includes("?") ? "&" : "?"}saved=1`);
}

// ---------- auth ----------

export async function login(_: ActionState, fd: FormData): Promise<ActionState> {
  const { username, password } = form(fd);
  const user = await db.user.findUnique({ where: { username: (username ?? "").trim().toLowerCase() } });
  const ok = user?.active && (await bcrypt.compare(password ?? "", user.passwordHash));
  if (!user || !ok) return { error: "wrongLogin" };

  await startSession({ uid: user.id, name: user.name, role: user.role === "ADMIN" ? "ADMIN" : "JUNIOR" });
  redirect("/");
}

/** First run only: create the advocate's (admin) account. */
export async function setupAdmin(_: ActionState, fd: FormData): Promise<ActionState> {
  if (await hasAnyUser()) redirect("/login");

  const parsed = z
    .object({ name: requiredText, username: requiredText, password: z.string().min(6) })
    .safeParse(form(fd));
  if (!parsed.success) return { error: "required" };

  const user = await db.user.create({
    data: {
      name: parsed.data.name,
      username: parsed.data.username.toLowerCase(),
      passwordHash: await bcrypt.hash(parsed.data.password, 10),
      role: "ADMIN",
    },
  });
  await startSession({ uid: user.id, name: user.name, role: "ADMIN" });
  redirect("/");
}

export async function logout() {
  await endSession();
  redirect("/login");
}

export async function setLanguage(lang: "hi" | "en") {
  const store = await cookies();
  store.set(LANG_COOKIE, lang, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  revalidatePath("/", "layout");
}

// ---------- clients ----------

const clientSchema = z.object({
  name: requiredText,
  phone: text,
  altPhone: text,
  address: text,
  notes: text,
});

export async function saveClient(_: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requireUser();
  const parsed = clientSchema.safeParse(form(fd));
  if (!parsed.success) return { error: "required" };

  const id = fd.get("id")?.toString();
  const client = id
    ? await db.client.update({ where: { id }, data: parsed.data })
    : await db.client.create({ data: parsed.data });

  await log(me.uid, id ? "CLIENT_UPDATED" : "CLIENT_ADDED", client.name);
  done(`/clients/${client.id}`);
}

// ---------- cases ----------

const caseSchema = z.object({
  title: requiredText,
  caseNumber: text,
  cnr: text,
  court: text,
  caseType: z.enum(["CIVIL", "CRIMINAL", "FAMILY", "REVENUE", "CONSUMER", "OTHER"]).default("CIVIL"),
  side: z.enum(["PETITIONER", "RESPONDENT"]).nullable().optional().catch(null),
  opposingParty: text,
  status: z.enum(["ACTIVE", "DISPOSED", "ON_HOLD"]).default("ACTIVE"),
  feeAgreed: z.coerce.number().int().min(0).max(100_000_000).catch(0),
  notes: text,
});

export async function saveCase(_: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requireUser();
  const data = form(fd);
  const parsed = caseSchema.safeParse(data);
  if (!parsed.success) return { error: "required" };

  // Either pick an existing client or type a new one's name (+ phone).
  let clientId = data.clientId?.trim();
  if (!clientId && data.newClientName?.trim()) {
    const client = await db.client.create({
      data: { name: data.newClientName.trim(), phone: data.newClientPhone?.trim() || null },
    });
    await log(me.uid, "CLIENT_ADDED", client.name);
    clientId = client.id;
  }
  if (!clientId) return { error: "required" };

  const id = data.id?.trim();
  const saved = id
    ? await db.case.update({ where: { id }, data: { ...parsed.data, clientId } })
    : await db.case.create({ data: { ...parsed.data, clientId } });

  // A first hearing date can be given right when the case is created.
  if (!id && data.firstDate && isValidDayKey(data.firstDate)) {
    await db.hearing.create({ data: { caseId: saved.id, date: dayFromKey(data.firstDate), createdById: me.uid } });
  }

  await log(me.uid, id ? "CASE_UPDATED" : "CASE_ADDED", saved.title);
  done(`/cases/${saved.id}`);
}

// ---------- hearings ----------

const hearingSchema = z.object({
  caseId: requiredText,
  date: dayKey,
  purpose: text,
});

export async function addHearing(_: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requireUser();
  const parsed = hearingSchema.safeParse(form(fd));
  if (!parsed.success) return { error: "required" };

  const { caseId, date, purpose } = parsed.data;
  const c = await db.case.findUniqueOrThrow({ where: { id: caseId }, select: { title: true } });
  await db.hearing.create({ data: { caseId, date: dayFromKey(date), purpose, createdById: me.uid } });
  await db.case.update({ where: { id: caseId }, data: { updatedAt: new Date() } });

  await log(me.uid, "HEARING_ADDED", `${c.title} · ${date}`);
  done(`/cases/${caseId}`);
}

/**
 * After a hearing: note what happened and set the next date in one step.
 * The current hearing is marked done; a new one is created for the next date.
 */
export async function completeHearing(_: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requireUser();
  const parsed = z
    .object({ hearingId: requiredText, outcome: text, nextDate: dayKey.optional().or(z.literal("")), purpose: text })
    .safeParse(form(fd));
  if (!parsed.success) return { error: "required" };

  const { hearingId, outcome, nextDate, purpose } = parsed.data;
  const hearing = await db.hearing.update({
    where: { id: hearingId },
    data: { done: true, outcome },
    include: { case: { select: { title: true } } },
  });

  if (nextDate) {
    await db.hearing.create({
      data: { caseId: hearing.caseId, date: dayFromKey(nextDate), purpose, createdById: me.uid },
    });
  }
  await db.case.update({ where: { id: hearing.caseId }, data: { updatedAt: new Date() } });

  await log(me.uid, "HEARING_DONE", `${hearing.case.title}${nextDate ? ` → ${nextDate}` : ""}`);
  done(`/cases/${hearing.caseId}`);
}

export async function deleteHearing(fd: FormData) {
  const me = await requireUser();
  const id = String(fd.get("id") ?? "");
  const h = await db.hearing.delete({ where: { id }, include: { case: { select: { title: true } } } });
  await log(me.uid, "HEARING_DELETED", h.case.title);
  done(`/cases/${h.caseId}`);
}

// ---------- payments ----------

const paymentSchema = z.object({
  caseId: requiredText,
  amount: rupeeAmount,
  mode: z.enum(["CASH", "UPI", "CHEQUE", "BANK"]).default("CASH"),
  paidOn: dayKey,
  note: text,
});

export async function addPayment(_: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requireUser();
  const data = form(fd);
  data.amount = (data.amount ?? "").replace(/[,\s₹]/g, "");
  const parsed = paymentSchema.safeParse(data);
  if (!parsed.success) {
    const amountBad = parsed.error.issues.some((i) => i.path[0] === "amount");
    return { error: amountBad ? "invalidAmount" : "required" };
  }

  const { caseId, amount, mode, paidOn, note } = parsed.data;
  const c = await db.case.findUniqueOrThrow({ where: { id: caseId }, select: { title: true } });
  await db.payment.create({
    data: { caseId, amount, mode, paidOn: dayFromKey(paidOn), note, receivedById: me.uid },
  });
  await db.case.update({ where: { id: caseId }, data: { updatedAt: new Date() } });

  await log(me.uid, "PAYMENT_ADDED", `${rupees(amount)} · ${c.title}`);
  done(`/cases/${caseId}`);
}

/** Only the advocate can remove a payment entry. */
export async function deletePayment(fd: FormData) {
  const me = await requireAdmin();
  const id = String(fd.get("id") ?? "");
  const p = await db.payment.delete({ where: { id }, include: { case: { select: { title: true } } } });
  await log(me.uid, "PAYMENT_DELETED", `${rupees(p.amount)} · ${p.case.title}`);
  done(`/cases/${p.caseId}`);
}

// ---------- team ----------

export async function addJunior(_: ActionState, fd: FormData): Promise<ActionState> {
  const me = await requireAdmin();
  const parsed = z
    .object({ name: requiredText, username: requiredText, password: z.string().min(6) })
    .safeParse(form(fd));
  if (!parsed.success) return { error: "required" };

  const username = parsed.data.username.toLowerCase();
  if (await db.user.findUnique({ where: { username } })) return { error: "usernameTaken" };

  await db.user.create({
    data: {
      name: parsed.data.name,
      username,
      passwordHash: await bcrypt.hash(parsed.data.password, 10),
      role: "JUNIOR",
    },
  });
  await log(me.uid, "USER_ADDED", parsed.data.name);
  done("/more");
}

export async function toggleUser(fd: FormData) {
  const me = await requireAdmin();
  const id = String(fd.get("id") ?? "");
  if (id === me.uid) return; // never lock yourself out
  const user = await db.user.findUniqueOrThrow({ where: { id } });
  await db.user.update({ where: { id }, data: { active: !user.active } });
  await log(me.uid, user.active ? "USER_DISABLED" : "USER_ENABLED", user.name);
  done("/more");
}
