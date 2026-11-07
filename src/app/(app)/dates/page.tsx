import Link from "next/link";
import { AlertTriangle, ChevronRight } from "lucide-react";
import { getDatesData } from "@/server/queries";
import { getT } from "@/i18n/server";
import { fmtDay, monthShort, shortDate } from "@/i18n/format";
import { keyFromDay } from "@/lib/dates";
import { DateStamp, Empty, PageHeader } from "@/components/ui";

export default async function DatesPage() {
  const { t, lang } = await getT();
  const { upcoming, needsUpdate } = await getDatesData();

  // Group upcoming hearings by day, one card per day.
  const days = new Map<string, typeof upcoming>();
  for (const h of upcoming) {
    const k = keyFromDay(h.date);
    days.set(k, [...(days.get(k) ?? []), h]);
  }

  return (
    <>
      <PageHeader title={t.nav.dates} />

      {needsUpdate.length > 0 && (
        <section className="mb-6 overflow-hidden rounded-2xl border-2 border-red/40 bg-red/5">
          <div className="flex items-center gap-3 px-4 pb-2 pt-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-red text-paper">
              <AlertTriangle size={18} />
            </span>
            <div className="flex-1">
              <h2 className="text-[18px] font-bold text-red">{t.needsUpdate}</h2>
              <p className="text-[14px] text-ink-soft">{t.needsUpdateHint}</p>
            </div>
            <span className="figure text-[22px] font-extrabold text-red">{needsUpdate.length}</span>
          </div>
          <ul>
            {needsUpdate.map((c) => (
              <li key={c.id} className="border-t border-red/20">
                <Link
                  href={c.lastHearingId ? `/hearing/${c.lastHearingId}/done` : `/cases/${c.id}`}
                  className="flex items-center gap-3 px-4 py-3 active:bg-red/10"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[18px] font-bold">{c.title}</p>
                    <p className="figure truncate text-[14px] text-ink-soft">
                      {[c.court, c.lastDate && shortDate(c.lastDate, lang)].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <ChevronRight size={20} className="text-red" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {days.size === 0 && <Empty>-</Empty>}

      <div className="space-y-4">
        {[...days.entries()].map(([key, hearings]) => {
          const day = hearings[0].date;
          return (
            <section key={key} className="card overflow-hidden">
              <header className="flex items-center gap-3 border-b border-rule bg-paper-deep/50 px-4 py-3">
                <DateStamp day={day.getUTCDate()} month={monthShort(day, lang)} />
                <p className="flex-1 text-[18px] font-bold">{fmtDay(day, lang, { weekday: "long" })}</p>
                <span className="figure grid h-7 min-w-7 place-items-center rounded-full bg-ink px-2 text-[15px] font-bold text-paper">
                  {hearings.length}
                </span>
              </header>
              <ul>
                {hearings.map((h, i) => {
                  const meta = [h.case.court, h.purpose].filter(Boolean).join(" · ");
                  return (
                    <li key={h.id} className={i ? "border-t border-rule" : ""}>
                      <Link
                        href={`/cases/${h.case.id}`}
                        className="flex items-center gap-2 px-4 py-3 active:bg-paper-deep"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[18px] font-bold">{h.case.title}</p>
                          {meta && <p className="truncate text-[15px] text-ink-soft">{meta}</p>}
                        </div>
                        <ChevronRight size={20} className="text-ink-faint" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </>
  );
}
