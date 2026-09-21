import Link from "next/link";
import { getCurrentMember } from "@/lib/current-member";
import { signOut } from "@/app/actions/auth";
import styles from "./SylonDesign.module.css";

// Generic landing page. v1 only has one host (Kanom), so this mostly
// exists to set the tone and point somewhere real — once the platform
// opens to other hosts (a later, non-v1 step per the requirements doc),
// this is where new hosts would sign up and existing pages get listed.
// Shares SylonDesign.module.css with the personal page so the brand
// language (nav, hero type, passport-style card, manifesto, footer)
// stays one system instead of two competing looks.
export default async function LandingPage() {
  const member = await getCurrentMember();
  const name = member?.displayName || member?.email.split("@")[0] || null;

  return (
    <div className={styles.page}>
      {/* Nav */}
      <nav>
        <span className={styles.brand}>
          <span className={styles.brandDot} />
          SYLON
        </span>
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
            <div className={`${styles.kicker} mono`}>See you later — or not</div>
            <h1>
              See you
              <span className={styles.outline}>somewhere.</span>
            </h1>
            <div className={styles.intro}>
              <span className={`${styles.introNumber} mono`}>01</span>
              <p>
                A place for sharing the trips you&apos;re actually planning — and the ones
                that are still just a <mark>maybe.</mark>
              </p>
            </div>
            <Link href="/kanom" className={styles.cta} style={{ marginTop: "32px" }}>
              See Kanom&apos;s plans ↗
            </Link>
          </div>
          <aside className={styles.passport} aria-label="About SYLON">
            <span className={`${styles.passportLabel} mono`}>First stop</span>
            <span className={styles.passportCount}>K.</span>
            <span className={styles.passportCopy}>
              Kanom&apos;s the only host here so far — more may join later.
            </span>
            <div className={`${styles.passportMeta} mono`}>
              <span>Bangkok based</span>
              <span>Since 2026</span>
            </div>
          </aside>
        </section>

        {/* Manifesto */}
        <section className={styles.manifesto}>
          <span className={`${styles.manifestoLabel} mono`}>
            A note from
            <br />
            future us
          </span>
          <blockquote>
            Not every plan is a promise. Some are just a place we haven&apos;t been yet — and
            an <em>open invitation.</em>
          </blockquote>
        </section>
      </main>

      <footer>
        <div className={styles.footerBrand}>SYLON</div>
        <div className={`${styles.footerMeta} mono`}>See you later (or not)</div>
      </footer>
    </div>
  );
}
