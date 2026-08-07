import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

// Rate limiting is active only when Upstash credentials are configured. Without
// them every check fails open, so local/dev/CI (and any deploy that hasn't set the
// vars yet) keep working — limits just aren't enforced.
const redis = url && token ? new Redis({ url, token }) : null;

type Window = Parameters<typeof Ratelimit.slidingWindow>[1];

function slidingWindow(tokens: number, window: Window, prefix: string) {
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(tokens, window),
    prefix,
  });
}

// Per-endpoint limiters. Separate prefixes keep their sliding windows from
// colliding in Redis. Limits/windows come from the rate-limiting spec.
export const loginRateLimit = slidingWindow(5, "15 m", "ratelimit:login");
export const registerRateLimit = slidingWindow(3, "1 h", "ratelimit:register");
export const forgotPasswordRateLimit = slidingWindow(3, "1 h", "ratelimit:forgot-password");
export const resetPasswordRateLimit = slidingWindow(5, "15 m", "ratelimit:reset-password");

export type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  /** Seconds until the window resets — for a `Retry-After` header / message. */
  retryAfter: number;
};

const ALLOW: RateLimitResult = {
  success: true,
  limit: 0,
  remaining: 0,
  reset: 0,
  retryAfter: 0,
};

/** Consume one token for `identifier`. Fails open when disabled or Redis errors. */
export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string,
): Promise<RateLimitResult> {
  if (!limiter) return ALLOW;
  try {
    const { success, limit, remaining, reset } = await limiter.limit(identifier);
    // `reset` is epoch milliseconds.
    const retryAfter = Math.max(0, Math.ceil((reset - Date.now()) / 1000));
    return { success, limit, remaining, reset, retryAfter };
  } catch {
    return ALLOW;
  }
}

/** First client IP from proxy headers (Vercel/Node), falling back to a constant. */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0];
    if (first) return first.trim();
  }
  return headers.get("x-real-ip")?.trim() || "127.0.0.1";
}

/** Shared "try again in N minutes" message for routes and the sign-in action. */
export function rateLimitMessage(retryAfter: number): string {
  const minutes = Math.max(1, Math.ceil(retryAfter / 60));
  return `Too many attempts. Please try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`;
}

/** 429 JSON response with a `Retry-After` header for rate-limited route handlers. */
export function tooManyRequests(retryAfter: number): NextResponse {
  return NextResponse.json(
    { error: rateLimitMessage(retryAfter) },
    { status: 429, headers: { "Retry-After": String(retryAfter) } },
  );
}
