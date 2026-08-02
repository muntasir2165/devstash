import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";

// Edge-safe config: providers only. No adapter/Prisma/bcrypt here so it can run in the proxy.
export const authConfig = {
  providers: [
    GitHub,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // Placeholder only — the real bcrypt validation lives in auth.ts (Node runtime).
      authorize: () => null,
    }),
  ],
} satisfies NextAuthConfig;
