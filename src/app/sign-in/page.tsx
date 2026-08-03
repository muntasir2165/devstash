import Link from "next/link";

import { githubSignIn } from "@/lib/auth-actions";
import { SignInForm } from "@/components/auth/SignInForm";
import { Button } from "@/components/ui/button";

const BANNERS: Record<string, { tone: "success" | "error"; text: string }> = {
  registered: {
    tone: "success",
    text: "Account created — check your email to verify before signing in.",
  },
  ready: {
    tone: "success",
    text: "Account created — you can sign in now.",
  },
  verified: {
    tone: "success",
    text: "Email verified — you can now sign in.",
  },
  expired_token: {
    tone: "error",
    text: "That verification link has expired. Please register again.",
  },
  invalid_token: {
    tone: "error",
    text: "That verification link is invalid.",
  },
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{
    registered?: string;
    verified?: string;
    error?: string;
  }>;
}) {
  const params = await searchParams;
  const bannerKey =
    params.registered === "ready"
      ? "ready"
      : params.registered
        ? "registered"
        : params.verified
          ? "verified"
          : params.error;
  const banner = bannerKey ? (BANNERS[bannerKey] ?? null) : null;

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-sm flex-col justify-center gap-6 p-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to your DevStash account
        </p>
      </div>

      {banner ? (
        <p
          role="status"
          className={
            banner.tone === "success"
              ? "rounded-md bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400"
              : "rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
          }
        >
          {banner.text}
        </p>
      ) : null}

      <form action={githubSignIn}>
        <Button type="submit" variant="outline" className="w-full">
          Sign in with GitHub
        </Button>
      </form>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <SignInForm />

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-foreground underline underline-offset-4"
        >
          Register
        </Link>
      </p>
    </div>
  );
}
