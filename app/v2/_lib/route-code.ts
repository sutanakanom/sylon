// Decorative airport/route-style codes for the boarding-pass graphic
// language ("BKK → HKG"). Purely cosmetic — falls back to the place's own
// first three letters for anywhere not in the small lookup table below, so
// it never breaks for a place we haven't seen yet.
const KNOWN_CODES: Record<string, string> = {
  Bangkok: "BKK",
  "Hong Kong": "HKG",
  Shenzhen: "SZX",
  "Kuala Lumpur": "KUL",
  Malaysia: "KUL",
  "Xi'an": "XIY",
  China: "PEK",
  Japan: "NRT",
  Australia: "SYD",
  Spain: "MAD",
  Italy: "FCO",
  "United States": "LAX",
};

export function routeCode(place: string): string {
  if (KNOWN_CODES[place]) return KNOWN_CODES[place];
  const letters = place.replace(/[^a-zA-Z]/g, "").toUpperCase();
  return (letters.slice(0, 3) || "???").padEnd(3, "X");
}
