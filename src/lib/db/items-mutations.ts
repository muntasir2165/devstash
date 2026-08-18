import { prisma } from "@/lib/prisma";
import { deleteFromR2, keyFromPublicUrl } from "@/lib/r2";
import { ContentType } from "@/generated/prisma/client";

import { getItemDetail, type ItemDetail } from "./items";

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
