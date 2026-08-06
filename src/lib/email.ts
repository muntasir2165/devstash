import "server-only";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// In production set EMAIL_FROM to a verified domain, e.g. "DevStash <noreply@yourdomain.com>".
// The onboarding@resend.dev fallback only delivers to the Resend account owner's email.
const FROM = process.env.EMAIL_FROM ?? "DevStash <onboarding@resend.dev>";

export async function sendVerificationEmail(to: string, url: string) {
  const { data, error } = await resend.emails.send({
    from: FROM,
    to: [to],
    subject: "Verify your email",
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="margin:0 0 12px">Confirm your email</h2>
        <p style="color:#444;line-height:1.5">
          Click the button below to verify your DevStash account. This link expires in 24 hours.
        </p>
        <p style="margin:20px 0">
          <a href="${url}" style="display:inline-block;padding:10px 18px;background:#111;color:#fff;border-radius:8px;text-decoration:none;font-weight:500">Verify email</a>
        </p>
        <p style="color:#888;font-size:12px;word-break:break-all">Or paste this URL into your browser:<br />${url}</p>
      </div>
    `,
  });

  // The Resend SDK returns errors instead of throwing — surface it to the caller.
  if (error) {
    return { ok: false as const, error };
  }
  return { ok: true as const, id: data?.id };
}

export async function sendPasswordResetEmail(to: string, url: string) {
  const { data, error } = await resend.emails.send({
    from: FROM,
    to: [to],
    subject: "Reset your password",
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="margin:0 0 12px">Reset your password</h2>
        <p style="color:#444;line-height:1.5">
          We received a request to reset your DevStash password. Click the button below to choose a new one. This link expires in 1 hour — if you didn't request it, you can safely ignore this email.
        </p>
        <p style="margin:20px 0">
          <a href="${url}" style="display:inline-block;padding:10px 18px;background:#111;color:#fff;border-radius:8px;text-decoration:none;font-weight:500">Reset password</a>
        </p>
        <p style="color:#888;font-size:12px;word-break:break-all">Or paste this URL into your browser:<br />${url}</p>
      </div>
    `,
  });

  if (error) {
    return { ok: false as const, error };
  }
  return { ok: true as const, id: data?.id };
}
