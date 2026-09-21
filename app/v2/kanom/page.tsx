import { notFound } from "next/navigation";
import Link from "next/link";
import { getPublicItems, handleExists } from "@/lib/data";
import { Item } from "@/lib/types";
import {
  labelFor,
  kindLabel,
  whereOnly,
  activitySummary,
  formatDateRange,
  routeText,
} from "@/lib/item-display";
import { routeCode } from "../_lib/route-code";
import { V2Nav } from "../_components/V2Nav";
import { V2Footer } from "../_components/V2Footer";
import { V2ShareButton } from "../_components/V2ShareButton";
import styles from "../v2.module.css";

export const metadata = {
  title: "Kanom — SYLON V2",
};

// Deterministic-looking "randomness" for the scrapbook rotation/shadow
// variety, keyed off the item id so the layout doesn't jump between
// server renders.
function cardTreatment(id: string): { rotate?: string; shadow: string } {
  const n = id.charCodeAt(0) + id.length;
  const rotates = [undefined, styles.rotateNeg, styles.rotatePos];
  const shadows = [styles.shadowRed, styles.shadowLime, styles.shadowBlack];
  return { rotate: rotates[n % rotates.length], shadow: shadows[n % shadows.length] };
}

export default async function V2KanomPage() {
  const exists = await handleExists("kanom");
  if (!exists) notFound();

  const items = await getPublicItems("kanom");
  const trips = items.filter((i): i is Extract<Item, { kind: "trip" }> => i.kind === "trip");
  const manifests = items.filter(
    (i): i is Extract<Item, { kind: "manifest" }> => i.kind === "manifest"
  );

  return (
    <div className={styles.root}>
      <V2Nav v1Href="/kanom" />

      <div className={styles.gutter}>
        {/* Hero — member pass */}
        <section style={{ padding: "clamp(48px, 8vh, 88px) 0 56px" }}>
          <div className={styles.kicker}>All-access pass · @kanom</div>
          <h1 className={styles.headline}>
            SEE YOU
            <br />
            <span className={styles.outline}>SOMEWHERE.</span>
          </h1>

          <div className={styles.heroGrid}>
            <p className={styles.body} style={{ maxWidth: 520, fontSize: "1.05rem" }}>
              Confirmed trips, half-decided ideas, and the concerts Kanom is manifesting into
              existence. Some of it&apos;s booked. Some of it&apos;s just a rumor she&apos;s
              telling out loud until it becomes real.
            </p>

            <div className={`${styles.cardBone} ${styles.shadowRed}`} style={{ position: "relative" }}>
              <div className={styles.tape} />
              <div className={styles.meta} style={{ color: "var(--ash)", opacity: 0.75 }}>
                Member since 2026
              </div>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: "2.6rem",
                  letterSpacing: "-0.03em",
                  margin: "6px 0 4px",
                }}
              >
                K.
              </div>
              <div style={{ fontWeight: 700, marginBottom: 14 }}>Kanom</div>
              <div className={styles.barcode} aria-hidden style={{ color: "var(--black)", marginBottom: 14 }}>
                {[6, 3, 8, 2, 5, 9, 3, 7, 4, 6, 2, 8, 5, 3, 7, 4, 9, 2, 6, 3].map((h, i) => (
                  <span key={i} style={{ height: `${h * 2}px` }} />
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <span className={styles.meta} style={{ color: "var(--black)", opacity: 0.6 }}>
                  Bangkok based
                </span>
                <span className={styles.meta} style={{ color: "var(--black)", opacity: 0.6 }}>
                  {trips.length + manifests.length} plans
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Confirmed / planning trips */}
        <section style={{ padding: "24px 0 8px" }}>
          <div className={styles.kicker}>01 / Trips</div>
          <h2 className={styles.sectionHeading}>Actually happening.</h2>

          <div className={styles.cardGrid}>
            {trips.map((trip, i) => {
              const t = cardTreatment(trip.id);
              const codes = trip.legs.length
                ? trip.legs.map((l) => routeCode(l.place))
                : trip.countries.map(routeCode);
              return (
                <Link
                  key={trip.id}
                  href={
                    trip.slug === "hk-disney-run" ? "/v2/trip/hk-disney-run" : `/trip/${trip.slug}`
                  }
                  className={`${styles.cardBone} ${t.shadow}`}
                  style={{ display: "block", textDecoration: "none", color: "var(--black)" }}
                >
                  <div className={t.rotate ?? ""}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 14,
                      }}
                    >
                      <span className={styles.meta} style={{ color: "var(--black)", opacity: 0.55 }}>
                        {String(i + 1).padStart(2, "0")} / {String(trips.length).padStart(2, "0")}
                      </span>
                      <span className={styles.stamp} style={{ color: "var(--red)" }}>
                        {labelFor(trip)}
                      </span>
                    </div>
                    <div className={styles.cardTitle}>{trip.title}</div>
                    <div style={{ color: "var(--charcoal)", opacity: 0.7, fontSize: "0.88rem", margin: "6px 0 16px" }}>
                      {trip.summary}
                    </div>
                    <div className={styles.meta} style={{ color: "var(--black)", marginBottom: 12 }}>
                      {codes.join(" → ")}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        borderTop: "1px dashed var(--line)",
                        paddingTop: 12,
                      }}
                    >
                      <span className={styles.meta} style={{ color: "var(--black)", opacity: 0.6 }}>
                        {trip.roughDate}
                      </span>
                      <span className={styles.meta} style={{ color: "var(--black)", opacity: 0.6 }}>
                        {activitySummary(trip)}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Manifests */}
        <section style={{ padding: "56px 0 8px" }}>
          <div className={styles.kicker}>02 / Manifesting</div>
          <h2 className={styles.sectionHeading}>
            Not decided yet. <span className={styles.outline}>Loudly hoped for.</span>
          </h2>

          <div className={styles.cardGrid}>
            {manifests.map((manifest, i) => {
              const t = cardTreatment(manifest.id);
              return (
                <div key={manifest.id} className={`${styles.cardDashed} ${t.shadow} ${t.rotate ?? ""}`}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 14,
                    }}
                  >
                    <span className={styles.meta}>
                      {String(i + 1).padStart(2, "0")} / {String(manifests.length).padStart(2, "0")}
                    </span>
                    <span className={`${styles.tag} ${styles.tagLime}`}>{labelFor(manifest)}</span>
                  </div>
                  <div className={styles.cardTitle} style={{ color: "var(--bone)" }}>
                    {manifest.title}
                  </div>
                  <div className={styles.body} style={{ margin: "6px 0 16px" }}>
                    {manifest.summary}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      borderTop: "1px dashed var(--line)",
                      paddingTop: 12,
                    }}
                  >
                    <span className={styles.meta}>{whereOnly(manifest)}</span>
                    <span className={styles.meta}>{activitySummary(manifest)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Manifesto pull-quote */}
        <section style={{ padding: "72px 0 24px" }}>
          <div className={`${styles.cardDashed} ${styles.leopard}`} style={{ border: "none", color: "var(--black)" }}>
            <div className={styles.meta} style={{ color: "var(--black)", opacity: 0.7 }}>
              A note from future Kanom
            </div>
            <p
              style={{
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "-0.02em",
                fontSize: "clamp(1.4rem, 3vw, 2.2rem)",
                lineHeight: 1.2,
                margin: "10px 0 0",
                maxWidth: 720,
              }}
            >
              Not every plan is a promise. Some are just a place I haven&apos;t been yet — and an
              open invitation.
            </p>
          </div>
        </section>

        <section style={{ padding: "16px 0 40px" }}>
          <V2ShareButton
            title="Kanom's plans — SYLON"
            text="Confirmed trips, half-decided ideas, and concerts I'm manifesting."
            label="Share my plans ↗"
          />
        </section>
      </div>

      <V2Footer />
    </div>
  );
}
