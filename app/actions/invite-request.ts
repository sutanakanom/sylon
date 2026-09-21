"use server";

import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase-admin";
import { sendInviteRequestNotification } from "@/lib/email";
import { adminEmails } from "@/lib/admin";

export type RequestInviteResult = { ok: true } | { ok: false; error: string };

// Public — anyone visiting a personal page can ask to be invited. This
// only records the request and notifies the admin; the admin still has
// to actually send an invite from /admin (see app/actions/admin.ts).
export async function requestInviteAccess(input: {
  name: string;
  email: string;
  reason: string;
}): Promise<RequestInviteResult> {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const reason = input.reason.trim();

  if (!name) return { ok: false, error: "Tell us who you are." };
  if (!email || !email.includes("@")) {
    return { ok: false, error: "That doesn't look like an email address." };
  }

  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return { ok: false, error: "This isn't wired up on this environment yet." };
  }

  const { error } = await supabaseAdmin.from("invite_requests").insert({
    name,
    email,
    reason: reason || "Just curious",
  });

  if (error) {
    console.error("requestInviteAccess insert failed", error);
    return { ok: false, error: "Something went wrong. Try again." };
  }

  await sendInviteRequestNotification(adminEmails(), {
    name,
    email,
    reason: reason || "Just curious",
  });

  return { ok: true };
}
