import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

/** A distinct item type present in a collection, resolved for display. */
export interface CollectionType {
  id: string;
  name: string;
  /** Lucide icon name */
  icon: string;
  /** Hex color, e.g. "#3b82f6" */
  color: string;
}

/** A collection shaped for the dashboard collection cards. */
export interface CollectionSummary {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  itemCount: number;
  /** Distinct item types present, most-used first (the first drives the card accent). */
  types: CollectionType[];
}

/**
 * Fetch the most recently updated collections for the dashboard grid.
 *
 * Each summary includes its item count and the distinct item types it
 * contains, ordered by how often they appear so the first type can drive the
 * card's accent color.
 */
export async function getRecentCollections(
  limit = 6,
): Promise<CollectionSummary[]> {
  const collections = await prisma.collection.findMany({
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: {
      items: {
        include: {
          item: {
            select: {
              itemType: {
                select: { id: true, name: true, icon: true, color: true },
              },
            },
          },
        },
      },
    },
  });

  return collections.map((collection) => {
    const typeCounts = new Map<string, { type: CollectionType; count: number }>();

    for (const { item } of collection.items) {
      const { itemType } = item;
      const existing = typeCounts.get(itemType.id);
      if (existing) {
        existing.count += 1;
      } else {
        typeCounts.set(itemType.id, { type: itemType, count: 1 });
      }
    }

    const types = [...typeCounts.values()]
      .sort((a, b) => b.count - a.count)
      .map((entry) => entry.type);

    return {
      id: collection.id,
      name: collection.name,
      description: collection.description,
      isFavorite: collection.isFavorite,
      itemCount: collection.items.length,
      types,
    };
  });
}

/** Aggregate collection counts for the dashboard stats row. */
export async function getCollectionStats(): Promise<{
  total: number;
  favorites: number;
}> {
  const [total, favorites] = await Promise.all([
    prisma.collection.count(),
    prisma.collection.count({ where: { isFavorite: true } }),
  ]);

  return { total, favorites };
}

/** A collection shaped for the sidebar Collections list. */
export interface SidebarCollection {
  id: string;
  name: string;
  isFavorite: boolean;
  /** Hex color of the most-used item type, or null when the collection is empty. */
  color: string | null;
}

/** Just enough of each collection to resolve its dominant type color. */
const sidebarCollectionInclude = {
  items: {
    include: {
      item: { select: { itemType: { select: { id: true, color: true } } } },
    },
  },
} satisfies Prisma.CollectionInclude;

type SidebarCollectionRow = Prisma.CollectionGetPayload<{
  include: typeof sidebarCollectionInclude;
}>;

/** The hex color of the most-used item type in a collection, or null when empty. */
function dominantTypeColor(items: SidebarCollectionRow["items"]): string | null {
  const counts = new Map<string, { color: string; count: number }>();

  for (const { item } of items) {
    const { id, color } = item.itemType;
    const existing = counts.get(id);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(id, { color, count: 1 });
    }
  }

  let dominant: string | null = null;
  let max = 0;
  for (const { color, count } of counts.values()) {
    if (count > max) {
      max = count;
      dominant = color;
    }
  }

  return dominant;
}

function toSidebarCollection(collection: SidebarCollectionRow): SidebarCollection {
  return {
    id: collection.id,
    name: collection.name,
    isFavorite: collection.isFavorite,
    color: dominantTypeColor(collection.items),
  };
}

/**
 * Fetch collections for the sidebar, split into favorites and recents.
 *
 * Favorites are rendered with a star; recents (the most recently updated
 * non-favorite collections) are rendered with a colored circle drawn from the
 * collection's most-used item type.
 */
export async function getSidebarCollections(recentLimit = 5): Promise<{
  favorites: SidebarCollection[];
  recents: SidebarCollection[];
}> {
  const [favorites, recents] = await Promise.all([
    prisma.collection.findMany({
      where: { isFavorite: true },
      orderBy: { updatedAt: "desc" },
      include: sidebarCollectionInclude,
    }),
    prisma.collection.findMany({
      where: { isFavorite: false },
      orderBy: { updatedAt: "desc" },
      take: recentLimit,
      include: sidebarCollectionInclude,
    }),
  ]);

  return {
    favorites: favorites.map(toSidebarCollection),
    recents: recents.map(toSidebarCollection),
  };
}
