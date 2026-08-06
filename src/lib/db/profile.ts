import { prisma } from "@/lib/prisma";

/** One system item type with the current user's item count for that type. */
export interface ProfileTypeBreakdown {
  id: string;
  name: string;
  icon: string;
  color: string;
  count: number;
}

export interface ProfileStats {
  totalItems: number;
  totalCollections: number;
  breakdown: ProfileTypeBreakdown[];
}

/** Canonical display order for the system item types. */
const TYPE_ORDER = [
  "snippet",
  "prompt",
  "command",
  "note",
  "file",
  "image",
  "link",
];

/** Aggregate the signed-in user's item/collection counts and per-type breakdown. */
export async function getProfileStats(userId: string): Promise<ProfileStats> {
  const [totalItems, totalCollections, types] = await Promise.all([
    prisma.item.count({ where: { userId } }),
    prisma.collection.count({ where: { userId } }),
    prisma.itemType.findMany({
      where: { isSystem: true },
      select: {
        id: true,
        name: true,
        icon: true,
        color: true,
        _count: { select: { items: { where: { userId } } } },
      },
    }),
  ]);

  const orderOf = (name: string) => {
    const i = TYPE_ORDER.indexOf(name.toLowerCase());
    return i === -1 ? TYPE_ORDER.length : i;
  };

  const breakdown = types
    .map((type) => ({
      id: type.id,
      name: type.name,
      icon: type.icon,
      color: type.color,
      count: type._count.items,
    }))
    .sort(
      (a, b) => orderOf(a.name) - orderOf(b.name) || a.name.localeCompare(b.name),
    );

  return { totalItems, totalCollections, breakdown };
}
