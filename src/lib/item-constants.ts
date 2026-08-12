/**
 * Item types creatable from the New Item dialog (file/image are Pro upload types).
 * Kept out of `item-actions.ts` because a "use server" module may only export
 * async functions — exporting this array from there breaks it on the client.
 */
export const CREATABLE_ITEM_TYPES = [
  "snippet",
  "prompt",
  "command",
  "note",
  "link",
] as const;

export type CreatableItemType = (typeof CREATABLE_ITEM_TYPES)[number];
