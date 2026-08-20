import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db/collections", () => ({ createCollection: vi.fn() }));

import { auth } from "@/auth";
import { createCollection as createCollectionQuery } from "@/lib/db/collections";
import { createCollection } from "@/lib/collection-actions";

const mockAuth = vi.mocked(auth);
const mockQuery = vi.mocked(createCollectionQuery);

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
  mockQuery.mockResolvedValue({
    id: "col-1",
    name: "React Patterns",
    description: null,
    isFavorite: false,
    itemCount: 0,
    types: [],
  });
});

describe("createCollection action", () => {
  it("rejects when there is no session and never touches the database", async () => {
    mockAuth.mockResolvedValue(null as never);

    const result = await createCollection({ name: "React", description: "" });

    expect(result).toEqual({ success: false, error: "You must be signed in." });
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("rejects a blank name", async () => {
    const result = await createCollection({ name: "   ", description: "" });

    expect(result.success).toBe(false);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  // The error string goes straight into a toast, so it has to stay readable.
  it("surfaces a human-readable message for a blank name", async () => {
    const result = await createCollection({ name: "", description: "" });

    expect(result).toEqual({
      success: false,
      error: expect.stringContaining("Name is required"),
    });
  });

  it("accepts an omitted description", async () => {
    const result = await createCollection({ name: "React Patterns" });

    expect(result.success).toBe(true);
    expect(mockQuery).toHaveBeenCalledWith("user-1", {
      name: "React Patterns",
      description: null,
    });
  });

  it("trims the name and turns a blank description into null", async () => {
    await createCollection({ name: "  React Patterns  ", description: "   " });

    expect(mockQuery).toHaveBeenCalledWith("user-1", {
      name: "React Patterns",
      description: null,
    });
  });

  it("creates for the session user, not any id supplied by the caller", async () => {
    const result = await createCollection({
      name: "React Patterns",
      description: "Hooks and patterns",
    });

    expect(mockQuery).toHaveBeenCalledWith("user-1", {
      name: "React Patterns",
      description: "Hooks and patterns",
    });
    expect(result).toEqual({
      success: true,
      data: {
        id: "col-1",
        name: "React Patterns",
        description: null,
        isFavorite: false,
        itemCount: 0,
        types: [],
      },
    });
  });
});
