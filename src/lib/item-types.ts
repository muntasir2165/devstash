import { itemTypes, type ItemType } from "@/lib/mock-data";

const itemTypeById = new Map(itemTypes.map((type) => [type.id, type]));

export function getItemType(id: string): ItemType | undefined {
  return itemTypeById.get(id);
}
