import { describe, expect, it } from "vitest";

import { cn, formatBytes } from "@/lib/utils";

describe("cn", () => {
  it("joins class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("drops falsy values", () => {
    expect(cn("a", false, undefined, null, "c")).toBe("a c");
  });

  it("resolves conflicting Tailwind classes (last one wins)", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});

describe("formatBytes", () => {
  it("shows plain bytes under 1 KB", () => {
    expect(formatBytes(512)).toBe("512 B");
  });

  it("switches to KB at 1 KB", () => {
    expect(formatBytes(1024)).toBe("1.0 KB");
  });

  it("switches to MB at 1 MB", () => {
    expect(formatBytes(1024 * 1024)).toBe("1.0 MB");
  });

  it("rounds to one decimal place", () => {
    expect(formatBytes(1536)).toBe("1.5 KB");
  });

  it("handles zero", () => {
    expect(formatBytes(0)).toBe("0 B");
  });
});
