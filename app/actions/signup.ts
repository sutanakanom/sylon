"use server";

import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase-admin";
import { sendSignupRequestNotification } from "@/lib/email";
import { adminEmails } from "@/lib/admin";

export type RequestSignupResult = { ok: true } | { ok: false; error: string };

// Public — anyone on the landing page can ask for an account. This only
// records the request and notifies the admin; the admin still has to
// approve it from /admin (see app/actions/admin.ts), which sends an
// invite code the same way invite_requests approval does.
export async function requestSignup(input: { email: string }): Promise<RequestSignupResult> {
  const email = input.email.trim().toLowerCase();

  if (!email || !email.includes("@")) {
    return { ok: false, error: "That doesn't look like an email address." };
  }

  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return { ok: false, error: "This isn't wired up on this environment yet." };
  }

  const { error } = await supabaseAdmin.from("signup_requests").insert({ email });

  if (error) {
    console.error("requestSignup insert failed", error);
    return { ok: false, error: "Something went wrong. Try again." };
  }

  await sendSignupRequestNotification(adminEmails(), { email });

  return { ok: true };
}
