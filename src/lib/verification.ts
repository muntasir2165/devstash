import crypto from "node:crypto";

import { prisma } from "@/lib/prisma";
import { getBaseUrl } from "@/lib/base-url";
import { sendVerificationEmail } from "@/lib/email";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/** Create a single-use verification token and email its link. Best-effort on send. */
export async function issueVerificationToken(email: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + TOKEN_TTL_MS);

  // Replace any outstanding tokens for this email.
  await prisma.verificationToken.deleteMany({ where: { identifier: email } });
  await prisma.verificationToken.create({
    data: { identifier: email, token, expires },
  });

  const url = `${await getBaseUrl()}/api/auth/verify-email?token=${token}`;
  return sendVerificationEmail(email, url);
}

export type ConsumeResult =
  | { ok: true; email: string }
  | { ok: false; reason: "invalid" | "expired" };

/** Validate a token, mark the user verified, and consume the token (single use). */
export async function consumeVerificationToken(
  token: string,
): Promise<ConsumeResult> {
  const record = await prisma.verificationToken.findFirst({ where: { token } });
  if (!record) return { ok: false, reason: "invalid" };

  const key = {
    identifier_token: { identifier: record.identifier, token },
  };

  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({ where: key });
    return { ok: false, reason: "expired" };
  }

  await prisma.user.update({
    where: { email: record.identifier },
    data: { emailVerified: new Date() },
  });
  await prisma.verificationToken.delete({ where: key });

  return { ok: true, email: record.identifier };
}
