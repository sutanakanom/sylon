"use server";

import { randomInt } from "crypto";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase-admin";
import { sendInviteCodeEmail } from "@/lib/email";
import { createSession, destroySession } from "@/lib/session";

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I ambiguity
const CODE_LENGTH = 6;
const EXPIRY_DAYS = 7;

function generateCode(): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_CHARS[randomInt(CODE_CHARS.length)];
  }
  return code;
}

export type RequestCodeResult = { ok: true } | { ok: false; error: string };

// Step 1: someone types their email. Whether they're a brand-new visitor
// or a returning member, the flow is the same — request a code, we email
// it. (Returning-member login reuses the invite-code flow rather than a
// separate mechanism; see the requirements doc's open question on this.)
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

  const code = generateCode();
  const expiresAt = new Date(Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await supabaseAdmin.from("invite_codes").insert({
    email: cleanEmail,
    code,
    expires_at: expiresAt,
  });

  if (error) {
    console.error("requestCode insert failed", error);
    return { ok: false, error: "Something went wrong generating a code. Try again." };
  }

  await sendInviteCodeEmail(cleanEmail, code);

  return { ok: true };
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
    .select("id")
    .eq("email", cleanEmail)
    .maybeSingle();

  let memberId: string;

  if (existingMember?.id) {
    memberId = existingMember.id;
  } else {
    const { data: newMember, error: memberError } = await supabaseAdmin
      .from("members")
      .insert({ email: cleanEmail })
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
