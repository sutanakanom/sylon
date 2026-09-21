"use client";

import { useT } from "./LocaleProvider";
import styles from "@/app/SylonDesign.module.css";

export function SiteFooter({ metaLines }: { metaLines?: string[] }) {
  const { t } = useT();
  const lines = metaLines ?? [t("footer.defaultMeta")];

  return (
    <footer>
      <div className={styles.footerBrand}>SYLON</div>
      <div className={`${styles.footerMeta} mono`}>
        {lines.map((line, i) => (
          <span key={i}>
            {line}
            {i < lines.length - 1 && <br />}
          </span>
        ))}
      </div>
    </footer>
  );
}
