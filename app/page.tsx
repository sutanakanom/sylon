import Link from "next/link";
import { getCurrentMember } from "@/lib/current-member";
import { getLocale } from "@/lib/i18n/locale";
import { t } from "@/lib/i18n/dictionary";
import { SiteShell } from "@/components/SiteShell";
import styles from "./SylonDesign.module.css";

// Generic landing page. v1 only has one host (Kanom), so this mostly
// exists to set the tone and point somewhere real — once the platform
// opens to other hosts (a later, non-v1 step per the requirements doc),
// this is where new hosts would sign up and existing pages get listed.
export default async function LandingPage() {
  const [member, locale] = await Promise.all([getCurrentMember(), getLocale()]);

  return (
    <SiteShell member={member}>
      <main id="top" className={styles.heroPage}>
        {/* Hero */}
        <section className={styles.profileHero}>
          <div>
            <div className={`${styles.kicker} mono`}>{t(locale, "landing.kicker")}</div>
            <h1 className={styles.heroTitle}>
              {t(locale, "landing.titleLine1")}
              <span className={styles.outline}>{t(locale, "landing.titleLine2")}</span>
            </h1>
            <div className={styles.intro}>
              <span className={`${styles.introNumber} mono`}>01</span>
              <p>{t(locale, "landing.intro")}</p>
            </div>
            <div style={{ marginTop: "32px" }}>
              <Link href="/kanom" className={styles.cta}>
                {t(locale, "landing.seeKanomsPlans")}
              </Link>
            </div>
          </div>
          <aside className={styles.passport} aria-label="About SYLON">
            <span className={`${styles.passportLabel} mono`}>{t(locale, "landing.firstStop")}</span>
            <span className={styles.passportCount}>K.</span>
            <span className={styles.passportCopy}>{t(locale, "landing.passportCopy")}</span>
            <div className={`${styles.passportMeta} mono`}>
              <span>{t(locale, "landing.bangkokBased")}</span>
              <span>{t(locale, "landing.since2026")}</span>
            </div>
          </aside>
        </section>

        {/* Manifesto */}
        <section className={styles.manifesto}>
          <span className={`${styles.manifestoLabel} mono`}>
            {t(locale, "landing.manifestoLabel")
              .split("\n")
              .map((line, i) => (
                <span key={i}>
                  {line}
                  {i === 0 && <br />}
                </span>
              ))}
          </span>
          <blockquote>{t(locale, "landing.manifestoBody")}</blockquote>
        </section>
      </main>
    </SiteShell>
  );
}
