import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarPlus, IndianRupee, Pencil, Plus, Trash2 } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { today } from "@/lib/dates";
import { getCase } from "@/server/queries";
import { deleteHearing, deletePayment } from "@/server/actions";
import { getT } from "@/i18n/server";
import { monthShort, shortDate } from "@/i18n/format";
import { ContactButtons } from "@/components/contact-buttons";
import { ConfirmButton } from "@/components/form";
import { DateStamp, Empty, LinkButton, Money, PageHeader, SectionTitle, Stamp } from "@/components/ui";

export default async function CasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [me, { t, lang }, c] = await Promise.all([requireUser(), getT(), getCase(id)]);
  if (!c) notFound();

  const day = today();
  const pct = c.feeAgreed > 0 ? Math.min(100, Math.round((c.paid / c.feeAgreed) * 100)) : 0;
  const meta = [c.caseNumber, c.court].filter(Boolean).join(" · ");
  // The most recent past hearing still waiting for "what happened / next date".
  const pending = c.nextHearing ? null : (c.hearings.find((h) => !h.done && h.date < day) ?? null);

  return (
    <>
      <PageHeader
        title={c.title}
        back="/cases"
        action={
          <Link href={`/cases/${c.id}/edit`} className="grid h-11 w-11 place-items-center text-ink" aria-label={t.edit}>
            <Pencil size={22} />
          </Link>
        }
      />

      <div className="-mt-3 space-y-3">
        <p className="text-[17px] text-ink-soft">
          <Link href={`/clients/${c.client.id}`} className="font-bold text-ink underline decoration-rule underline-offset-4">
            {c.client.name}
          </Link>
          {meta && <span className="figure"> · {meta}</span>}
          {c.status !== "ACTIVE" && (
            <span className="ml-2">
              <Stamp tone={c.status === "DISPOSED" ? "ink" : "red"}>{t.statuses[c.status as keyof typeof t.statuses]}</Stamp>
            </span>
          )}
        </p>
        <ContactButtons phone={c.client.phone} t={t} />
      </div>

      {/* Fee ledger */}
      <section className="card mt-5 p-4">
        <dl className="grid grid-cols-3 text-center">
          <div>
            <dt className="text-[13px] font-bold uppercase tracking-wider text-ink-soft">{t.fee}</dt>
            <dd><Money amount={c.feeAgreed} className="text-[20px]" /></dd>
          </div>
          <div className="border-x border-rule">
            <dt className="text-[13px] font-bold uppercase tracking-wider text-ink-soft">{t.paid}</dt>
            <dd><Money amount={c.paid} className="text-[20px] text-green" /></dd>
          </div>
          <div>
            <dt className="text-[13px] font-bold uppercase tracking-wider text-ink-soft">{t.due}</dt>
            <dd><Money amount={c.due} owed={c.due > 0} className="text-[20px]" /></dd>
          </div>
        </dl>
        {c.feeAgreed > 0 && (
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-paper-deep" aria-hidden>
            <div className="h-full bg-green" style={{ width: `${pct}%` }} />
          </div>
        )}
      </section>

      {/* Next date */}
      <section className="mt-4">
        {pending ? (
          <Link
            href={`/hearing/${pending.id}/done`}
            className="flex items-center gap-4 rounded-2xl border-2 border-red/40 bg-red/5 p-4 active:bg-red/10"
          >
            <DateStamp day={pending.date.getUTCDate()} month={monthShort(pending.date, lang)} muted />
            <div className="flex-1">
              <p className="text-[18px] font-bold text-red">{t.needsUpdate}</p>
              <p className="text-[15px] text-ink-soft">{t.needsUpdateHint}</p>
            </div>
          </Link>
        ) : c.nextHearing ? (
          <div className="card flex items-center gap-4 p-4">
            <DateStamp day={c.nextHearing.date.getUTCDate()} month={monthShort(c.nextHearing.date, lang)} />
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-bold uppercase tracking-wider text-ink-soft">{t.nextDate}</p>
              <p className="truncate text-[19px] font-bold">{c.nextHearing.purpose || shortDate(c.nextHearing.date, lang)}</p>
            </div>
            <Link href={`/hearing/${c.nextHearing.id}/done`} className="rounded-md border-2 border-ink px-3 py-2 font-bold">
              {t.markDone}
            </Link>
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-rule px-4 py-4 text-center text-[17px] text-ink-faint">{t.noNextDate}</p>
        )}
      </section>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <LinkButton href={`/payment/new?case=${c.id}`} variant="primary">
          <Plus size={20} strokeWidth={3} />
          <IndianRupee size={20} strokeWidth={2.5} />
          {t.addPayment}
        </LinkButton>
        <LinkButton href={`/hearing/new?case=${c.id}`}>
          <CalendarPlus size={22} />
          {t.addHearing}
        </LinkButton>
      </div>

      {/* Payments */}
      <SectionTitle>{t.payments}</SectionTitle>
      {c.payments.length ? (
        <ul className="card-list">
          {c.payments.map((p) => (
            <li key={p.id} className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="figure text-[17px] font-bold">{shortDate(p.paidOn, lang)}</p>
                <p className="truncate text-[14px] text-ink-soft">
                  {t.modes[p.mode as keyof typeof t.modes]}
                  {p.note && ` · ${p.note}`}
                  {p.receivedBy && ` · ${p.receivedBy.name}`}
                </p>
              </div>
              <Money amount={p.amount} className="text-[19px] text-green" />
              {me.role === "ADMIN" && (
                <form action={deletePayment}>
                  <input type="hidden" name="id" value={p.id} />
                  <ConfirmButton className="grid h-10 w-8 place-items-center text-ink-faint">
                    <Trash2 size={18} aria-label={t.delete} />
                  </ConfirmButton>
                </form>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <Empty>—</Empty>
      )}

      {/* Hearing history */}
      <SectionTitle>{t.hearings}</SectionTitle>
      {c.hearings.length ? (
        <ul className="card-list">
          {c.hearings.map((h) => (
            <li key={h.id} className="flex items-center gap-3 py-3">
              <DateStamp day={h.date.getUTCDate()} month={monthShort(h.date, lang)} muted={h.date < day} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[17px] font-bold">{h.purpose || "—"}</p>
                {h.outcome && <p className="text-[15px] text-ink-soft">{h.outcome}</p>}
              </div>
              {h.done ? (
                <Stamp tone="green">{t.done}</Stamp>
              ) : (
                <form action={deleteHearing}>
                  <input type="hidden" name="id" value={h.id} />
                  <ConfirmButton className="grid h-10 w-8 place-items-center text-ink-faint">
                    <Trash2 size={18} aria-label={t.delete} />
                  </ConfirmButton>
                </form>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <Empty>—</Empty>
      )}

      {c.notes && (
        <>
          <SectionTitle>{t.notes}</SectionTitle>
          <p className="whitespace-pre-wrap text-[17px]">{c.notes}</p>
        </>
      )}
    </>
  );
}
