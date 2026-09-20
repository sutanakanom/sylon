import Link from "next/link";
import { SignInForm } from "./SignInForm";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b-[1.5px] border-ink px-6 py-5 md:px-10">
        <Link href="/" className="text-lg font-extrabold tracking-tight uppercase">
          SYLON
        </Link>
      </header>

      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm border-[1.5px] border-ink bg-paper p-8 shadow-[8px_8px_0_var(--ink)]">
          <h1 className="mb-2 text-3xl font-extrabold uppercase leading-none">
            Sign in
          </h1>
          <p className="mb-8 text-sm leading-snug text-muted">
            No password. We&apos;ll email you a one-time code.
          </p>
          <SignInForm />
        </div>
      </div>
    </div>
  );
}
