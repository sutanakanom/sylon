import Link from "next/link";
import { notFound } from "next/navigation";
import { getItemBySlug } from "@/lib/data";
import { getCurrentMember } from "@/lib/current-member";
import { getComments, isFollowing, getParticipants, isJoined } from "@/app/actions/interactions";
import { getMySurveyResponse } from "@/app/actions/survey";
import { labelFor, StatusStamp } from "@/components/StatusStamp";
import { KindBadge } from "@/components/KindBadge";
import { SiteShell } from "@/components/SiteShell";
import { CommentThread } from "@/components/CommentThread";
import { FollowButton } from "@/components/FollowButton";
import { JoinButton } from "@/components/JoinButton";
import { SurveyForm } from "@/components/SurveyForm";
import { ShareStoryButton } from "@/components/ShareStoryButton";
import { ChecklistToggle } from "@/components/ChecklistToggle";
import { formatDateRange, routeText, tripDayCount, posterMark, legDateRange } from "@/lib/item-display";
import styles from "../../SylonDesign.module.css";

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await getItemBySlug(slug);

  if (!item || item.kind !== "trip") notFound();

  const member = await getCurrentMember();

  // Invite-only items need a signed-in member for now — full per-item
  // invite access (checking they were specifically invited to *this*
  // trip) is a later build step, not yet wired in.
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

  const [comments, following, participants, joined, mySurvey] = await Promise.all([
    getComments("trip", item.id),
    isFollowing("trip", item.id),
    getParticipants("trip", item.id),
    isJoined("trip", item.id),
    member ? getMySurveyResponse(item.id) : Promise.resolve(null),
  ]);

  const label = labelFor(item);
  const memberDisplayName = member?.displayName || member?.email.split("@")[0] || null;
  const isOwner = Boolean(member?.handle && member.handle === item.ownerHandle);
  const dayCount = tripDayCount(item);
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
          <span className={`${styles.eyebrow} mono`}>
            {label} trip
          </span>
          <h1 className={styles.heroTitleBig}>{item.title}</h1>
          <p className={styles.heroLede}>{item.summary}</p>
          <div className={styles.heroActions}>
            <KindBadge kind={item.kind} />
            <StatusStamp item={item} size="md" />
          </div>
        </div>
        <aside className={`${styles.heroPanel} ${styles.posterTrip}`}>
          <div className={styles.poster} data-mark={posterMark(item)}>
            <div className={`${styles.posterTop} mono`}>
              <span>{label} trip</span>
              <span>@{item.ownerHandle}</span>
            </div>
            <div className={styles.factGrid}>
              <div className={styles.fact}>
                <small className="mono">Date</small>
                <strong>{formatDateRange(item)}</strong>
              </div>
              <div className={styles.fact}>
                <small className="mono">Location</small>
                <strong>{item.countries.join(" + ") || "Somewhere"}</strong>
              </div>
              <div className={styles.fact}>
                <small className="mono">Main event</small>
                <strong>{item.mainEvent || "—"}</strong>
              </div>
              <div className={styles.fact}>
                <small className="mono">Going with</small>
                {item.companionName ? (
                  <span className={styles.person}>
                    <span className={styles.personAvatar} aria-hidden="true">
                      {item.companionName.charAt(0).toUpperCase()}
                    </span>
                    <strong>{item.companionName}</strong>
                  </span>
                ) : (
                  <strong>
                    {item.memberCount === 0
                      ? "Be the first"
                      : `${item.memberCount} member${item.memberCount === 1 ? "" : "s"}`}
                  </strong>
                )}
              </div>
            </div>
            <div className={`${styles.posterBottom} mono`}>
              <span>{routeText(item)}</span>
              <span>{item.visibility === "public" ? "Public" : "Invite-only"}</span>
            </div>
          </div>
        </aside>
      </section>

      {/* The route + side cards */}
      <section className={styles.contentGrid}>
        <div>
          <div className={`${styles.sectionLabel} mono`}>The route</div>
          <h2 className={styles.sectionTitle}>
            {dayCount ? `${dayCount} day${dayCount === 1 ? "" : "s"}.` : "The plan."}
          </h2>
          <div className={styles.timeline}>
            {item.legs.length === 0 ? (
              <p className="py-6 text-sm text-muted">No dates locked in yet.</p>
            ) : (
              item.legs.map((leg, i) => (
                <article key={i} className={styles.timelineRow}>
                  <time className="mono">{legDateRange(leg)}</time>
                  <div>
                    <h3>{leg.place}</h3>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
        <aside>
          {item.readinessPercent !== null && (
            <div className={`${styles.sideCard} ${styles.sideCardAcid}`}>
              <span className={`${styles.mini} mono`}>Ready meter</span>
              <h3>
                {item.readinessPercent >= 80
                  ? "Mostly sorted."
                  : item.readinessPercent >= 40
                    ? "Mostly real. Slightly chaotic."
                    : "Still very much a dream."}
              </h3>
              <div className={styles.progressTrack}>
                <span className={styles.progressFill} style={{ width: `${item.readinessPercent}%` }} />
              </div>
              <div className={`${styles.mini} mono`}>
                {item.readinessPercent}% sorted · {100 - item.readinessPercent}% future {ownerDisplay}
                &apos;s problem
              </div>
            </div>
          )}
          {item.checklist.length > 0 && (
            <div className={styles.sideCard}>
              <span className={`${styles.mini} mono`}>Before we go</span>
              <h3>The useful list.</h3>
              <ChecklistToggle
                tripId={item.id}
                slug={item.slug}
                initialChecklist={item.checklist}
                canEdit={isOwner}
              />
            </div>
          )}
          {item.noteQuote && (
            <div className={`${styles.sideCard} ${styles.sideCardDark}`}>
              <span className={`${styles.mini} mono`}>Trip note</span>
              <h3>&ldquo;{item.noteQuote}&rdquo;</h3>
              {item.noteAuthor && <span className={`${styles.mini} mono`}>— {item.noteAuthor}</span>}
            </div>
          )}
          <div className={styles.sideCard}>
            <span className={`${styles.mini} mono`}>Members</span>
            {participants.length === 0 ? (
              <p className="mt-3 text-sm text-muted">Nobody&apos;s joined yet — be the first.</p>
            ) : (
              <ul className="mt-3 flex flex-col gap-1">
                {participants.map((p) => (
                  <li key={p.id} className="text-sm font-bold uppercase">
                    {p.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </section>

      {/* Join */}
      <section className="flex items-center justify-center border-b-[1.5px] border-ink px-6 py-8 md:px-10">
        <JoinButton
          itemType="trip"
          itemId={item.id}
          slug={item.slug}
          initialJoined={joined}
          signedIn={Boolean(member)}
        />
      </section>

      {/* Survey — only once you've joined */}
      {joined && (
        <section className="mx-auto w-full max-w-2xl px-6 py-10 md:px-10">
          <h2 className="mb-4 text-lg font-extrabold uppercase">A couple of questions</h2>
          <SurveyForm tripId={item.id} slug={item.slug} initialAnswers={mySurvey} />
        </section>
      )}

      {/* Follow + comments */}
      <section className="mx-auto w-full max-w-2xl flex-1 px-6 py-10 md:px-10">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-lg font-extrabold uppercase">Comments</h2>
          <FollowButton
            itemType="trip"
            itemId={item.id}
            slug={item.slug}
            initialFollowing={following}
            signedIn={Boolean(member)}
          />
        </div>
        <CommentThread
          itemType="trip"
          itemId={item.id}
          slug={item.slug}
          initialComments={comments}
          currentMemberName={memberDisplayName}
        />
      </section>
    </SiteShell>
  );
}
