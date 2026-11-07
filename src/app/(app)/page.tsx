import Link from "next/link";
import { AlertTriangle, CalendarPlus, ChevronRight, IndianRupee, Plus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getHomeData, getMoneyTotals } from "@/server/queries";
import { getT } from "@/i18n/server";
import { fmtDay, weekday } from "@/i18n/format";
import { rupees } from "@/lib/money";
import { HearingCard } from "@/components/hearing-row";
import { LinkButton } from "@/components/ui";

export default async function HomePage() {
  const me = await requireUser();
  const { t, lang } = await getT();
  const [home, totals] = await Promise.all([getHomeData(), me.role === "ADMIN" ? getMoneyTotals() : null]);
  const { day, todayHearings, tomorrowHearings, needsUpdateCount, activeCount } = home;
  const firstName = me.name.replace(/^Adv\.?\s*/i, "");

  return (
    <>
      {/* Greeting and date */}
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[16px] text-ink-soft">
            {t.hello}, {firstName}
          </p>
          <h1 className="figure mt-1 text-[32px] font-extrabold leading-none">
            {fmtDay(day, lang, { day: "numeric", month: "long" })}
          </h1>
          <p className="mt-1 text-[17px] font-bold text-red">{weekday(day, lang)}</p>
        </div>
        <Link
          href="/more"
          className="figure grid h-12 w-12 shrink-0 place-items-center rounded-full bg-ink text-[20px] font-bold text-paper"
          aria-label={t.nav.more}
        >
          {firstName.charAt(0).toUpperCase()}
        </Link>
      </header>

      {/* Money summary — advocate only */}
      {totals && (
        <section className="mt-5 rounded-2xl bg-ink p-5 text-paper shadow-[0_10px_24px_-14px_rgb(29_43_79/0.8)]">
          <p className="flex items-center gap-2 text-[15px] font-medium opacity-80">
            <span className="h-2.5 w-2.5 rounded-full bg-[#e0786f]" />
            {t.due}
          </p>
          <p className="figure mt-1 text-[38px] font-extrabold leading-tight">{rupees(totals.totalDue)}</p>
          <div className="mt-4 grid grid-cols-2 border-t border-white/15 pt-3">
            <div>
              <p className="text-[14px] opacity-70">{t.collectedThisMonth}</p>
              <p className="figure text-[20px] font-bold">{rupees(totals.collectedThisMonth)}</p>
            </div>
            <div className="border-l border-white/15 pl-4">
              <p className="text-[14px] opacity-70">{t.activeCases}</p>
              <p className="figure text-[20px] font-bold">{activeCount}</p>
            </div>
          </div>
        </section>
      )}

      {/* Cases waiting for a next date */}
      {needsUpdateCount > 0 && (
        <Link
          href="/dates"
          className="mt-4 flex items-center gap-3 rounded-2xl border-2 border-red/40 bg-red/5 p-4 active:scale-[0.99]"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-red text-paper">
            <AlertTriangle size={20} />
          </span>
          <p className="flex-1 text-[17px] font-bold text-red">
            <span className="figure text-[20px]">{needsUpdateCount}</span> {t.casesNeedUpdate}
          </p>
          <ChevronRight size={22} className="text-red" />
        </Link>
      )}

      {/* Today */}
      <Section title={t.today} count={todayHearings.length} strong />
      {todayHearings.length ? (
        <ul className="space-y-3">
          {todayHearings.map((h) => (
            <HearingCard key={h.id} t={t} caseId={h.case.id} title={h.case.title} court={h.case.court} purpose={h.purpose} done={h.done} due={h.due} />
          ))}
        </ul>
      ) : (
        <EmptyCard>{t.noHearingsToday}</EmptyCard>
      )}

      {/* Tomorrow */}
      <Section title={t.tomorrow} count={tomorrowHearings.length} />
      {tomorrowHearings.length ? (
        <ul className="space-y-3">
          {tomorrowHearings.map((h) => (
            <HearingCard key={h.id} t={t} caseId={h.case.id} title={h.case.title} court={h.case.court} purpose={h.purpose} done={h.done} due={h.due} />
          ))}
        </ul>
      ) : (
        <EmptyCard>{t.noHearingsTomorrow}</EmptyCard>
      )}

      <div className="h-20" aria-hidden />

      {/* The two things he does most, always within thumb reach. */}
      <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom)+12px)] z-10">
        <div className="mx-auto grid max-w-xl grid-cols-2 gap-3 px-4">
          <LinkButton href="/payment/new" variant="primary">
            <Plus size={20} strokeWidth={3} />
            <IndianRupee size={20} strokeWidth={2.5} />
            {t.addPayment}
          </LinkButton>
          <LinkButton href="/hearing/new">
            <CalendarPlus size={22} />
            {t.addHearing}
          </LinkButton>
        </div>
      </div>
    </>
  );
}

function Section({ title, count, strong }: { title: string; count: number; strong?: boolean }) {
  return (
    <div className="mb-3 mt-7 flex items-center gap-2">
      <h2 className={`text-[20px] font-bold ${strong ? "text-ink" : "text-ink-soft"}`}>{title}</h2>
      <span
        className={`figure grid h-7 min-w-7 place-items-center rounded-full px-2 text-[15px] font-bold ${
          strong ? "bg-ink text-paper" : "bg-paper-deep text-ink-soft"
        }`}
      >
        {count}
      </span>
    </div>
  );
}

function EmptyCard({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl border border-dashed border-rule px-4 py-5 text-center text-[17px] text-ink-faint">
      {children}
    </p>
  );
}
