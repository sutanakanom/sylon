import { Item, Trip, Manifest, Leg } from "./types";
import { seedItems } from "./seed-data";
import { isSupabaseConfigured, supabase } from "./supabase";

// Supabase/Postgres returns snake_case column names (rough_date,
// country_votes, member_count); the rest of the app uses camelCase.
// These map one row shape to the other.

interface TripRow {
  id: string;
  slug: string;
  title: string;
  status: Trip["status"];
  visibility: Trip["visibility"];
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
    roughDate: row.rough_date,
    countryVotes: row.country_votes,
    summary: row.summary,
    memberCount: row.member_count,
  };
}

// Rough-view rule, per the requirements doc's "Visibility and access"
// section: a visitor (no account) only ever sees public items, and never
// their exact dates or member names — just the rough version.
export async function getPublicItems(): Promise<Item[]> {
  if (!isSupabaseConfigured || !supabase) {
    return seedItems.filter((item) => item.visibility === "public");
  }

  const [{ data: trips }, { data: manifests }] = await Promise.all([
    supabase.from("trips").select("*").eq("visibility", "public"),
    supabase.from("manifests").select("*").eq("visibility", "public"),
  ]);

  const tripItems: Trip[] = (trips ?? []).map((row) => tripFromRow(row as TripRow));
  const manifestItems: Manifest[] = (manifests ?? []).map((row) =>
    manifestFromRow(row as ManifestRow)
  );

  return [...tripItems, ...manifestItems];
}
