// Shared types for Trips and Manifests, matching the requirements doc's
// "Two modes: Manifest and Trip" section.

export type TripStatus = "planning" | "confirmed" | "completed" | "cancelled";
export type ManifestStatus = "open" | "converted" | "dropped";
export type Visibility = "public" | "invite-only";

// The site's playful labels, mapped from status. See the "Wording" section
// of the requirements doc.
export const TRIP_LABEL: Record<TripStatus, string> = {
  planning: "See you, maybe",
  confirmed: "See you",
  completed: "Saw you",
  cancelled: "Not see you",
};

export const MANIFEST_LABEL: Record<ManifestStatus, string> = {
  open: "Should we see?",
  converted: "See you",
  dropped: "Not see you",
};

export interface Leg {
  place: string;
  startDate: string; // ISO date
  endDate: string; // ISO date
}

export interface Trip {
  id: string;
  slug: string;
  kind: "trip";
  title: string;
  status: TripStatus;
  visibility: Visibility;
  roughDate: string; // shown to visitors, e.g. "Late Nov – early Dec"
  countries: string[];
  legs: Leg[];
  summary: string; // shown to visitors
  memberCount: number;
}

export interface Manifest {
  id: string;
  slug: string;
  kind: "manifest";
  title: string;
  status: ManifestStatus;
  visibility: Visibility;
  roughDate: string;
  countryVotes: { country: string; votes: number }[];
  summary: string;
  memberCount: number;
}

export type Item = Trip | Manifest;
