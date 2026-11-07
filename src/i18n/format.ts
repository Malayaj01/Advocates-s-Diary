import type { Lang } from "./dictionary";

const locale = (lang: Lang) => (lang === "hi" ? "hi-IN" : "en-IN");

/** Stored days are UTC midnight, so always format in UTC. */
export function fmtDay(day: Date, lang: Lang, opts: Intl.DateTimeFormatOptions = {}) {
  // Hindi short months come out as "नव॰"; drop the abbreviation mark.
  return new Intl.DateTimeFormat(locale(lang), { timeZone: "UTC", ...opts }).format(day).replace(/[°॰]/g, "");
}

export function weekday(day: Date, lang: Lang) {
  return fmtDay(day, lang, { weekday: "long" });
}

export function shortDate(day: Date, lang: Lang) {
  return fmtDay(day, lang, { day: "numeric", month: "short", year: "numeric" });
}

export function monthShort(day: Date, lang: Lang) {
  return fmtDay(day, lang, { month: "short" });
}
