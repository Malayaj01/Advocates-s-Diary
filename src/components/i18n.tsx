"use client";

import { createContext, useContext } from "react";
import type { Dictionary, Lang } from "@/i18n/dictionary";

const Ctx = createContext<{ t: Dictionary; lang: Lang } | null>(null);

export function I18nProvider({ t, lang, children }: { t: Dictionary; lang: Lang; children: React.ReactNode }) {
  return <Ctx.Provider value={{ t, lang }}>{children}</Ctx.Provider>;
}

export function useT() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useT must be used inside I18nProvider");
  return v;
}
