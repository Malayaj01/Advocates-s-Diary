import { IndianRupee, Plus, CalendarPlus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getHomeData, getMoneyTotals } from "@/server/queries";
import { getT } from "@/i18n/server";
import { fmtDay, weekday } from "@/i18n/format";
import { HearingRow } from "@/components/hearing-row";
import { Empty, LinkButton, Money, SectionTitle } from "@/components/ui";

export default async function HomePage() {
  const me = await requireUser();
  const { t, lang } = await getT();
  const [{ day, todayHearings, tomorrowHearings }, totals] = await Promise.all([
    getHomeData(),
    me.role === "ADMIN" ? getMoneyTotals() : null,
  ]);

  return (
    <>
      <header className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[17px] font-bold text-red">{weekday(day, lang)}</p>
          <h1 className="figure text-[34px] font-extrabold leading-none">
            {fmtDay(day, lang, { day: "numeric", month: "long" })}
          </h1>
        </div>
      </header>

      {totals && (
        <dl className="mt-6 grid grid-cols-2 border-y-2 border-ink">
          <div className="border-r border-rule py-3 pr-3">
            <dt className="text-[14px] font-bold uppercase tracking-wider text-ink-soft">{t.due}</dt>
            <dd><Money amount={totals.totalDue} owed className="text-[26px]" /></dd>
          </div>
          <div className="py-3 pl-4">
            <dt className="text-[14px] font-bold uppercase tracking-wider text-ink-soft">{t.collectedThisMonth}</dt>
            <dd><Money amount={totals.collectedThisMonth} className="text-[26px]" /></dd>
          </div>
        </dl>
      )}

      <SectionTitle right={<span className="figure text-[22px] font-extrabold">{todayHearings.length}</span>}>
        {t.today}
      </SectionTitle>
      {todayHearings.length ? (
        <ul className="ruled">
          {todayHearings.map((h) => (
            <HearingRow key={h.id} t={t} caseId={h.case.id} title={h.case.title} court={h.case.court} purpose={h.purpose} done={h.done} due={h.due} />
          ))}
        </ul>
      ) : (
        <Empty>{t.noHearingsToday}</Empty>
      )}

      <SectionTitle right={<span className="figure text-[18px] font-bold text-ink-soft">{tomorrowHearings.length}</span>}>
        {t.tomorrow}
      </SectionTitle>
      {tomorrowHearings.length ? (
        <ul className="ruled">
          {tomorrowHearings.map((h) => (
            <HearingRow key={h.id} t={t} caseId={h.case.id} title={h.case.title} court={h.case.court} purpose={h.purpose} done={h.done} due={h.due} />
          ))}
        </ul>
      ) : (
        <Empty>{t.noHearingsTomorrow}</Empty>
      )}

      <div className="h-20" aria-hidden />

      {/* The two things he does most, always within thumb reach. */}
      <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom)+12px)] z-10">
        <div className="mx-auto grid max-w-xl grid-cols-2 gap-3 pl-11 pr-5">
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
