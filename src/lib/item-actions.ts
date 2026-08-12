"use server";

import { z } from "zod";

import { auth } from "@/auth";
import { CREATABLE_ITEM_TYPES } from "@/lib/item-constants";
import {
  createItem as createItemQuery,
  deleteItem as deleteItemQuery,
  updateItem as updateItemQuery,
  type ItemDetail,
} from "@/lib/db/items";

// Empty inputs come back from the form as "" — treat them as "no value".
const emptyToNull = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? null : value;

const updateItemSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.preprocess(emptyToNull, z.string().trim().nullable()),
  content: z.preprocess(emptyToNull, z.string().nullable()),
  url: z.preprocess(emptyToNull, z.url("Enter a valid URL").nullable()),
  language: z.preprocess(emptyToNull, z.string().trim().nullable()),
  tags: z.array(z.string().trim().min(1)),
});

export type UpdateItemInput = z.input<typeof updateItemSchema>;

export type UpdateItemResult =
  | { success: true; data: ItemDetail }
  | { success: false; error: string };

/** Update an item the signed-in user owns. Validates input before touching the database. */
export async function updateItem(
  itemId: string,
  input: UpdateItemInput,
): Promise<UpdateItemResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "You must be signed in." };
  }

  const parsed = updateItemSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: z.prettifyError(parsed.error),
    };
  }

  const item = await updateItemQuery(itemId, session.user.id, parsed.data);
  if (!item) {
    return { success: false, error: "Item not found." };
  }

  return { success: true, data: item };
}

export type DeleteItemResult = { success: true } | { success: false; error: string };

/** Permanently delete an item the signed-in user owns. */
export async function deleteItem(itemId: string): Promise<DeleteItemResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "You must be signed in." };
  }

  const deleted = await deleteItemQuery(itemId, session.user.id);
  if (!deleted) {
    return { success: false, error: "Item not found." };
  }

  return { success: true };
}

const createItemSchema = z
  .object({
    type: z.enum(CREATABLE_ITEM_TYPES),
    title: z.string().trim().min(1, "Title is required"),
    description: z.preprocess(emptyToNull, z.string().trim().nullable()),
    content: z.preprocess(emptyToNull, z.string().nullable()),
    url: z.preprocess(emptyToNull, z.url("Enter a valid URL").nullable()),
    language: z.preprocess(emptyToNull, z.string().trim().nullable()),
    tags: z.array(z.string().trim().min(1)),
  })
  .refine((data) => data.type !== "link" || data.url !== null, {
    path: ["url"],
    error: "A link needs a URL",
  });

export type CreateItemInput = z.input<typeof createItemSchema>;

export type CreateItemResult =
  | { success: true; data: ItemDetail }
  | { success: false; error: string };

/** Create an item owned by the signed-in user. */
export async function createItem(
  input: CreateItemInput,
): Promise<CreateItemResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "You must be signed in." };
  }

  const parsed = createItemSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: z.prettifyError(parsed.error) };
  }

  const item = await createItemQuery(session.user.id, parsed.data);
  if (!item) {
    return { success: false, error: "Unknown item type." };
  }

  return { success: true, data: item };
}
