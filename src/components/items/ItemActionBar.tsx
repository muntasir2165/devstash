"use client";

import { useState } from "react";
import { Copy, Pencil, Pin, Star } from "lucide-react";

import type { ItemDetail } from "@/lib/db/items";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DeleteItemDialog } from "./DeleteItemDialog";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="ghost"
      size="sm"
      className="gap-1.5"
      disabled={!text}
      onClick={() => {
        if (!text) return;
        void navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      <Copy className="size-4" />
      {copied ? "Copied" : "Copy"}
    </Button>
  );
}

export function ItemActionBar({
  item,
  onEdit,
  onDeleted,
}: {
  item: ItemDetail;
  onEdit: () => void;
  onDeleted: () => void;
}) {
  return (
    <div className="flex items-center gap-1 border-y py-1">
      <Button variant="ghost" size="sm" className="gap-1.5">
        <Star
          className={cn(
            "size-4",
            item.isFavorite && "fill-yellow-400 text-yellow-400",
          )}
        />
        Favorite
      </Button>
      <Button variant="ghost" size="sm" className="gap-1.5">
        <Pin className={cn("size-4", item.isPinned && "fill-current")} />
        Pin
      </Button>
      <CopyButton text={item.content ?? item.url ?? ""} />
      <div className="ml-auto flex items-center gap-1">
        <Button variant="ghost" size="sm" className="gap-1.5" onClick={onEdit}>
          <Pencil className="size-4" />
          Edit
        </Button>
        <DeleteItemDialog
          itemId={item.id}
          itemTitle={item.title}
          onDeleted={onDeleted}
        />
      </div>
    </div>
  );
}
