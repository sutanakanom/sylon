import { redirect } from "next/navigation";
import { getCurrentMember } from "@/lib/current-member";
import { getLocale } from "@/lib/i18n/locale";
import { t } from "@/lib/i18n/dictionary";
import { SiteShell } from "@/components/SiteShell";
import { NewItemForm } from "./NewItemForm";

export default async function NewItemPage() {
  const [member, locale] = await Promise.all([getCurrentMember(), getLocale()]);
  if (!member?.handle) redirect("/");

  return (
    <SiteShell member={member} centerLabel={t(locale, "newItem.centerLabel")}>
      <div className="mx-auto w-full max-w-lg flex-1 px-6 py-12 md:px-0">
        <h1 className="mb-2 text-4xl font-extrabold uppercase leading-none">{t(locale, "newItem.title")}</h1>
        <p className="mb-10 text-sm leading-snug text-muted">{t(locale, "newItem.subtitle")}</p>
        <NewItemForm />
      </div>
    </SiteShell>
  );
}
