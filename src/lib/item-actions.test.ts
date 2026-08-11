import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db/items", () => ({ updateItem: vi.fn() }));

import { auth } from "@/auth";
import { updateItem as updateItemQuery } from "@/lib/db/items";
import { updateItem } from "@/lib/item-actions";

const mockAuth = vi.mocked(auth);
const mockQuery = vi.mocked(updateItemQuery);

const valid = {
  title: "Title",
  description: "",
  content: "code",
  url: "",
  language: "typescript",
  tags: ["react"],
};

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
  mockQuery.mockResolvedValue({ id: "item-1" } as never);
});

describe("updateItem action", () => {
  it("rejects when there is no session and never touches the database", async () => {
    mockAuth.mockResolvedValue(null as never);
    const result = await updateItem("item-1", valid);
    expect(result).toEqual({ success: false, error: "You must be signed in." });
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("rejects an empty title", async () => {
    const result = await updateItem("item-1", { ...valid, title: "   " });
    expect(result.success).toBe(false);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("rejects an invalid URL", async () => {
    const result = await updateItem("item-1", { ...valid, url: "not-a-url" });
    expect(result.success).toBe(false);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("normalizes blank optional fields to null and trims the title", async () => {
    await updateItem("item-1", { ...valid, title: "  Padded  " });
    expect(mockQuery).toHaveBeenCalledWith(
      "item-1",
      "user-1",
      expect.objectContaining({
        title: "Padded",
        description: null,
        url: null,
      }),
    );
  });

  it("returns not found when the item isn't owned by the user", async () => {
    mockQuery.mockResolvedValue(null);
    const result = await updateItem("item-1", valid);
    expect(result).toEqual({ success: false, error: "Item not found." });
  });

  it("returns the updated item on success", async () => {
    const result = await updateItem("item-1", valid);
    expect(result).toEqual({ success: true, data: { id: "item-1" } });
  });
});
