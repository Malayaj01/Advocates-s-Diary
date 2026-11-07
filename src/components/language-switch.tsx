"use client";

import { useTransition } from "react";
import { setLanguage } from "@/server/actions";
import { useT } from "./i18n";

/** EN | हिं toggle. */
export function LanguageSwitch() {
  const { lang } = useT();
  const [pending, start] = useTransition();
  const option = (value: "hi" | "en", label: string) => (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(() => setLanguage(value))}
      aria-pressed={lang === value}
      className={`h-10 min-w-12 px-3 text-[17px] font-bold ${lang === value ? "bg-ink text-paper" : "text-ink"}`}
    >
      {label}
    </button>
  );
  return (
    <div className="inline-flex overflow-hidden rounded-md border-2 border-ink">
      {option("hi", "हिं")}
      {option("en", "EN")}
    </div>
  );
}
