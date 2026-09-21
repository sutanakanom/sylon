"use client";

import Link from "next/link";
import { Member } from "@/lib/current-member";
import { signOut } from "@/app/actions/auth";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useT } from "./LocaleProvider";
import styles from "@/app/SylonDesign.module.css";

// The one nav bar for the whole site — used by every page via SiteShell.
// Change it here and it changes everywhere, instead of six copies
// drifting apart page by page. "use client" so it can read the current
// language via useT() without every caller having to pass it down.
export function SiteNav({
  member,
  centerLabel,
}: {
  member: Member | null;
  centerLabel?: string;
}) {
  const { t } = useT();
  const name = member?.displayName || member?.email.split("@")[0] || null;

  return (
    <nav>
      <Link href="/" className={styles.brand}>
        <span className={styles.brandDot} />
        SYLON
      </Link>
      <span className={`${styles.navLine} mono`}>{centerLabel ?? t("nav.defaultCenter")}</span>
      <div className={styles.navActions}>
        <LanguageSwitcher />
        {member ? (
          <>
            {member.handle && (
              <Link href="/new" className={`${styles.signout} mono`}>
                {t("nav.addPlan")}
              </Link>
            )}
            {member.isAdmin && (
              <Link href="/admin" className={`${styles.signout} mono`}>
                {t("nav.admin")}
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
                {t("nav.signOut")}
              </button>
            </form>
          </>
        ) : (
          <a href="/sign-in" className={styles.signIn}>
            {t("nav.signInCta")}
          </a>
        )}
      </div>
    </nav>
  );
}
