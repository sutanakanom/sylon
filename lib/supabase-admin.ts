import { createClient } from "@supabase/supabase-js";

// Server-only client using the service role key, which bypasses Row Level
// Security. Used for the few operations regular visitors should never be
// able to do directly (writing invite codes, creating member accounts).
// Never import this file from a Client Component or expose the key with
// a NEXT_PUBLIC_ prefix.

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseAdminConfigured = Boolean(url && serviceKey);

export const supabaseAdmin = isSupabaseAdminConfigured
  ? createClient(url as string, serviceKey as string, {
      auth: { persistSession: false },
    })
  : null;
