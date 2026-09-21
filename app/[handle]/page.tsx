import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicItems, handleExists } from "@/lib/data";
import { getCurrentMember } from "@/lib/current-member";
import { signOut } from "@/app/actions/auth";
import { PlansSection } from "./PlansSection";
import styles from "./PersonalPage.module.css";

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
  const upcomingCount = items.filter(
    (i) => i.kind === "trip" && (i.status === "confirmed" || i.status === "planning")
  ).length;
  const name = member?.displayName || member?.email.split("@")[0] || null;

  return (
    <div className={styles.page}>
      {/* Nav */}
      <nav>
        <Link href="/" className={styles.brand}>
          <span className={styles.brandDot} />
          SYLON
        </Link>
        <span className={`${styles.navLine} mono`}>See you later — or not.</span>
        <div className={styles.navActions}>
          {member ? (
            <>
              {member.isAdmin && (
                <Link href="/admin" className={`${styles.signout} mono`}>
                  Admin
                </Link>
              )}
              <Link href="/profile" className={styles.profileChip} aria-label={`${name}'s profile`}>
                {member.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={member.photoUrl} alt={name ?? ""} className={styles.avatar} />
                ) : (
                  <span className={styles.avatar} aria-hidden="true">
                    {(name ?? "?").charAt(0).toUpperCase()}
                  </span>
                )}
                <span className={styles.profileText}>
                  <strong>{name}</strong>
                  {member.instagramHandle && <span>@{member.instagramHandle}</span>}
                </span>
              </Link>
              <form action={signOut}>
                <button type="submit" className={styles.signout}>
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <a href="/sign-in" className={styles.signIn}>
              What is our password?
            </a>
          )}
        </div>
      </nav>

      <main id="top">
        {/* Hero */}
        <section className={styles.profileHero}>
          <div>
            <div className={`${styles.kicker} mono`}>{displayName}&apos;s future atlas</div>
            <h1>
              See you
              <span className={styles.outline}>somewhere.</span>
            </h1>
            <div className={styles.intro}>
              <span className={`${styles.introNumber} mono`}>01</span>
              <p>
                {displayName}&apos;s trips and travel ideas — some booked, some still just a
                maybe. Public plans below; the rest need a little help from{" "}
                <mark>an invite.</mark>
              </p>
            </div>
          </div>
          <aside className={styles.passport} aria-label="Profile summary">
            <span className={`${styles.passportLabel} mono`}>Departures on my mind</span>
            <span className={styles.passportCount}>
              {String(upcomingCount).padStart(2, "0")}
            </span>
            <span className={styles.passportCopy}>public possibilities currently in motion</span>
            <div className={`${styles.passportMeta} mono`}>
              <span>{items.length} public plans</span>
              <span>@{handle}</span>
            </div>
          </aside>
        </section>

        {/* Ticker */}
        {items.length > 0 && (
          <div className={styles.ticker} aria-hidden="true">
            <div className={`${styles.tickerTrack} mono`}>
              {Array(2)
                .fill(
                  items
                    .map((i) => `${i.title.toUpperCase()} — ${i.status.toUpperCase()}`)
                    .join(" / ") + " / "
                )
                .join("")}
            </div>
          </div>
        )}

        <PlansSection
          items={items}
          displayName={displayName}
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

      <footer>
        <div className={styles.footerBrand}>SYLON</div>
        <div className={`${styles.footerMeta} mono`}>
          See you later (or not)
          <br />
          @{handle}
        </div>
      </footer>
    </div>
  );
}
