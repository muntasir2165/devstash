import type { Metadata } from "next";
import Link from "next/link";
import { Pin } from "lucide-react";

import { items } from "@/lib/mock-data";
import { getRecentCollections } from "@/lib/db/collections";
import { CollectionCard } from "@/components/dashboard/CollectionCard";
import { ItemCard } from "@/components/dashboard/ItemCard";
import { StatsCards } from "@/components/dashboard/StatsCards";

export const metadata: Metadata = {
  title: "Dashboard | DevStash",
};

// Collections are read from the database on each request.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const collections = await getRecentCollections();

  const pinnedItems = items.filter((item) => item.isPinned);
  const recentItems = [...items]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 10);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Your developer knowledge hub</p>
      </div>

      <StatsCards />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Collections</h2>
          <Link
            href="/collections"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            View all
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Pin className="size-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Pinned</h2>
        </div>
        <div className="space-y-3">
          {pinnedItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Items</h2>
        <div className="space-y-3">
          {recentItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
