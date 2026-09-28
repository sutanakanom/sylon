import { notFound } from "next/navigation";
import { getPublicItems, getOwnerItems, handleExists } from "@/lib/data";
import { getCurrentMember } from "@/lib/current-member";
import { getLocale } from "@/lib/i18n/locale";
import { t } from "@/lib/i18n/dictionary";
import { SiteShell } from "@/components/SiteShell";
import { PersonalPageBody } from "./PersonalPageBody";
import styles from "../SylonDesign.module.css";

export default async function PersonalPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;

  const [exists, member, locale] = await Promise.all([
    handleExists(handle),
    getCurrentMember(),
    getLocale(),
  ]);

  if (!exists) notFound();

  // The host sees everything they've published on their own page,
  // invite-only included — a visitor still only sees the public subset.
  const isOwner = member?.handle === handle;
  const items = isOwner ? await getOwnerItems(handle) : await getPublicItems(handle);

  const displayName = handle.charAt(0).toUpperCase() + handle.slice(1);

  return (
    <SiteShell member={member} footerMeta={[t(locale, "footer.defaultMeta"), `@${handle}`]}>
      <main id="top" className={styles.heroPage}>
        <PersonalPageBody
          items={items}
          displayName={displayName}
          handle={handle}
          isOwner={isOwner}
          showInviteCta={!member}
        />

        {/* Manifesto */}
        <section className={styles.manifesto}>
          <span className={`${styles.manifestoLabel} mono`}>
            {t(locale, "personalPage.manifestoNoFrom", { name: displayName })}
            <br />
            {t(locale, "personalPage.manifestoNo01")}
          </span>
          <blockquote>{t(locale, "personalPage.manifestoBody")}</blockquote>
        </section>
      </main>
    </SiteShell>
  );
}
