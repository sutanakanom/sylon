// Country/place lookup for the Create Trip / Create Manifest forms
// ("pick from list, like Google Maps or something" — requirements doc,
// Open questions). Uses OpenStreetMap's free Nominatim API instead of
// Google Places: no API key, no billing account, no card required.
//
// Nominatim asks that requests identify the app (no key needed, just a
// User-Agent) and that usage stay light — fine for a friend-group site.
// https://nominatim.org/release-docs/latest/api/Search/

export interface PlaceResult {
  name: string; // display label, e.g. "Kyoto, Japan"
  country: string;
  lat: number;
  lon: number;
}

export async function searchPlaces(query: string): Promise<PlaceResult[]> {
  if (!query.trim()) return [];

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "6");

  const res = await fetch(url, {
    headers: {
      // Nominatim's usage policy asks for an identifying User-Agent.
      "User-Agent": "sylon-app (personal travel-sharing site)",
    },
  });

  if (!res.ok) return [];

  const data = (await res.json()) as Array<{
    display_name: string;
    lat: string;
    lon: string;
    address?: { country?: string };
  }>;

  return data.map((r) => ({
    name: r.display_name,
    country: r.address?.country ?? "",
    lat: parseFloat(r.lat),
    lon: parseFloat(r.lon),
  }));
}
