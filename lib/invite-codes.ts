import { randomInt } from "crypto";
import { supabaseAdmin, isSupabaseAdminConfigured } from "./supabase-admin";
import { sendInviteCodeEmail } from "./email";

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

export type SendCodeResult = { ok: true } | { ok: false; error: string };

// Creates a fresh one-time, 7-day code for an email and emails it. Shared
// by the admin "invite a new person" / "regenerate a code" actions and by
// the sign-in page's own code request — one code-issuing path either way.
export async function generateAndSendInviteCode(email: string): Promise<SendCodeResult> {
  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return { ok: false, error: "Sign-in isn't wired up on this environment yet." };
  }

  const code = generateCode();
  const expiresAt = new Date(Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await supabaseAdmin.from("invite_codes").insert({
    email,
    code,
    expires_at: expiresAt,
  });

  if (error) {
    console.error("generateAndSendInviteCode insert failed", error);
    return { ok: false, error: "Something went wrong generating a code. Try again." };
  }

  await sendInviteCodeEmail(email, code);

  return { ok: true };
}
