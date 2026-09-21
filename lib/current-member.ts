import { getSessionMemberId } from "./session";
import { supabaseAdmin, isSupabaseAdminConfigured } from "./supabase-admin";
import { isAdminEmail } from "./admin";

export interface Member {
  id: string;
  email: string;
  displayName: string | null;
  photoUrl: string | null;
  instagramHandle: string | null;
  isAdmin: boolean;
}

export async function getCurrentMember(): Promise<Member | null> {
  const memberId = await getSessionMemberId();
  if (!memberId || !isSupabaseAdminConfigured || !supabaseAdmin) return null;

  const { data } = await supabaseAdmin
    .from("members")
    .select("id, email, display_name, photo_url, instagram_handle, deactivated")
    .eq("id", memberId)
    .maybeSingle();

  // A deactivated member's cookie may still be valid, but they no longer
  // count as signed in anywhere in the app.
  if (!data || data.deactivated) return null;

  return {
    id: data.id,
    email: data.email,
    displayName: data.display_name,
    photoUrl: data.photo_url,
    instagramHandle: data.instagram_handle,
    isAdmin: isAdminEmail(data.email),
  };
}
