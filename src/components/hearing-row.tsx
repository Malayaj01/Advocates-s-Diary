import Link from "next/link";
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
  leading?: React.ReactNode;
};

/** A hearing on the day's list: case name, court and what's pending. */
export function HearingRow({ t, caseId, title, court, purpose, done, due, leading }: Props) {
  const meta = [court, purpose].filter(Boolean).join(" · ");
  return (
    <li>
      <Link href={`/cases/${caseId}`} className="flex items-center gap-3 py-3.5 active:bg-paper-deep">
        {leading}
        <div className="min-w-0 flex-1">
          <p className={`truncate text-[19px] font-bold ${done ? "text-ink-soft line-through decoration-1" : ""}`}>
            {title}
          </p>
          {meta && <p className="truncate text-[15px] text-ink-soft">{meta}</p>}
        </div>
        {done ? <Stamp tone="green">{t.done}</Stamp> : due ? <Money amount={due} owed className="text-[17px]" /> : null}
      </Link>
    </li>
  );
}
