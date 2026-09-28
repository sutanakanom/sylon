"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase-admin";
import { getCurrentMember } from "@/lib/current-member";
import { TripStatus, Visibility, ChecklistItem, SignalItem } from "@/lib/types";
import { formatLegsDateRange, countriesFromLegs, MONTHS } from "@/lib/item-display";

function slugify(text: string): string {
  const base = text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return base || "plan";
}

async function uniqueSlug(base: string): Promise<string> {
  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return `${base}-${randomBytes(2).toString("hex")}`;
  }
  let slug = base;
  for (let i = 0; i < 5; i++) {
    const [{ count: tripCount }, { count: manifestCount }] = await Promise.all([
      supabaseAdmin.from("trips").select("id", { count: "exact", head: true }).eq("slug", slug),
      supabaseAdmin
        .from("manifests")
        .select("id", { count: "exact", head: true })
        .eq("slug", slug),
    ]);
    if (!tripCount && !manifestCount) return slug;
    slug = `${base}-${randomBytes(2).toString("hex")}`;
  }
  return `${base}-${randomBytes(3).toString("hex")}`;
}

// A member is a "host" (can publish trips/manifests) once they have a
// handle — the slug their own personal page and their plans live under
// (see supabase/step9-member-handle.sql). That's deliberately separate
// from isAdmin: isAdmin is the system-management capability for /admin,
// not "owns a page." Handles are assigned by an admin in /admin, so v1's
// one host (Kanom) still needs that done once, but nothing here is
// hardcoded to them anymore — whoever's signed in publishes under their
// own handle. Visitors without a handle can still join/comment/vote.
async function requireHost() {
  const member = await getCurrentMember();
  if (!member?.handle) throw new Error("Not authorized.");
  return member;
}

export type CreateItemResult = { ok: true; slug: string } | { ok: false; error: string };

export interface TripLegInput {
  place: string;
  country: string;
  startDate: string;
  endDate: string;
}

// A leg only counts once every field on it is filled in — a half-typed
// stop shouldn't silently make it into countries/rough_date.
function validLegs(legs: TripLegInput[]): TripLegInput[] {
  return legs.filter((l) => l.place.trim() && l.country.trim() && l.startDate && l.endDate);
}

export interface CreateTripInput {
  title: string;
  legs: TripLegInput[];
  summary: string;
  visibility: Visibility;
  status: TripStatus;
  companionName: string;
  mainEvent: string;
  checklist: ChecklistItem[];
  noteQuote: string;
  noteAuthor: string;
}

export async function createTrip(input: CreateTripInput): Promise<CreateItemResult> {
  const host = await requireHost();
  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return { ok: false, error: "Not configured." };
  }
  if (!input.title.trim()) return { ok: false, error: "Give it a title." };

  const legs = validLegs(input.legs);
  if (legs.length === 0) {
    return { ok: false, error: "Add at least one stop with a place, country and dates." };
  }

  const slug = await uniqueSlug(slugify(input.title));

  const { error } = await supabaseAdmin.from("trips").insert({
    slug,
    title: input.title.trim(),
    status: input.status,
    visibility: input.visibility,
    owner_handle: host.handle,
    rough_date: formatLegsDateRange(legs) || "Sometime",
    countries: countriesFromLegs(legs),
    legs,
    summary: input.summary.trim(),
    member_count: 1,
    companion_name: input.companionName.trim() || null,
    main_event: input.mainEvent.trim() || null,
    checklist: input.checklist.filter((c) => c.label.trim()),
    readiness_percent: null,
    note_quote: input.noteQuote.trim() || null,
    note_author: input.noteAuthor.trim() || null,
  });

  if (error) {
    console.error("createTrip failed", error);
    return { ok: false, error: "Couldn't save that trip. Try again." };
  }

  return { ok: true, slug };
}

// Lets the host check items off their own trip's "before we go" list
// straight from the detail page, without a separate edit page.
export async function toggleChecklistItem(
  tripId: string,
  slug: string,
  index: number
): Promise<CreateItemResult> {
  const host = await requireHost();
  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return { ok: false, error: "Not configured." };
  }

  const { data: tripRow } = await supabaseAdmin
    .from("trips")
    .select("checklist, owner_handle")
    .eq("id", tripId)
    .maybeSingle();

  if (!tripRow || tripRow.owner_handle !== host.handle) {
    return { ok: false, error: "Not authorized." };
  }

  const checklist = (tripRow.checklist as { label: string; done: boolean }[]) ?? [];
  if (!checklist[index]) return { ok: false, error: "Couldn't find that item." };

  checklist[index] = { ...checklist[index], done: !checklist[index].done };

  const { error } = await supabaseAdmin.from("trips").update({ checklist }).eq("id", tripId);
  if (error) return { ok: false, error: "Couldn't save that. Try again." };

  revalidatePath(`/trip/${slug}`);
  return { ok: true, slug };
}

export type ManifestDateMode = "exact" | "rough";

