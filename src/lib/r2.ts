import "server-only";

import { randomUUID } from "node:crypto";

import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

export const R2_BUCKET = process.env.R2_BUCKET_NAME ?? "";
/** Public base URL the bucket is served from, without a trailing slash. */
export const R2_PUBLIC_URL = (process.env.R2_PUBLIC_URL ?? "").replace(/\/+$/, "");

/** Uploads are disabled (rather than crashing) when R2 isn't configured. */
export const r2Configured = Boolean(
  accountId && accessKeyId && secretAccessKey && R2_BUCKET && R2_PUBLIC_URL,
);

const client = r2Configured
  ? new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: accessKeyId!,
        secretAccessKey: secretAccessKey!,
      },
    })
  : null;

export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const FILE_MAX_BYTES = 10 * 1024 * 1024;

/** Allowed MIME type → permitted extensions, per the file/image spec. */
const IMAGE_TYPES: Record<string, string[]> = {
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/gif": [".gif"],
  "image/webp": [".webp"],
  "image/svg+xml": [".svg"],
};

const FILE_TYPES: Record<string, string[]> = {
  "application/pdf": [".pdf"],
  "text/plain": [".txt", ".ini"],
  "text/markdown": [".md"],
  "application/json": [".json"],
  "application/x-yaml": [".yaml", ".yml"],
  "text/yaml": [".yaml", ".yml"],
  "application/xml": [".xml"],
  "text/xml": [".xml"],
  "text/csv": [".csv"],
  "application/toml": [".toml"],
};

export const ACCEPT_ATTR = {
  image: Object.keys(IMAGE_TYPES).join(","),
  file: Object.keys(FILE_TYPES).join(","),
} as const;

export type UploadKind = "image" | "file";

function extensionOf(name: string) {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot).toLowerCase();
}

export type ValidationResult = { ok: true } | { ok: false; error: string };

/** Validate size, MIME type and extension together — the client is never trusted. */
export function validateUpload(
  kind: UploadKind,
  file: { name: string; type: string; size: number },
): ValidationResult {
  const allowed = kind === "image" ? IMAGE_TYPES : FILE_TYPES;
  const maxBytes = kind === "image" ? IMAGE_MAX_BYTES : FILE_MAX_BYTES;

  if (file.size <= 0) return { ok: false, error: "File is empty." };
  if (file.size > maxBytes) {
    return {
      ok: false,
      error: `File is too large (max ${Math.round(maxBytes / 1024 / 1024)} MB).`,
    };
  }

  const extensions = allowed[file.type];
  if (!extensions) {
    return { ok: false, error: `Unsupported ${kind} type: ${file.type || "unknown"}.` };
  }
  if (!extensions.includes(extensionOf(file.name))) {
    return { ok: false, error: "File extension doesn't match its type." };
  }

  return { ok: true };
}

/** Object key, namespaced per user so one user's keys can't collide with another's. */
export function buildObjectKey(userId: string, fileName: string) {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-100);
  return `${userId}/${randomUUID()}-${safeName}`;
}

/** Public URL for a stored object. */
export function publicUrlFor(key: string) {
  return `${R2_PUBLIC_URL}/${key}`;
}

/** Recover the object key from a stored public URL; null if it isn't ours. */
export function keyFromPublicUrl(url: string | null | undefined) {
  if (!url || !R2_PUBLIC_URL) return null;
  const prefix = `${R2_PUBLIC_URL}/`;
  return url.startsWith(prefix) ? url.slice(prefix.length) : null;
}

export async function uploadToR2(
  key: string,
  body: Uint8Array,
  contentType: string,
) {
  if (!client) throw new Error("R2 is not configured.");
  await client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
  return publicUrlFor(key);
}

/** Best-effort delete — a missing object shouldn't fail the caller's operation. */
export async function deleteFromR2(key: string) {
  if (!client) return;
  try {
    await client.send(
      new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }),
    );
  } catch {
    // Ignore: the DB row is the source of truth.
  }
}
