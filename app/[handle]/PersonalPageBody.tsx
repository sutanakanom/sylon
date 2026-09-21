"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Item } from "@/lib/types";
import { labelFor } from "@/components/StatusStamp";
import { ShareOverallButton } from "@/components/ShareOverallButton";
import { CaptureCardButton } from "./CaptureCardButton";
import { requestInviteAccess } from "@/app/actions/invite-request";
import { whereText, whereOnly, activitySummary, kindLabel } from "@/lib/item-display";
import styles from "../SylonDesign.module.css";

// The personal page's interactive body: the shareable trip carousel, the
// ticker, and "the whole plan" board — everything between the hero title
// and the manifesto. Split out of page.tsx (a server component) because
// the carousel, dialog and toast all need client-side state.

const SNAPSHOT_COLORS = [styles.darkCard, styles.acidCard, styles.orangeCard, styles.paperCard];
const BANNER_COLORS = [styles.bannerDark, styles.bannerAcid, styles.bannerOrange, styles.bannerPaper];

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
  const tripCount = items.filter((i) => i.kind === "trip").length;
  const manifestCount = items.filter((i) => i.kind === "manifest").length;

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
  const [reason, setReason] = useState("Just curious");
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
      setReason("Just curious");
      showToast("Signal sent — maybe see you there");
    });
  }

  return (
    <>
      {/* Hero */}
      <section className={`${styles.profileHero} ${styles.profileHeroCarousel}`}>
        <div className={styles.heroCopy}>
          <div className={`${styles.kicker} mono`}>{displayName}&apos;s upcoming trips</div>
          <h1 className={styles.heroTitle}>
            Where I&apos;m
            <span className={styles.outline}>going next.</span>
          </h1>
          <div className={styles.intro}>
            <span className={`${styles.introNumber} mono`}>01</span>
            <p>
              Booked trips, possible detours, and the plans {displayName} is still trying to
              manifest.
            </p>
          </div>
          {items.length > 0 && (
            <div className={`${styles.sharePrompt} ${styles.desktopShare}`}>
              <CaptureCardButton
                activeItem={activeItem}
                displayName={displayName}
                items={items}
                className={`${styles.share} mono`}
                label="Capture or share this on story ↗"
                onToast={showToast}
              />
              <span className="mono">Capture this card or send the link to a friend.</span>
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
                  <span>{displayName}&apos;s future atlas</span>
                  <span>
                    01 / {String(slideCount).padStart(2, "0")}
                  </span>
                </div>
                <div className={styles.summaryCount}>{String(items.length).padStart(2, "0")}</div>
                <h2>
                  {items.length === 1 ? "trip is" : "trips are"}
                  <br />
                  waiting.
                </h2>
                <div className={`${styles.summaryStats} mono`}>
                  <span>
                    <b>{tripCount}</b> trip{tripCount === 1 ? "" : "s"}
                  </span>
                  <span>
                    <b>{manifestCount}</b> manifest{manifestCount === 1 ? "" : "s"}
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
                      {kindLabel(item)} · {labelFor(item)}
                    </span>
                    <span>
                      {String(index + 2).padStart(2, "0")} / {String(slideCount).padStart(2, "0")}
                    </span>
                  </div>
                  <div className={`${styles.snapshotDate} mono`}>{item.roughDate}</div>
                  <h2>{item.title}</h2>
                  <p>{item.summary}</p>
                  <div className={`${styles.snapshotFoot} mono`}>
                    <span>{whereOnly(item)}</span>
                    <span>{activitySummary(item)}</span>
                  </div>
                </article>
              ))}
            </div>

            <div className={styles.carouselUi}>
              <span className={`${styles.swipeHint} mono`}>Swipe to choose a card</span>
              <div className={styles.carouselDots} aria-label="Choose a card">
                {Array.from({ length: slideCount }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`${styles.dot} ${i === activeSlide ? styles.dotActive : ""}`}
                    aria-label={i === 0 ? "Summary card" : `${items[i - 1]?.title} card`}
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
              .fill(items.map((i) => `${i.title.toUpperCase()} — ${labelFor(i).toUpperCase()}`).join(" / ") + " / ")
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
              className={`${styles.share} mono`}
              label="Capture or share this on story ↗"
              onToast={showToast}
            />
            <span className="mono">Swipe above to choose what your friend will see.</span>
          </div>
        )}

        <header className={styles.collectionHead}>
          <h2 id="plans-heading">The whole plan.</h2>
          <p>One screen, every maybe. Made to save, send, or drop into an IG Story.</p>
        </header>

        {items.length === 0 ? (
          <p className="mono" style={{ color: "var(--muted)" }}>
            Nothing public yet — check back soon.
          </p>
        ) : (
          <div className={styles.boardShell}>
            <div className={`${styles.boardTop} mono`}>
              <span>{displayName}&apos;s departures</span>
              <span>Bangkok → wherever</span>
            </div>
            <div className={styles.planBoard}>
              {items.map((item, index) => (
                <Link
                  key={item.id}
                  href={`/${item.kind === "trip" ? "trip" : "manifest"}/${item.slug}`}
                  className={`${styles.planBanner} ${BANNER_COLORS[index % BANNER_COLORS.length]}`}
                >
                  <span className={`${styles.bannerNo} mono`}>{String(index + 1).padStart(2, "0")}</span>
                  <span className={styles.bannerMain}>
                    <small className="mono">
                      {kindLabel(item)} · {labelFor(item)} · {item.roughDate}
                    </small>
                    <strong>{item.title}</strong>
                    <em>{whereText(item)}</em>
                  </span>
                  <span className={styles.bannerArrow} aria-hidden="true">
                    ↗
                  </span>
                </Link>
              ))}
            </div>

            {isOwner ? (
              <Link href="/new" className={styles.quietBanner}>
                <span className="mono">+ Add a plan</span>
                <strong>Something else on your mind?</strong>
                <span className="mono">Trip or manifest ↗</span>
              </Link>
            ) : (
              showInviteCta && (
                <button
                  type="button"
                  className={styles.quietBanner}
                  onClick={() => dialogRef.current?.showModal()}
                >
                  <span className="mono">+ Request an invite</span>
                  <strong>Curious about the quiet plans?</strong>
                  <span className="mono">Ask {displayName} ↗</span>
                </button>
              )
            )}

            <div className={`${styles.boardSignoff} mono`}>
              <span>@{handle}</span>
              <span>SYLON — See you later (or not)</span>
            </div>
          </div>
        )}

        {items.length > 0 && (
          <div className={styles.storyAction}>
            <span className={`${styles.storyNote} mono`}>The whole plan · 1080 × 1920</span>
            <ShareOverallButton
              displayName={displayName}
              items={items}
              className={`${styles.storyButton} mono`}
              onToast={showToast}
            />
          </div>
        )}
      </section>

      {/* Invite-request dialog */}
      <dialog ref={dialogRef}>
        <form className={styles.sheet} onSubmit={handleInviteSubmit}>
          <div className={styles.sheetHead}>
            <span className="mono">Invitation request</span>
            <button
              type="button"
              className={styles.close}
              aria-label="Close"
              onClick={() => dialogRef.current?.close()}
            >
              ×
            </button>
          </div>
          <h2>Maybe together?</h2>
          <div className={styles.field}>
            <label className="mono" htmlFor="invite-name">
              Your name
            </label>
            <input
              id="invite-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`The person ${displayName} knows`}
            />
          </div>
          <div className={styles.field}>
            <label className="mono" htmlFor="invite-email">
              Your email
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
              Which plan brought you here?
            </label>
            <select id="invite-reason" value={reason} onChange={(e) => setReason(e.target.value)}>
              <option>Just curious</option>
              <option>I want to join a trip</option>
              <option>I have a better idea</option>
            </select>
          </div>
          {formError && <p className={styles.formError}>{formError}</p>}
          <button type="submit" className={styles.submit} disabled={isPending}>
            {isPending ? "Sending…" : "Send the signal"}
          </button>
        </form>
      </dialog>

      <div className={`${styles.toast} mono ${toast ? styles.toastShow : ""}`} role="status" aria-live="polite">
        {toast}
      </div>
    </>
  );
}
