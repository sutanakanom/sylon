import { notFound } from "next/navigation";
import { getItemBySlug } from "@/lib/data";
import {
  labelFor,
  formatDateRange,
  routeText,
  tripDayCount,
  legDateRange,
} from "@/lib/item-display";
import { routeCode } from "../../_lib/route-code";
import { V2Nav } from "../../_components/V2Nav";
import { V2Footer } from "../../_components/V2Footer";
import { V2ShareButton } from "../../_components/V2ShareButton";
import styles from "../../v2.module.css";

export const metadata = {
  title: "HK Disney Run — SYLON V2",
};

export default async function V2TripPage() {
  const item = await getItemBySlug("hk-disney-run");
  if (!item || item.kind !== "trip") notFound();

  const days = tripDayCount(item);
  const codes = item.legs.length ? item.legs.map((l) => routeCode(l.place)) : item.countries.map(routeCode);
  const doneCount = item.checklist.filter((c) => c.done).length;

  return (
    <div className={styles.root}>
      <V2Nav backHref="/v2/kanom" backLabel="Kanom's plans" v1Href="/trip/hk-disney-run" />

      <div className={styles.gutter}>
        {/* Hero — boarding pass */}
        <section style={{ padding: "clamp(40px, 7vh, 72px) 0 0" }}>
          <div className={styles.kicker}>Trip · @kanom</div>
          <h1 className={styles.headline} style={{ fontSize: "clamp(3.2rem, 8vw, 8rem)" }}>
            HK DISNEY
            <br />
            <span className={styles.outline}>RUN.</span>
          </h1>
          <p className={styles.body} style={{ maxWidth: 520, marginTop: 18, fontSize: "1.05rem" }}>
            {item.summary} Main event: {item.mainEvent}.
          </p>

          <div
            className={`${styles.cardBone} ${styles.shadowRed}`}
            style={{ marginTop: 32, position: "relative" }}
          >
            <div className={styles.tape} />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: 0,
              }}
            >
              <div style={{ padding: "4px 20px 4px 0" }}>
                <div className={styles.meta} style={{ color: "var(--black)", opacity: 0.55 }}>
                  Status
                </div>
                <div style={{ fontWeight: 800, fontSize: "1.1rem", marginTop: 4 }}>{labelFor(item)}</div>
              </div>
              <div className={styles.perforated} style={{ padding: "4px 20px" }}>
                <div className={styles.meta} style={{ color: "var(--black)", opacity: 0.55 }}>
                  Dates
                </div>
                <div style={{ fontWeight: 800, fontSize: "1.1rem", marginTop: 4 }}>
                  {formatDateRange(item)}
                </div>
              </div>
              <div className={styles.perforated} style={{ padding: "4px 20px" }}>
                <div className={styles.meta} style={{ color: "var(--black)", opacity: 0.55 }}>
                  Route
                </div>
                <div style={{ fontWeight: 800, fontSize: "1.1rem", marginTop: 4 }}>
                  {codes.join(" → ")}
                </div>
              </div>
              <div className={styles.perforated} style={{ padding: "4px 0 4px 20px" }}>
                <div className={styles.meta} style={{ color: "var(--black)", opacity: 0.55 }}>
                  Going with
                </div>
                <div style={{ fontWeight: 800, fontSize: "1.1rem", marginTop: 4 }}>
                  {item.companionName ?? "Just Kanom"}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 24 }}>
            <V2ShareButton
              title={item.title}
              text={`${item.title} — ${routeText(item)}, ${formatDateRange(item)}`}
              label="Share this trip ↗"
              variant="primary"
            />
            <span className={`${styles.tag} ${styles.tagRed}`}>{routeText(item)}</span>
          </div>
        </section>

        {/* Itinerary */}
        <section style={{ padding: "64px 0 8px" }}>
          <div className={styles.kicker}>01 / Itinerary</div>
          <h2 className={styles.sectionHeading}>{days ? `${days} days.` : "Route."}</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {item.legs.map((leg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "18px 0",
                  borderBottom: i < item.legs.length - 1 ? "1px solid var(--line)" : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
                  <span className={styles.meta} style={{ color: "var(--red)" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span style={{ fontWeight: 800, fontSize: "clamp(1.2rem, 2.4vw, 1.7rem)", textTransform: "uppercase" }}>
                    {leg.place}
                  </span>
                </div>
                <span className={styles.meta}>{legDateRange(leg)}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Readiness + checklist */}
        <section className={styles.grid2} style={{ padding: "56px 0 8px", alignItems: "start" }}>
          <div>
            <div className={styles.kicker}>02 / Readiness</div>
            <h2 className={styles.sectionHeading} style={{ fontSize: "clamp(2rem, 3.4vw, 3.2rem)" }}>
              {item.readinessPercent ?? 0}% sorted.
            </h2>
            <div className={styles.meterTrack}>
              <div
                className={styles.meterFill}
                style={{ width: `${item.readinessPercent ?? 0}%` }}
              />
            </div>
            <div className={styles.meta} style={{ marginTop: 10 }}>
              {doneCount} / {item.checklist.length} handled
            </div>

            {item.noteQuote && (
              <div
                className={`${styles.cardDashed} ${styles.rotateNeg} ${styles.shadowLime}`}
                style={{ marginTop: 28, maxWidth: 420 }}
              >
                <div className={styles.meta} style={{ marginBottom: 10 }}>
                  Note to self
                </div>
                <p style={{ fontSize: "1.05rem", lineHeight: 1.4, fontWeight: 600 }}>
                  &ldquo;{item.noteQuote}&rdquo;
                </p>
                {item.noteAuthor && (
                  <div className={styles.meta} style={{ marginTop: 12, color: "var(--ash)" }}>
                    — {item.noteAuthor}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className={styles.card}>
            <div className={styles.meta} style={{ marginBottom: 16 }}>
              Before we go
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {item.checklist.map((c, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span
                    aria-hidden
                    style={{
                      width: 20,
                      height: 20,
                      flexShrink: 0,
                      border: "1.5px solid var(--bone)",
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: c.done ? "var(--lime)" : "transparent",
                      color: "var(--black)",
                      fontSize: "0.7rem",
                      fontWeight: 800,
                    }}
                  >
                    {c.done ? "✓" : ""}
                  </span>
                  <span
                    style={{
                      fontSize: "0.95rem",
                      textDecoration: c.done ? "line-through" : "none",
                      opacity: c.done ? 0.6 : 1,
                    }}
                  >
                    {c.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <V2Footer />
    </div>
  );
}
