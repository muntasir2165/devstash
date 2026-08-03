const raw = process.env.EMAIL_VERIFICATION_ENABLED?.trim().toLowerCase();

/**
 * Whether new credential sign-ups must verify their email before signing in.
 * Enabled by default; set EMAIL_VERIFICATION_ENABLED to "false"/"0"/"off"/"no" to disable
 * (useful while Resend has no verified domain).
 */
export const emailVerificationEnabled = !(
  raw === "false" ||
  raw === "0" ||
  raw === "off" ||
  raw === "no"
);
