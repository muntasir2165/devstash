import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getItemsByType, getItemTypeBySlug } from "@/lib/db/items";
import {
  CREATABLE_ITEM_TYPES,
  type CreatableItemType,
} from "@/lib/item-constants";
import { ItemCard } from "@/components/dashboard/ItemCard";
import { TypeIcon } from "@/components/dashboard/TypeIcon";
import { ItemCardTrigger } from "@/components/items/ItemCardTrigger";
import { ItemDrawerProvider } from "@/components/items/ItemDrawerProvider";
import { NewItemDialog } from "@/components/items/NewItemDialog";

// Reads the database on each request.
export const dynamic = "force-dynamic";

export default async function ItemsByTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;

  const itemType = await getItemTypeBySlug(type);
  if (!itemType) notFound();

  const items = await getItemsByType(itemType.id);

  // file/image are Pro upload types and can't be created from this dialog.
  const creatableType = CREATABLE_ITEM_TYPES.find(
    (name) => name === itemType.slug,
  ) as CreatableItemType | undefined;

  return (
    <ItemDrawerProvider>
      <div className="mx-auto w-full max-w-4xl space-y-6 p-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to dashboard
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
            <TypeIcon icon={itemType.icon} color={itemType.color} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold capitalize tracking-tight">
              {itemType.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {items.length} {items.length === 1 ? "item" : "items"}
            </p>
          </div>
          {creatableType ? (
            <div className="ml-auto">
              <NewItemDialog
                defaultType={creatableType}
                label={`New ${itemType.name}`}
              />
            </div>
          ) : null}
        </div>

        {items.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <ItemCardTrigger key={item.id} id={item.id}>
                <ItemCard item={item} />
              </ItemCardTrigger>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            No {itemType.name} items yet.
          </p>
        )}
      </div>
    </ItemDrawerProvider>
  );
}
