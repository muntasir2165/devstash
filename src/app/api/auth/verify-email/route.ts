import { NextResponse } from "next/server";

import { getBaseUrl } from "@/lib/base-url";
import { consumeVerificationToken } from "@/lib/verification";

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  const base = await getBaseUrl();

  if (!token) {
    return NextResponse.redirect(`${base}/sign-in?error=invalid_token`);
  }

  const result = await consumeVerificationToken(token);
  if (!result.ok) {
    return NextResponse.redirect(`${base}/sign-in?error=${result.reason}_token`);
  }

  return NextResponse.redirect(`${base}/sign-in?verified=1`);
}
