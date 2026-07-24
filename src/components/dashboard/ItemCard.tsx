import { Pin, Star } from "lucide-react";

import type { Item } from "@/lib/mock-data";
import { getItemType } from "@/lib/item-types";

import { TypeIcon } from "./TypeIcon";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function ItemCard({ item }: { item: Item }) {
  const type = getItemType(item.typeId);

  return (
    <div
      className="flex gap-3 rounded-xl border border-l-4 bg-card p-4"
      style={{ borderLeftColor: type?.color }}
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
        <TypeIcon typeId={item.typeId} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <span className="truncate font-medium">{item.title}</span>
            {item.isPinned && (
              <Pin className="size-3.5 shrink-0 text-muted-foreground" />
            )}
            {item.isFavorite && (
              <Star className="size-3.5 shrink-0 fill-yellow-400 text-yellow-400" />
            )}
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatDate(item.createdAt)}
          </span>
        </div>

        <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
          {item.description}
        </p>

        {item.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
