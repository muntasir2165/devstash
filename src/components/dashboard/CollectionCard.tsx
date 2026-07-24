import Link from "next/link";
import { MoreHorizontal, Star } from "lucide-react";

import type { CollectionSummary } from "@/lib/db/collections";

import { TypeIcon } from "./TypeIcon";

export function CollectionCard({
  collection,
}: {
  collection: CollectionSummary;
}) {
  const dominantType = collection.types[0];

  return (
    <Link
      href={`/collections/${collection.id}`}
      className="group relative flex flex-col gap-2 rounded-xl border border-l-4 bg-card p-4 transition-colors hover:bg-muted/40"
      style={{ borderLeftColor: dominantType?.color }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="font-medium">{collection.name}</span>
          {collection.isFavorite && (
            <Star className="size-4 fill-yellow-400 text-yellow-400" />
          )}
        </div>
        <MoreHorizontal className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      <span className="text-xs text-muted-foreground">
        {collection.itemCount} items
      </span>

      {collection.description && (
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {collection.description}
        </p>
      )}

      <div className="mt-1 flex items-center gap-2">
        {collection.types.map((type) => (
          <TypeIcon key={type.id} icon={type.icon} color={type.color} />
        ))}
      </div>
    </Link>
  );
}
