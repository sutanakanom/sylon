"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Item } from "@/lib/types";
import { labelFor, StatusStamp } from "@/components/StatusStamp";
import { ShareOverallButton } from "@/components/ShareOverallButton";
import { CaptureCardButton } from "./CaptureCardButton";
import { requestInviteAccess } from "@/app/actions/invite-request";
import { whereText, whereOnly, activitySummary, kindLabel } from "@/lib/item-display";
import { useT } from "@/components/LocaleProvider";
import styles from "../SylonDesign.module.css";

// The personal page's interactive body: the shareable trip carousel, the
// ticker, and "the whole plan" board — everything between the hero title
// and the manifesto. Split out of page.tsx (a server component) because
// the carousel, dialog and toast all need client-side state.

const SNAPSHOT_COLORS = [styles.darkCard, styles.acidCard, styles.orangeCard, styles.paperCard];

export function PersonalPageBody({
  items,
  displayName,
  handle,
  isOwner,
  showInviteCta,
}: {
  items: Item[];
  displayName: string;
  handle: string;
  isOwner: boolean;
  showInviteCta: boolean;
}) {
  const { t, tn, locale } = useT();
  const trips = items.filter((i) => i.kind === "trip");
  const manifests = items.filter((i) => i.kind === "manifest");
  const tripCount = trips.length;
  const manifestCount = manifests.length;

  // --- Carousel -----------------------------------------------------
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const slideCount = items.length + 1; // +1 for the summary card
  const autoTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showSlide(index: number, behavior: ScrollBehavior = "smooth") {
    const track = trackRef.current;
    if (!track) return;
    const next = ((index % slideCount) + slideCount) % slideCount;
    setActiveSlide(next);
    track.scrollTo({ left: next * track.clientWidth, behavior });
  }

  function startAuto() {
    if (autoTimer.current) clearInterval(autoTimer.current);
    if (typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (slideCount <= 1) return;
    autoTimer.current = setInterval(() => {
      setActiveSlide((current) => {
        const next = (current + 1) % slideCount;
        const track = trackRef.current;
        track?.scrollTo({ left: next * track.clientWidth, behavior: "smooth" });
        return next;
      });
    }, 4200);
  }

  useEffect(() => {
    startAuto();
    function handleResize() {
      showSlide(activeSlide, "auto" as ScrollBehavior);
    }
    window.addEventListener("resize", handleResize);
    function handleVisibility() {
      if (document.hidden) {
        if (autoTimer.current) clearInterval(autoTimer.current);
      } else {
        startAuto();
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      if (autoTimer.current) clearInterval(autoTimer.current);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slideCount]);

  function handleTrackScroll() {
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => {
      const track = trackRef.current;
      if (!track || track.clientWidth === 0) return;
      setActiveSlide(Math.round(track.scrollLeft / track.clientWidth));
    }, 90);
  }

  function userInteracted() {
    startAuto();
  }

  // --- Toast ----------------------------------------------------------
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(message: string) {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }

  // The item behind the carousel's currently active slide — slide 0 is the
  // summary card (no single item), everything after maps to items[i-1].
  const activeItem = activeSlide === 0 ? null : items[activeSlide - 1] ?? null;

  // --- Invite-request dialog -------------------------------------------
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState(t("personalPage.reasonCurious"));
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleInviteSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    startTransition(async () => {
      const result = await requestInviteAccess({ name, email, reason });
      if (!result.ok) {
        setFormError(result.error);
        return;
      }
      dialogRef.current?.close();
      setName("");
      setEmail("");
      setReason(t("personalPage.reasonCurious"));
      showToast(t("personalPage.signalSentToast"));
    });
  }

  const captureShareLabel = t("personalPage.captureShare");

  return (
    <>
      {/* Hero */}
      <section className={`${styles.profileHero} ${styles.profileHeroCarousel}`}>
        <div className={styles.heroCopy}>
          <div className={`${styles.kicker} mono`}>{t("personalPage.upcomingTrips", { name: displayName })}</div>
          <h1 className={styles.heroTitle}>
            {t("personalPage.titleLine1")}
            <span className={styles.outline}>{t("personalPage.titleLine2")}</span>
          </h1>
          <div className={styles.intro}>
            <span className={`${styles.introNumber} mono`}>01</span>
            <p>{t("personalPage.introBody", { name: displayName })}</p>
          </div>
          {items.length > 0 && (
            <div className={`${styles.sharePrompt} ${styles.desktopShare}`}>
              <CaptureCardButton
                activeItem={activeItem}
                displayName={displayName}
                items={items}
                className={styles.iconButton}
                label={captureShareLabel}
                iconOnly
                onToast={showToast}
              />
              <span className="mono">{t("personalPage.captureHintDesktop")}</span>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className={styles.shareCarousel} aria-label={`${displayName}'s shareable trip cards`}>
            <div
              className={styles.carouselTrack}
              ref={trackRef}
              onScroll={handleTrackScroll}
              onPointerDown={userInteracted}
              onTouchStart={userInteracted}
              onWheel={userInteracted}
            >
              <article className={`${styles.snapshotCard} ${styles.summaryCard}`}>
                <div className={`${styles.snapshotTop} mono`}>
                  <span>{t("personalPage.futureAtlas", { name: displayName })}</span>
                  <span>
                    01 / {String(slideCount).padStart(2, "0")}
                  </span>
                </div>
                <div className={styles.summaryCount}>{String(items.length).padStart(2, "0")}</div>
                <h2>
                  {items.length === 1 ? t("personalPage.tripsAreOne") : t("personalPage.tripsAreMany")}
                  <br />
                  {t("personalPage.waiting")}
                </h2>
                <div className={`${styles.summaryStats} mono`}>
                  <span>
                    <b>{tripCount}</b> {tn(tripCount, { one: "trip", other: "trips" }, "ทริป")}
                  </span>
                  <span>
                    <b>{manifestCount}</b> {tn(manifestCount, { one: "manifest", other: "manifests" }, "แมนิเฟสต์")}
                  </span>
                </div>
              </article>

              {items.map((item, index) => (
                <article
                  key={item.id}
                  className={`${styles.snapshotCard} ${SNAPSHOT_COLORS[index % SNAPSHOT_COLORS.length]}`}
                >
                  <div className={`${styles.snapshotTop} mono`}>
                    <span>
                      {kindLabel(item, locale)} · {labelFor(item, locale)}
                    </span>
                    <span>
                      {String(index + 2).padStart(2, "0")} / {String(slideCount).padStart(2, "0")}
                    </span>
                  </div>
                  <div className={`${styles.snapshotDate} mono`}>{item.roughDate}</div>
                  <h2>{item.title}</h2>
                  <p>{item.summary}</p>
                  <div className={`${styles.snapshotFoot} mono`}>
                    <span>{whereOnly(item, locale)}</span>
                    <span>{activitySummary(item, locale)}</span>
                  </div>
                </article>
              ))}
            </div>

            <div className={styles.carouselUi}>
              <span className={`${styles.swipeHint} mono`}>{t("personalPage.swipeHint")}</span>
              <div className={styles.carouselDots} aria-label="Choose a card">
                {Array.from({ length: slideCount }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`${styles.dot} ${i === activeSlide ? styles.dotActive : ""}`}
                    aria-label={i === 0 ? t("personalPage.summaryCard") : `${items[i - 1]?.title} card`}
                    onClick={() => {
                      showSlide(i);
                      userInteracted();
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Ticker */}
      {items.length > 0 && (
        <div className={styles.ticker} aria-hidden="true">
          <div className={`${styles.tickerTrack} mono`}>
            {Array(2)
              .fill(
                items.map((i) => `${i.title.toUpperCase()} — ${labelFor(i, locale).toUpperCase()}`).join(" / ") +
                  " / "
              )
              .join("")}
          </div>
        </div>
      )}

      {/* Board */}
      <section aria-labelledby="plans-heading">
        {items.length > 0 && (
          <div className={styles.mobileShare}>
            <CaptureCardButton
              activeItem={activeItem}
              displayName={displayName}
              items={items}
              className={styles.iconButton}
              label={captureShareLabel}
              iconOnly
              onToast={showToast}
            />
            <span className="mono">{t("personalPage.captureHintMobile")}</span>
          </div>
        )}

        <header className={styles.collectionHead}>
          <h2 id="plans-heading">{t("personalPage.theWholePlan")}</h2>
          <p>{t("personalPage.boardSubtitle")}</p>
        </header>

        {items.length === 0 ? (
          <p className="mono" style={{ color: "var(--muted)" }}>
            {t("personalPage.nothingPublicYet")}
          </p>
        ) : (
          <div className={styles.boardShell}>
            <div className={`${styles.boardTop} mono`}>
              <span>{t("personalPage.departures", { name: displayName })}</span>
              <span>{t("personalPage.bangkokWherever")}</span>
            </div>

            <div className={styles.boardGroup}>
              <div className={styles.boardGroupHead}>
                <h3>{t("personalPage.actuallyHappening")}</h3>
                <span className="mono">{tn(tripCount, { one: "trip", other: "trips" }, "ทริป")}</span>
              </div>
              {trips.length === 0 ? (
                <p className={`${styles.boardEmptyGroup} mono`}>{t("personalPage.noTripsYet")}</p>
              ) : (
                <div className={styles.boardGrid}>
                  {trips.map((item) => (
                    <Link
                      key={item.id}
                      href={`/trip/${item.slug}`}
                      className={`${styles.boardCard} ${styles.boardCardHappening}`}
                    >
                      <span className={styles.boardCardMain}>
                        <small className="mono">{item.roughDate}</small>
                        <strong>{item.title}</strong>
                        <em>{whereText(item, locale)}</em>
                      </span>
                      <StatusStamp item={item} size="sm" />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.boardGroup}>
              <div className={styles.boardGroupHead}>
                <h3>{t("personalPage.notDecidedYet")}</h3>
                <span className="mono">{tn(manifestCount, { one: "manifest", other: "manifests" }, "แมนิเฟสต์")}</span>
              </div>
              {manifests.length === 0 ? (
                <p className={`${styles.boardEmptyGroup} mono`}>{t("personalPage.noManifestsYet")}</p>
              ) : (
                <div className={styles.boardGrid}>
                  {manifests.map((item) => (
                    <Link
                      key={item.id}
                      href={`/manifest/${item.slug}`}
                      className={`${styles.boardCard} ${styles.boardCardHoped}`}
                    >
                      <span className={styles.boardCardMain}>
                        <small className="mono">{item.roughDate}</small>
                        <strong>{item.title}</strong>
                        <em>{whereText(item, locale)}</em>
                      </span>
                      <StatusStamp item={item} size="sm" />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {isOwner ? (
              <Link href="/new" className={styles.quietBanner}>
                <span className="mono">{t("personalPage.addPlan")}</span>
                <strong>{t("personalPage.addPlanQuestion")}</strong>
                <span className="mono">{t("personalPage.addPlanCta")}</span>
              </Link>
            ) : (
              showInviteCta && (
                <button
                  type="button"
                  className={styles.quietBanner}
                  onClick={() => dialogRef.current?.showModal()}
                >
                  <span className="mono">{t("personalPage.requestInvite")}</span>
                  <strong>{t("personalPage.requestInviteQuestion")}</strong>
                  <span className="mono">{t("personalPage.requestInviteCta", { name: displayName })}</span>
                </button>
              )
            )}

            <div className={`${styles.boardSignoff} mono`}>
              <span>@{handle}</span>
              <span>{t("personalPage.boardSignoffTagline")}</span>
            </div>
          </div>
        )}

        {items.length > 0 && (
          <div className={styles.storyAction}>
            <span className={`${styles.storyNote} mono`}>{t("personalPage.storyNote")}</span>
            <ShareOverallButton
              displayName={displayName}
              items={items}
              className={`${styles.iconButton} ${styles.iconButtonDark}`}
              iconOnly
              onToast={showToast}
            />
          </div>
        )}
      </section>

      {/* Invite-request dialog */}
      <dialog ref={dialogRef}>
        <form className={styles.sheet} onSubmit={handleInviteSubmit}>
          <div className={styles.sheetHead}>
            <span className="mono">{t("personalPage.inviteDialogTitle")}</span>
            <button
              type="button"
              className={styles.close}
              aria-label={t("personalPage.close")}
              onClick={() => dialogRef.current?.close()}
            >
              ×
            </button>
          </div>
          <h2>{t("personalPage.inviteHeading")}</h2>
          <div className={styles.field}>
            <label className="mono" htmlFor="invite-name">
              {t("personalPage.yourName")}
            </label>
            <input
              id="invite-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("personalPage.yourNamePlaceholder", { name: displayName })}
            />
          </div>
          <div className={styles.field}>
            <label className="mono" htmlFor="invite-email">
              {t("personalPage.yourEmail")}
            </label>
            <input
              id="invite-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className={styles.field}>
            <label className="mono" htmlFor="invite-reason">
              {t("personalPage.whichPlan")}
            </label>
            <select id="invite-reason" value={reason} onChange={(e) => setReason(e.target.value)}>
              <option value={t("personalPage.reasonCurious")}>{t("personalPage.reasonCurious")}</option>
              <option value={t("personalPage.reasonJoin")}>{t("personalPage.reasonJoin")}</option>
              <option value={t("personalPage.reasonIdea")}>{t("personalPage.reasonIdea")}</option>
            </select>
          </div>
          {formError && <p className={styles.formError}>{formError}</p>}
          <button type="submit" className={styles.submit} disabled={isPending}>
            {isPending ? t("personalPage.sending") : t("personalPage.sendSignal")}
          </button>
        </form>
      </dialog>

      <div className={`${styles.toast} mono ${toast ? styles.toastShow : ""}`} role="status" aria-live="polite">
        {toast}
      </div>
    </>
  );
}
