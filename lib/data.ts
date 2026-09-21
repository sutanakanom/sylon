import { Item, Trip, Manifest, Leg } from "./types";
import { seedItems } from "./seed-data";
import { isSupabaseConfigured, supabase } from "./supabase";
import { supabaseAdmin, isSupabaseAdminConfigured } from "./supabase-admin";

// Supabase/Postgres returns snake_case column names (rough_date,
// country_votes, member_count); the rest of the app uses camelCase.
// These map one row shape to the other.

interface TripRow {
  id: string;
  slug: string;
  title: string;
  status: Trip["status"];
  visibility: Trip["visibility"];
  owner_handle: string;
  rough_date: string;
  countries: string[];
  legs: Leg[];
  summary: string;
  member_count: number;
}

interface ManifestRow {
  id: string;
  slug: string;
  title: string;
  status: Manifest["status"];
  visibility: Manifest["visibility"];
  owner_handle: string;
  rough_date: string;
  country_votes: { country: string; votes: number }[];
  summary: string;
  member_count: number;
}

function tripFromRow(row: TripRow): Trip {
  return {
    kind: "trip",
    id: row.id,
    slug: row.slug,
    title: row.title,
    status: row.status,
    visibility: row.visibility,
    ownerHandle: row.owner_handle,
    roughDate: row.rough_date,
    countries: row.countries,
    legs: row.legs,
    summary: row.summary,
    memberCount: row.member_count,
  };
}

function manifestFromRow(row: ManifestRow): Manifest {
  return {
    kind: "manifest",
    id: row.id,
    slug: row.slug,
    title: row.title,
    status: row.status,
    visibility: row.visibility,
    ownerHandle: row.owner_handle,
    roughDate: row.rough_date,
    countryVotes: row.country_votes,
    summary: row.summary,
    memberCount: row.member_count,
  };
}

// Rough-view rule, per the requirements doc's "Visibility and access"
// section: a visitor (no account) only ever sees public items, and never
// their exact dates or member names — just the rough version. Scoped to
// one host's handle — each personal page (/[handle]) only shows that
// host's own items.
export async function getPublicItems(ownerHandle: string): Promise<Item[]> {
  if (!isSupabaseConfigured || !supabase) {
    return seedItems.filter(
      (item) => item.visibility === "public" && item.ownerHandle === ownerHandle
    );
  }

  const [{ data: trips }, { data: manifests }] = await Promise.all([
    supabase.from("trips").select("*").eq("visibility", "public").eq("owner_handle", ownerHandle),
    supabase
      .from("manifests")
      .select("*")
      .eq("visibility", "public")
      .eq("owner_handle", ownerHandle),
  ]);

  const tripItems: Trip[] = (trips ?? []).map((row) => tripFromRow(row as TripRow));
  const manifestItems: Manifest[] = (manifests ?? []).map((row) =>
    manifestFromRow(row as ManifestRow)
  );

  return [...tripItems, ...manifestItems];
}

// Fetches one Trip or Manifest by slug regardless of visibility — the
// page that calls this decides what a visitor is allowed to see (public
// items show full detail to anyone; invite-only items require a signed-in
// member for now, until per-item invite access is built). Slugs are
// unique site-wide, so no handle is needed here.
export async function getItemBySlug(slug: string): Promise<Item | null> {
  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return seedItems.find((item) => item.slug === slug) ?? null;
  }

  const { data: tripRow } = await supabaseAdmin
    .from("trips")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (tripRow) return tripFromRow(tripRow as TripRow);

  const { data: manifestRow } = await supabaseAdmin
    .from("manifests")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (manifestRow) return manifestFromRow(manifestRow as ManifestRow);

  return null;
}

// Checks whether a handle actually has a page (at least one item owned by
// it) — used by /[handle] to 404 for anything that isn't a real host.
export async function handleExists(ownerHandle: string): Promise<boolean> {
  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return seedItems.some((item) => item.ownerHandle === ownerHandle);
  }

  const { count: tripCount } = await supabaseAdmin
    .from("trips")
    .select("id", { count: "exact", head: true })
    .eq("owner_handle", ownerHandle);
  if (tripCount && tripCount > 0) return true;

  const { count: manifestCount } = await supabaseAdmin
    .from("manifests")
    .select("id", { count: "exact", head: true })
    .eq("owner_handle", ownerHandle);
  return Boolean(manifestCount && manifestCount > 0);
}
