import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { emailVerificationEnabled } from "@/lib/config";
import { issueVerificationToken } from "@/lib/verification";
import {
  checkRateLimit,
  getClientIp,
  registerRateLimit,
  tooManyRequests,
} from "@/lib/rate-limit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const rl = await checkRateLimit(registerRateLimit, getClientIp(req.headers));
  if (!rl.success) return tooManyRequests(rl.retryAfter);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { name, email, password, confirmPassword } = (body ?? {}) as Record<
    string,
    unknown
  >;

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof confirmPassword !== "string" ||
    !name.trim()
  ) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 },
    );
  }
  if (password !== confirmPassword) {
    return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
  }

  const normalizedEmail = email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists" },
      { status: 409 },
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  // Verification disabled: create the user already verified and skip the Resend send.
  if (!emailVerificationEnabled) {
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        hashedPassword,
        emailVerified: new Date(),
      },
      select: { id: true, name: true, email: true },
    });
    return NextResponse.json(
      { user, verificationRequired: false },
      { status: 201 },
    );
  }

  const user = await prisma.user.create({
    data: { name: name.trim(), email: normalizedEmail, hashedPassword },
    select: { id: true, name: true, email: true },
  });

  // Registration only succeeds if the verification email actually sends.
  const emailResult = await issueVerificationToken(normalizedEmail);
  if (!emailResult.ok) {
    // Roll back so the address is free to retry and no unverifiable account lingers.
    await prisma.verificationToken.deleteMany({
      where: { identifier: normalizedEmail },
    });
    await prisma.user.delete({ where: { id: user.id } });
    return NextResponse.json(
      {
        error:
          "We couldn't send the verification email. Please check the address and try again.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ user, verificationRequired: true }, { status: 201 });
}
