import { notFound, redirect } from "next/navigation";
import { getItemBySlug } from "@/lib/data";
import { getCurrentMember } from "@/lib/current-member";
import { getLocale } from "@/lib/i18n/locale";
import { t } from "@/lib/i18n/dictionary";
import { SiteShell } from "@/components/SiteShell";
import { EditTripForm } from "./EditTripForm";

export default async function EditTripPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [item, member, locale] = await Promise.all([
    getItemBySlug(slug),
    getCurrentMember(),
    getLocale(),
  ]);

  if (!item || item.kind !== "trip") notFound();

  // Only the page owner can edit their own trip — not just any host, and
  // not the system-admin flag (see requireItemOwner in items.ts).
  if (!member?.handle || member.handle !== item.ownerHandle) {
    redirect(`/trip/${slug}`);
  }

  return (
    <SiteShell member={member} centerLabel={t(locale, "tripEdit.centerLabel", { title: item.title })}>
      <div className="mx-auto w-full max-w-lg flex-1 px-6 py-12 md:px-0">
        <h1 className="mb-2 text-4xl font-extrabold uppercase leading-none">
          {t(locale, "tripEdit.title")}
        </h1>
        <p className="mb-10 text-sm leading-snug text-muted">{t(locale, "tripEdit.subtitle")}</p>
        <EditTripForm item={item} />
      </div>
    </SiteShell>
  );
}
