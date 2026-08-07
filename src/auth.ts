import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";

import { prisma } from "@/lib/prisma";
import { emailVerificationEnabled } from "@/lib/config";
import { authConfig } from "@/auth.config";
import { checkRateLimit, getClientIp, loginRateLimit } from "@/lib/rate-limit";

// Thrown when the password is correct but the email has not been verified yet.
class EmailNotVerifiedError extends CredentialsSignin {
  code = "email_not_verified";
}

// Thrown when too many login attempts come from the same IP + email.
class RateLimitedError extends CredentialsSignin {
  code = "rate_limited";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  // Override the edge-safe placeholder providers with the real bcrypt authorize (Node runtime).
  providers: [
    GitHub,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string") return null;

        const normalizedEmail = email.toLowerCase().trim();

        // Throttle here (not just the sign-in action) so direct POSTs to
        // /api/auth/callback/credentials are limited too.
        const rl = await checkRateLimit(
          loginRateLimit,
          `${getClientIp(await headers())}:${normalizedEmail}`,
        );
        if (!rl.success) throw new RateLimitedError();

        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });
        // No such user, or a GitHub-only account with no password set.
        if (!user?.hashedPassword) return null;

        const isValid = await bcrypt.compare(password, user.hashedPassword);
        if (!isValid) return null;

        if (emailVerificationEnabled && !user.emailVerified) {
          throw new EmailNotVerifiedError();
        }

        return { id: user.id, name: user.name, email: user.email, image: user.image };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      return session;
    },
  },
});
