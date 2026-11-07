import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { todayKey } from "@/lib/dates";
import { getT } from "@/i18n/server";
import { monthShort } from "@/i18n/format";
import { DateStamp, PageHeader } from "@/components/ui";
import { CompleteForm } from "./complete-form";

/** After a hearing: what happened, and when is the next date. */
export default async function HearingDonePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [{ t, lang }, h] = await Promise.all([
    getT(),
    db.hearing.findUnique({ where: { id }, include: { case: { select: { id: true, title: true } } } }),
  ]);
  if (!h) notFound();

  return (
    <>
      <PageHeader title={t.markDone} back={`/cases/${h.case.id}`} />
      <div className="-mt-2 mb-7 flex items-center gap-3 border-b border-rule pb-3">
        <DateStamp day={h.date.getUTCDate()} month={monthShort(h.date, lang)} muted />
        <div className="min-w-0">
          <p className="truncate text-[18px] font-bold">{h.case.title}</p>
          {h.purpose && <p className="text-[15px] text-ink-soft">{h.purpose}</p>}
        </div>
      </div>
      <CompleteForm hearingId={h.id} todayKey={todayKey()} />
    </>
  );
}
