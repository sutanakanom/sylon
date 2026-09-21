// Admin is an env var (ADMIN_EMAILS, comma-separated), not a database
// flag. v1 only ever has one admin (Kanom); this avoids a chicken-and-egg
// bootstrap problem — a DB flag would need an admin to grant the first
// admin. Add ADMIN_EMAILS=you@example.com to Vercel's env vars.
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminEmails().includes(email.trim().toLowerCase());
}
