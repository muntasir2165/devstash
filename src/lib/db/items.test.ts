import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    item: {
      findFirst: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn(),
      create: vi.fn(),
    },
    itemType: { findFirst: vi.fn() },
  },
}));

vi.mock("@/lib/r2", () => ({
  deleteFromR2: vi.fn(),
  keyFromPublicUrl: (url: string | null) =>
    url && url.startsWith("https://cdn.example.com/")
      ? url.slice("https://cdn.example.com/".length)
      : null,
}));

import { prisma } from "@/lib/prisma";
import { deleteFromR2 } from "@/lib/r2";
import {
  createItem,
  deleteItem,
  getItemDetail,
  updateItem,
} from "@/lib/db/items";

const findFirst = vi.mocked(prisma.item.findFirst);
const update = vi.mocked(prisma.item.update);
const deleteMany = vi.mocked(prisma.item.deleteMany);
const create = vi.mocked(prisma.item.create);
const typeFindFirst = vi.mocked(prisma.itemType.findFirst);
const mockDeleteFromR2 = vi.mocked(deleteFromR2);

beforeEach(() => vi.clearAllMocks());

describe("getItemDetail", () => {
  it("scopes the query to the owner (id + userId) to prevent IDOR", async () => {
    findFirst.mockResolvedValue(null as never);
    await getItemDetail("item-1", "user-1");
    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "item-1", userId: "user-1" } }),
    );
  });

  it("returns null when the item is missing or not owned", async () => {
    findFirst.mockResolvedValue(null as never);
    await expect(getItemDetail("missing", "user-1")).resolves.toBeNull();
  });

  it("shapes the row: ISO dates, tag names, and collection {id,name}", async () => {
    findFirst.mockResolvedValue({
      id: "item-1",
      title: "useDebounce",
      description: "d",
      content: "code",
      url: null,
      fileUrl: null,
      fileName: null,
      fileSize: null,
      language: "typescript",
      isFavorite: true,
      isPinned: false,
      createdAt: new Date("2026-01-02T03:04:05.000Z"),
      updatedAt: new Date("2026-01-03T03:04:05.000Z"),
      itemType: { name: "snippet", icon: "Code", color: "#3b82f6" },
      tags: [{ name: "react" }, { name: "hooks" }],
      collections: [{ collection: { id: "col-1", name: "React Patterns" } }],
    } as never);

    await expect(getItemDetail("item-1", "user-1")).resolves.toMatchObject({
      id: "item-1",
      language: "typescript",
      isFavorite: true,
      createdAt: "2026-01-02T03:04:05.000Z",
      updatedAt: "2026-01-03T03:04:05.000Z",
      type: { name: "snippet", icon: "Code", color: "#3b82f6" },
      tags: ["react", "hooks"],
      collections: [{ id: "col-1", name: "React Patterns" }],
    });
  });
});

describe("updateItem", () => {
  it("returns null and skips the write when the user doesn't own the item", async () => {
    findFirst.mockResolvedValue(null as never);
    await expect(
      updateItem("item-1", "user-1", { title: "New" }),
    ).resolves.toBeNull();
    expect(update).not.toHaveBeenCalled();
  });

  it("replaces the tag set with per-user connect-or-create", async () => {
    // First call = ownership check, second = the getItemDetail refresh.
    findFirst
      .mockResolvedValueOnce({ id: "item-1" } as never)
      .mockResolvedValueOnce(null as never);

    await updateItem("item-1", "user-1", { title: "New", tags: ["react"] });

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "item-1" },
        data: expect.objectContaining({
          title: "New",
          tags: {
            set: [],
            connectOrCreate: [
              {
                where: { name_userId: { name: "react", userId: "user-1" } },
                create: { name: "react", userId: "user-1" },
              },
            ],
          },
        }),
      }),
    );
  });

  it("leaves tags untouched when none are provided", async () => {
    findFirst
      .mockResolvedValueOnce({ id: "item-1" } as never)
      .mockResolvedValueOnce(null as never);

    await updateItem("item-1", "user-1", { title: "New" });

    const data = update.mock.calls[0]?.[0]?.data as Record<string, unknown>;
    expect(data).not.toHaveProperty("tags");
  });
});

