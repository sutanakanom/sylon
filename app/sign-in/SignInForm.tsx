"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { requestCode, verifyCode } from "@/app/actions/auth";

export function SignInForm() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleRequestCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await requestCode(email);
      if (result.ok) {
        setStep("code");
      } else {
        setError(result.error);
      }
    });
  }

  function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await verifyCode(email, code);
      if (result.ok) {
        router.push("/");
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  if (step === "email") {
    return (
      <form onSubmit={handleRequestCode} className="flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span className="mono-label text-[0.7rem] text-muted">Your email</span>
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
          className="mono-label border-[1.5px] border-ink bg-ink px-5 py-3 text-[0.75rem] text-paper transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--ink)] disabled:opacity-50"
        >
          {isPending ? "Sending…" : "Send me a code"}
        </button>
        <p className="text-xs leading-snug text-muted">
          New here? The same code creates your account. Returning? It just signs you in.
        </p>
      </form>
    );
  }

  return (
    <form onSubmit={handleVerifyCode} className="flex flex-col gap-4">
      <p className="text-sm text-muted">
        We sent a code to <span className="text-ink">{email}</span>.
      </p>
      <label className="flex flex-col gap-2">
        <span className="mono-label text-[0.7rem] text-muted">6-character code</span>
        <input
          type="text"
          required
          autoFocus
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="ABCD12"
          maxLength={6}
          className="mono-label border-[1.5px] border-ink bg-paper px-4 py-3 text-2xl tracking-[0.2em] outline-none focus:shadow-[4px_4px_0_var(--ink)]"
        />
      </label>
      {error && <p className="text-sm text-orange">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="mono-label border-[1.5px] border-ink bg-acid px-5 py-3 text-[0.75rem] text-ink transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--ink)] disabled:opacity-50"
      >
        {isPending ? "Checking…" : "See you →"}
      </button>
      <button
        type="button"
        onClick={() => setStep("email")}
        className="mono-label text-[0.7rem] text-muted underline underline-offset-2"
      >
        Use a different email
      </button>
    </form>
  );
}
