import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

/** An item shaped for the dashboard item cards. */
export interface ItemSummary {
  id: string;
  title: string;
  description: string | null;
  /** Lucide icon name from the item's type (drives the card icon). */
  icon: string;
  /** Hex color from the item's type (drives the card accent border). */
  color: string;
  tags: string[];
  isPinned: boolean;
  isFavorite: boolean;
  createdAt: Date;
}

/** Fields needed to render an item card, including its type and tags. */
const itemCardSelect = {
  id: true,
  title: true,
  description: true,
  isPinned: true,
  isFavorite: true,
  createdAt: true,
  itemType: { select: { icon: true, color: true } },
  tags: { select: { name: true } },
} satisfies Prisma.ItemSelect;

type ItemCardRow = Prisma.ItemGetPayload<{ select: typeof itemCardSelect }>;

function toItemSummary(item: ItemCardRow): ItemSummary {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    icon: item.itemType.icon,
    color: item.itemType.color,
    tags: item.tags.map((tag) => tag.name),
    isPinned: item.isPinned,
    isFavorite: item.isFavorite,
    createdAt: item.createdAt,
  };
}

/** Fetch all pinned items for the dashboard, most recently created first. */
export async function getPinnedItems(): Promise<ItemSummary[]> {
  const items = await prisma.item.findMany({
    where: { isPinned: true },
    orderBy: { createdAt: "desc" },
    select: itemCardSelect,
  });

  return items.map(toItemSummary);
}

/** Fetch the most recently created items for the dashboard. */
export async function getRecentItems(limit = 10): Promise<ItemSummary[]> {
  const items = await prisma.item.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: itemCardSelect,
  });

  return items.map(toItemSummary);
}

/** Aggregate item counts for the dashboard stats row. */
export async function getItemStats(): Promise<{
  total: number;
  favorites: number;
}> {
  const [total, favorites] = await Promise.all([
    prisma.item.count(),
    prisma.item.count({ where: { isFavorite: true } }),
  ]);

  return { total, favorites };
}