describe("deleteItem", () => {
  it("scopes the delete to the owner", async () => {
    findFirst.mockResolvedValue({ fileUrl: null } as never);
    deleteMany.mockResolvedValue({ count: 1 } as never);
    await deleteItem("item-1", "user-1");
    expect(deleteMany).toHaveBeenCalledWith({
      where: { id: "item-1", userId: "user-1" },
    });
  });

  it("returns true when a row was removed", async () => {
    findFirst.mockResolvedValue({ fileUrl: null } as never);
    deleteMany.mockResolvedValue({ count: 1 } as never);
    await expect(deleteItem("item-1", "user-1")).resolves.toBe(true);
  });

  it("returns false and skips the delete when not owned", async () => {
    findFirst.mockResolvedValue(null as never);
    await expect(deleteItem("item-1", "user-2")).resolves.toBe(false);
    expect(deleteMany).not.toHaveBeenCalled();
  });

  it("removes the stored R2 object alongside the row", async () => {
    findFirst.mockResolvedValue({
      fileUrl: "https://cdn.example.com/user-1/abc-photo.png",
    } as never);
    deleteMany.mockResolvedValue({ count: 1 } as never);

    await deleteItem("item-1", "user-1");

    expect(mockDeleteFromR2).toHaveBeenCalledWith("user-1/abc-photo.png");
  });

  it("doesn't call R2 for items without a file", async () => {
    findFirst.mockResolvedValue({ fileUrl: null } as never);
    deleteMany.mockResolvedValue({ count: 1 } as never);

    await deleteItem("item-1", "user-1");

    expect(mockDeleteFromR2).not.toHaveBeenCalled();
  });
});

describe("createItem", () => {
  it("returns null and skips the write for an unknown type", async () => {
    typeFindFirst.mockResolvedValue(null as never);
    await expect(
      createItem("user-1", { type: "nope", title: "T" }),
    ).resolves.toBeNull();
    expect(create).not.toHaveBeenCalled();
  });

  it("stores a link as ContentType.URL and scopes it to the owner", async () => {
    typeFindFirst.mockResolvedValue({ id: "type-link" } as never);
    create.mockResolvedValue({ id: "item-1" } as never);
    findFirst.mockResolvedValue(null as never);

    await createItem("user-1", {
      type: "link",
      title: "Docs",
      url: "https://example.com",
    });

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          contentType: "URL",
          userId: "user-1",
          itemTypeId: "type-link",
        }),
      }),
    );
  });

  it("stores a snippet as ContentType.TEXT with connect-or-create tags", async () => {
    typeFindFirst.mockResolvedValue({ id: "type-snippet" } as never);
    create.mockResolvedValue({ id: "item-2" } as never);
    findFirst.mockResolvedValue(null as never);

    await createItem("user-1", {
      type: "snippet",
      title: "useDebounce",
      content: "code",
      tags: ["react"],
    });

    const data = create.mock.calls[0]?.[0]?.data as Record<string, unknown>;
    expect(data.contentType).toBe("TEXT");
    expect(data.tags).toEqual({
      connectOrCreate: [
        {
          where: { name_userId: { name: "react", userId: "user-1" } },
          create: { name: "react", userId: "user-1" },
        },
      ],
    });
  });

  it("omits tags entirely when none are given", async () => {
    typeFindFirst.mockResolvedValue({ id: "type-note" } as never);
    create.mockResolvedValue({ id: "item-3" } as never);
    findFirst.mockResolvedValue(null as never);

    await createItem("user-1", { type: "note", title: "N", tags: [] });

    const data = create.mock.calls[0]?.[0]?.data as Record<string, unknown>;
    expect(data).not.toHaveProperty("tags");
  });
});
