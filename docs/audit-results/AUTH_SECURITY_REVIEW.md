# Auth Security Review — DevStash

**Last audited:** 2026-08-06
**Scope:** NextAuth v5 auth (Credentials + GitHub), email verification, password reset, profile.
**Reviewer:** auth-auditor (automated)

## Summary
**5 High severity findings, 3 Low severity notes.** Critical authentication operations lack rate limiting, exposing the application to credential stuffing, brute-force token attacks, and email-send abuse. Password hashing, token security, and session validation controls are correctly implemented. All High findings center on the absence of throttling mechanisms that NextAuth does not provide.

## Findings

### Critical
None found.

### High

- **`src/auth.ts:26-46`** — No rate limiting on Credentials `authorize` function
  - Why it matters: Attackers can conduct unlimited credential-stuffing attacks against the sign-in endpoint, attempting thousands of username/password combinations without throttling. This is a direct account-takeover vector.
  - Fix: Implement per-IP + per-email token bucket rate limiting (e.g., 5 attempts per 15 minutes per identifier). Use `@upstash/ratelimit` with Redis/Upstash, or a database-backed throttle table tracking attempt counts and lockout timestamps. Check the rate limit before `bcrypt.compare` to prevent timing-based enumeration and before database queries to reduce load. Example pseudo-code:
    ```typescript
    const limiter = new Ratelimit({
      redis: upstashRedis,
      limiter: Ratelimit.slidingWindow(5, "15 m"),
    });
    const ip = headers().get("x-forwarded-for") ?? "unknown";
    const { success } = await limiter.limit(`credentials:${ip}:${email}`);
    if (!success) return null; // or throw a specific error
    ```

- **`src/app/api/auth/register/route.ts:10`** — No rate limiting on registration endpoint
  - Why it matters: Attackers can hammer the registration endpoint to: (1) enumerate existing accounts by testing which emails return "already exists" vs. validation errors, (2) trigger costly email sends if verification is enabled, exhausting Resend quota or incurring financial cost, and (3) pollute the database with spam accounts if email verification is disabled.
  - Fix: Apply per-IP rate limiting (e.g., 3 registrations per hour per IP). This limits enumeration speed and email-send abuse. Example:
    ```typescript
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    const { success } = await limiter.limit(`register:${ip}`);
    if (!success) return NextResponse.json({ error: "Too many registration attempts. Please try again later." }, { status: 429 });
    ```

- **`src/app/api/auth/forgot-password/route.ts:12`** — No rate limiting on forgot-password endpoint
  - Why it matters: Although the endpoint returns a neutral response (preventing direct enumeration), attackers can abuse it to trigger unlimited password-reset emails to arbitrary addresses. This exhausts Resend quota, incurs cost, and can be used for email harassment (sending unwanted reset emails to a target).
  - Fix: Apply per-IP + per-email rate limiting (e.g., 3 requests per hour per email, 10 requests per hour per IP). Example:
    ```typescript
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    const emailKey = `forgot:${email}`;
    const ipKey = `forgot:${ip}`;
    const [emailLimit, ipLimit] = await Promise.all([
      limiter.limit(emailKey),
      limiter.limit(ipKey),
    ]);
    if (!emailLimit.success || !ipLimit.success) {
      return NextResponse.json(NEUTRAL); // still neutral response to avoid enumeration
    }
    ```

- **`src/app/api/auth/reset-password/route.ts:10`** — No rate limiting on reset-password submission endpoint
  - Why it matters: Attackers who obtain or guess a reset token (e.g., via a leaked email or brute-force of a weak token space, though the current 256-bit tokens are strong) can hammer the submission endpoint to test token validity or exhaust server resources. While the 1-hour TTL and single-use enforcement mitigate this, lack of throttling allows rapid automated attempts.
  - Fix: Apply per-IP + per-token rate limiting (e.g., 5 attempts per 5 minutes per IP, 3 attempts per token). Track failed attempts per token and lock it after repeated failures. Example:
    ```typescript
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    const { success } = await limiter.limit(`reset:${ip}`);
    if (!success) return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
    ```

- **`src/lib/profile-actions.ts:12-56`** — No rate limiting on `changePassword` server action
  - Why it matters: An authenticated attacker (or a session-hijacker) can brute-force the current password field without throttling, bypassing the session check. While `bcrypt.compare` is slow (cost 12), modern GPUs can still test hundreds of hashes per second remotely via repeated action invocations. This is a lateral-movement risk if an attacker gains a session token but not the plaintext password.
  - Fix: Apply per-user rate limiting on password-change attempts (e.g., 5 attempts per 15 minutes per user ID). Track attempts in Redis or a database table. Example:
    ```typescript
    const { success } = await limiter.limit(`changepw:${session.user.id}`);
    if (!success) return { error: "Too many password change attempts. Please try again later." };
    ```

### Medium
None found.

### Low

