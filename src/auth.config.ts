import GitHub from "next-auth/providers/github";
import type { NextAuthConfig } from "next-auth";

// Edge-safe config: providers only. No adapter/Prisma here so it can run in the proxy.
export const authConfig = {
  providers: [GitHub],
} satisfies NextAuthConfig;
