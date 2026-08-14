import { ImageOff, Pin, Star } from "lucide-react";

import type { ItemSummary } from "@/lib/db/items";

/** Gallery tile for image items — 16:9 thumbnail with a hover zoom. */
export function ImageCard({ item }: { item: ItemSummary }) {
  return (
    <div className="group overflow-hidden rounded-xl border bg-card">
      <div className="relative aspect-video overflow-hidden bg-muted">
        {item.fileUrl ? (
          // R2 host isn't configured in next.config images — plain img is intentional.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.fileUrl}
            alt={item.title}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <ImageOff className="size-6 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="flex items-start justify-between gap-2 p-3">
        <span className="truncate text-sm font-medium">{item.title}</span>
        <div className="flex shrink-0 items-center gap-1">
          {item.isPinned && (
            <Pin className="size-3.5 text-muted-foreground" />
          )}
          {item.isFavorite && (
            <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
          )}
        </div>
      </div>
    </div>
  );
}
