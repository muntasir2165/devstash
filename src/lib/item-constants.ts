/**
 * Item types creatable from the New Item dialog.
 * Kept out of `item-actions.ts` because a "use server" module may only export
 * async functions — exporting this array from there breaks it on the client.
 */
export const CREATABLE_ITEM_TYPES = [
  "snippet",
  "prompt",
  "command",
  "note",
  "link",
  "file",
  "image",
] as const;

export type CreatableItemType = (typeof CREATABLE_ITEM_TYPES)[number];

/** Types whose content is an uploaded object in R2. */
export const UPLOAD_ITEM_TYPES = ["file", "image"] as const;

export function isUploadType(type: string): type is "file" | "image" {
  return type === "file" || type === "image";
}
