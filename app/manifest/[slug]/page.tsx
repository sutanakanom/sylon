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
import { getLocale } from "@/lib/i18n/locale";
import { t, tn } from "@/lib/i18n/dictionary";
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

  const [member, locale] = await Promise.all([getCurrentMember(), getLocale()]);

  if (item.visibility === "invite-only" && !member) {
    return (
      <SiteShell member={member} centerLabel={t(locale, "tripDetail.invitedOnly")}>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
          <p className="mono-label text-[0.7rem] text-muted">{t(locale, "tripDetail.invitedOnly")}</p>
          <h1 className="text-2xl font-extrabold uppercase">{t(locale, "tripDetail.privateTitle")}</h1>
          <p className="max-w-sm text-sm text-muted">{t(locale, "tripDetail.privateBody")}</p>
          <Link
            href="/sign-in"
            className="mono-label border-[1.5px] border-ink px-5 py-3 text-[0.75rem]"
          >
            {t(locale, "common.signIn")}
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
      label: t(locale, "manifestDetail.purpose"),
      value: item.purpose || t(locale, "manifestDetail.notSetYet"),
      tag: item.purpose ? ("known" as const) : ("open" as const),
    },
    {
      label: t(locale, "manifestDetail.roughTiming"),
      value: item.roughDate,
      tag: "rough" as const,
    },
    {
      label: t(locale, "manifestDetail.location"),
      value: locationKnown
        ? item.decidedCountry!
        : sortedVotes[0]
          ? `${sortedVotes[0].country} ${t(locale, "manifestDetail.leading")}`
          : t(locale, "manifestDetail.open"),
      tag: locationKnown ? ("known" as const) : ("open" as const),
    },
    {
      label: t(locale, "manifestDetail.exactDates"),
      value: datesKnown ? `${item.targetStartDate} → ${item.targetEndDate}` : t(locale, "manifestDetail.waitingToBeDecided"),
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
          ← {t(locale, "tripDetail.plansOf", { name: ownerDisplay })}
        </Link>
        <div className="flex items-center gap-3">
          {isHost && (
            <Link href={`/manifest/${slug}/edit`} className={`${styles.mini} mono underline underline-offset-2`}>
              {t(locale, "manifestDetail.edit")}
            </Link>
          )}
          {member && <ShareStoryButton item={item} variant="subtle" />}
        </div>
      </div>

      {/* Hero */}
      <section className={styles.detailHero}>
        <div className={styles.heroCopy}>
          <span className={`${styles.eyebrow} mono`}>
            {t(locale, "manifestDetail.manifesting")} ·{" "}
            {progress.activeCount >= 2
              ? t(locale, "manifestDetail.manifestingGatheringIdeas")
              : t(locale, "manifestDetail.manifestingJustPosted")}
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
              joinLabel={t(locale, "manifestDetail.manifestWithMe")}
              joinedLabel={t(locale, "manifestDetail.youreManifestingThis")}
            />
            <FollowButton
              itemType="manifest"
              itemId={item.id}
              slug={item.slug}
              initialFollowing={following}
              signedIn={Boolean(member)}
              followLabel={t(locale, "manifestDetail.followThisIdea")}
              followingLabel={t(locale, "manifestDetail.followingThisIdea")}
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
              <b>{item.memberCount}</b> {t(locale, "manifestDetail.interested")} · {followerCount}{" "}
              {t(locale, "manifestDetail.following")}
            </small>
          </div>
        </div>
        <aside className={`${styles.heroPanel} ${styles.anchorPanel}`}>
          <div className={`${styles.anchorHead} mono`}>
            <span>{t(locale, "manifestDetail.whatWeKnow")}</span>
            <span>
              {String(setAnchors).padStart(2, "0")} / 04 {t(locale, "manifestDetail.anchorsSuffix")}
            </span>
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
                {a.tag === "known"
                  ? t(locale, "manifestDetail.tagKnown")
                  : a.tag === "rough"
                    ? t(locale, "manifestDetail.tagRough")
                    : t(locale, "manifestDetail.tagOpen")}
              </span>
            </div>
          ))}
        </aside>
      </section>

      {alreadyConverted && (
        <div className="border-b-[1.5px] border-ink bg-ink px-6 py-4 text-center text-paper md:px-10">
          <p className="mono-label text-[0.7rem]">
            {t(locale, "manifestDetail.becameARealTrip")}{" "}
            <a href={`/trip/${item.slug}-trip`} className="underline underline-offset-2">
              {t(locale, "manifestDetail.seeItHere")}
            </a>
            .
          </p>
        </div>
      )}

      {/* Workspace — shape the possibility */}
      <section className={styles.workspace}>
        <div className={styles.workspaceHeader}>
          <span className="mono">{t(locale, "manifestDetail.shapeThePossibility")}</span>
          <h2>
            {t(locale, "manifestDetail.whatShouldWeDecideLine1")}
            <br />
            {t(locale, "manifestDetail.whatShouldWeDecideLine2")}
          </h2>
          <p>{t(locale, "manifestDetail.signalsNotCommitments", { name: ownerDisplay })}</p>
        </div>

        <div className={styles.questionGrid}>
          {/* Vote card */}
          <article className={`${styles.questionCard} ${styles.questionCardFeature}`}>
            <div className={styles.qtop}>
              <span className="mono">{t(locale, "manifestDetail.openQuestionVote")}</span>
              <span className="mono">{tn(locale, totalVotes, { one: "response", other: "responses" }, "คำตอบ")}</span>
            </div>
            <h3>{t(locale, "manifestDetail.whereShouldItHappen")}</h3>
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
                {t(locale, "manifestDetail.noLocationOptions")}
              </p>
            )}
          </article>

          {/* Availability card */}
          <article className={styles.questionCard}>
            <div className={styles.qtop}>
              <span className="mono">{t(locale, "manifestDetail.openQuestionAvailability")}</span>
            </div>
            <h3>{t(locale, "manifestDetail.whenCouldYouGo")}</h3>
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
              <span className="mono">{t(locale, "manifestDetail.brainstorm")}</span>
              <span className="mono">{tn(locale, ideaMessages.length, { one: "idea", other: "ideas" }, "ไอเดีย")}</span>
            </div>
            <h3>{t(locale, "manifestDetail.whatWouldMakeThisWorthIt")}</h3>
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
              <span className="mono">{t(locale, "manifestDetail.latestSummaryBy", { name: ownerDisplay })}</span>
              {item.creatorSummaryUpdatedAt && <span className="mono">{t(locale, "manifestDetail.updated")}</span>}
            </div>
            <h3>{item.creatorSummaryHeadline || t(locale, "manifestDetail.noTakeYet")}</h3>
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
                {t(locale, "manifestDetail.writeTheSummary")}
              </Link>
            )}
          </article>
        </div>
      </section>

      {/* Conversion */}
      <section className={styles.conversion}>
        <div>
          <span className="mono">{t(locale, "manifestDetail.manifestProgress")}</span>
          <h2>
            {alreadyConverted ? (
              t(locale, "manifestDetail.itsATripNow")
            ) : canConvertManifest(item) ? (
              <>
                {t(locale, "manifestDetail.readyLine1")}
                <br />
                {t(locale, "manifestDetail.readyLine2")}
              </>
            ) : (
              <>
                {t(locale, "manifestDetail.notATripLine1")}
                <br />
                {t(locale, "manifestDetail.notATripLine2")}
              </>
            )}
          </h2>
          <p>
            {alreadyConverted
              ? t(locale, "manifestDetail.convertedBody")
              : canConvertManifest(item)
                ? t(locale, "manifestDetail.readyBody")
                : t(locale, "manifestDetail.notReadyBody")}
          </p>
        </div>
        <div className={styles.progressCard}>
          <div className={styles.meter}>
            <span className={styles.meterFill} style={{ width: `${progress.percent}%` }} />
          </div>
          <div className={`${styles.stages} mono`}>
            {progress.stageKeys.map((stageKey, i) => (
              <b key={stageKey} className={i < progress.activeCount ? styles.stageOn : ""}>
                {t(locale, stageKey)}
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
                label={t(locale, "manifestDetail.convertToTrip")}
              />
              {!canConvert && (
                <small className={`${styles.convertNote} mono`}>
                  {!iAmManifestor
                    ? t(locale, "manifestDetail.onlyManifestorsCanConvert")
                    : t(locale, "manifestDetail.finalizeFirst")}
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
        <h2 className="mb-8 text-lg font-extrabold uppercase">{t(locale, "manifestDetail.everythingSaidSoFar")}</h2>
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
