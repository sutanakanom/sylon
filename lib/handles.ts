import { SupabaseClient } from "@supabase/supabase-js";

// Route segments that live under app/ as their own literal folders —
// Next.js always resolves these ahead of the [handle] catch-all, so a
// member with one of these as a handle wouldn't break routing, but their
// own page would never be reachable (the static route always wins), so
// we treat these as unavailable rather than let confusion happen.
const RESERVED_HANDLES = new Set([
  "admin",
  "sign-in",
  "sign-up",
  "new",
  "profile",
  "trip",
  "manifest",
  "v2",
  "api",
  "top",
]);

// "kanom.b+trips@gmail.com" → "kanom-b-trips" — same sanitization an
// admin's manual handle entry gets in app/actions/admin.ts, so the two
// paths (auto-assigned, admin-edited) always produce the same shape.
export function sanitizeHandle(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function handleFromEmail(email: string): string {
  const localPart = email.split("@")[0] ?? "";
  return sanitizeHandle(localPart) || "member";
}

// Finds the first available handle starting from `base`: base, then
// base-2, base-3, … Shared by new-member auto-assignment (auth.ts) and
// could back admin's manual "set handle" too. excludeMemberId lets a
// member "reclaim" their own current handle when re-checking.
export async function pickAvailableHandle(
  supabaseAdmin: SupabaseClient,
  base: string,
  excludeMemberId?: string
): Promise<string> {
  const root = base || "member";
  let candidate = root;
  let suffix = 2;

  // 30 tries is generous — collisions this deep would mean something else
  // is wrong, but we still don't want an infinite loop either way.
  for (let i = 0; i < 30; i++) {
    if (!RESERVED_HANDLES.has(candidate)) {
      const { data } = await supabaseAdmin
        .from("members")
        .select("id")
        .eq("handle", candidate)
        .maybeSingle();
      if (!data || data.id === excludeMemberId) return candidate;
    }
    candidate = `${root}-${suffix}`;
    suffix++;
  }

  return `${root}-${Date.now().toString(36)}`;
}
