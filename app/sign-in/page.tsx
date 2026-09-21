import { getCurrentMember } from "@/lib/current-member";
import { getLocale } from "@/lib/i18n/locale";
import { t } from "@/lib/i18n/dictionary";
import { SiteShell } from "@/components/SiteShell";
import { SignInForm } from "./SignInForm";

export default async function SignInPage() {
  const [member, locale] = await Promise.all([getCurrentMember(), getLocale()]);

  return (
    <SiteShell member={member} centerLabel={t(locale, "signIn.title")}>
      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm border-[1.5px] border-ink bg-paper p-8 shadow-[8px_8px_0_var(--ink)]">
          <h1 className="mb-2 text-3xl font-extrabold uppercase leading-none">
            {t(locale, "signIn.title")}
          </h1>
          <p className="mb-8 text-sm leading-snug text-muted">{t(locale, "signIn.subtitle")}</p>
          <SignInForm />
        </div>
      </div>
    </SiteShell>
  );
}
