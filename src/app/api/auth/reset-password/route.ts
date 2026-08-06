import { NextResponse } from "next/server";

import { resetPassword } from "@/lib/password-reset";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { token, password, confirmPassword } = (body ?? {}) as {
    token?: unknown;
    password?: unknown;
    confirmPassword?: unknown;
  };

  if (typeof token !== "string" || !token) {
    return NextResponse.json({ error: "Invalid or missing token" }, { status: 400 });
  }
  if (typeof password !== "string" || password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 },
    );
  }
  if (password !== confirmPassword) {
    return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
  }

  const result = await resetPassword(token, password);
  if (!result.ok) {
    return NextResponse.json(
      {
        error:
          result.reason === "expired"
            ? "This reset link has expired. Please request a new one."
            : "This reset link is invalid.",
      },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true });
}
