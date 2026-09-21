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

export async function sendInviteRequestNotification(
  adminEmails: string[],
  request: { name: string; email: string; reason: string }
) {
  if (!resend || adminEmails.length === 0) {
    console.warn(
      `RESEND_API_KEY or ADMIN_EMAILS not set — would have notified admins of invite request from ${request.email}`
    );
    return { sent: false };
  }

  await resend.emails.send({
    from: FROM,
    to: adminEmails,
    replyTo: request.email,
    subject: `SYLON: ${request.name} wants an invite`,
    text: `${request.name} (${request.email}) asked for an invite.\n\nReason: ${request.reason}\n\nHead to sylater.app/admin to send them a code.`,
    html: `
      <div style="font-family: monospace; background:#F3F0E8; color:#11110F; padding: 32px;">
        <p style="text-transform:uppercase; letter-spacing:0.08em; font-size:12px; color:#716F68;">New invite request</p>
        <p style="font-size:20px; font-weight:700; margin: 8px 0 4px;">${request.name}</p>
        <p style="font-size:14px; color:#716F68; margin: 0 0 16px;">${request.email}</p>
        <p style="font-size:14px; margin: 0 0 24px;">${request.reason}</p>
        <p style="font-size:14px; color:#716F68;">Send them a code from sylater.app/admin</p>
      </div>
    `,
  });

  return { sent: true };
}
