"use server";

import { AuthError } from "next-auth";

import { signIn, signOut } from "@/auth";

export type SignInState = { error?: string };

export async function credentialsSignIn(
  _prev: SignInState,
  formData: FormData,
): Promise<SignInState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/dashboard",
    });
    return {};
  } catch (error) {
    // A successful sign-in throws a NEXT_REDIRECT (not an AuthError) — re-throw it
    // so Next.js can complete the redirect. Only handle real auth failures here.
    if (error instanceof AuthError) {
      return {
        error:
          error.type === "CredentialsSignin"
            ? "Invalid email or password."
            : "Unable to sign in. Please try again.",
      };
    }
    throw error;
  }
}

export async function githubSignIn() {
  await signIn("github", { redirectTo: "/dashboard" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/sign-in" });
}
