import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: { item: { findFirst: vi.fn(), update: vi.fn() } },
}));

import { prisma } from "@/lib/prisma";
import { getItemDetail, updateItem } from "@/lib/db/items";

const findFirst = vi.mocked(prisma.item.findFirst);
const update = vi.mocked(prisma.item.update);

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
