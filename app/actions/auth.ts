"use server";

import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase-admin";
import { createSession, destroySession } from "@/lib/session";
import { generateAndSendInviteCode } from "@/lib/invite-codes";
import { handleFromEmail, pickAvailableHandle } from "@/lib/handles";

export type RequestCodeResult = { ok: true } | { ok: false; error: string };

// Step 1: someone types their email to get a sign-in code. SYLON is
// invite-only now — this only sends a code to an email that already has
// an account, or that an admin has invited (a pending invite_codes row).
// New people are added from /admin, not by typing a random email here.
export async function requestCode(email: string): Promise<RequestCodeResult> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@")) {
    return { ok: false, error: "That doesn't look like an email address." };
  }

  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return {
      ok: false,
      error: "Sign-in isn't wired up on this environment yet.",
    };
  }

  const { data: member } = await supabaseAdmin
    .from("members")
    .select("id, deactivated")
    .eq("email", cleanEmail)
    .maybeSingle();

  if (member?.deactivated) {
    return { ok: false, error: "This account no longer has access." };
  }

  if (!member) {
    const { data: invite } = await supabaseAdmin
      .from("invite_codes")
      .select("id")
      .eq("email", cleanEmail)
      .limit(1)
      .maybeSingle();

    if (!invite) {
      return { ok: false, error: "That email hasn't been invited yet." };
    }
  }

  return generateAndSendInviteCode(cleanEmail);
}

export type VerifyCodeResult = { ok: true } | { ok: false; error: string };

// Step 2: they type the code back. A match creates the account (first
// time) or just signs them in (returning), per the requirements doc.
export async function verifyCode(email: string, code: string): Promise<VerifyCodeResult> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = code.trim().toUpperCase();

  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return {
      ok: false,
      error: "Sign-in isn't wired up on this environment yet.",
    };
  }

  const { data: codeRow, error: codeError } = await supabaseAdmin
    .from("invite_codes")
    .select("*")
    .eq("email", cleanEmail)
    .eq("code", cleanCode)
    .is("used_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (codeError || !codeRow) {
    return { ok: false, error: "That code is wrong, used, or expired." };
  }

  await supabaseAdmin
    .from("invite_codes")
    .update({ used_at: new Date().toISOString() })
    .eq("id", codeRow.id);

  const { data: existingMember } = await supabaseAdmin
    .from("members")
    .select("id, deactivated")
    .eq("email", cleanEmail)
    .maybeSingle();

  if (existingMember?.deactivated) {
    return { ok: false, error: "This account no longer has access." };
  }

  let memberId: string;

  if (existingMember?.id) {
    memberId = existingMember.id;
  } else {
    // Everyone who signs in for the first time becomes a host, not just
    // Kanom — SYLON opened up to other hosts (see requireHost() in
    // app/actions/items.ts), so a brand-new member needs a handle right
    // away, not a manual "Set handle" click in /admin first. Derived from
    // the email's local part; an admin can still change it in /admin.
    const handle = await pickAvailableHandle(supabaseAdmin, handleFromEmail(cleanEmail));

    const { data: newMember, error: memberError } = await supabaseAdmin
      .from("members")
      .insert({ email: cleanEmail, handle })
      .select("id")
      .single();

    if (memberError || !newMember) {
      console.error("verifyCode member insert failed", memberError);
      return { ok: false, error: "Couldn't create your account. Try again." };
    }
    memberId = newMember.id;
  }

  await createSession(memberId);

  return { ok: true };
}

export async function signOut() {
  await destroySession();
}
