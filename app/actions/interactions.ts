"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase-admin";
import { getCurrentMember } from "@/lib/current-member";
import { Comment } from "@/lib/types";

type ItemType = "trip" | "manifest";

interface CommentRow {
  id: string;
  item_type: ItemType;
  item_id: string;
  member_id: string;
  body: string;
  created_at: string;
  members: { display_name: string | null; email: string } | null;
}

function commentFromRow(row: CommentRow): Comment {
  const name = row.members?.display_name || row.members?.email.split("@")[0] || "Someone";
  return {
    id: row.id,
    itemType: row.item_type,
    itemId: row.item_id,
    memberId: row.member_id,
    memberName: name,
    body: row.body,
    createdAt: row.created_at,
  };
}

// Comments are member-only, per the requirements doc's rough-view table —
// a visitor without an account never sees them, even on a public item.
export async function getComments(itemType: ItemType, itemId: string): Promise<Comment[]> {
  const member = await getCurrentMember();
  if (!member || !isSupabaseAdminConfigured || !supabaseAdmin) return [];

  const { data, error } = await supabaseAdmin
    .from("comments")
    .select("id, item_type, item_id, member_id, body, created_at, members(display_name, email)")
    .eq("item_type", itemType)
    .eq("item_id", itemId)
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return (data as unknown as CommentRow[]).map(commentFromRow);
}

export type PostCommentResult = { ok: true } | { ok: false; error: string };

export async function postComment(
  itemType: ItemType,
  itemId: string,
  slug: string,
  body: string
): Promise<PostCommentResult> {
  const member = await getCurrentMember();
  if (!member) return { ok: false, error: "Sign in to comment." };

  const trimmed = body.trim();
  if (!trimmed) return { ok: false, error: "Comment can't be empty." };
  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return { ok: false, error: "Comments aren't wired up on this environment yet." };
  }

  const { error } = await supabaseAdmin.from("comments").insert({
    item_type: itemType,
    item_id: itemId,
    member_id: member.id,
    body: trimmed,
  });

  if (error) {
    console.error("postComment failed", error);
    return { ok: false, error: "Couldn't post that. Try again." };
  }

  revalidatePath(`/${itemType}/${slug}`);
  return { ok: true };
}

export async function isFollowing(itemType: ItemType, itemId: string): Promise<boolean> {
  const member = await getCurrentMember();
  if (!member || !isSupabaseAdminConfigured || !supabaseAdmin) return false;

  const { data } = await supabaseAdmin
    .from("follows")
    .select("id")
    .eq("item_type", itemType)
    .eq("item_id", itemId)
    .eq("member_id", member.id)
    .maybeSingle();

  return Boolean(data);
}

export type ToggleFollowResult = { ok: true; following: boolean } | { ok: false; error: string };

export async function toggleFollow(
  itemType: ItemType,
  itemId: string,
  slug: string
): Promise<ToggleFollowResult> {
  const member = await getCurrentMember();
  if (!member) return { ok: false, error: "Sign in to follow." };
  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return { ok: false, error: "Following isn't wired up on this environment yet." };
  }

  const { data: existing } = await supabaseAdmin
    .from("follows")
    .select("id")
    .eq("item_type", itemType)
    .eq("item_id", itemId)
    .eq("member_id", member.id)
    .maybeSingle();

  if (existing) {
    await supabaseAdmin.from("follows").delete().eq("id", existing.id);
    revalidatePath(`/${itemType}/${slug}`);
    return { ok: true, following: false };
  }

  await supabaseAdmin.from("follows").insert({
    item_type: itemType,
    item_id: itemId,
    member_id: member.id,
  });
  revalidatePath(`/${itemType}/${slug}`);
  return { ok: true, following: true };
}

export interface Participant {
  id: string;
  name: string;
}

// No approval needed to join, per the requirements doc's decided open
// question. Returns the real joined-members list for the detail page's
// Members block.
export async function getParticipants(itemType: ItemType, itemId: string): Promise<Participant[]> {
  if (!isSupabaseAdminConfigured || !supabaseAdmin) return [];

  const { data, error } = await supabaseAdmin
    .from("participants")
    .select("member_id, members(display_name, email)")
    .eq("item_type", itemType)
    .eq("item_id", itemId);

  if (error || !data) return [];
  return (
    data as unknown as { member_id: string; members: { display_name: string | null; email: string } | null }[]
  ).map((row) => ({
    id: row.member_id,
    name: row.members?.display_name || row.members?.email.split("@")[0] || "Someone",
  }));
}

export async function isJoined(itemType: ItemType, itemId: string): Promise<boolean> {
  const member = await getCurrentMember();
  if (!member || !isSupabaseAdminConfigured || !supabaseAdmin) return false;

  const { data } = await supabaseAdmin
    .from("participants")
    .select("id")
    .eq("item_type", itemType)
    .eq("item_id", itemId)
    .eq("member_id", member.id)
    .maybeSingle();

  return Boolean(data);
}

export type JoinResult = { ok: true } | { ok: false; error: string };

export async function joinItem(itemType: ItemType, itemId: string, slug: string): Promise<JoinResult> {
  const member = await getCurrentMember();
  if (!member) return { ok: false, error: "Sign in to join." };
  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return { ok: false, error: "Joining isn't wired up on this environment yet." };
  }

  const { error } = await supabaseAdmin
    .from("participants")
    .upsert(
      { item_type: itemType, item_id: itemId, member_id: member.id },
      { onConflict: "item_type,item_id,member_id" }
    );

  if (error) {
    console.error("joinItem failed", error);
    return { ok: false, error: "Couldn't join. Try again." };
  }

  revalidatePath(`/${itemType}/${slug}`);
  return { ok: true };
}
