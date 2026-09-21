"use server";

import { cookies } from "next/headers";
import { Locale } from "@/lib/i18n/dictionary";
import { LOCALE_COOKIE_NAME, LOCALE_COOKIE_MAX_AGE } from "@/lib/i18n/locale";

// Sets the visitor's language for a year, no account required — the
// switcher works the same for a signed-out visitor as for a member.
export async function setLocaleAction(locale: Locale) {
  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE_NAME, locale, {
    maxAge: LOCALE_COOKIE_MAX_AGE,
    path: "/",
    sameSite: "lax",
  });
}
