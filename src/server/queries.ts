import "server-only";
import { db } from "@/lib/db";
import { addDays, startOfMonth, today } from "@/lib/dates";

// Read-side of the app. Every page gets its data from here so the
// pages themselves stay free of query details.

export type CaseFilter = "all" | "active" | "due" | "disposed";

const isPostgres = (process.env.DATABASE_URL ?? "").startsWith("postgres");

/** Case-insensitive "contains" filter that works on both SQLite and Postgres. */
function like(term: string) {
  return isPostgres ? { contains: term, mode: "insensitive" as const } : { contains: term };
}

/** Sum of payments per case, as a Map<caseId, rupees>. */
async function paidByCase(caseIds?: string[]) {
  const rows = await db.payment.groupBy({
    by: ["caseId"],
    _sum: { amount: true },
    where: caseIds ? { caseId: { in: caseIds } } : undefined,
  });
  return new Map(rows.map((r) => [r.caseId, r._sum.amount ?? 0]));
}

function dueOf(feeAgreed: number, paid: number) {
  return Math.max(feeAgreed - paid, 0);
}

/** Active cases whose last hearing has passed and no next date is set. */
function staleCaseWhere(day: Date) {
  return { status: "ACTIVE", hearings: { some: {}, none: { date: { gte: day } } } };
}

// ---------- Home ----------

export async function getHomeData() {
  const day = today();
  const tomorrow = addDays(day, 1);

  const hearings = await db.hearing.findMany({
    where: { date: { gte: day, lt: addDays(day, 2) } },
    orderBy: [{ date: "asc" }, { createdAt: "asc" }],
    include: {
      case: { select: { id: true, title: true, court: true, caseNumber: true, feeAgreed: true } },
    },
  });

  const [paid, needsUpdateCount, activeCount] = await Promise.all([
    paidByCase([...new Set(hearings.map((h) => h.caseId))]),
    db.case.count({ where: staleCaseWhere(day) }),
    db.case.count({ where: { status: "ACTIVE" } }),
  ]);
  const withDue = hearings.map((h) => ({
    ...h,
    due: h.case.feeAgreed > 0 ? dueOf(h.case.feeAgreed, paid.get(h.caseId) ?? 0) : undefined,
  }));

  return {
    day,
    needsUpdateCount,
    activeCount,
    todayHearings: withDue.filter((h) => h.date < tomorrow),
    tomorrowHearings: withDue.filter((h) => h.date >= tomorrow),
  };
}

/** Money totals — only shown to the advocate (admin). */
export async function getMoneyTotals() {
  const [cases, paid, month] = await Promise.all([
    db.case.findMany({ where: { status: { not: "DISPOSED" } }, select: { id: true, feeAgreed: true } }),
    paidByCase(),
    db.payment.aggregate({ _sum: { amount: true }, where: { paidOn: { gte: startOfMonth(today()) } } }),
  ]);
  const totalDue = cases.reduce((sum, c) => sum + dueOf(c.feeAgreed, paid.get(c.id) ?? 0), 0);
  return { totalDue, collectedThisMonth: month._sum.amount ?? 0 };
}

// ---------- Cases ----------

