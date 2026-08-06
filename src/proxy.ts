import NextAuth from "next-auth";

import { authConfig } from "@/auth.config";

// Build a lightweight, edge-safe auth instance from the adapter-free config.
const { auth } = NextAuth(authConfig);

export const proxy = auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;
  const isProtected =
    pathname.startsWith("/dashboard") || pathname.startsWith("/profile");

  if (isProtected && !isLoggedIn) {
    const signInUrl = new URL("/sign-in", req.nextUrl);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return Response.redirect(signInUrl);
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"],
};
