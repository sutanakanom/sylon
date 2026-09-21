"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase-admin";
import { getCurrentMember } from "@/lib/current-member";
import { ChatMessage, ChatTag, Manifestor } from "@/lib/types";

// --- Manifestors -----------------------------------------------------
// All manifestors have equal power, including removing the original
// creator (decided via the requirements doc's open-question comments).

export async function getManifestors(itemId: string): Promise<Manifestor[]> {
  if (!isSupabaseAdminConfigured || !supabaseAdmin) return [];

  const { data, error } = await supabaseAdmin
    .from("manifestors")
    .select("member_id, members(display_name, email)")
    .eq("item_type", "manifest")
    .eq("item_id", itemId);

  if (error || !data) return [];
  return (
    data as unknown as { member_id: string; members: { display_name: string | null; email: string } | null }[]
  ).map((row) => ({
    id: row.member_id,
    name: row.members?.display_name || row.members?.email.split("@")[0] || "Someone",
  }));
}

export async function isManifestor(itemId: string): Promise<boolean> {
  const member = await getCurrentMember();
  if (!member || !isSupabaseAdminConfigured || !supabaseAdmin) return false;

  const { data } = await supabaseAdmin
    .from("manifestors")
    .select("id")
    .eq("item_type", "manifest")
    .eq("item_id", itemId)
    .eq("member_id", member.id)
    .maybeSingle();

  return Boolean(data);
}

export type ActionResult = { ok: true } | { ok: false; error: string };

// If a Manifest somehow has no manifestors yet (e.g. seed data inserted
// directly), the first signed-in member to show up can claim it.
export async function becomeManifestor(itemId: string, slug: string): Promise<ActionResult> {
  const member = await getCurrentMember();
  if (!member) return { ok: false, error: "Sign in first." };
  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return { ok: false, error: "Not wired up on this environment yet." };
  }

  const { count } = await supabaseAdmin
    .from("manifestors")
    .select("id", { count: "exact", head: true })
    .eq("item_type", "manifest")
    .eq("item_id", itemId);

  if (count && count > 0) {
    return { ok: false, error: "This already has manifestors — ask one to nominate you." };
  }

  await supabaseAdmin
    .from("manifestors")
    .insert({ item_type: "manifest", item_id: itemId, member_id: member.id });

  revalidatePath(`/manifest/${slug}`);
  return { ok: true };
}

export async function nominateManifestor(
  itemId: string,
  slug: string,
  email: string
): Promise<ActionResult> {
  const isAlreadyManifestor = await isManifestor(itemId);
  if (!isAlreadyManifestor) return { ok: false, error: "Only manifestors can nominate." };
  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return { ok: false, error: "Not wired up on this environment yet." };
  }

  const cleanEmail = email.trim().toLowerCase();
  const { data: targetMember } = await supabaseAdmin
    .from("members")
    .select("id")
    .eq("email", cleanEmail)
    .maybeSingle();

  if (!targetMember) {
    return { ok: false, error: "That person needs a SYLON account first." };
  }

  await supabaseAdmin
    .from("manifestors")
    .upsert(
      { item_type: "manifest", item_id: itemId, member_id: targetMember.id },
      { onConflict: "item_type,item_id,member_id" }
    );

  revalidatePath(`/manifest/${slug}`);
  return { ok: true };
}

export async function removeManifestor(
  itemId: string,
  slug: string,
  memberId: string
): Promise<ActionResult> {
  const isAlreadyManifestor = await isManifestor(itemId);
  if (!isAlreadyManifestor) return { ok: false, error: "Only manifestors can remove manifestors." };
  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return { ok: false, error: "Not wired up on this environment yet." };
  }

  await supabaseAdmin
    .from("manifestors")
    .delete()
    .eq("item_type", "manifest")
    .eq("item_id", itemId)
    .eq("member_id", memberId);

  revalidatePath(`/manifest/${slug}`);
  return { ok: true };
}

// --- Country voting ------------------------------------------------------
// One vote per member per manifest (manifest_votes has a unique
// constraint on manifest_id+member_id), so voting again just changes
// your vote. manifests.country_votes is kept as the display copy — after
// every vote we recompute its counts from manifest_votes, so the options
// list stays whatever the host set at creation, and existing reads
// (getPublicItems/getItemBySlug) don't need to know votes moved to their
// own table.

