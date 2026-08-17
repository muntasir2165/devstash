import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    collection: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import {
  getCollectionStats,
  getRecentCollections,
  getSidebarCollections,
} from "@/lib/db/collections";

const findMany = vi.mocked(prisma.collection.findMany);
const count = vi.mocked(prisma.collection.count);

beforeEach(() => vi.clearAllMocks());

// Regression guard: these queries were global and leaked every user's
// collections onto the dashboard grid, stats row and sidebar.
describe("user scoping of collection queries", () => {
  it("getRecentCollections filters by userId", async () => {
    findMany.mockResolvedValue([] as never);
    await getRecentCollections("user-1");
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: "user-1" } }),
    );
  });

  it("getCollectionStats scopes both the total and the favorites count", async () => {
    count.mockResolvedValue(0 as never);
    await getCollectionStats("user-1");
    expect(count).toHaveBeenCalledWith({ where: { userId: "user-1" } });
    expect(count).toHaveBeenCalledWith({
      where: { userId: "user-1", isFavorite: true },
    });
  });

  it("getSidebarCollections scopes both the favorites and the recents query", async () => {
    findMany.mockResolvedValue([] as never);
    await getSidebarCollections("user-1");
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user-1", isFavorite: true },
      }),
    );
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user-1", isFavorite: false },
      }),
    );
  });
});
