import Link from "next/link";
import styles from "../v2.module.css";

// V2's own header bar — a boarding-pass strip, not the V1 site nav.
// backHref/backLabel point at the previous V2 screen (or nowhere, on the
// profile page); v1Href always points at the matching V1 page so a
// reviewer can flip between the two versions of the same content.
export function V2Nav({
  backHref,
  backLabel,
  v1Href,
}: {
  backHref?: string;
  backLabel?: string;
  v1Href: string;
}) {
  return (
    <div className={styles.nav}>
      <div className={styles.navLeft}>
        <Link href="/v2/kanom" className={styles.navBrand}>
          SYLON
        </Link>
        {backHref && (
          <Link href={backHref} className={styles.navBack}>
            ← {backLabel}
          </Link>
        )}
      </div>
      <div className={styles.navRight}>
        <span className={styles.v2Badge}>V2 experiment</span>
        <Link href={v1Href} className={styles.v1Link}>
          View V1 ↗
        </Link>
      </div>
    </div>
  );
}
