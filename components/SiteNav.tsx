import Link from "next/link";
import { Member } from "@/lib/current-member";
import { signOut } from "@/app/actions/auth";
import styles from "@/app/SylonDesign.module.css";

// The one nav bar for the whole site — used by every page via SiteShell.
// Change it here and it changes everywhere, instead of six copies
// drifting apart page by page.
export function SiteNav({
  member,
  centerLabel = "See you later — or not.",
}: {
  member: Member | null;
  centerLabel?: string;
}) {
  const name = member?.displayName || member?.email.split("@")[0] || null;

  return (
    <nav>
      <Link href="/" className={styles.brand}>
        <span className={styles.brandDot} />
        SYLON
      </Link>
      <span className={`${styles.navLine} mono`}>{centerLabel}</span>
      <div className={styles.navActions}>
        {member ? (
          <>
            {member.isAdmin && (
              <>
                <Link href="/new" className={`${styles.signout} mono`}>
                  + Add a plan
                </Link>
                <Link href="/admin" className={`${styles.signout} mono`}>
                  Admin
                </Link>
              </>
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
  );
}
