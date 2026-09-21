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
  const host = await requireHost();
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
    owner_handle: host.handle,
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
  const host = await requireHost();
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
    owner_handle: host.handle,
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
