import { beforeEach, describe, expect, it, vi } from "vitest";

// Values are read at module load, so set them before importing.
vi.stubEnv("R2_ACCOUNT_ID", "acct");
vi.stubEnv("R2_ACCESS_KEY_ID", "key");
vi.stubEnv("R2_SECRET_ACCESS_KEY", "secret");
vi.stubEnv("R2_BUCKET_NAME", "bucket");
vi.stubEnv("R2_PUBLIC_URL", "https://cdn.example.com/");

const { buildObjectKey, keyFromPublicUrl, publicUrlFor, validateUpload } =
  await import("@/lib/r2");

beforeEach(() => vi.clearAllMocks());

describe("validateUpload", () => {
  const png = { name: "shot.png", type: "image/png", size: 1024 };

  it("accepts an allowed image", () => {
    expect(validateUpload("image", png)).toEqual({ ok: true });
  });

  it("rejects an image over 5 MB", () => {
    const result = validateUpload("image", { ...png, size: 6 * 1024 * 1024 });
    expect(result).toMatchObject({ ok: false });
  });

  it("rejects a file over 10 MB", () => {
    const result = validateUpload("file", {
      name: "big.pdf",
      type: "application/pdf",
      size: 11 * 1024 * 1024,
    });
    expect(result).toMatchObject({ ok: false });
  });

  it("rejects an empty file", () => {
    expect(validateUpload("image", { ...png, size: 0 })).toMatchObject({
      ok: false,
    });
  });

  it("rejects a disallowed MIME type", () => {
    expect(
      validateUpload("file", {
        name: "run.sh",
        type: "application/x-sh",
        size: 10,
      }),
    ).toMatchObject({ ok: false });
  });

  it("rejects an extension that doesn't match the MIME type", () => {
    // Executable renamed to look like a PNG.
    expect(
      validateUpload("image", { ...png, name: "payload.exe" }),
    ).toMatchObject({ ok: false });
  });

  it("keeps image and file allow-lists separate", () => {
    expect(
      validateUpload("file", { name: "a.png", type: "image/png", size: 10 }),
    ).toMatchObject({ ok: false });
  });
});

describe("object keys", () => {
  it("namespaces the key under the user id", () => {
    expect(buildObjectKey("user-1", "photo.png")).toMatch(/^user-1\//);
  });

  it("sanitises the file name so a key can't escape its user prefix", () => {
    const key = buildObjectKey("user-1", "../../etc/passwd");
    expect(key.startsWith("user-1/")).toBe(true);
    // Separators are stripped, so the remainder is a single flat segment.
    expect(key.slice("user-1/".length)).not.toContain("/");
  });

  it("round-trips a public URL back to its key", () => {
    const key = "user-1/abc-photo.png";
    expect(keyFromPublicUrl(publicUrlFor(key))).toBe(key);
  });

  it("ignores URLs from another host", () => {
    expect(keyFromPublicUrl("https://evil.example.com/user-1/x.png")).toBeNull();
  });

  it("ignores a null URL", () => {
    expect(keyFromPublicUrl(null)).toBeNull();
  });
});
