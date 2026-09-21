import Link from "next/link";
import { notFound } from "next/navigation";
import { getItemBySlug } from "@/lib/data";
import { getCurrentMember } from "@/lib/current-member";
import { getManifestors, getChatMessages, isManifestor, getMyVote } from "@/app/actions/manifest";
import { labelFor, StatusStamp } from "@/components/StatusStamp";
import { KindBadge } from "@/components/KindBadge";
import { SiteShell } from "@/components/SiteShell";
import { ManifestorPanel } from "@/components/ManifestorPanel";
import { ChatFeed } from "@/components/ChatFeed";
import { FinalizeButton } from "@/components/FinalizeButton";
import { ShareStoryButton } from "@/components/ShareStoryButton";
import { CountryVoteChoices } from "@/components/CountryVoteChoices";
import { posterMark, whereOnly } from "@/lib/item-display";
import styles from "../../SylonDesign.module.css";

export default async function ManifestDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getItemBySlug(slug);

  if (!item || item.kind !== "manifest") notFound();

  const member = await getCurrentMember();

  if (item.visibility === "invite-only" && !member) {
    return (
      <SiteShell member={member} centerLabel="Invite-only">
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
          <p className="mono-label text-[0.7rem] text-muted">Invite-only</p>
          <h1 className="text-2xl font-extrabold uppercase">This one&apos;s private</h1>
          <p className="max-w-sm text-sm text-muted">
            Ask whoever shared this link with you for an invite, then sign in.
          </p>
          <Link
            href="/sign-in"
            className="mono-label border-[1.5px] border-ink px-5 py-3 text-[0.75rem]"
          >
            Sign in
          </Link>
        </div>
      </SiteShell>
    );
  }

  const [manifestors, messages, iAmManifestor, myVote] = await Promise.all([
    getManifestors(item.id),
    getChatMessages(item.id),
    isManifestor(item.id),
    member ? getMyVote(item.id) : Promise.resolve(null),
  ]);

  const label = labelFor(item);
  const alreadyConverted = item.status === "converted";
  const totalVotes = item.countryVotes.reduce((sum, v) => sum + v.votes, 0);
  const sortedVotes = item.countryVotes.slice().sort((a, b) => b.votes - a.votes);
  const targetYear = item.roughDate.match(/\d{4}/)?.[0] ?? item.roughDate;
  const ownerDisplay = item.ownerHandle.charAt(0).toUpperCase() + item.ownerHandle.slice(1);

  return (
    <SiteShell member={member} centerLabel={item.title}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link href={`/${item.ownerHandle}`} className={`${styles.breadcrumbBack} mono`}>
          ← {ownerDisplay}&apos;s plans
        </Link>
        {member && <ShareStoryButton item={item} variant="subtle" />}
      </div>

      {/* Hero */}
      <section className={styles.detailHero}>
        <div className={styles.heroCopy}>
          <span className={`${styles.eyebrow} mono`}>Manifesting</span>
          <h1 className={styles.heroTitleBig}>{item.title}</h1>
          <p className={styles.heroLede}>{item.summary}</p>
          <div className={styles.heroActions}>
            <KindBadge kind={item.kind} />
            <StatusStamp item={item} size="md" />
            {iAmManifestor && !alreadyConverted && (
              <FinalizeButton manifestId={item.id} slug={item.slug} />
            )}
          </div>
        </div>
        <aside className={`${styles.heroPanel} ${styles.posterManifest}`}>
          <div className={styles.poster} data-mark="?">
            <div className={`${styles.posterTop} mono`}>
              <span>{item.roughDate}</span>
              <span>
                {item.memberCount} believer{item.memberCount === 1 ? "" : "s"}
              </span>
            </div>
            <div className={styles.factGrid}>
              <div className={styles.fact}>
                <small className="mono">Status</small>
                <strong>{label}</strong>
              </div>
              <div className={styles.fact}>
                <small className="mono">Target year</small>
                <strong>{targetYear}</strong>
              </div>
              <div className={styles.fact}>
                <small className="mono">Dream A</small>
                <strong>{sortedVotes[0]?.country ?? "—"}</strong>
              </div>
              <div className={styles.fact}>
                <small className="mono">Dream B</small>
                <strong>{sortedVotes[1]?.country ?? "—"}</strong>
              </div>
            </div>
            <div className={`${styles.posterBottom} mono`}>
              <span>{whereOnly(item)}</span>
              <span>{item.visibility === "public" ? "Public" : "Invite-only"}</span>
            </div>
          </div>
        </aside>
      </section>

      {alreadyConverted && (
        <div className="border-b-[1.5px] border-ink bg-ink px-6 py-4 text-center text-paper md:px-10">
          <p className="mono-label text-[0.7rem]">
            This became a real trip —{" "}
            <a href={`/trip/${item.slug}-trip`} className="underline underline-offset-2">
              see it here
            </a>
            .
          </p>
        </div>
      )}

      {/* Signals + side cards */}
      <section className={styles.contentGrid}>
        <div>
          <div className={`${styles.sectionLabel} mono`}>Signs of life</div>
          <h2 className={styles.sectionTitle}>How a maybe becomes real.</h2>
          {item.signals.length === 0 ? (
            <p className="py-6 text-sm text-muted">No milestones set yet.</p>
          ) : (
            <div className={styles.signalList}>
              {item.signals.map((signal, i) => (
                <article key={i} className={styles.signalRow}>
                  <b className="mono">{String(i + 1).padStart(2, "0")}</b>
                  <div>
                    <h3>{signal.title}</h3>
                    <p>{signal.body}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
        <aside>
          {item.countryVotes.length > 0 && (
            <div className={`${styles.sideCard} ${styles.sideCardAcid}`}>
              <span className={`${styles.mini} mono`}>Choose the universe</span>
              <h3>Where should it happen?</h3>
              <CountryVoteChoices
                manifestId={item.id}
                slug={item.slug}
                options={item.countryVotes}
                initialVote={myVote}
                signedIn={Boolean(member)}
              />
            </div>
          )}
          {item.realityFundPercent !== null && (
            <div className={styles.sideCard}>
              <span className={`${styles.mini} mono`}>Reality fund</span>
              <h3>Make the dream less theoretical.</h3>
              <div className={styles.progressTrack}>
                <span
                  className={styles.progressFill}
                  style={{ width: `${item.realityFundPercent}%` }}
                />
              </div>
              <div className={`${styles.mini} mono`}>
                {item.realityFundPercent}% saved · enough for optimism, not yet airfare
              </div>
            </div>
          )}
          {item.noteQuote && (
            <div className={`${styles.sideCard} ${styles.sideCardDark}`}>
              <span className={`${styles.mini} mono`}>Manifest note</span>
              <h3>&ldquo;{item.noteQuote}&rdquo;</h3>
              {item.noteAuthor && <span className={`${styles.mini} mono`}>— {item.noteAuthor}</span>}
            </div>
          )}
          <div className={styles.sideCard}>
            <span className={`${styles.mini} mono`}>Interested</span>
            <p className="mt-3 text-sm">
              {totalVotes} vote{totalVotes === 1 ? "" : "s"} · {item.memberCount} so far
            </p>
          </div>
        </aside>
      </section>

      <section className="grid grid-cols-1 gap-4 border-b-[1.5px] border-ink px-6 py-10 sm:grid-cols-2 md:px-10">
        <ManifestorPanel
          itemId={item.id}
          slug={item.slug}
          initialManifestors={manifestors}
          currentMemberId={member?.id ?? null}
          signedIn={Boolean(member)}
        />
      </section>

      {/* Chat feed */}
      <section className="mx-auto w-full max-w-2xl flex-1 px-6 py-10 md:px-10">
        <h2 className="mb-8 text-lg font-extrabold uppercase">The brainstorm</h2>
        <ChatFeed
          manifestId={item.id}
          slug={item.slug}
          initialMessages={messages}
          signedIn={Boolean(member)}
        />
      </section>
    </SiteShell>
  );
}