export async function getMyVote(manifestId: string): Promise<string | null> {
  const member = await getCurrentMember();
  if (!member || !isSupabaseAdminConfigured || !supabaseAdmin) return null;

  const { data } = await supabaseAdmin
    .from("manifest_votes")
    .select("country")
    .eq("manifest_id", manifestId)
    .eq("member_id", member.id)
    .maybeSingle();

  return data?.country ?? null;
}

export type VoteResult = { ok: true; country: string } | { ok: false; error: string };

export async function voteCountry(
  manifestId: string,
  slug: string,
  country: string
): Promise<VoteResult> {
  const member = await getCurrentMember();
  if (!member) return { ok: false, error: "Sign in to vote." };
  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return { ok: false, error: "Not wired up on this environment yet." };
  }

  const { error: voteError } = await supabaseAdmin
    .from("manifest_votes")
    .upsert(
      { manifest_id: manifestId, member_id: member.id, country },
      { onConflict: "manifest_id,member_id" }
    );

  if (voteError) {
    console.error("voteCountry failed", voteError);
    return { ok: false, error: "Couldn't save your vote. Try again." };
  }

  // Recompute counts for every option the host set up, from real votes.
  const [{ data: manifestRow }, { data: allVotes }] = await Promise.all([
    supabaseAdmin.from("manifests").select("country_votes").eq("id", manifestId).single(),
    supabaseAdmin.from("manifest_votes").select("country").eq("manifest_id", manifestId),
  ]);

  if (manifestRow) {
    const options = (manifestRow.country_votes as { country: string; votes: number }[]).map(
      (v) => v.country
    );
    const counts = new Map<string, number>(options.map((c) => [c, 0]));
    for (const vote of allVotes ?? []) {
      counts.set(vote.country, (counts.get(vote.country) ?? 0) + 1);
    }
    const updatedVotes = options.map((c) => ({ country: c, votes: counts.get(c) ?? 0 }));
    await supabaseAdmin.from("manifests").update({ country_votes: updatedVotes }).eq("id", manifestId);
  }

  revalidatePath(`/manifest/${slug}`);
  return { ok: true, country };
}

// --- Availability (a signal, not a commitment) --------------------------

export async function getMyAvailability(manifestId: string): Promise<string[]> {
  const member = await getCurrentMember();
  if (!member || !isSupabaseAdminConfigured || !supabaseAdmin) return [];

  const { data } = await supabaseAdmin
    .from("manifest_availability")
    .select("windows")
    .eq("manifest_id", manifestId)
    .eq("member_id", member.id)
    .maybeSingle();

  return (data?.windows as string[] | undefined) ?? [];
}

export async function setAvailability(
  manifestId: string,
  slug: string,
  windows: string[]
): Promise<ActionResult> {
  const member = await getCurrentMember();
  if (!member) return { ok: false, error: "Sign in to save your availability." };
  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return { ok: false, error: "Not wired up on this environment yet." };
  }

  const { error } = await supabaseAdmin
    .from("manifest_availability")
    .upsert(
      { manifest_id: manifestId, member_id: member.id, windows, updated_at: new Date().toISOString() },
      { onConflict: "manifest_id,member_id" }
    );

  if (error) {
    console.error("setAvailability failed", error);
    return { ok: false, error: "Couldn't save that. Try again." };
  }

  revalidatePath(`/manifest/${slug}`);
  return { ok: true };
}

// --- Host-only anchors: decide the location, set target dates, write a
// summary. Each moves a "What we know" anchor from Open to Known. -------

export async function decideLocation(
  manifestId: string,
  slug: string,
  country: string | null
): Promise<ActionResult> {
  const isHost = await isManifestHost(manifestId);
  if (!isHost) return { ok: false, error: "Only the host can decide this." };
  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return { ok: false, error: "Not wired up on this environment yet." };
  }

  await supabaseAdmin.from("manifests").update({ decided_country: country }).eq("id", manifestId);
  revalidatePath(`/manifest/${slug}`);
  return { ok: true };
}

