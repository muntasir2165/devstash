import Link from "next/link";
import { ChevronDown, File as FileIcon } from "lucide-react";

import type { SidebarItemType } from "@/lib/db/items";
import { Badge } from "@/components/ui/badge";
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
import { ICON_MAP } from "./sidebar-icons";

/** Item type slugs that display a "PRO" badge. */
const PRO_TYPE_SLUGS = new Set(["file", "image"]);

export function SidebarTypesGroup({
  itemTypes,
}: {
  itemTypes: SidebarItemType[];
}) {
  return (
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
                      <span className="capitalize">{type.name}</span>
                      {PRO_TYPE_SLUGS.has(type.slug) && (
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
  );
}
