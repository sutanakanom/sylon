// Shared types for Trips and Manifests, matching the requirements doc's
// "Two modes: Manifest and Trip" section.

export type TripStatus = "planning" | "confirmed" | "completed" | "cancelled";
export type ManifestStatus = "open" | "converted" | "dropped";
export type Visibility = "public" | "invite-only";

// The site's playful stage labels, mapped from status. Shown alongside a
// separate Trip/Manifest type badge (see KindBadge / kindLabel), so these
// only need to say what stage the plan is at, not what kind it is.
export const TRIP_LABEL: Record<TripStatus, string> = {
  planning: "Maybe See You",
  confirmed: "See You",
  completed: "Saw You",
  cancelled: "Cancelled",
};

export const MANIFEST_LABEL: Record<ManifestStatus, string> = {
  open: "Manifesting",
  converted: "Became a Trip",
  dropped: "Not Manifesting",
};

export interface Leg {
  place: string;
  startDate: string; // ISO date
  endDate: string; // ISO date
}

export interface ChecklistItem {
  label: string;
  done: boolean;
}

export interface SignalItem {
  title: string;
  body: string;
}

export interface Trip {
  id: string;
  slug: string;
  kind: "trip";
  title: string;
  status: TripStatus;
  visibility: Visibility;
  ownerHandle: string;
  roughDate: string; // shown to visitors, e.g. "Late Nov – early Dec"
  countries: string[];
  legs: Leg[];
  summary: string; // shown to visitors
  memberCount: number;
  // Detail-page extras — all optional, all host-editable at creation.
  companionName: string | null; // "Going with"
  mainEvent: string | null;
  checklist: ChecklistItem[]; // "before we go"
  readinessPercent: number | null; // "ready meter"
  noteQuote: string | null;
  noteAuthor: string | null;
}

export interface Manifest {
  id: string;
  slug: string;
  kind: "manifest";
  title: string;
  status: ManifestStatus;
  visibility: Visibility;
  ownerHandle: string;
  roughDate: string;
  countryVotes: { country: string; votes: number }[];
  summary: string;
  memberCount: number;
  // Detail-page extras — all optional, all host-editable at creation.
  signals: SignalItem[]; // "signs of life" — how the maybe becomes real
  realityFundPercent: number | null;
  noteQuote: string | null;
  noteAuthor: string | null;
}

export type Item = Trip | Manifest;

export interface Comment {
  id: string;
  itemType: "trip" | "manifest";
  itemId: string;
  memberId: string;
  memberName: string;
  body: string;
  createdAt: string;
}

export type ChatTag = "date_idea" | "place_idea" | "im_in" | "note";

export const CHAT_TAG_LABEL: Record<ChatTag, string> = {
  date_idea: "Date idea",
  place_idea: "Place idea",
  im_in: "I'm in",
  note: "Note",
};

export interface ChatMessage {
  id: string;
  manifestId: string;
  memberId: string;
  memberName: string;
  tag: ChatTag;
  body: string;
  createdAt: string;
}

export interface Manifestor {
  id: string; // member id
  name: string;
}
