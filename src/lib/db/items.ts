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

/** Fetch pinned items for the dashboard, most recently created first. */
export async function getPinnedItems(limit = 50): Promise<ItemSummary[]> {
  const items = await prisma.item.findMany({
    where: { isPinned: true },
    orderBy: { createdAt: "desc" },
    take: limit,
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

/** A system item type shaped for the sidebar Types list. */
export interface SidebarItemType {
  id: string;
  /** Raw type name from the database, e.g. "snippet". */
  name: string;
  /** URL segment for /items/[typename]. */
  slug: string;
  /** Lucide icon name. */
  icon: string;
  /** Hex color, e.g. "#3b82f6". */
  color: string;
  /** Number of items of this type. */
  count: number;
}

/** Canonical display order for the system item types in the sidebar. */
const SIDEBAR_TYPE_ORDER = [
  "snippet",
  "prompt",
  "command",
  "note",
  "file",
  "image",
  "link",
];

/**
 * Fetch the system item types for the sidebar, each with its item count.
 *
 * Ordered by the canonical `SIDEBAR_TYPE_ORDER`, with any unlisted types
 * falling back to the end alphabetically.
 */
export async function getSidebarItemTypes(): Promise<SidebarItemType[]> {
  const types = await prisma.itemType.findMany({
    where: { isSystem: true },
    select: {
      id: true,
      name: true,
      icon: true,
      color: true,
      _count: { select: { items: true } },
    },
  });

  const orderOf = (name: string) => {
    const index = SIDEBAR_TYPE_ORDER.indexOf(name.toLowerCase());
    return index === -1 ? SIDEBAR_TYPE_ORDER.length : index;
  };

  return types
    .map((type) => ({
      id: type.id,
      name: type.name,
      slug: type.name.toLowerCase(),
      icon: type.icon,
      color: type.color,
      count: type._count.items,
    }))
    .sort(
      (a, b) => orderOf(a.name) - orderOf(b.name) || a.name.localeCompare(b.name),
    );
}
