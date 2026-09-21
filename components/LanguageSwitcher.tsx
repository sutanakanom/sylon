"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLocaleAction } from "@/app/actions/locale";
import { Locale } from "@/lib/i18n/dictionary";
import { useLocale } from "./LocaleProvider";
import styles from "@/app/SylonDesign.module.css";

// EN / TH toggle in the nav. Saves to a cookie (works for signed-out
// visitors too, not just members) and refreshes so every server-rendered
// page picks up the new language on the next request.
export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function switchTo(next: Locale) {
    if (next === locale || isPending) return;
    startTransition(async () => {
      await setLocaleAction(next);
      router.refresh();
    });
  }

  return (
    <div className={styles.langSwitch} role="group" aria-label="Language / ภาษา">
      <button
        type="button"
        onClick={() => switchTo("en")}
        aria-pressed={locale === "en"}
        className={locale === "en" ? styles.langActive : ""}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => switchTo("th")}
        aria-pressed={locale === "th"}
        className={locale === "th" ? styles.langActive : ""}
      >
        ไทย
      </button>
    </div>
  );
}
