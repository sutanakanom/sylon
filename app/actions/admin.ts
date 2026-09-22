"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase-admin";
import { getCurrentMember } from "@/lib/current-member";
import { generateAndSendInviteCode } from "@/lib/invite-codes";

async function requireAdmin() {
  const member = await getCurrentMember();
  if (!member?.isAdmin) {
    throw new Error("Not authorized.");
  }
}

export interface AdminMemberRow {
  id: string;
  email: string;
  displayName: string | null;
  handle: string | null;
  deactivated: boolean;
  createdAt: string;
}

export interface AdminInviteRequestRow {
  id: string;
  name: string;
  email: string;
  reason: string | null;
  createdAt: string;
}

export interface AdminSignupRequestRow {
  id: string;
  email: string;
  createdAt: string;
}

export async function listInviteRequests(): Promise<AdminInviteRequestRow[]> {
  await requireAdmin();
  if (!isSupabaseAdminConfigured || !supabaseAdmin) return [];

  const { data } = await supabaseAdmin
    .from("invite_requests")
    .select("id, name, email, reason, created_at")
    .eq("handled", false)
    .order("created_at", { ascending: false });

  return (data ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    reason: r.reason,
    createdAt: r.created_at,
  }));
}

// Sends the invite and marks the request handled in one step — the point
// of surfacing requests in /admin is a single "approve" click.
export async function approveInviteRequest(requestId: string, email: string): Promise<AdminActionResult> {
  await requireAdmin();
  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return { ok: false, error: "Not configured." };
  }

  const result = await generateAndSendInviteCode(email.trim().toLowerCase());
  if (result.ok) {
    await supabaseAdmin.from("invite_requests").update({ handled: true }).eq("id", requestId);
  }
  revalidatePath("/admin");
  return result;
}

export async function dismissInviteRequest(requestId: string): Promise<AdminActionResult> {
  await requireAdmin();
  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return { ok: false, error: "Not configured." };
  }
  await supabaseAdmin.from("invite_requests").update({ handled: true }).eq("id", requestId);
  revalidatePath("/admin");
  return { ok: true };
}

export async function listSignupRequests(): Promise<AdminSignupRequestRow[]> {
  await requireAdmin();
  if (!isSupabaseAdminConfigured || !supabaseAdmin) return [];

  const { data } = await supabaseAdmin
    .from("signup_requests")
    .select("id, email, created_at")
    .eq("handled", false)
    .order("created_at", { ascending: false });

  return (data ?? []).map((r) => ({
    id: r.id,
    email: r.email,
    createdAt: r.created_at,
  }));
}

// Same one-click "approve" pattern as approveInviteRequest — sends the
// invite code and marks the request handled in one step.
export async function approveSignupRequest(requestId: string, email: string): Promise<AdminActionResult> {
  await requireAdmin();
  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return { ok: false, error: "Not configured." };
  }

  const result = await generateAndSendInviteCode(email.trim().toLowerCase());
  if (result.ok) {
    await supabaseAdmin.from("signup_requests").update({ handled: true }).eq("id", requestId);
  }
  revalidatePath("/admin");
  return result;
}

export async function dismissSignupRequest(requestId: string): Promise<AdminActionResult> {
  await requireAdmin();
  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return { ok: false, error: "Not configured." };
  }
  await supabaseAdmin.from("signup_requests").update({ handled: true }).eq("id", requestId);
  revalidatePath("/admin");
  return { ok: true };
}

export async function listMembers(): Promise<AdminMemberRow[]> {
  await requireAdmin();
  if (!isSupabaseAdminConfigured || !supabaseAdmin) return [];

  const { data } = await supabaseAdmin
    .from("members")
    .select("id, email, display_name, handle, deactivated, created_at")
    .order("created_at", { ascending: false });

  return (data ?? []).map((r) => ({
    id: r.id,
    email: r.email,
    displayName: r.display_name,
    handle: r.handle,
    deactivated: r.deactivated,
    createdAt: r.created_at,
  }));
}

// Giving a member a handle is what makes them a page owner/host — it's
// what /[handle] resolves to and what new trips/manifests they create get
// filed under (see requireHost() in app/actions/items.ts). Separate from
// isAdmin, which only gates /admin itself.
export async function setMemberHandle(memberId: string, rawHandle: string): Promise<AdminActionResult> {
  await requireAdmin();
  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return { ok: false, error: "Not configured." };
  }

  const handle = rawHandle
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/(^-|-$)/g, "");

  if (!handle) return { ok: false, error: "Give them a handle." };

  const { data: existing } = await supabaseAdmin
    .from("members")
    .select("id")
    .eq("handle", handle)
    .maybeSingle();
  if (existing && existing.id !== memberId) {
    return { ok: false, error: "That handle's already taken." };
  }

  const { error } = await supabaseAdmin.from("members").update({ handle }).eq("id", memberId);
  if (error) return { ok: false, error: "Couldn't save that handle. Try again." };

  revalidatePath("/admin");
  return { ok: true };
}

export type AdminActionResult = { ok: true } | { ok: false; error: string };

// Admin adds someone new by email — this is the only way a brand-new
// email gets into the system now (see requestCode in app/actions/auth.ts,
// which refuses anyone without a members row or a pending invite).
export async function inviteMember(email: string): Promise<AdminActionResult> {
  await requireAdmin();
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@")) {
    return { ok: false, error: "That doesn't look like an email address." };
  }

  const result = await generateAndSendInviteCode(cleanEmail);
  revalidatePath("/admin");
  return result;
}

// Codes are one-time-use and expire after 7 days — this issues a fresh
// one for someone already known to the system (invited or an existing
// member who's locked out of their old code).
export async function regenerateCode(email: string): Promise<AdminActionResult> {
  await requireAdmin();
  const result = await generateAndSendInviteCode(email.trim().toLowerCase());
  revalidatePath("/admin");
  return result;
}

export async function deactivateMember(memberId: string): Promise<AdminActionResult> {
  await requireAdmin();
  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return { ok: false, error: "Not configured." };
  }
  await supabaseAdmin.from("members").update({ deactivated: true }).eq("id", memberId);
  revalidatePath("/admin");
  return { ok: true };
}

export async function reactivateMember(memberId: string): Promise<AdminActionResult> {
  await requireAdmin();
  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return { ok: false, error: "Not configured." };
  }
  await supabaseAdmin.from("members").update({ deactivated: false }).eq("id", memberId);
  revalidatePath("/admin");
  return { ok: true };
}
