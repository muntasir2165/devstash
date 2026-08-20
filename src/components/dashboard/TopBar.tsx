import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NewCollectionDialog } from "@/components/collections/NewCollectionDialog";
import { NewItemDialog } from "@/components/items/NewItemDialog";

export function TopBar() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b px-4">
      <SidebarTrigger />

      <div className="relative w-full max-w-md">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search items, collections, tags..."
          aria-label="Search"
          className="h-9 pl-9"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <NewCollectionDialog />
        <NewItemDialog />
      </div>
    </header>
  );
}
