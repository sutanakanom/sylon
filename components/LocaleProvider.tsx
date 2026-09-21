"use client";

import { createContext, useContext } from "react";
import { DEFAULT_LOCALE, Locale, t as translate, tn as translateCount, Vars } from "@/lib/i18n/dictionary";

// Makes the visitor's language available to every CLIENT component in
// the tree without prop-drilling — app/layout.tsx (a server component)
// reads the cookie once via getLocale() and renders <LocaleProvider
// locale={locale}> around the whole page. Any "use client" component
// anywhere below it can then just call useLocale() / useT().
//
// Server components (page.tsx files with their own literal text) can't
// use this context — they call `await getLocale()` from
// lib/i18n/locale.ts directly instead. See docs/I18N.md.
const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

// Convenience: a bound t() that already knows the current locale, so
// client components can write t("nav.addPlan") instead of
// t(locale, "nav.addPlan").
export function useT() {
  const locale = useLocale();
  return {
    locale,
    t: (path: string, vars?: Vars) => translate(locale, path, vars),
    tn: (count: number, en: { one: string; other: string }, th: string) =>
      translateCount(locale, count, en, th),
  };
}
