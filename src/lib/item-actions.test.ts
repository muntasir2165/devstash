import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db/items-mutations", () => ({
  updateItem: vi.fn(),
  deleteItem: vi.fn(),
  createItem: vi.fn(),
}));

import { auth } from "@/auth";
import {
  updateItem as updateItemQuery,
  deleteItem as deleteItemQuery,
  createItem as createItemQuery,
} from "@/lib/db/items-mutations";
import { createItem, deleteItem, updateItem } from "@/lib/item-actions";

const mockAuth = vi.mocked(auth);
const mockQuery = vi.mocked(updateItemQuery);
const mockDeleteQuery = vi.mocked(deleteItemQuery);
const mockCreateQuery = vi.mocked(createItemQuery);

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

describe("deleteItem action", () => {
  it("rejects when there is no session and never touches the database", async () => {
    mockAuth.mockResolvedValue(null as never);
    const result = await deleteItem("item-1");
    expect(result).toEqual({ success: false, error: "You must be signed in." });
    expect(mockDeleteQuery).not.toHaveBeenCalled();
  });

  it("reports not found when the item isn't owned by the user", async () => {
    mockDeleteQuery.mockResolvedValue(false);
    const result = await deleteItem("item-1");
    expect(result).toEqual({ success: false, error: "Item not found." });
  });

  it("deletes scoped to the session user", async () => {
    mockDeleteQuery.mockResolvedValue(true);
    const result = await deleteItem("item-1");
    expect(mockDeleteQuery).toHaveBeenCalledWith("item-1", "user-1");
    expect(result).toEqual({ success: true });
  });
});

describe("createItem action", () => {
  const newSnippet = {
    type: "snippet" as const,
    title: "useDebounce",
    description: "",
    content: "code",
    url: "",
    language: "typescript",
    tags: ["react"],
  };

  beforeEach(() => {
    mockCreateQuery.mockResolvedValue({ id: "item-1" } as never);
  });

  it("rejects when there is no session and never touches the database", async () => {
    mockAuth.mockResolvedValue(null as never);
    const result = await createItem(newSnippet);
    expect(result).toEqual({ success: false, error: "You must be signed in." });
    expect(mockCreateQuery).not.toHaveBeenCalled();
  });

  it("rejects an empty title", async () => {
    const result = await createItem({ ...newSnippet, title: "  " });
    expect(result.success).toBe(false);
    expect(mockCreateQuery).not.toHaveBeenCalled();
  });

  it("rejects a link without a URL", async () => {
    const result = await createItem({
      ...newSnippet,
      type: "link",
      url: "",
    });
    expect(result.success).toBe(false);
    expect(mockCreateQuery).not.toHaveBeenCalled();
  });

  it("creates scoped to the session user with blanks normalized to null", async () => {
    const result = await createItem(newSnippet);
    expect(mockCreateQuery).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({
        type: "snippet",
        title: "useDebounce",
        description: null,
        url: null,
      }),
    );
    expect(result).toEqual({ success: true, data: { id: "item-1" } });
  });

  it("reports an unknown item type", async () => {
    mockCreateQuery.mockResolvedValue(null);
    const result = await createItem(newSnippet);
    expect(result).toEqual({ success: false, error: "Unknown item type." });
  });
});