export async function setTargetDates(
  manifestId: string,
  slug: string,
  startDate: string | null,
  endDate: string | null
): Promise<ActionResult> {
  const isHost = await isManifestHost(manifestId);
  if (!isHost) return { ok: false, error: "Only the host can decide this." };
  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return { ok: false, error: "Not wired up on this environment yet." };
  }

  await supabaseAdmin
    .from("manifests")
    .update({ target_start_date: startDate, target_end_date: endDate })
    .eq("id", manifestId);
  revalidatePath(`/manifest/${slug}`);
  return { ok: true };
}

export async function setCreatorSummary(
  manifestId: string,
  slug: string,
  headline: string,
  body: string,
  tags: string[]
): Promise<ActionResult> {
  const isHost = await isManifestHost(manifestId);
  if (!isHost) return { ok: false, error: "Only the host can post a summary." };
  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return { ok: false, error: "Not wired up on this environment yet." };
  }

  await supabaseAdmin
    .from("manifests")
    .update({
      creator_summary_headline: headline.trim() || null,
      creator_summary_body: body.trim() || null,
      creator_summary_tags: tags.filter(Boolean),
      creator_summary_updated_at: new Date().toISOString(),
    })
    .eq("id", manifestId);
  revalidatePath(`/manifest/${slug}`);
  return { ok: true };
}

// A "host" for these anchor decisions is whoever owns the page the
// manifest lives on — not the isAdmin system flag (see
// supabase/step9-member-handle.sql), and not the manifestor role either
// (manifestors run the brainstorm/finalize; the host curates the
// take-away). In practice v1's one host is usually also the manifestor,
// but they're deliberately separate checks.
async function isManifestHost(manifestId: string): Promise<boolean> {
  const member = await getCurrentMember();
  if (!member?.handle || !isSupabaseAdminConfigured || !supabaseAdmin) return false;

  const { data } = await supabaseAdmin
    .from("manifests")
    .select("owner_handle")
    .eq("id", manifestId)
    .maybeSingle();

  return data?.owner_handle === member.handle;
}

// --- Idea likes (brainstorm cards in the workspace) ---------------------

export async function getIdeaLikes(
  messageIds: string[]
): Promise<Record<string, { count: number; likedByMe: boolean }>> {
  if (messageIds.length === 0 || !isSupabaseAdminConfigured || !supabaseAdmin) return {};

  const member = await getCurrentMember();
  const { data } = await supabaseAdmin
    .from("chat_message_likes")
    .select("chat_message_id, member_id")
    .in("chat_message_id", messageIds);

  const result: Record<string, { count: number; likedByMe: boolean }> = {};
  for (const id of messageIds) result[id] = { count: 0, likedByMe: false };
  for (const row of data ?? []) {
    const entry = result[row.chat_message_id];
    if (!entry) continue;
    entry.count += 1;
    if (member && row.member_id === member.id) entry.likedByMe = true;
  }
  return result;
}

export type ToggleLikeResult = { ok: true; liked: boolean } | { ok: false; error: string };

export async function toggleIdeaLike(
  messageId: string,
  slug: string
): Promise<ToggleLikeResult> {
  const member = await getCurrentMember();
  if (!member) return { ok: false, error: "Sign in to like an idea." };
  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return { ok: false, error: "Not wired up on this environment yet." };
  }

  const { data: existing } = await supabaseAdmin
    .from("chat_message_likes")
    .select("id")
    .eq("chat_message_id", messageId)
    .eq("member_id", member.id)
    .maybeSingle();

  if (existing) {
    await supabaseAdmin.from("chat_message_likes").delete().eq("id", existing.id);
    revalidatePath(`/manifest/${slug}`);
    return { ok: true, liked: false };
  }

  await supabaseAdmin
    .from("chat_message_likes")
    .insert({ chat_message_id: messageId, member_id: member.id });
  revalidatePath(`/manifest/${slug}`);
  return { ok: true, liked: true };
}

// --- Chat feed ---------------------------------------------------------

interface ChatRow {
  id: string;
  manifest_id: string;
  member_id: string;
  tag: ChatTag;
  body: string;
  created_at: string;
  members: { display_name: string | null; email: string } | null;
}

