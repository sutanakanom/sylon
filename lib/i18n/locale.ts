import { cookies } from "next/headers";
import { DEFAULT_LOCALE, Locale } from "./dictionary";

const COOKIE_NAME = "sylon_locale";
const ONE_YEAR = 60 * 60 * 24 * 365;

// Server-only read of the visitor's saved language. Called once per page
// (each server page.tsx that has its own literal text calls this
// directly; client components read the same value via LocaleProvider /
// useLocale() instead, set once in app/layout.tsx, so it isn't re-read
// per component).
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  return raw === "th" ? "th" : DEFAULT_LOCALE;
}

export { COOKIE_NAME as LOCALE_COOKIE_NAME, ONE_YEAR as LOCALE_COOKIE_MAX_AGE };
