import "server-only";
import { cookies } from "next/headers";
import { dictionaries, type Lang } from "./dictionary";

export const LANG_COOKIE = "lang";

export async function getLang(): Promise<Lang> {
  const store = await cookies();
  return store.get(LANG_COOKIE)?.value === "en" ? "en" : "hi";
}

export async function getT() {
  const lang = await getLang();
  return { t: dictionaries[lang], lang };
}
