import styles from "@/app/SylonDesign.module.css";

export function SiteFooter({ metaLines = ["See you later (or not)"] }: { metaLines?: string[] }) {
  return (
    <footer>
      <div className={styles.footerBrand}>SYLON</div>
      <div className={`${styles.footerMeta} mono`}>
        {metaLines.map((line, i) => (
          <span key={i}>
            {line}
            {i < metaLines.length - 1 && <br />}
          </span>
        ))}
      </div>
    </footer>
  );
}
