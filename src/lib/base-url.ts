import { headers } from "next/headers";

/** Absolute base URL for building links in emails and redirects. */
export async function getBaseUrl() {
  const fromEnv = process.env.AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}
