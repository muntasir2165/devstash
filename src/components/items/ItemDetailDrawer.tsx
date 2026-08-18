"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, FolderOpen, Tag } from "lucide-react";

import type { ItemDetail } from "@/lib/db/items";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { DrawerSection } from "./DrawerSection";
import { ItemActionBar } from "./ItemActionBar";
import { ItemContentSection } from "./ItemContentSection";
import { ItemDrawerHeader } from "./ItemDrawerHeader";
import { ItemEditForm } from "./ItemEditForm";

export function ItemDetailDrawer({
  itemId,
  open,
  onOpenChange,
}: {
  itemId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  // Keyed by id so we never show a stale item while the next one loads, and so
  // all setState happens in async callbacks (not synchronously in the effect).
  const [loaded, setLoaded] = useState<{
    id: string;
    item: ItemDetail | null;
  } | null>(null);
  // Tracked by id so opening another item always starts back in view mode.
  const [editingId, setEditingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open || !itemId) return;
    let cancelled = false;
    fetch(`/api/items/${itemId}`)
      .then((res) => (res.ok ? (res.json() as Promise<ItemDetail>) : null))
      .then((data) => {
        if (!cancelled) setLoaded({ id: itemId, item: data });
      })
      .catch(() => {
        if (!cancelled) setLoaded({ id: itemId, item: null });
      });
    return () => {
      cancelled = true;
    };
  }, [open, itemId]);

  const item = loaded && loaded.id === itemId ? loaded.item : null;
  const loading = open && itemId != null && loaded?.id !== itemId;
  const editing = item != null && editingId === item.id;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 overflow-y-auto p-0 sm:max-w-xl"
      >
        {/* Base UI's Dialog needs a title for accessibility in every state. */}
        <SheetTitle className="sr-only">
          {item?.title ?? "Item details"}
        </SheetTitle>
        {loading ? (
          <DrawerSkeleton />
        ) : item ? (
          editing ? (
            <div className="p-5">
              <ItemEditForm
                item={item}
                onCancel={() => setEditingId(null)}
                onSaved={(updated) => {
                  setLoaded({ id: updated.id, item: updated });
                  setEditingId(null);
                  // Keep the underlying card list in sync with the edit.
                  router.refresh();
                }}
              />
            </div>
          ) : (
            <DrawerBody
              item={item}
              onEdit={() => setEditingId(item.id)}
              onDeleted={() => {
                onOpenChange(false);
                router.refresh();
              }}
            />
          )
        ) : (
          <p className="p-6 text-sm text-muted-foreground">
            Couldn&apos;t load this item.
          </p>
        )}
      </SheetContent>
    </Sheet>
  );
}

function DrawerBody({
  item,
  onEdit,
  onDeleted,
}: {
  item: ItemDetail;
  onEdit: () => void;
  onDeleted: () => void;
}) {
  return (
    <div className="flex flex-col gap-5 p-5">
      <ItemDrawerHeader item={item} />
      <ItemActionBar item={item} onEdit={onEdit} onDeleted={onDeleted} />

      {item.description ? (
        <DrawerSection label="Description">
          <p className="text-sm text-muted-foreground">{item.description}</p>
        </DrawerSection>
      ) : null}

      <ItemContentSection item={item} />

      {item.tags.length > 0 ? (
        <DrawerSection label="Tags" icon={Tag}>
          <div className="flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </DrawerSection>
      ) : null}

      {item.collections.length > 0 ? (
        <DrawerSection label="Collections" icon={FolderOpen}>
          <div className="flex flex-wrap gap-1.5">
            {item.collections.map((collection) => (
              <Badge key={collection.id} variant="secondary">
                {collection.name}
              </Badge>
            ))}
          </div>
        </DrawerSection>
      ) : null}

      <DrawerSection label="Details" icon={Calendar}>
        <dl className="space-y-1 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Created</dt>
            <dd>{formatDate(item.createdAt, "long")}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Updated</dt>
            <dd>{formatDate(item.updatedAt, "long")}</dd>
          </div>
        </dl>
      </DrawerSection>
    </div>
  );
}

function DrawerSkeleton() {
  return (
    <div className="flex flex-col gap-5 p-5">
      <div className="flex items-start gap-3">
        <Skeleton className="size-10 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}
