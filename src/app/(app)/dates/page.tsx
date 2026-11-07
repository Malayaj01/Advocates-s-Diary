import Link from "next/link";
import { getDatesData } from "@/server/queries";
import { getT } from "@/i18n/server";
import { fmtDay, monthShort, shortDate } from "@/i18n/format";
import { keyFromDay } from "@/lib/dates";
import { DateStamp, Empty, PageHeader, SectionTitle } from "@/components/ui";

export default async function DatesPage() {
  const { t, lang } = await getT();
  const { upcoming, needsUpdate } = await getDatesData();

  // Group upcoming hearings by day, like pages of a diary.
  const days = new Map<string, typeof upcoming>();
  for (const h of upcoming) {
    const k = keyFromDay(h.date);
    days.set(k, [...(days.get(k) ?? []), h]);
  }

  return (
    <>
      <PageHeader title={t.nav.dates} />

      {needsUpdate.length > 0 && (
        <section className="mb-8 rounded-md border-2 border-red p-4">
          <h2 className="flex items-baseline justify-between text-[17px] font-bold text-red">
            {t.needsUpdate}
            <span className="figure text-[22px]">{needsUpdate.length}</span>
          </h2>
          <p className="text-[14px] text-ink-soft">{t.needsUpdateHint}</p>
          <ul className="ruled mt-3">
            {needsUpdate.map((c) => (
              <li key={c.id}>
                <Link
                  href={c.lastHearingId ? `/hearing/${c.lastHearingId}/done` : `/cases/${c.id}`}
                  className="flex items-center gap-3 py-3 active:bg-paper-deep"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[18px] font-bold">{c.title}</p>
                    {c.court && <p className="truncate text-[14px] text-ink-soft">{c.court}</p>}
                  </div>
                  {c.lastDate && <span className="figure text-[15px] text-ink-soft">{shortDate(c.lastDate, lang)}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {days.size === 0 && <Empty>-</Empty>}

      {[...days.entries()].map(([key, hearings]) => {
        const day = hearings[0].date;
        return (
          <section key={key} className="mb-6 flex gap-4">
            <DateStamp day={day.getUTCDate()} month={monthShort(day, lang)} />
            <div className="min-w-0 flex-1">
              <SectionTitle>{fmtDay(day, lang, { weekday: "long" })}</SectionTitle>
              <ul className="ruled">
                {hearings.map((h) => {
                  const meta = [h.case.court, h.purpose].filter(Boolean).join(" · ");
                  return (
                    <li key={h.id}>
                      <Link href={`/cases/${h.case.id}`} className="block py-2.5 active:bg-paper-deep">
                        <p className="truncate text-[17px] font-bold">{h.case.title}</p>
                        {meta && <p className="truncate text-[14px] text-ink-soft">{meta}</p>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        );
      })}
    </>
  );
}
