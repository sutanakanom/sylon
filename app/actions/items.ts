"use server";

import { randomBytes } from "crypto";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase-admin";
import { getCurrentMember } from "@/lib/current-member";
import { TripStatus, Visibility } from "@/lib/types";

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

// v1 has exactly one host (Kanom), and only the host/admin can add plans —
// there's no per-host "owner" concept in the UI yet, just the owner_handle
// column on each row (see supabase/step6-owner-handle.sql). Gating on
// isAdmin rather than opening this to every signed-in member matches that:
// visitors can join/comment/vote, only the host publishes new plans.
async function requireHost() {
  const member = await getCurrentMember();
  if (!member?.isAdmin) throw new Error("Not authorized.");
  return member;
}

export type CreateItemResult = { ok: true; slug: string } | { ok: false; error: string };

export interface CreateTripInput {
  title: string;
  roughDate: string;
  countries: string[];
  legs: { place: string; startDate: string; endDate: string }[];
  summary: string;
  visibility: Visibility;
  status: TripStatus;
}

export async function createTrip(input: CreateTripInput): Promise<CreateItemResult> {
  await requireHost();
  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return { ok: false, error: "Not configured." };
  }
  if (!input.title.trim()) return { ok: false, error: "Give it a title." };

  const slug = await uniqueSlug(slugify(input.title));

  const { error } = await supabaseAdmin.from("trips").insert({
    slug,
    title: input.title.trim(),
    status: input.status,
    visibility: input.visibility,
    owner_handle: "kanom",
    rough_date: input.roughDate.trim() || "Sometime",
    countries: input.countries.map((c) => c.trim()).filter(Boolean),
    legs: input.legs.filter((l) => l.place.trim()),
    summary: input.summary.trim(),
    member_count: 1,
  });

  if (error) {
    console.error("createTrip failed", error);
    return { ok: false, error: "Couldn't save that trip. Try again." };
  }

  return { ok: true, slug };
}

export interface CreateManifestInput {
  title: string;
  roughDate: string;
  countryOptions: string[];
  summary: string;
  visibility: Visibility;
}

export async function createManifest(input: CreateManifestInput): Promise<CreateItemResult> {
  await requireHost();
  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return { ok: false, error: "Not configured." };
  }
  if (!input.title.trim()) return { ok: false, error: "Give it a title." };

  const slug = await uniqueSlug(slugify(input.title));

  const { error } = await supabaseAdmin.from("manifests").insert({
    slug,
    title: input.title.trim(),
    status: "open",
    visibility: input.visibility,
    owner_handle: "kanom",
    rough_date: input.roughDate.trim() || "Sometime",
    country_votes: input.countryOptions
      .map((c) => c.trim())
      .filter(Boolean)
      .map((country) => ({ country, votes: 0 })),
    summary: input.summary.trim(),
    member_count: 1,
  });

  if (error) {
    console.error("createManifest failed", error);
    return { ok: false, error: "Couldn't save that manifest. Try again." };
  }

  return { ok: true, slug };
}
