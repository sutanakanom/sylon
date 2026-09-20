import { Item, Trip, Manifest } from "./types";
import { seedItems } from "./seed-data";
import { isSupabaseConfigured, supabase } from "./supabase";

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

  const tripItems: Trip[] = (trips ?? []).map((t) => ({ ...t, kind: "trip" }));
  const manifestItems: Manifest[] = (manifests ?? []).map((m) => ({
    ...m,
    kind: "manifest",
  }));

  return [...tripItems, ...manifestItems];
}
