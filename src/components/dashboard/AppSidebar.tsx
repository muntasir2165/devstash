import type { ComponentType, CSSProperties } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Code,
  File as FileIcon,
  Folder,
  Image as ImageIcon,
  Layers,
  Link as LinkIcon,
  Settings,
  Sparkles,
  Star,
  StickyNote,
  Terminal,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { collections, currentUser, itemTypes } from "@/lib/mock-data";

type IconComponent = ComponentType<{
  className?: string;
  style?: CSSProperties;
}>;

const ICON_MAP: Record<string, IconComponent> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File: FileIcon,
  Image: ImageIcon,
  Link: LinkIcon,
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function AppSidebar() {
  const favoriteCollections = collections.filter(
    (collection) => collection.isFavorite,
  );
  const otherCollections = collections.filter(
    (collection) => !collection.isFavorite,
  );

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="p-3">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Layers className="size-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">DevStash</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <Collapsible defaultOpen>
          <SidebarGroup>
            <SidebarGroupLabel
              className="group/collapsible w-full cursor-pointer"
              render={<CollapsibleTrigger />}
            >
              Types
              <ChevronDown className="ml-auto size-4 shrink-0 text-sidebar-foreground/50 transition-transform duration-200 group-data-[panel-open]/collapsible:rotate-180" />
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {itemTypes.map((type) => {
                    const Icon = ICON_MAP[type.icon] ?? FileIcon;
                    return (
                      <SidebarMenuItem key={type.id}>
                        <SidebarMenuButton
                          render={<Link href={`/items/${type.slug}`} />}
                        >
                          <Icon style={{ color: type.color }} />
                          <span>{type.name}</span>
                        </SidebarMenuButton>
                        <SidebarMenuBadge>{type.count}</SidebarMenuBadge>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        <SidebarSeparator />

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
                <p className="px-2 pt-1 text-[0.7rem] font-medium tracking-wide text-sidebar-foreground/50 uppercase">
                  Favorites
                </p>
                <SidebarMenu>
                  {favoriteCollections.map((collection) => (
                    <SidebarMenuItem key={collection.id}>
                      <SidebarMenuButton
                        render={<Link href={`/collections/${collection.id}`} />}
                      >
                        <Folder />
                        <span>{collection.name}</span>
                      </SidebarMenuButton>
                      <SidebarMenuBadge>
                        <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
                      </SidebarMenuBadge>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>

                <p className="px-2 pt-2 text-[0.7rem] font-medium tracking-wide text-sidebar-foreground/50 uppercase">
                  All Collections
                </p>
                <SidebarMenu>
                  {otherCollections.map((collection) => (
                    <SidebarMenuItem key={collection.id}>
                      <SidebarMenuButton
                        render={<Link href={`/collections/${collection.id}`} />}
                      >
                        <Folder />
                        <span>{collection.name}</span>
                      </SidebarMenuButton>
                      <SidebarMenuBadge>{collection.itemCount}</SidebarMenuBadge>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-md p-2 text-left transition-colors hover:bg-sidebar-accent"
        >
          <Avatar>
            <AvatarImage
              src={currentUser.image ?? undefined}
              alt={currentUser.name}
            />
            <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
          </Avatar>
          <div className="grid min-w-0 flex-1 leading-tight">
            <span className="truncate text-sm font-medium">
              {currentUser.name}
            </span>
            <span className="truncate text-xs text-sidebar-foreground/60">
              {currentUser.email}
            </span>
          </div>
          <Settings className="size-4 shrink-0 text-sidebar-foreground/60" />
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
