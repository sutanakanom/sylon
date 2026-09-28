import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentMember } from "@/lib/current-member";
import { getLocale } from "@/lib/i18n/locale";
import { t } from "@/lib/i18n/dictionary";
import { SiteShell } from "@/components/SiteShell";
import { ProfileForm } from "./ProfileForm";
import { signOut } from "@/app/actions/auth";

export default async function ProfilePage() {
  const [member, locale] = await Promise.all([getCurrentMember(), getLocale()]);
  if (!member) redirect("/sign-in");

  return (
    <SiteShell member={member} centerLabel={t(locale, "profile.centerLabel")}>
      <div className="mx-auto w-full max-w-md flex-1 px-6 py-12 md:px-0">
        <h1 className="mb-2 text-4xl font-extrabold uppercase leading-none">{t(locale, "profile.title")}</h1>
        <p className="mb-4 text-sm leading-snug text-muted">{t(locale, "profile.subtitle")}</p>
        {member.handle && (
          <Link
            href={`/${member.handle}`}
            className="mb-10 inline-block text-sm font-medium text-ink underline underline-offset-2"
          >
            {t(locale, "profile.viewYourPage")}
          </Link>
        )}
        <ProfileForm member={member} />

        {/* The nav's own Sign out link is hidden on narrow screens to save
            space there, so this is the one place it's guaranteed to be
            reachable regardless of screen size — see SiteNav.tsx. */}
        <form action={signOut} className="mt-10 border-t-[1.5px] border-ink pt-6">
          <button
            type="submit"
            className="mono-label border-[1.5px] border-ink px-5 py-3 text-[0.75rem] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--ink)]"
          >
            {t(locale, "nav.signOut")}
          </button>
        </form>
      </div>
    </SiteShell>
  );
}
