import type { ComponentType, CSSProperties } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ChevronDown,
  Code,
  File as FileIcon,
  Folder,
  Image as ImageIcon,
  Layers,
  Link as LinkIcon,
  Sparkles,
  Star,
  StickyNote,
  Terminal,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
import { auth } from "@/auth";
import { SidebarUser } from "@/components/dashboard/SidebarUser";
import { getSidebarCollections } from "@/lib/db/collections";
import { getSidebarItemTypes } from "@/lib/db/items";

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

/** Item type slugs that display a "PRO" badge in the sidebar. */
const PRO_TYPE_SLUGS = new Set(["file", "image"]);

export async function AppSidebar() {
  const session = await auth();
  // Route is proxy-protected; this also narrows the id for the scoped queries.
  if (!session?.user?.id) redirect("/sign-in");

  const [itemTypes, { favorites, recents }] = await Promise.all([
    getSidebarItemTypes(session.user.id),
    getSidebarCollections(session.user.id),
  ]);

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
                    const isPro = PRO_TYPE_SLUGS.has(type.slug);
                    return (
                      <SidebarMenuItem key={type.id}>
                        <SidebarMenuButton
                          render={<Link href={`/items/${type.slug}`} />}
                        >
                          <Icon style={{ color: type.color }} />
                          <span className="capitalize">{type.name}</span>
                          {isPro && (
                            <Badge
                              variant="secondary"
                              className="h-4 px-1.5 text-[0.625rem] font-semibold tracking-wide"
                            >
                              PRO
                            </Badge>
                          )}
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
                {favorites.length > 0 && (
                  <>
                    <p className="px-2 pt-1 text-[0.7rem] font-medium tracking-wide text-sidebar-foreground/50 uppercase">
                      Favorites
                    </p>
                    <SidebarMenu>
                      {favorites.map((collection) => (
                        <SidebarMenuItem key={collection.id}>
                          <SidebarMenuButton
                            render={
                              <Link href={`/collections/${collection.id}`} />
                            }
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
                  </>
                )}

                {recents.length > 0 && (
                  <>
                    <p className="px-2 pt-2 text-[0.7rem] font-medium tracking-wide text-sidebar-foreground/50 uppercase">
                      Recent
                    </p>
                    <SidebarMenu>
                      {recents.map((collection) => (
                        <SidebarMenuItem key={collection.id}>
                          <SidebarMenuButton
                            render={
                              <Link href={`/collections/${collection.id}`} />
                            }
                          >
                            <Folder />
                            <span>{collection.name}</span>
                          </SidebarMenuButton>
                          <SidebarMenuBadge>
                            <span
                              aria-hidden
                              className="size-2.5 rounded-full bg-sidebar-foreground/30"
                              style={
                                collection.color
                                  ? { backgroundColor: collection.color }
                                  : undefined
                              }
                            />
                          </SidebarMenuBadge>
                        </SidebarMenuItem>
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
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        {session?.user ? <SidebarUser user={session.user} /> : null}
      </SidebarFooter>
    </Sidebar>
  );
}
