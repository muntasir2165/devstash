import { FileStack, FolderHeart, FolderOpen, Star } from "lucide-react";

import { collections, items, itemTypes } from "@/lib/mock-data";

const stats = [
  {
    label: "Total Items",
    value: itemTypes.reduce((sum, type) => sum + type.count, 0),
    icon: FileStack,
  },
  {
    label: "Collections",
    value: collections.length,
    icon: FolderOpen,
  },
  {
    label: "Favorite Items",
    value: items.filter((item) => item.isFavorite).length,
    icon: Star,
  },
  {
    label: "Favorite Collections",
    value: collections.filter((collection) => collection.isFavorite).length,
    icon: FolderHeart,
  },
];

export function StatsCards() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map(({ label, value, icon: Icon }) => (
        <div key={label} className="rounded-xl border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{label}</span>
            <Icon className="size-4 text-muted-foreground" />
          </div>
          <div className="mt-2 text-2xl font-semibold tabular-nums">{value}</div>
        </div>
      ))}
    </div>
  );
}
