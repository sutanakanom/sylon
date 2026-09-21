import Link from "next/link";
import { notFound } from "next/navigation";
import { getItemBySlug } from "@/lib/data";
import { getCurrentMember } from "@/lib/current-member";
import {
  getManifestors,
  getChatMessages,
  isManifestor,
  getMyVote,
  getMyAvailability,
  getIdeaLikes,
} from "@/app/actions/manifest";
import {
  getParticipants,
  isJoined,
  isFollowing,
  getFollowerCount,
} from "@/app/actions/interactions";
import { SiteShell } from "@/components/SiteShell";
import { ManifestorPanel } from "@/components/ManifestorPanel";
import { ChatFeed } from "@/components/ChatFeed";
import { FinalizeButton } from "@/components/FinalizeButton";
import { ShareStoryButton } from "@/components/ShareStoryButton";
import { CountryVoteChoices } from "@/components/CountryVoteChoices";
import { AvailabilityPicker } from "@/components/AvailabilityPicker";
import { IdeaBrainstormCard } from "@/components/IdeaBrainstormCard";
import { JoinButton } from "@/components/JoinButton";
import { FollowButton } from "@/components/FollowButton";
import { manifestStageProgress, canConvertManifest } from "@/lib/item-display";
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

  const [
    manifestors,
    messages,
    iAmManifestor,
    myVote,
    myAvailability,
    participants,
    joined,
    following,
    followerCount,
  ] = await Promise.all([
    getManifestors(item.id),
    getChatMessages(item.id),
    isManifestor(item.id),
    member ? getMyVote(item.id) : Promise.resolve(null),
    member ? getMyAvailability(item.id) : Promise.resolve([]),
    getParticipants("manifest", item.id),
    isJoined("manifest", item.id),
    isFollowing("manifest", item.id),
    getFollowerCount("manifest", item.id),
  ]);

  const ideaMessages = messages.filter((m) => m.tag === "date_idea" || m.tag === "place_idea");
  const ideaLikes = await getIdeaLikes(ideaMessages.map((m) => m.id));

  const alreadyConverted = item.status === "converted";
  const isHost = member?.handle === item.ownerHandle;
  const totalVotes = item.countryVotes.reduce((sum, v) => sum + v.votes, 0);
  const sortedVotes = item.countryVotes.slice().sort((a, b) => b.votes - a.votes);
  const ownerDisplay = item.ownerHandle.charAt(0).toUpperCase() + item.ownerHandle.slice(1);

  // "What we know" anchors — each one moves from Open to Known/Rough as
  // real fields get filled in (purpose at creation, location + dates via
  // the host's edit page or decideLocation/setTargetDates).
  const locationKnown = Boolean(item.decidedCountry);
  const datesKnown = Boolean(item.targetStartDate && item.targetEndDate);
  const anchors = [
    {
      label: "Purpose",
      value: item.purpose || "Not set yet",
      tag: item.purpose ? ("known" as const) : ("open" as const),
    },
    {
      label: "Rough timing",
      value: item.roughDate,
      tag: "rough" as const,
    },
    {
      label: "Location",
      value: locationKnown ? item.decidedCountry! : sortedVotes[0] ? `${sortedVotes[0].country} leading` : "Open",
      tag: locationKnown ? ("known" as const) : ("open" as const),
    },
    {
      label: "Exact dates",
      value: datesKnown ? `${item.targetStartDate} → ${item.targetEndDate}` : "Waiting to be decided",
      tag: datesKnown ? ("known" as const) : ("open" as const),
    },
  ];
  const setAnchors = anchors.filter((a) => a.tag !== "open").length;

  const hasActivity = totalVotes > 0 || ideaMessages.length > 0 || myAvailability.length > 0;
  const progress = manifestStageProgress(item, hasActivity);
  const canConvert = canConvertManifest(item) && iAmManifestor && !alreadyConverted;

  const faceInitials = participants.slice(0, 3).map((p) => p.name.slice(0, 1).toUpperCase());
  const overflowCount = Math.max(0, participants.length - faceInitials.length);

  return (
    <SiteShell member={member} centerLabel={item.title}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link href={`/${item.ownerHandle}`} className={`${styles.breadcrumbBack} mono`}>
          ← {ownerDisplay}&apos;s plans
        </Link>
        <div className="flex items-center gap-3">
          {isHost && (
            <Link href={`/manifest/${slug}/edit`} className={`${styles.mini} mono underline underline-offset-2`}>
              Edit
            </Link>
          )}
          {member && <ShareStoryButton item={item} variant="subtle" />}
        </div>
      </div>

      {/* Hero */}
      <section className={styles.detailHero}>
        <div className={styles.heroCopy}>
          <span className={`${styles.eyebrow} mono`}>
            Manifesting · {progress.activeCount >= 2 ? "Gathering ideas" : "Just posted"}
          </span>
          <h1 className={styles.heroTitleBig}>{item.title}</h1>
          <p className={styles.heroLede}>{item.summary}</p>
          <div className={styles.heroActions}>
            <JoinButton
              itemType="manifest"
              itemId={item.id}
              slug={item.slug}
              initialJoined={joined}
              signedIn={Boolean(member)}
              joinLabel="Manifest with me +"
              joinedLabel="You're manifesting this"
            />
            <FollowButton
              itemType="manifest"
              itemId={item.id}
              slug={item.slug}
              initialFollowing={following}
              signedIn={Boolean(member)}
              followLabel="Follow this idea"
              followingLabel="Following this idea"
            />
          </div>
          <div className={styles.facesRow}>
            <div className={styles.faces}>
              {faceInitials.map((initial, i) => (
                <span key={i} className={styles.faceAvatar}>
                  {initial}
                </span>
              ))}
              {overflowCount > 0 && <span className={styles.faceAvatar}>+{overflowCount}</span>}
            </div>
            <small className="mono">
              <b>{item.memberCount}</b> interested · {followerCount} following
            </small>
          </div>
        </div>
        <aside className={`${styles.heroPanel} ${styles.anchorPanel}`}>
          <div className={`${styles.anchorHead} mono`}>
            <span>What we know</span>
            <span>{String(setAnchors).padStart(2, "0")} / 04 anchors</span>
          </div>
          {anchors.map((a) => (
            <div key={a.label} className={styles.anchor}>
              <small className="mono">{a.label}</small>
              <strong>{a.value}</strong>
              <span
                className={`${styles.anchorTag} mono ${
                  a.tag === "known" ? styles.anchorKnown : a.tag === "open" ? styles.anchorOpen : ""
                }`}
              >
                {a.tag === "known" ? "Known" : a.tag === "rough" ? "Rough" : "Open"}
              </span>
            </div>
          ))}
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

      {/* Workspace — shape the possibility */}
      <section className={styles.workspace}>
        <div className={styles.workspaceHeader}>
          <span className="mono">Shape the possibility</span>
          <h2>
            What should
            <br />
            we decide?
          </h2>
          <p>
            Your answers are signals, not commitments. {ownerDisplay} will summarize the
            strongest direction before anything becomes final.
          </p>
        </div>

        <div className={styles.questionGrid}>
          {/* Vote card */}
          <article className={`${styles.questionCard} ${styles.questionCardFeature}`}>
            <div className={styles.qtop}>
              <span className="mono">Open question · Vote</span>
              <span className="mono">
                {totalVotes} response{totalVotes === 1 ? "" : "s"}
              </span>
            </div>
            <h3>Where should it happen?</h3>
            {item.countryVotes.length > 0 ? (
              <CountryVoteChoices
                manifestId={item.id}
                slug={item.slug}
                options={item.countryVotes}
                initialVote={myVote}
                signedIn={Boolean(member)}
              />
            ) : (
              <p className="text-sm" style={{ opacity: 0.7 }}>
                No location options yet.
              </p>
            )}
          </article>

          {/* Availability card */}
          <article className={styles.questionCard}>
            <div className={styles.qtop}>
              <span className="mono">Open question · Availability</span>
            </div>
            <h3>When could you go?</h3>
            <AvailabilityPicker
              manifestId={item.id}
              slug={item.slug}
              windowOptions={item.availabilityWindows}
              initialSelected={myAvailability}
              signedIn={Boolean(member)}
            />
          </article>

          {/* Brainstorm card */}
          <article className={styles.questionCard}>
            <div className={styles.qtop}>
              <span className="mono">Brainstorm</span>
              <span className="mono">
                {ideaMessages.length} idea{ideaMessages.length === 1 ? "" : "s"}
              </span>
            </div>
            <h3>What would make this worth the trip?</h3>
            <IdeaBrainstormCard
              manifestId={item.id}
              slug={item.slug}
              initialIdeas={ideaMessages}
              initialLikes={ideaLikes}
              signedIn={Boolean(member)}
            />
          </article>

          {/* Summary card */}
          <article className={`${styles.questionCard} ${styles.questionCardSummary}`}>
            <div className={styles.qtop}>
              <span className="mono">Latest summary · By {ownerDisplay}</span>
              {item.creatorSummaryUpdatedAt && <span className="mono">Updated</span>}
            </div>
            <h3>{item.creatorSummaryHeadline || "No take yet — check back soon."}</h3>
            {item.creatorSummaryBody && <p style={{ opacity: 0.85 }}>{item.creatorSummaryBody}</p>}
            {item.creatorSummaryTags.length > 0 && (
              <div className={styles.summaryTags}>
                {item.creatorSummaryTags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            )}
            {isHost && !item.creatorSummaryHeadline && (
              <Link href={`/manifest/${slug}/edit`} className={styles.submitSmall} style={{ marginTop: "auto" }}>
                Write the summary
              </Link>
            )}
          </article>
        </div>
      </section>

      {/* Conversion */}
      <section className={styles.conversion}>
        <div>
          <span className="mono">Manifest progress</span>
          <h2>
            {alreadyConverted ? (
              "It's a trip now."
            ) : canConvertManifest(item) ? (
              <>
                Ready
                <br />
                when you are.
              </>
            ) : (
              <>
                Not a trip.
                <br />
                Not yet.
              </>
            )}
          </h2>
          <p>
            {alreadyConverted
              ? "This idea became a real trip — everything gathered here carried over."
              : canConvertManifest(item)
              ? "A location and dates are set. Any manifestor can convert this into a trip when ready."
              : "The purpose is clear, but the date and location still need a decision. Keep gathering signals until the idea is solid enough to act on."}
          </p>
        </div>
        <div className={styles.progressCard}>
          <div className={styles.meter}>
            <span className={styles.meterFill} style={{ width: `${progress.percent}%` }} />
          </div>
          <div className={`${styles.stages} mono`}>
            {progress.stages.map((stage, i) => (
              <b key={stage} className={i < progress.activeCount ? styles.stageOn : ""}>
                {stage}
              </b>
            ))}
          </div>
          {!alreadyConverted && (
            <>
              <FinalizeButton
                manifestId={item.id}
                slug={item.slug}
                variant="wide"
                disabled={!canConvert}
                className={styles.convertButton}
                label="Convert to trip"
              />
              {!canConvert && (
                <small className={`${styles.convertNote} mono`}>
                  {!iAmManifestor
                    ? "Only manifestors can convert this."
                    : "Finalize a location and date first"}
                </small>
              )}
            </>
          )}
        </div>
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

      {/* Full discussion */}
      <section className="mx-auto w-full max-w-2xl flex-1 px-6 py-10 md:px-10">
        <h2 className="mb-8 text-lg font-extrabold uppercase">Everything said so far</h2>
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
