import Link from "next/link";
import { ChevronDown, Folder, Star } from "lucide-react";

import type { SidebarCollection } from "@/lib/db/collections";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

function GroupLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "px-2 pt-1 text-[0.7rem] font-medium tracking-wide text-sidebar-foreground/50 uppercase",
        className,
      )}
    >
      {children}
    </p>
  );
}

function CollectionLink({
  collection,
  badge,
}: {
  collection: SidebarCollection;
  badge: React.ReactNode;
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton render={<Link href={`/collections/${collection.id}`} />}>
        <Folder />
        <span>{collection.name}</span>
      </SidebarMenuButton>
      <SidebarMenuBadge>{badge}</SidebarMenuBadge>
    </SidebarMenuItem>
  );
}

export function SidebarCollectionsGroup({
  favorites,
  recents,
}: {
  favorites: SidebarCollection[];
  recents: SidebarCollection[];
}) {
  return (
    <Collapsible defaultOpen>
      <SidebarGroup>
        <SidebarGroupLabel
          className="group/collapsible w-full cursor-pointer"
          render={<CollapsibleTrigger />}
        >
          Collections
          <ChevronDown className="ml-auto size-4 shrink-0 text-sidebar-foreground/50 transition-transform duration-200 group-data-[panel-open]/collapsible:rotate-180" />
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarGroupContent className="space-y-1">
            {favorites.length > 0 && (
              <>
                <GroupLabel>Favorites</GroupLabel>
                <SidebarMenu>
                  {favorites.map((collection) => (
                    <CollectionLink
                      key={collection.id}
                      collection={collection}
                      badge={
                        <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
                      }
                    />
                  ))}
                </SidebarMenu>
              </>
            )}

            {recents.length > 0 && (
              <>
                <GroupLabel className="pt-2">Recent</GroupLabel>
                <SidebarMenu>
                  {recents.map((collection) => (
                    <CollectionLink
                      key={collection.id}
                      collection={collection}
                      badge={
                        <span
                          aria-hidden
                          className="size-2.5 rounded-full bg-sidebar-foreground/30"
                          style={
                            collection.color
                              ? { backgroundColor: collection.color }
                              : undefined
                          }
                        />
                      }
                    />
                  ))}
                </SidebarMenu>
              </>
            )}

            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="text-sidebar-foreground/70"
                  render={<Link href="/collections" />}
                >
                  <span>View all collections</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}
