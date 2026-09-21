import { redirect } from "next/navigation";
import { getCurrentMember } from "@/lib/current-member";
import { getLocale } from "@/lib/i18n/locale";
import { t } from "@/lib/i18n/dictionary";
import { SiteShell } from "@/components/SiteShell";
import { ProfileForm } from "./ProfileForm";

export default async function ProfilePage() {
  const [member, locale] = await Promise.all([getCurrentMember(), getLocale()]);
  if (!member) redirect("/sign-in");

  return (
    <SiteShell member={member} centerLabel={t(locale, "profile.centerLabel")}>
      <div className="mx-auto w-full max-w-md flex-1 px-6 py-12 md:px-0">
        <h1 className="mb-2 text-4xl font-extrabold uppercase leading-none">{t(locale, "profile.title")}</h1>
        <p className="mb-10 text-sm leading-snug text-muted">{t(locale, "profile.subtitle")}</p>
        <ProfileForm member={member} />
      </div>
    </SiteShell>
  );
}
