import { NextResponse } from "next/server";

import { issuePasswordReset } from "@/lib/password-reset";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Neutral response used for every request so the endpoint never reveals
// whether an account exists for the given email (no account enumeration).
const NEUTRAL = {
  message: "If an account exists for that email, we've sent a reset link.",
};

export async function POST(req: Request) {
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
