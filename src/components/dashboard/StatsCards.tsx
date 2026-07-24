import { FileStack, FolderHeart, FolderOpen, Star } from "lucide-react";

import { getCollectionStats } from "@/lib/db/collections";
import { getItemStats } from "@/lib/db/items";

export async function StatsCards() {
  const [collectionStats, itemStats] = await Promise.all([
    getCollectionStats(),
    getItemStats(),
  ]);

  const stats = [
    {
      label: "Total Items",
      value: itemStats.total,
      icon: FileStack,
    },
    {
      label: "Collections",
      value: collectionStats.total,
      icon: FolderOpen,
    },
    {
      label: "Favorite Items",
      value: itemStats.favorites,
      icon: Star,
    },
    {
      label: "Favorite Collections",
      value: collectionStats.favorites,
      icon: FolderHeart,
    },
  ];

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
