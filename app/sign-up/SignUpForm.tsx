"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { requestSignup } from "@/app/actions/signup";
import { useT } from "@/components/LocaleProvider";

export function SignUpForm() {
  const { t } = useT();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await requestSignup({ email });
      if (result.ok) {
        setSent(true);
      } else {
        setError(result.error);
      }
    });
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-lg font-bold">{t("signUp.successTitle")}</p>
        <p className="text-sm leading-snug text-muted">{t("signUp.successBody")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2">
        <span className="mono-label text-[0.7rem] text-muted">{t("signUp.yourEmail")}</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="border-[1.5px] border-ink bg-paper px-4 py-3 text-base outline-none focus:shadow-[4px_4px_0_var(--ink)]"
        />
      </label>
      {error && <p className="text-sm text-orange">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="mono-label border-[1.5px] border-ink bg-acid px-5 py-3 text-[0.75rem] text-ink transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--ink)] disabled:opacity-50"
      >
        {isPending ? t("signUp.sending") : t("signUp.submit")}
      </button>
      <p className="text-xs leading-snug text-muted">
        {t("signUp.alreadyHaveCode")}{" "}
        <Link href="/sign-in" className="text-ink underline underline-offset-2">
          {t("signUp.signInLink")}
        </Link>
      </p>
    </form>
  );
}
