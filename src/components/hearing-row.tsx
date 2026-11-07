import Link from "next/link";
import { ChevronRight, Landmark } from "lucide-react";
import { Money, Stamp } from "./ui";
import type { Dictionary } from "@/i18n/dictionary";

type Props = {
  t: Dictionary;
  caseId: string;
  title: string;
  court: string | null;
  purpose: string | null;
  done: boolean;
  due?: number;
};

/** A hearing as its own card: court on top, case name, purpose, money owed. */
export function HearingCard({ t, caseId, title, court, purpose, done, due }: Props) {
  return (
    <li>
      <Link href={`/cases/${caseId}`} className="card block p-4 transition active:scale-[0.99]">
        <div className="flex items-center justify-between gap-3">
          {court ? (
            <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-paper-deep px-2.5 py-0.5 text-[14px] font-medium text-ink-soft">
              <Landmark size={14} className="shrink-0" />
              <span className="truncate">{court}</span>
            </span>
          ) : (
            <span />
          )}
          {done ? (
            <Stamp tone="green">{t.done}</Stamp>
          ) : due === undefined ? null : due > 0 ? (
            <Money amount={due} owed className="text-[18px]" />
          ) : (
            <Stamp tone="green">{t.paid}</Stamp>
          )}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <p className={`text-[20px] font-bold leading-snug ${done ? "text-ink-soft" : ""}`}>{title}</p>
            {purpose && <p className="text-[16px] text-ink-soft">{purpose}</p>}
          </div>
          <ChevronRight size={22} className="shrink-0 text-ink-faint" />
        </div>
      </Link>
    </li>
  );
}
