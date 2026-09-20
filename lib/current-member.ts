import { getSessionMemberId } from "./session";
import { supabaseAdmin, isSupabaseAdminConfigured } from "./supabase-admin";

export interface Member {
  id: string;
  email: string;
  displayName: string | null;
  photoUrl: string | null;
  instagramHandle: string | null;
}

export async function getCurrentMember(): Promise<Member | null> {
  const memberId = await getSessionMemberId();
  if (!memberId || !isSupabaseAdminConfigured || !supabaseAdmin) return null;

  const { data } = await supabaseAdmin
    .from("members")
    .select("id, email, display_name, photo_url, instagram_handle")
    .eq("id", memberId)
    .maybeSingle();

  if (!data) return null;

  return {
    id: data.id,
    email: data.email,
    displayName: data.display_name,
    photoUrl: data.photo_url,
    instagramHandle: data.instagram_handle,
  };
}
