// Small, presentation-only helpers shared by the personal page's carousel,
// board and IG Story generator. Rough info only — no exact dates, no member
// names — matching the "rough view" rule for anything public/shareable.

import { Item, Leg, Trip } from "./types";

// Full "where" line, including the vote count for a manifest — for a
// single-line slot (the board banner's <em>, the story board's rows) that
// has nowhere else to show the vote count.
export function whereText(item: Item): string {
  if (item.kind === "trip") return item.countries.join(" + ");
  const total = item.countryVotes.reduce((sum, v) => sum + v.votes, 0);
  if (total === 0) return item.countryVotes.map((v) => v.country).join(" or ");
  const leader = item.countryVotes.slice().sort((a, b) => b.votes - a.votes)[0];
  return `${leader.country} leading · ${total} vote${total === 1 ? "" : "s"} so far`;
}

// Just the place, no vote count — for a two-column layout (the carousel's
// snapshot-foot) that already shows the vote count in its own slot via
// activitySummary(), so whereText() there would repeat it.
export function whereOnly(item: Item): string {
  if (item.kind === "trip") return item.countries.join(" + ");
  const total = item.countryVotes.reduce((sum, v) => sum + v.votes, 0);
  if (total === 0) return item.countryVotes.map((v) => v.country).join(" or ");
  const leader = item.countryVotes.slice().sort((a, b) => b.votes - a.votes)[0];
  return `${leader.country} leading`;
}

export function totalVotes(item: Item): number {
  if (item.kind !== "manifest") return 0;
  return item.countryVotes.reduce((sum, v) => sum + v.votes, 0);
}

export function voteShare(item: Item): number | null {
  if (item.kind !== "manifest") return null;
  const total = totalVotes(item);
  if (total === 0) return null;
  const leader = item.countryVotes.slice().sort((a, b) => b.votes - a.votes)[0];
  return Math.round((leader.votes / total) * 100);
}

// Plain-text "TRIP" / "MANIFEST" — for contexts where the colorful
// KindBadge pill would clash with a card's own background (a colored
// carousel snapshot, board banner, or canvas row). Uses currentColor there
// instead of a fixed color.
export function kindLabel(item: Item): string {
  return item.kind === "trip" ? "TRIP" : "MANIFEST";
}

// A short "what's happening" line for a snapshot/banner's secondary slot —
// member count for a trip, vote count for a manifest.
export function activitySummary(item: Item): string {
  if (item.kind === "trip") {
    return item.memberCount === 0
      ? "Be the first"
      : `${item.memberCount} member${item.memberCount === 1 ? "" : "s"}`;
  }
  const votes = totalVotes(item);
  return votes === 0 ? "No votes yet" : `${votes} vote${votes === 1 ? "" : "s"}`;
}

// --- Detail-page helpers (trip/manifest hero poster + timeline) --------

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatDay(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return isoDate;
  return `${String(day).padStart(2, "0")} ${MONTHS[month - 1]}`;
}

function formatDayWithYear(isoDate: string): string {
  const [year] = isoDate.split("-").map(Number);
  return `${formatDay(isoDate)} ${year}`;
}

// "28 Nov — 04 Dec 2026" from the trip's full leg list, earliest start to
// latest end. Falls back to the rough date when there are no legs yet.
export function formatDateRange(item: Trip): string {
  if (item.legs.length === 0) return item.roughDate;
  const starts = item.legs.map((l) => l.startDate).sort();
  const ends = item.legs.map((l) => l.endDate).sort();
  const start = starts[0];
  const end = ends[ends.length - 1];
  if (start === end) return formatDayWithYear(start);
  return `${formatDay(start)} — ${formatDayWithYear(end)}`;
}

// "Hong Kong → Shenzhen" — the leg places in order, for the poster's
// route line. Falls back to the country list when there are no legs.
export function routeText(item: Trip): string {
  if (item.legs.length === 0) return item.countries.join(" + ");
  return item.legs.map((l) => l.place).join(" → ");
}

// Inclusive night/day count spanning every leg, for the timeline's
// section title ("6 days"). Falls back to leg count when dates don't
// parse cleanly.
export function tripDayCount(item: Trip): number | null {
  if (item.legs.length === 0) return null;
  const starts = item.legs.map((l) => new Date(l.startDate).getTime());
  const ends = item.legs.map((l) => new Date(l.endDate).getTime());
  const start = Math.min(...starts);
  const end = Math.max(...ends);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  const days = Math.round((end - start) / 86_400_000) + 1;
  return days > 0 ? days : null;
}

// A short two-letter watermark for the poster corner — from the first
// country's initials, or the title's initials when there's no country
// yet (an all-open manifest).
export function posterMark(item: Item): string {
  const source = item.kind === "trip" ? item.countries[0] : item.countryVotes[0]?.country;
  const text = source || item.title;
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return text.slice(0, 2).toUpperCase() || "??";
}

export function legDateRange(leg: Leg): string {
  if (leg.startDate === leg.endDate) return formatDay(leg.startDate);
  return `${formatDay(leg.startDate)} – ${formatDay(leg.endDate)}`;
}

// Gating for the manifest v2 "convert to trip" button — plain sync
// helper, kept out of app/actions/manifest.ts because a "use server" file
// can only export async functions.
export function canConvertManifest(item: {
  decidedCountry: string | null;
  targetStartDate: string | null;
  targetEndDate: string | null;
}): boolean {
  return Boolean(item.decidedCountry && item.targetStartDate && item.targetEndDate);
}

// --- Manifest v2: convert-progress meter --------------------------------
// Four stages mirroring the "What we know" anchors going from Open to
// Known: Manifesting (always true — it exists), Gathering ideas (someone
// has actually engaged — a vote, an idea, or an availability response),
// Taking shape (the host has decided a location), Trip (converted). The
// meter fill is just stageIndex/3, no separate weighting — it's meant to
// read as "how many of the four are lit," matching the mock's stage row.
const MANIFEST_STAGES = ["Manifesting", "Gathering ideas", "Taking shape", "Trip"] as const;

export function manifestStageProgress(
  item: { decidedCountry: string | null; status: string },
  hasActivity: boolean
): { stages: readonly string[]; activeCount: number; percent: number } {
  let activeCount = 1; // Manifesting is always on — it exists.
  if (hasActivity) activeCount = 2;
  if (item.decidedCountry) activeCount = 3;
  if (item.status === "converted") activeCount = 4;
  return {
    stages: MANIFEST_STAGES,
    activeCount,
    percent: Math.round((activeCount / MANIFEST_STAGES.length) * 100),
  };
}
