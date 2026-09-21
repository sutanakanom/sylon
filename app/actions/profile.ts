"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase-admin";
import { getCurrentMember } from "@/lib/current-member";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2MB
const AVATAR_BUCKET = "avatars";

export type ProfileActionResult = { ok: true } | { ok: false; error: string };

// Updates display name, IG handle and (optionally) avatar photo for the
// signed-in member. Photo goes to a public Supabase Storage bucket named
// "avatars" — create it once from the Supabase dashboard (Storage → New
// bucket → name "avatars" → Public bucket) before this can save a photo;
// display name and IG still save fine without it.
export async function updateProfile(formData: FormData): Promise<ProfileActionResult> {
  const member = await getCurrentMember();
  if (!member) return { ok: false, error: "Not signed in." };
  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return { ok: false, error: "Not configured." };
  }

  const displayName = String(formData.get("displayName") ?? "").trim();
  const instagramHandle = String(formData.get("instagramHandle") ?? "")
    .trim()
    .replace(/^@/, "");
  const photo = formData.get("photo");

  const updates: Record<string, string | null> = {
    display_name: displayName || null,
    instagram_handle: instagramHandle || null,
  };

  if (photo instanceof File && photo.size > 0) {
    if (photo.size > MAX_AVATAR_BYTES) {
      return { ok: false, error: "That photo is over 2MB — please use a smaller one." };
    }
    if (!photo.type.startsWith("image/")) {
      return { ok: false, error: "That doesn't look like an image file." };
    }

    const ext = photo.type === "image/png" ? "png" : photo.type === "image/webp" ? "webp" : "jpg";
    const path = `${member.id}.${ext}`;
    const buffer = Buffer.from(await photo.arrayBuffer());

    const { error: uploadError } = await supabaseAdmin.storage
      .from(AVATAR_BUCKET)
      .upload(path, buffer, { contentType: photo.type, upsert: true });

    if (uploadError) {
      console.error("avatar upload failed", uploadError);
      return {
        ok: false,
        error:
          "Couldn't upload that photo — make sure a public 'avatars' storage bucket exists in Supabase.",
      };
    }

    const { data: publicUrlData } = supabaseAdmin.storage.from(AVATAR_BUCKET).getPublicUrl(path);
    // Cache-bust so a re-uploaded photo shows immediately instead of the
    // browser's cached copy of the old one at the same URL.
    updates.photo_url = `${publicUrlData.publicUrl}?v=${Date.now()}`;
  }

  const { error } = await supabaseAdmin.from("members").update(updates).eq("id", member.id);
  if (error) {
    console.error("updateProfile failed", error);
    return { ok: false, error: "Couldn't save your profile. Try again." };
  }

  revalidatePath("/", "layout");
  return { ok: true };
}
