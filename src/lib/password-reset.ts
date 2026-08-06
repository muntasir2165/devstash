import crypto from "node:crypto";

import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { getBaseUrl } from "@/lib/base-url";
import { sendPasswordResetEmail } from "@/lib/email";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour
const RESET_PREFIX = "password-reset:";

/**
 * Issue a single-use reset token and email its link. Best-effort on send.
 * Stays silent for unknown or OAuth-only accounts so callers can respond
 * without leaking whether an account exists.
 */
export async function issuePasswordReset(email: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { hashedPassword: true },
  });
  // Only credential accounts have a password to reset.
  if (!user?.hashedPassword) return;

  const identifier = RESET_PREFIX + email;
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + TOKEN_TTL_MS);

  // Replace any outstanding reset tokens for this email.
  await prisma.verificationToken.deleteMany({ where: { identifier } });
  await prisma.verificationToken.create({
    data: { identifier, token, expires },
  });

  const url = `${await getBaseUrl()}/reset-password?token=${token}`;
  await sendPasswordResetEmail(email, url);
}

export type ResetResult = { ok: true } | { ok: false; reason: "invalid" | "expired" };

/** Validate a reset token, set the new password, and consume the token (single use). */
export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<ResetResult> {
  const record = await prisma.verificationToken.findFirst({ where: { token } });
  // Must be a password-reset token specifically (not an email-verify token).
  if (!record || !record.identifier.startsWith(RESET_PREFIX)) {
    return { ok: false, reason: "invalid" };
  }

  const key = {
    identifier_token: { identifier: record.identifier, token },
  };

  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({ where: key });
    return { ok: false, reason: "expired" };
  }

  const email = record.identifier.slice(RESET_PREFIX.length);
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({ where: { email }, data: { hashedPassword } });
  await prisma.verificationToken.delete({ where: key });

  return { ok: true };
}