export async function getChatMessages(manifestId: string): Promise<ChatMessage[]> {
  const member = await getCurrentMember();
  if (!member || !isSupabaseAdminConfigured || !supabaseAdmin) return [];

  const { data, error } = await supabaseAdmin
    .from("chat_messages")
    .select("id, manifest_id, member_id, tag, body, created_at, members(display_name, email)")
    .eq("manifest_id", manifestId)
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return (data as unknown as ChatRow[]).map((row) => ({
    id: row.id,
    manifestId: row.manifest_id,
    memberId: row.member_id,
    memberName: row.members?.display_name || row.members?.email.split("@")[0] || "Someone",
    tag: row.tag,
    body: row.body,
    createdAt: row.created_at,
  }));
}

export async function postChatMessage(
  manifestId: string,
  slug: string,
  tag: ChatTag,
  body: string
): Promise<ActionResult> {
  const member = await getCurrentMember();
  if (!member) return { ok: false, error: "Sign in to post." };

  const trimmed = body.trim();
  if (!trimmed) return { ok: false, error: "Say something first." };
  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return { ok: false, error: "Not wired up on this environment yet." };
  }

  const { error } = await supabaseAdmin.from("chat_messages").insert({
    manifest_id: manifestId,
    member_id: member.id,
    tag,
    body: trimmed,
  });

  if (error) {
    console.error("postChatMessage failed", error);
    return { ok: false, error: "Couldn't post that. Try again." };
  }

  revalidatePath(`/manifest/${slug}`);
  return { ok: true };
}

// --- Convert to Trip -----------------------------------------------------
// Manifestor-only, and — per the collaborative-idea design — only once
// the location is decided and target dates are set (the two "Open"
// anchors that have to become "Known" first). Derives a first-pass Trip
// from the Manifest's own fields; editing the details afterward uses the
// Trip's own edit flow once one exists (still a later build step).

export async function convertToTrip(manifestId: string, manifestSlug: string) {
  const isAlreadyManifestor = await isManifestor(manifestId);
  if (!isAlreadyManifestor) {
    return { ok: false as const, error: "Only manifestors can finalize this." };
  }
  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return { ok: false as const, error: "Not wired up on this environment yet." };
  }

  const { data: manifestRow, error: fetchError } = await supabaseAdmin
    .from("manifests")
    .select("*")
    .eq("id", manifestId)
    .single();

  if (fetchError || !manifestRow) {
    return { ok: false as const, error: "Couldn't find that manifest." };
  }

  if (!manifestRow.decided_country || !manifestRow.target_start_date || !manifestRow.target_end_date) {
    return { ok: false as const, error: "Decide a location and target dates first." };
  }

  const tripSlug = `${manifestRow.slug}-trip`;

  const { data: newTrip, error: insertError } = await supabaseAdmin
    .from("trips")
    .insert({
      slug: tripSlug,
      title: manifestRow.title,
      status: "planning",
      visibility: manifestRow.visibility,
      owner_handle: manifestRow.owner_handle,
      rough_date: manifestRow.rough_date,
      countries: [manifestRow.decided_country],
      legs: [
        {
          place: manifestRow.decided_country,
          startDate: manifestRow.target_start_date,
          endDate: manifestRow.target_end_date,
        },
      ],
      summary: manifestRow.summary,
      member_count: manifestRow.member_count,
    })
    .select("id, slug")
    .single();

  if (insertError || !newTrip) {
    console.error("convertToTrip insert failed", insertError);
    return { ok: false as const, error: "Couldn't create the trip. Try again." };
  }

  await supabaseAdmin.from("manifests").update({ status: "converted" }).eq("id", manifestId);

  // Carry the manifestors over to the new Trip, per the doc ("manifestor
  // role applies to both Trips and Manifests").
  const manifestors = await getManifestors(manifestId);
  if (manifestors.length > 0) {
    await supabaseAdmin.from("manifestors").insert(
      manifestors.map((m) => ({
        item_type: "trip" as const,
        item_id: newTrip.id,
        member_id: m.id,
      }))
    );
  }

  revalidatePath("/");
  revalidatePath(`/manifest/${manifestSlug}`);
  redirect(`/trip/${newTrip.slug}`);
}
