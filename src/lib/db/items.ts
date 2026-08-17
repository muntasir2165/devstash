import { prisma } from "@/lib/prisma";
import { deleteFromR2, keyFromPublicUrl } from "@/lib/r2";
import { ContentType, Prisma } from "@/generated/prisma/client";

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
  /** Stored object URL — only set for file/image items; drives gallery thumbnails. */
  fileUrl: string | null;
  /** Original upload name — drives the file list's name and extension icon. */
  fileName: string | null;
  fileSize: number | null;
}

/** Fields needed to render an item card, including its type and tags. */
const itemCardSelect = {
  id: true,
  title: true,
  description: true,
  isPinned: true,
  isFavorite: true,
  createdAt: true,
  fileUrl: true,
  fileName: true,
  fileSize: true,
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
    fileUrl: item.fileUrl,
    fileName: item.fileName,
    fileSize: item.fileSize,
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

/** A system item type resolved from its `/items/[type]` URL slug. */
export interface ItemTypeBySlug {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
}

/** Resolve a `/items/[type]` slug (lowercased type name) to its system type, or null. */
export async function getItemTypeBySlug(
  slug: string,
): Promise<ItemTypeBySlug | null> {
  const type = await prisma.itemType.findFirst({
    where: { isSystem: true, name: { equals: slug, mode: "insensitive" } },
    select: { id: true, name: true, icon: true, color: true },
  });
  if (!type) return null;
  return {
    id: type.id,
    name: type.name,
    slug: type.name.toLowerCase(),
    icon: type.icon,
    color: type.color,
  };
}

/** Fetch all items of a given type (by id), most recently created first. */
export async function getItemsByType(typeId: string): Promise<ItemSummary[]> {
  const items = await prisma.item.findMany({
    where: { itemTypeId: typeId },
    orderBy: { createdAt: "desc" },
    select: itemCardSelect,
  });

  return items.map(toItemSummary);
}

/** Full item detail for the drawer view (dates serialized as ISO strings). */
export interface ItemDetail {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  language: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  type: { name: string; icon: string; color: string };
  tags: string[];
  collections: { id: string; name: string }[];
}

/**
 * Fetch a single item's full detail, scoped to its owner (prevents IDOR).
 * Returns null if the item doesn't exist or isn't owned by `userId`.
 */
export async function getItemDetail(
  id: string,
  userId: string,
): Promise<ItemDetail | null> {
  const item = await prisma.item.findFirst({
    where: { id, userId },
    select: {
      id: true,
      title: true,
      description: true,
      content: true,
      url: true,
      fileUrl: true,
      fileName: true,
      fileSize: true,
      language: true,
      isFavorite: true,
      isPinned: true,
      createdAt: true,
      updatedAt: true,
      itemType: { select: { name: true, icon: true, color: true } },
      tags: { select: { name: true } },
      collections: {
        select: { collection: { select: { id: true, name: true } } },
      },
    },
  });
  if (!item) return null;

  return {
    id: item.id,
    title: item.title,
    description: item.description,
    content: item.content,
    url: item.url,
    fileUrl: item.fileUrl,
    fileName: item.fileName,
    fileSize: item.fileSize,
    language: item.language,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    type: item.itemType,
    tags: item.tags.map((tag) => tag.name),
    collections: item.collections.map((entry) => entry.collection),
  };
}

/** Fields the drawer's edit mode can change. */
export interface UpdateItemData {
  title: string;
  description?: string | null;
  content?: string | null;
  url?: string | null;
  language?: string | null;
  tags?: string[];
}

/**
 * Update an item the user owns and return its refreshed detail.
 * Returns null when the item doesn't exist or isn't owned by `userId`.
 */
export async function updateItem(
  id: string,
  userId: string,
  data: UpdateItemData,
): Promise<ItemDetail | null> {
  const owned = await prisma.item.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!owned) return null;

  await prisma.item.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      content: data.content,
      url: data.url,
      language: data.language,
      ...(data.tags
        ? {
            // Replace the tag set: drop all links, then reuse/create per user.
            tags: {
              set: [],
              connectOrCreate: data.tags.map((name) => ({
                where: { name_userId: { name, userId } },
                create: { name, userId },
              })),
            },
          }
        : {}),
    },
  });

  return getItemDetail(id, userId);
}

/**
 * Delete an item the user owns, removing its R2 object first.
 * Returns false when it doesn't exist or isn't theirs.
 * Collection links cascade; implicit tag links are cleaned up by Prisma.
 */
export async function deleteItem(id: string, userId: string): Promise<boolean> {
  // Read the file URL before the row goes, otherwise the object is orphaned.
  const existing = await prisma.item.findFirst({
    where: { id, userId },
    select: { fileUrl: true },
  });
  if (!existing) return false;

  const { count } = await prisma.item.deleteMany({ where: { id, userId } });
  if (count === 0) return false;

  const key = keyFromPublicUrl(existing.fileUrl);
  if (key) await deleteFromR2(key);

  return true;
}

/** Fields needed to create an item from the "New Item" dialog. */
export interface CreateItemData {
  /** System item type name, e.g. "snippet". */
  type: string;
  title: string;
  description?: string | null;
  content?: string | null;
  url?: string | null;
  language?: string | null;
  tags?: string[];
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
}

/**
 * Create an item owned by `userId`, resolving the system type by name.
 * Returns null when the type name doesn't match a system item type.
 */
export async function createItem(
  userId: string,
  data: CreateItemData,
): Promise<ItemDetail | null> {
  const itemType = await prisma.itemType.findFirst({
    where: { isSystem: true, name: { equals: data.type, mode: "insensitive" } },
    select: { id: true },
  });
  if (!itemType) return null;

  const contentType = data.fileUrl
    ? ContentType.FILE
    : data.url
      ? ContentType.URL
      : ContentType.TEXT;

  const item = await prisma.item.create({
    data: {
      title: data.title,
      description: data.description,
      content: data.content,
      url: data.url,
      language: data.language,
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      fileSize: data.fileSize,
      contentType,
      userId,
      itemTypeId: itemType.id,
      ...(data.tags?.length
        ? {
            tags: {
              connectOrCreate: data.tags.map((name) => ({
                where: { name_userId: { name, userId } },
                create: { name, userId },
              })),
            },
          }
        : {}),
    },
    select: { id: true },
  });

  return getItemDetail(item.id, userId);
}
