import Link from "next/link";
import { notFound } from "next/navigation";
import { getItemBySlug } from "@/lib/data";
import { getCurrentMember } from "@/lib/current-member";
import { getComments, isFollowing, getParticipants, isJoined } from "@/app/actions/interactions";
import { getMySurveyResponse } from "@/app/actions/survey";
import { getLocale } from "@/lib/i18n/locale";
import { t, tn } from "@/lib/i18n/dictionary";
import { labelFor } from "@/lib/item-display";
import { StatusStamp } from "@/components/StatusStamp";
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

  const [member, locale] = await Promise.all([getCurrentMember(), getLocale()]);

  // Invite-only items need a signed-in member for now — full per-item
  // invite access (checking they were specifically invited to *this*
  // trip) is a later build step, not yet wired in.
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

  const [comments, following, participants, joined, mySurvey] = await Promise.all([
    getComments("trip", item.id),
    isFollowing("trip", item.id),
    getParticipants("trip", item.id),
    isJoined("trip", item.id),
    member ? getMySurveyResponse(item.id) : Promise.resolve(null),
  ]);

  const label = labelFor(item, locale);
  const memberDisplayName = member?.displayName || member?.email.split("@")[0] || null;
  const isOwner = Boolean(member?.handle && member.handle === item.ownerHandle);
  const dayCount = tripDayCount(item);
  const ownerDisplay = item.ownerHandle.charAt(0).toUpperCase() + item.ownerHandle.slice(1);

  return (
    <SiteShell member={member} centerLabel={item.title}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link href={`/${item.ownerHandle}`} className={`${styles.breadcrumbBack} mono`}>
          ← {t(locale, "tripDetail.plansOf", { name: ownerDisplay })}
        </Link>
        <div className="flex items-center gap-3">
          {isOwner && (
            <Link href={`/trip/${slug}/edit`} className={`${styles.mini} mono underline underline-offset-2`}>
              {t(locale, "tripDetail.edit")}
            </Link>
          )}
          {member && <ShareStoryButton item={item} variant="subtle" />}
        </div>
      </div>

      {/* Hero */}
      <section className={styles.detailHero}>
        <div className={styles.heroCopy}>
          <span className={`${styles.eyebrow} mono`}>
            {label} {t(locale, "tripDetail.tripSuffix")}
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
              <span>
                {label} {t(locale, "tripDetail.tripSuffix")}
              </span>
              <span>@{item.ownerHandle}</span>
            </div>
            <div className={styles.factGrid}>
              <div className={styles.fact}>
                <small className="mono">{t(locale, "tripDetail.date")}</small>
                <strong>{formatDateRange(item)}</strong>
              </div>
              <div className={styles.fact}>
                <small className="mono">{t(locale, "tripDetail.location")}</small>
                <strong>{item.countries.join(" + ") || t(locale, "tripDetail.somewhere")}</strong>
              </div>
              <div className={styles.fact}>
                <small className="mono">{t(locale, "tripDetail.mainEvent")}</small>
                <strong>{item.mainEvent || "—"}</strong>
              </div>
              <div className={styles.fact}>
                <small className="mono">{t(locale, "tripDetail.goingWith")}</small>
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
                      ? t(locale, "tripDetail.beTheFirst")
                      : tn(locale, item.memberCount, { one: "member", other: "members" }, "สมาชิก")}
                  </strong>
                )}
              </div>
            </div>
            <div className={`${styles.posterBottom} mono`}>
              <span>{routeText(item)}</span>
              <span>{item.visibility === "public" ? t(locale, "common.public") : t(locale, "common.inviteOnly")}</span>
            </div>
          </div>
        </aside>
      </section>

      {/* The route + side cards */}
      <section className={styles.contentGrid}>
        <div>
          <div className={`${styles.sectionLabel} mono`}>{t(locale, "tripDetail.theRoute")}</div>
          <h2 className={styles.sectionTitle}>
            {dayCount ? `${tn(locale, dayCount, { one: "day", other: "days" }, "วัน")}.` : t(locale, "tripDetail.thePlan")}
          </h2>
          <div className={styles.timeline}>
            {item.legs.length === 0 ? (
              <p className="py-6 text-sm text-muted">{t(locale, "tripDetail.noDatesYet")}</p>
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
              <span className={`${styles.mini} mono`}>{t(locale, "tripDetail.readyMeter")}</span>
              <h3>
                {item.readinessPercent >= 80
                  ? t(locale, "tripDetail.mostlySorted")
                  : item.readinessPercent >= 40
                    ? t(locale, "tripDetail.mostlyRealSlightlyChaotic")
                    : t(locale, "tripDetail.stillADream")}
              </h3>
              <div className={styles.progressTrack}>
                <span className={styles.progressFill} style={{ width: `${item.readinessPercent}%` }} />
              </div>
              <div className={`${styles.mini} mono`}>
                {t(locale, "tripDetail.sortedFutureProblem", {
                  sorted: item.readinessPercent,
                  left: 100 - item.readinessPercent,
                  name: ownerDisplay,
                })}
              </div>
            </div>
          )}
          {item.checklist.length > 0 && (
            <div className={styles.sideCard}>
              <span className={`${styles.mini} mono`}>{t(locale, "tripDetail.beforeWeGo")}</span>
              <h3>{t(locale, "tripDetail.usefulList")}</h3>
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
              <span className={`${styles.mini} mono`}>{t(locale, "tripDetail.tripNote")}</span>
              <h3>&ldquo;{item.noteQuote}&rdquo;</h3>
              {item.noteAuthor && <span className={`${styles.mini} mono`}>— {item.noteAuthor}</span>}
            </div>
          )}
          <div className={styles.sideCard}>
            <span className={`${styles.mini} mono`}>{t(locale, "tripDetail.members")}</span>
            {participants.length === 0 ? (
              <p className="mt-3 text-sm text-muted">{t(locale, "tripDetail.nobodyJoinedYet")}</p>
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
          <h2 className="mb-4 text-lg font-extrabold uppercase">{t(locale, "tripDetail.aCoupleQuestions")}</h2>
          <SurveyForm tripId={item.id} slug={item.slug} initialAnswers={mySurvey} />
        </section>
      )}

      {/* Follow + comments */}
      <section className="mx-auto w-full max-w-2xl flex-1 px-6 py-10 md:px-10">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-lg font-extrabold uppercase">{t(locale, "tripDetail.comments")}</h2>
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
