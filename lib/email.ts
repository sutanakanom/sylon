import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Resend's shared onboarding sender — works immediately, no domain setup.
// Swap for a verified sylater.app address once a domain is added in
// Resend's dashboard (Domains → Add Domain).
const FROM = "SYLON <onboarding@resend.dev>";

export async function sendInviteCodeEmail(email: string, code: string) {
  if (!resend) {
    console.warn(
      `RESEND_API_KEY not set — would have emailed ${email} the code ${code}`
    );
    return { sent: false };
  }

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `Your SYLON code: ${code}`,
    text: `Your sign-in code is ${code}\n\nIt expires in 7 days and works once. If you didn't ask for this, ignore this email.\n\n— SYLON (See You Later, or not)`,
    html: `
      <div style="font-family: monospace; background:#F3F0E8; color:#11110F; padding: 32px;">
        <p style="text-transform:uppercase; letter-spacing:0.08em; font-size:12px; color:#716F68;">Your sign-in code</p>
        <p style="font-size:32px; font-weight:700; letter-spacing:0.08em; margin: 8px 0 24px;">${code}</p>
        <p style="font-size:14px; color:#716F68;">Expires in 7 days · works once</p>
      </div>
    `,
  });

  return { sent: true };
}