export async function listCases({ q = "", filter = "active" }: { q?: string; filter?: CaseFilter }) {
  const term = q.trim();
  const cases = await db.case.findMany({
    where: {
      ...(filter === "active" || filter === "due" ? { status: { not: "DISPOSED" } } : {}),
      ...(filter === "disposed" ? { status: "DISPOSED" } : {}),
      ...(term
        ? {
            OR: [
              { title: like(term) },
              { caseNumber: like(term) },
              { opposingParty: like(term) },
              { client: { name: like(term) } },
            ],
          }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
    include: {
      client: { select: { name: true } },
      hearings: { where: { date: { gte: today() } }, orderBy: { date: "asc" }, take: 1, select: { date: true } },
    },
  });

  const paid = await paidByCase(cases.map((c) => c.id));
  const rows = cases.map((c) => ({
    id: c.id,
    title: c.title,
    caseNumber: c.caseNumber,
    court: c.court,
    status: c.status,
    clientName: c.client.name,
    nextDate: c.hearings[0]?.date ?? null,
    fee: c.feeAgreed,
    due: dueOf(c.feeAgreed, paid.get(c.id) ?? 0),
  }));

  return filter === "due" ? rows.filter((r) => r.due > 0).sort((a, b) => b.due - a.due) : rows;
}

export async function getCase(id: string) {
  const c = await db.case.findUnique({
    where: { id },
    include: {
      client: true,
      hearings: { orderBy: { date: "desc" } },
      payments: { orderBy: [{ paidOn: "desc" }, { createdAt: "desc" }], include: { receivedBy: { select: { name: true } } } },
    },
  });
  if (!c) return null;

  const paid = c.payments.reduce((s, p) => s + p.amount, 0);
  const day = today();
  const upcoming = c.hearings.filter((h) => h.date >= day && !h.done).sort((a, b) => +a.date - +b.date);

  return {
    ...c,
    paid,
    due: dueOf(c.feeAgreed, paid),
    nextHearing: upcoming[0] ?? null,
  };
}

/** Active cases for the "which case?" picker. */
export async function pickCases(q: string) {
  return listCases({ q, filter: "active" });
}

// ---------- Dates ----------

export async function getDatesData() {
  const day = today();

  const upcoming = await db.hearing.findMany({
    where: { date: { gte: day }, case: { status: { not: "DISPOSED" } } },
    orderBy: { date: "asc" },
    take: 200,
    include: { case: { select: { id: true, title: true, court: true } } },
  });

  const stale = await db.case.findMany({
    where: staleCaseWhere(day),
    include: { hearings: { orderBy: { date: "desc" }, take: 1, select: { id: true, date: true } } },
    orderBy: { updatedAt: "asc" },
  });

  return {
    upcoming,
    needsUpdate: stale.map((c) => ({
      id: c.id,
      title: c.title,
      court: c.court,
      lastHearingId: c.hearings[0]?.id ?? null,
      lastDate: c.hearings[0]?.date ?? null,
    })),
  };
}

// ---------- Clients ----------

export async function listClients(q = "") {
  const term = q.trim();
  const clients = await db.client.findMany({
    where: term ? { OR: [{ name: like(term) }, { phone: like(term) }] } : undefined,
    orderBy: { name: "asc" },
    include: { cases: { select: { id: true, feeAgreed: true, status: true } } },
  });

  const paid = await paidByCase(clients.flatMap((c) => c.cases.map((k) => k.id)));
  return clients.map((c) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    caseCount: c.cases.length,
    due: c.cases.reduce((s, k) => s + dueOf(k.feeAgreed, paid.get(k.id) ?? 0), 0),
  }));
}

export async function getClient(id: string) {
  const client = await db.client.findUnique({ where: { id } });
  if (!client) return null;
  const cases = await db.case.findMany({
    where: { clientId: id },
    orderBy: { updatedAt: "desc" },
    include: { hearings: { where: { date: { gte: today() } }, orderBy: { date: "asc" }, take: 1, select: { date: true } } },
  });
  const paid = await paidByCase(cases.map((c) => c.id));
  const rows = cases.map((c) => ({
    id: c.id,
    title: c.title,
    caseNumber: c.caseNumber,
    court: c.court,
    status: c.status,
    clientName: client.name,
    nextDate: c.hearings[0]?.date ?? null,
    fee: c.feeAgreed,
    due: dueOf(c.feeAgreed, paid.get(c.id) ?? 0),
  }));
  return { client, cases: rows, totalDue: rows.reduce((s, r) => s + r.due, 0) };
}

export async function clientOptions() {
  return db.client.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, phone: true } });
}

// ---------- Team & activity ----------

export async function listUsers() {
  return db.user.findMany({
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    select: { id: true, name: true, username: true, role: true, active: true },
  });
}

export async function recentActivity(take = 30) {
  return db.activity.findMany({
    orderBy: { createdAt: "desc" },
    take,
    include: { user: { select: { name: true } } },
  });
}

export async function hasAnyUser() {
  return (await db.user.count()) > 0;
}