export interface CreateManifestInput {
  title: string;
  purpose: string;
  dateMode: ManifestDateMode;
  startDate: string; // used when dateMode === "exact"
  endDate: string;
  roughMonth: string; // "1".."12", or "" for "any month" — used when dateMode === "rough"
  roughYear: string;
  countryOptions: string[];
  summary: string;
  visibility: Visibility;
  signals: SignalItem[];
  realityFundPercent: number | null;
  noteQuote: string;
  noteAuthor: string;
}

// Turns the date-mode fields into the rough_date text shown to visitors,
// plus (when the dates are exact) the target_start_date/target_end_date
// that gate "Convert to trip." A rough month+year with no exact dates
// leaves both target dates unset — that's still Open, not Known.
function resolveManifestDates(input: CreateManifestInput): {
  roughDate: string;
  targetStartDate: string | null;
  targetEndDate: string | null;
} {
  if (input.dateMode === "exact" && input.startDate && input.endDate) {
    return {
      roughDate: formatLegsDateRange([{ startDate: input.startDate, endDate: input.endDate }]),
      targetStartDate: input.startDate,
      targetEndDate: input.endDate,
    };
  }

  const year = input.roughYear.trim();
  const monthIndex = input.roughMonth ? Number(input.roughMonth) : null;
  let roughDate = "Sometime";
  if (monthIndex && monthIndex >= 1 && monthIndex <= 12 && year) {
    roughDate = `${MONTHS[monthIndex - 1]} ${year}`;
  } else if (year) {
    roughDate = year;
  }

  return { roughDate, targetStartDate: null, targetEndDate: null };
}

export async function createManifest(input: CreateManifestInput): Promise<CreateItemResult> {
  const host = await requireHost();
  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return { ok: false, error: "Not configured." };
  }
  if (!input.title.trim()) return { ok: false, error: "Give it a title." };

  const slug = await uniqueSlug(slugify(input.title));
  const { roughDate, targetStartDate, targetEndDate } = resolveManifestDates(input);

  const { error } = await supabaseAdmin.from("manifests").insert({
    slug,
    title: input.title.trim(),
    status: "open",
    visibility: input.visibility,
    owner_handle: host.handle,
    rough_date: roughDate,
    country_votes: input.countryOptions
      .map((c) => c.trim())
      .filter(Boolean)
      .map((country) => ({ country, votes: 0 })),
    summary: input.summary.trim(),
    member_count: 1,
    signals: input.signals.filter((s) => s.title.trim()),
    reality_fund_percent: input.realityFundPercent,
    note_quote: input.noteQuote.trim() || null,
    note_author: input.noteAuthor.trim() || null,
    purpose: input.purpose.trim() || null,
    target_start_date: targetStartDate,
    target_end_date: targetEndDate,
  });

  if (error) {
    console.error("createManifest failed", error);
    return { ok: false, error: "Couldn't save that manifest. Try again." };
  }

  return { ok: true, slug };
}

// A member can edit a specific item only if they own THAT item's page —
// stricter than requireHost() (which only checks "has some handle"), so
// one host can't edit another host's plan once multi-host is real.
async function requireItemOwner(ownerHandle: string) {
  const member = await getCurrentMember();
  if (!member?.handle || member.handle !== ownerHandle) throw new Error("Not authorized.");
  return member;
}

export interface UpdateTripInput {
  title: string;
  legs: TripLegInput[];
  summary: string;
  visibility: Visibility;
  status: TripStatus;
  companionName: string;
  mainEvent: string;
  checklist: ChecklistItem[];
  noteQuote: string;
  noteAuthor: string;
}

export async function updateTrip(
  tripId: string,
  slug: string,
  input: UpdateTripInput
): Promise<CreateItemResult> {
  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return { ok: false, error: "Not configured." };
  }

  const { data: existing } = await supabaseAdmin
    .from("trips")
    .select("owner_handle")
    .eq("id", tripId)
    .maybeSingle();
  if (!existing) return { ok: false, error: "Couldn't find that trip." };

  await requireItemOwner(existing.owner_handle);
  if (!input.title.trim()) return { ok: false, error: "Give it a title." };

  const legs = validLegs(input.legs);
  if (legs.length === 0) {
    return { ok: false, error: "Add at least one stop with a place, country and dates." };
  }

  const { error } = await supabaseAdmin
    .from("trips")
    .update({
      title: input.title.trim(),
      status: input.status,
      visibility: input.visibility,
      rough_date: formatLegsDateRange(legs) || "Sometime",
      countries: countriesFromLegs(legs),
      legs,
      summary: input.summary.trim(),
      companion_name: input.companionName.trim() || null,
      main_event: input.mainEvent.trim() || null,
      checklist: input.checklist.filter((c) => c.label.trim()),
      note_quote: input.noteQuote.trim() || null,
      note_author: input.noteAuthor.trim() || null,
    })
    .eq("id", tripId);

  if (error) {
    console.error("updateTrip failed", error);
    return { ok: false, error: "Couldn't save those changes. Try again." };
  }

  revalidatePath(`/trip/${slug}`);
  revalidatePath(`/trip/${slug}/edit`);
  return { ok: true, slug };
}

