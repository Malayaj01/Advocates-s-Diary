import Link from "next/link";
import type { Dictionary, Lang } from "@/i18n/dictionary";
import { shortDate } from "@/i18n/format";
import { Money, Stamp } from "./ui";

export type CaseRowData = {
  id: string;
  title: string;
  caseNumber: string | null;
  court: string | null;
  status: string;
  clientName: string;
  nextDate: Date | null;
  fee: number;
  due: number;
};

/** One line in the case register. */
export function CaseRow({ c, t, lang, href }: { c: CaseRowData; t: Dictionary; lang: Lang; href?: string }) {
  const meta = [c.caseNumber, c.court].filter(Boolean).join(" · ");
  return (
    <li>
      <Link href={href ?? `/cases/${c.id}`} className="flex items-center gap-3 py-3.5 active:bg-paper-deep">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[19px] font-bold">{c.title}</p>
          <p className="truncate text-[15px] text-ink-soft">
            {meta || c.clientName}
            {c.nextDate && <span className="figure"> · {shortDate(c.nextDate, lang)}</span>}
          </p>
        </div>
        {c.status === "DISPOSED" ? (
          <Stamp>{t.statuses.DISPOSED}</Stamp>
        ) : c.due > 0 ? (
          <Money amount={c.due} owed className="text-[18px]" />
        ) : c.fee > 0 ? (
          <Stamp tone="green">{t.paid}</Stamp>
        ) : null}
      </Link>
    </li>
  );
}