- **`src/lib/verification.ts:21` + `src/lib/password-reset.ts:33`** — Tokens appear in URL query parameters for email verification and password reset links
  - Why it matters: Query-string tokens can leak via HTTP Referer headers if the user navigates from the callback page to an external site, and they appear in server access logs and browser history. This is a standard email-verification pattern; modern browsers suppress referers on navigation from HTTPS, and the tokens are short-lived and single-use, limiting exposure. However, it remains a minor information-disclosure vector.
  - Note: This is an accepted trade-off for email-link-based flows. To eliminate URL leakage entirely, switch to a POST-based flow (email contains a code, user pastes it into a form that submits via POST). The current implementation is standard practice and not a critical flaw.

- **`src/app/api/auth/register/route.ts:55-59`** — Registration endpoint returns distinct "An account with this email already exists" error, enabling account enumeration
  - Why it matters: Attackers can test whether an email is registered by observing the 409 status vs. 400 validation errors. However, this is a common trade-off in user-facing registration flows; eliminating it would require always returning a neutral "check your email" message even for already-registered accounts, which degrades UX (users don't know if they mistyped their email or should check existing accounts). Rate limiting (already recommended as High) mitigates automated enumeration.
  - Note: Accepted UX trade-off. The High-severity rate-limiting fix above will slow enumeration to impractical speeds.

- **JWT session strategy after password change** — Password changes do not immediately invalidate existing JWT sessions; old sessions remain valid until their expiry
  - Why it matters: Under the JWT session strategy (configured in `src/auth.ts:18`), session state is stored client-side in a signed cookie. Changing the password updates the database but does not revoke the existing JWT. An attacker with a stolen session cookie can continue using it until natural expiry, even after the victim changes their password. This is an inherent limitation of stateless JWT sessions.
  - Note: To enforce immediate invalidation, switch to a database session strategy (`session: { strategy: "database" }`) or track a "password changed at" timestamp in the JWT and reject tokens older than that timestamp on each `session` callback invocation. The current behavior is typical for JWT-based auth and is a documented NextAuth trade-off. Consider this a low-priority hardening opportunity, not a bug.

## Passed Checks

- **Password hashing**: All three password write paths (register, reset, changePassword) use `bcrypt.hash` with cost factor 12, and password verification uses `bcrypt.compare` (never direct string comparison). No plaintext passwords logged, returned, or stored.
- **Token entropy**: Both email-verification and password-reset tokens are generated with `crypto.randomBytes(32)` (256 bits of entropy), a CSPRNG. No use of `Math.random()` for security-critical tokens.
- **Token expiry enforcement**: Verification tokens have a 24-hour TTL; reset tokens have a 1-hour TTL. Both flows check `record.expires < new Date()` server-side and delete expired tokens immediately on attempted use.
- **Single-use tokens**: Both verification and reset tokens are deleted from the database after successful consumption (`consumeVerificationToken` line 46, `resetPassword` line 64). Expired tokens are also deleted on attempted use. Outstanding tokens are purged on re-issue (`issueVerificationToken` line 14, `issuePasswordReset` line 30).
- **Token namespace separation**: Password-reset tokens use the `password-reset:` prefix on the identifier field, preventing a verification token from being used as a reset token or vice-versa.
- **Neutral forgot-password response**: The forgot-password endpoint returns an identical "If an account exists..." message for all requests (valid email, invalid email, OAuth-only account, non-existent account), preventing account enumeration at that stage.
- **Server-side session validation on profile mutations**: Both `changePassword` and `deleteAccount` call `auth()` at the start and reject requests with no session. The profile page itself redirects unauthenticated users.
- **No IDOR on profile actions**: Both `changePassword` and `deleteAccount` act on `session.user.id`, never a client-supplied user identifier.
- **Safe change-password flow**: Current password is verified with `bcrypt.compare` before accepting the new password; new password is validated for minimum length and confirmation match server-side; the new password is re-hashed with bcrypt cost 12 before storage.
- **Transactional FK-safe account deletion**: `deleteAccount` uses a transaction with the correct delete order (items before item types, due to the restrict FK) and cleans up all related records (sessions, accounts, verification tokens).
- **Email verification bypass prevention**: When `emailVerificationEnabled` is true, the Credentials `authorize` function (src/auth.ts:42-44) throws `EmailNotVerifiedError` if `user.emailVerified` is null, preventing unverified users from obtaining a session.
- **ENV security**: `.env*` files are git-ignored per `.gitignore:33`. All secrets (`RESEND_API_KEY`, `EMAIL_FROM`, `AUTH_SECRET`, etc.) are loaded from environment variables. The `onboarding@resend.dev` fallback sender in `src/lib/email.ts:10` is a non-production Resend default, not a committed secret.
- **No use of weak PRNGs**: Confirmed no `Math.random()` in auth-critical code; the single occurrence is in a UI component for visual styling (`src/components/ui/sidebar.tsx:609`) and has no security impact.
