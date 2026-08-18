import type { ItemDetail } from "@/lib/db/items";
import { Badge } from "@/components/ui/badge";
import { TypeIcon } from "@/components/dashboard/TypeIcon";

export function ItemDrawerHeader({ item }: { item: ItemDetail }) {
  return (
    <div className="flex items-start gap-3 pr-8">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
        <TypeIcon icon={item.type.icon} color={item.type.color} />
      </div>
      <div className="min-w-0 space-y-1.5">
        <h2 className="truncate text-lg font-semibold">{item.title}</h2>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="capitalize">
            {item.type.name}
          </Badge>
          {item.language ? (
            <Badge variant="secondary">{item.language}</Badge>
          ) : null}
        </div>
      </div>
    </div>
  );
}
