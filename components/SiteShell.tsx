import { Member } from "@/lib/current-member";
import { SiteNav } from "./SiteNav";
import { SiteFooter } from "./SiteFooter";
import styles from "@/app/SylonDesign.module.css";

// The one page shell for the whole site: same nav, same footer, same
// fonts/colors (SylonDesign.module.css), on every route. A page passes
// its own content as children and only needs to say who's signed in and,
// optionally, what belongs in the nav's center line and the footer.
export function SiteShell({
  member,
  centerLabel,
  footerMeta,
  children,
}: {
  member: Member | null;
  centerLabel?: string;
  footerMeta?: string[];
  children: React.ReactNode;
}) {
  return (
    <div className={styles.shell}>
      <SiteNav member={member} centerLabel={centerLabel} />
      {children}
      <SiteFooter metaLines={footerMeta} />
    </div>
  );
}
