import { beforeEach, describe, expect, it, vi } from "vitest";

// Server actions touch external boundaries — mock them so the unit under test is
// only the action's own logic (session guard, validation, branching).
vi.mock("@/auth", () => ({ auth: vi.fn(), signOut: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: { user: { findUnique: vi.fn(), update: vi.fn() } },
}));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

import { auth } from "@/auth";
import { changePassword } from "@/lib/profile-actions";

const mockAuth = vi.mocked(auth);

function formData(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) fd.set(key, value);
  return fd;
}

describe("changePassword", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects when there is no session", async () => {
    mockAuth.mockResolvedValue(null);
    const result = await changePassword({}, formData({}));
    expect(result.error).toMatch(/signed in/i);
  });

  it("rejects a new password shorter than 8 characters", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as never);
    const result = await changePassword(
      {},
      formData({
        currentPassword: "current",
        newPassword: "short",
        confirmPassword: "short",
      }),
    );
    expect(result.error).toMatch(/at least 8/i);
  });

  it("rejects when the confirmation does not match", async () => {
    mockAuth.mockResolvedValue({ user: { id: "u1" } } as never);
    const result = await changePassword(
      {},
      formData({
        currentPassword: "current",
        newPassword: "newpassword",
        confirmPassword: "different123",
      }),
    );
    expect(result.error).toMatch(/do not match/i);
  });
});