// Soft delete: sets deleted_at instead of removing the row, so nothing
// downstream (comments, participants, chat, votes) needs cascade
// handling. lib/data.ts filters deleted_at is null everywhere it reads
// trips/manifests, so a deleted item simply stops showing up anywhere.
export async function deleteTrip(tripId: string, slug: string): Promise<CreateItemResult> {
  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return { ok: false, error: "Not configured." };
  }

  const { data: existing } = await supabaseAdmin
    .from("trips")
    .select("owner_handle")
    .eq("id", tripId)
    .maybeSingle();
  if (!existing) return { ok: false, error: "Couldn't find that trip." };

  const host = await requireItemOwner(existing.owner_handle);

  const { error } = await supabaseAdmin
    .from("trips")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", tripId);

  if (error) {
    console.error("deleteTrip failed", error);
    return { ok: false, error: "Couldn't delete that. Try again." };
  }

  revalidatePath(`/trip/${slug}`);
  revalidatePath(`/${host.handle}`);
  return { ok: true, slug: host.handle ?? "" };
}

export interface UpdateManifestInput {
  title: string;
  purpose: string;
  roughDate: string;
  countryOptions: string[];
  summary: string;
  visibility: Visibility;
  signals: SignalItem[];
  realityFundPercent: number | null;
  noteQuote: string;
  noteAuthor: string;
  availabilityWindows: string[];
  decidedCountry: string;
  targetStartDate: string;
  targetEndDate: string;
  creatorSummaryHeadline: string;
  creatorSummaryBody: string;
  creatorSummaryTags: string[];
}

export async function updateManifest(
  manifestId: string,
  slug: string,
  input: UpdateManifestInput
): Promise<CreateItemResult> {
  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return { ok: false, error: "Not configured." };
  }

  const { data: existing } = await supabaseAdmin
    .from("manifests")
    .select("owner_handle, country_votes")
    .eq("id", manifestId)
    .maybeSingle();
  if (!existing) return { ok: false, error: "Couldn't find that manifest." };

  await requireItemOwner(existing.owner_handle);
  if (!input.title.trim()) return { ok: false, error: "Give it a title." };

  // Keep real vote counts for options that still exist; drop the rest —
  // voteCountry() will re-tally from manifest_votes on the next vote
  // regardless, this just keeps the display consistent right after a save.
  const previousCounts = new Map<string, number>(
    (existing.country_votes as { country: string; votes: number }[]).map((v) => [v.country, v.votes])
  );
  const cleanOptions = input.countryOptions.map((c) => c.trim()).filter(Boolean);
  const countryVotes = cleanOptions.map((country) => ({
    country,
    votes: previousCounts.get(country) ?? 0,
  }));

  const decidedCountry = input.decidedCountry.trim();

  const { error } = await supabaseAdmin
    .from("manifests")
    .update({
      title: input.title.trim(),
      purpose: input.purpose.trim() || null,
      rough_date: input.roughDate.trim() || "Sometime",
      country_votes: countryVotes,
      summary: input.summary.trim(),
      visibility: input.visibility,
      signals: input.signals.filter((s) => s.title.trim()),
      reality_fund_percent: input.realityFundPercent,
      note_quote: input.noteQuote.trim() || null,
      note_author: input.noteAuthor.trim() || null,
      availability_windows: input.availabilityWindows.map((w) => w.trim()).filter(Boolean),
      decided_country: decidedCountry || null,
      target_start_date: input.targetStartDate.trim() || null,
      target_end_date: input.targetEndDate.trim() || null,
      creator_summary_headline: input.creatorSummaryHeadline.trim() || null,
      creator_summary_body: input.creatorSummaryBody.trim() || null,
      creator_summary_tags: input.creatorSummaryTags.map((t) => t.trim()).filter(Boolean),
      creator_summary_updated_at: new Date().toISOString(),
    })
    .eq("id", manifestId);

  if (error) {
    console.error("updateManifest failed", error);
    return { ok: false, error: "Couldn't save those changes. Try again." };
  }

  revalidatePath(`/manifest/${slug}`);
  revalidatePath(`/manifest/${slug}/edit`);
  return { ok: true, slug };
}

export async function deleteManifest(manifestId: string, slug: string): Promise<CreateItemResult> {
  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return { ok: false, error: "Not configured." };
  }

  const { data: existing } = await supabaseAdmin
    .from("manifests")
    .select("owner_handle")
    .eq("id", manifestId)
    .maybeSingle();
  if (!existing) return { ok: false, error: "Couldn't find that manifest." };

  const host = await requireItemOwner(existing.owner_handle);

  const { error } = await supabaseAdmin
    .from("manifests")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", manifestId);

  if (error) {
    console.error("deleteManifest failed", error);
    return { ok: false, error: "Couldn't delete that. Try again." };
  }

  revalidatePath(`/manifest/${slug}`);
  revalidatePath(`/${host.handle}`);
  return { ok: true, slug: host.handle ?? "" };
}
