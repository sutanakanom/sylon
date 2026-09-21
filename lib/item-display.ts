// Small, presentation-only helpers shared by the personal page's carousel,
// board and IG Story generator. Rough info only — no exact dates, no member
// names — matching the "rough view" rule for anything public/shareable.

import { Item } from "./types";

export function whereText(item: Item): string {
  if (item.kind === "trip") return item.countries.join(" + ");
  const total = item.countryVotes.reduce((sum, v) => sum + v.votes, 0);
  if (total === 0) return item.countryVotes.map((v) => v.country).join(" or ");
  const leader = item.countryVotes.slice().sort((a, b) => b.votes - a.votes)[0];
  return `${leader.country} leading · ${total} vote${total === 1 ? "" : "s"} so far`;
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
