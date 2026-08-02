import Link from "next/link";

import { githubSignIn } from "@/lib/auth-actions";
import { SignInForm } from "@/components/auth/SignInForm";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-sm flex-col justify-center gap-6 p-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to your DevStash account
        </p>
      </div>

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
