import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/auth", () => ({ auth: vi.fn() }));
vi.mock("@/lib/db/items", () => ({ getItemDetail: vi.fn() }));

import { auth } from "@/auth";
import { getItemDetail } from "@/lib/db/items";
import { GET } from "@/app/api/items/[id]/route";

const mockAuth = vi.mocked(auth);
const mockGetItemDetail = vi.mocked(getItemDetail);

function ctx(id: string) {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => vi.clearAllMocks());

describe("GET /api/items/[id]", () => {
  it("returns 401 and skips the query when unauthenticated", async () => {
    mockAuth.mockResolvedValue(null as never);
    const res = await GET(new Request("http://test/api/items/1"), ctx("1"));
    expect(res.status).toBe(401);
    expect(mockGetItemDetail).not.toHaveBeenCalled();
  });

  it("returns 404 when the item is missing or not owned", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockGetItemDetail.mockResolvedValue(null);
    const res = await GET(new Request("http://test/api/items/1"), ctx("1"));
    expect(res.status).toBe(404);
    expect(mockGetItemDetail).toHaveBeenCalledWith("1", "user-1");
  });

  it("returns 200 with the item for the owner", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } } as never);
    mockGetItemDetail.mockResolvedValue({ id: "1", title: "t" } as never);
    const res = await GET(new Request("http://test/api/items/1"), ctx("1"));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toMatchObject({ id: "1", title: "t" });
  });
});
