import { NextResponse } from "next/server";

import { issuePasswordReset } from "@/lib/password-reset";
import {
  checkRateLimit,
  forgotPasswordRateLimit,
  getClientIp,
  tooManyRequests,
} from "@/lib/rate-limit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Neutral response used for every request so the endpoint never reveals
// whether an account exists for the given email (no account enumeration).
const NEUTRAL = {
  message: "If an account exists for that email, we've sent a reset link.",
};

export async function POST(req: Request) {
  const rl = await checkRateLimit(forgotPasswordRateLimit, getClientIp(req.headers));
  if (!rl.success) return tooManyRequests(rl.retryAfter);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const raw = (body as { email?: unknown })?.email;
  if (typeof raw === "string") {
    const email = raw.trim().toLowerCase();
    if (EMAIL_RE.test(email)) {
      await issuePasswordReset(email);
    }
  }

  return NextResponse.json(NEUTRAL);
}
