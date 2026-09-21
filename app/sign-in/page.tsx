import { getCurrentMember } from "@/lib/current-member";
import { SiteShell } from "@/components/SiteShell";
import { SignInForm } from "./SignInForm";

export default async function SignInPage() {
  const member = await getCurrentMember();

  return (
    <SiteShell member={member} centerLabel="Sign in">
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
    </SiteShell>
  );
}
