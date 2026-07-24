import { prisma } from "@/lib/prisma";

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
