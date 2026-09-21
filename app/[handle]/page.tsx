import { notFound } from "next/navigation";
import { getPublicItems, handleExists } from "@/lib/data";
import { getCurrentMember } from "@/lib/current-member";
import { SiteShell } from "@/components/SiteShell";
import { PersonalPageBody } from "./PersonalPageBody";
import styles from "../SylonDesign.module.css";

export default async function PersonalPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;

  const [exists, items, member] = await Promise.all([
    handleExists(handle),
    getPublicItems(handle),
    getCurrentMember(),
  ]);

  if (!exists) notFound();

  const displayName = handle.charAt(0).toUpperCase() + handle.slice(1);

  return (
    <SiteShell member={member} footerMeta={["See you later (or not)", `@${handle}`]}>
      <main id="top" className={styles.heroPage}>
        <PersonalPageBody
          items={items}
          displayName={displayName}
          handle={handle}
          isAdmin={Boolean(member?.isAdmin)}
          showInviteCta={!member}
        />

        {/* Manifesto */}
        <section className={styles.manifesto}>
          <span className={`${styles.manifestoLabel} mono`}>
            A note from future {displayName}
            <br />
            No. 01
          </span>
          <blockquote>
            Not every plan is a promise. Some are just a place we haven&apos;t been yet — and
            an <em>open invitation.</em>
          </blockquote>
        </section>
      </main>
    </SiteShell>
  );
}
