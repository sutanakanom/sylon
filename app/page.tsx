import Link from "next/link";
import { getCurrentMember } from "@/lib/current-member";
import { SiteShell } from "@/components/SiteShell";
import styles from "./SylonDesign.module.css";

// Generic landing page. v1 only has one host (Kanom), so this mostly
// exists to set the tone and point somewhere real — once the platform
// opens to other hosts (a later, non-v1 step per the requirements doc),
// this is where new hosts would sign up and existing pages get listed.
export default async function LandingPage() {
  const member = await getCurrentMember();

  return (
    <SiteShell member={member}>
      <main id="top" className={styles.heroPage}>
        {/* Hero */}
        <section className={styles.profileHero}>
          <div>
            <div className={`${styles.kicker} mono`}>See you later — or not</div>
            <h1 className={styles.heroTitle}>
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
            <div style={{ marginTop: "32px" }}>
              <Link href="/kanom" className={styles.cta}>
                See Kanom&apos;s plans ↗
              </Link>
            </div>
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
    </SiteShell>
  );
}
