"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Item } from "@/lib/types";
import { labelFor } from "@/components/StatusStamp";
import { ShareOverallButton } from "@/components/ShareOverallButton";
import { requestInviteAccess } from "@/app/actions/invite-request";
import styles from "../SylonDesign.module.css";

type FilterKey = "all" | "confirmed" | "planning" | "manifest";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All plans" },
  { key: "confirmed", label: "Confirmed" },
  { key: "planning", label: "Planning" },
  { key: "manifest", label: "Manifesting" },
];

const COLOR_CYCLE = [styles.dark, styles.acid, styles.orange, ""];

function filterKeyFor(item: Item): FilterKey {
  if (item.kind === "trip") {
    if (item.status === "planning" || item.status === "cancelled") return "planning";
    return "confirmed";
  }
  return "manifest";
}

function whereText(item: Item): string {
  if (item.kind === "trip") return item.countries.join(" + ");
  const total = item.countryVotes.reduce((sum, v) => sum + v.votes, 0);
  if (total === 0) return item.countryVotes.map((v) => v.country).join(" or ");
  const leader = item.countryVotes.slice().sort((a, b) => b.votes - a.votes)[0];
  return `${leader.country} leading · ${total} vote${total === 1 ? "" : "s"} so far`;
}

function voteShare(item: Item): number | null {
  if (item.kind !== "manifest") return null;
  const total = item.countryVotes.reduce((sum, v) => sum + v.votes, 0);
  if (total === 0) return null;
  const leader = item.countryVotes.slice().sort((a, b) => b.votes - a.votes)[0];
  return Math.round((leader.votes / total) * 100);
}

export function PlansSection({
  items,
  displayName,
  isAdmin,
  showInviteCta,
}: {
  items: Item[];
  displayName: string;
  isAdmin: boolean;
  showInviteCta: boolean;
}) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("Just curious");
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(message: string) {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }

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

  const visible = items.filter((item) => filter === "all" || filterKeyFor(item) === filter);

  return (
    <section aria-labelledby="plans-heading">
      <header className={styles.collectionHead}>
        <h2 id="plans-heading">Where to next?</h2>
        <p>The confirmed, the possible, and the ones {displayName} refuses to stop talking about.</p>
      </header>

      <div className={styles.tools}>
        <div className={styles.filters} aria-label="Filter plans">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`${styles.filter} ${filter === f.key ? styles.filterActive : ""}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        {items.length > 0 && (
          <ShareOverallButton
            displayName={displayName}
            items={items}
            className={`${styles.share} mono`}
            label="Share this atlas ↗"
          />
        )}
      </div>

      <div className={styles.plans}>
        {isAdmin && (
          <Link href="/new" className={styles.addPlan}>
            <span className={styles.addPlanPlus}>+</span>
            <span className="mono">Add a Trip or Manifest</span>
          </Link>
        )}

        {visible.map((item, index) => {
          const wide = index % 3 === 0;
          const color = COLOR_CYCLE[index % COLOR_CYCLE.length];
          const share = voteShare(item);
          return (
            <Link
              key={item.id}
              href={`/${item.kind === "trip" ? "trip" : "manifest"}/${item.slug}`}
              className={`${styles.plan} ${wide ? styles.wide : ""} ${color}`}
            >
              <div className={styles.planTop}>
                <span className={`${styles.badge} mono`}>{labelFor(item)}</span>
                <span className={`${styles.planDate} mono`}>{item.roughDate}</span>
              </div>
              <h3>{item.title}</h3>
              <div>
                <div className={styles.planBottom}>
                  <p className={styles.planCopy}>{item.summary}</p>
                  <span className={styles.arrow}>↗</span>
                </div>
                {whereText(item) && (
                  <div className={`${styles.location} mono`}>{whereText(item)}</div>
                )}
                {share !== null && (
                  <div className={styles.vote}>
                    <div className={styles.voteTrack}>
                      <div
                        className={styles.voteFill}
                        style={{ "--vote": `${share}%` } as React.CSSProperties}
                      />
                    </div>
                  </div>
                )}
              </div>
            </Link>
          );
        })}

        <article className={styles.private}>
          <div className={styles.lock} aria-hidden="true">
            ✦
          </div>
          <div>
            <h3>The quiet plans</h3>
            <p>A couple more possibilities are saved for people {displayName} has invited.</p>
            {showInviteCta && (
              <button
                type="button"
                className={`${styles.invite} mono`}
                onClick={() => dialogRef.current?.showModal()}
              >
                Ask for an invite ↗
              </button>
            )}
          </div>
        </article>
      </div>

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
            <select
              id="invite-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
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
    </section>
  );
}
