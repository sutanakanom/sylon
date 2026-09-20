import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

// A minimal signed-cookie session — no passwords, no phone numbers, per
// the requirements doc's Login section. The invite-code flow is what
// proves who someone is; this cookie just remembers that decision across
// requests. Not a JWT library, just an HMAC over "memberId.expiry" so
// there's no extra dependency for something this small.

const COOKIE_NAME = "sylon_session";
const THIRTY_DAYS = 60 * 60 * 24 * 30;

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) {
    throw new Error(
      "SESSION_SECRET is not set. Add it to .env.local (any long random string)."
    );
  }
  return s;
}

function sign(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

export async function createSession(memberId: string) {
  const expires = Date.now() + THIRTY_DAYS * 1000;
  const payload = `${memberId}.${expires}`;
  const signature = sign(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, `${payload}.${signature}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: THIRTY_DAYS,
    path: "/",
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSessionMemberId(): Promise<string | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (!raw) return null;

  const parts = raw.split(".");
  if (parts.length !== 3) return null;
  const [memberId, expiresStr, signature] = parts;

  const expected = sign(`${memberId}.${expiresStr}`);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  if (Date.now() > Number(expiresStr)) return null;

  return memberId;
}
