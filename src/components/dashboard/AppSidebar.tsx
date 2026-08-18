import { redirect } from "next/navigation";
import { Layers } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { auth } from "@/auth";
import { SidebarUser } from "@/components/dashboard/SidebarUser";
import { getSidebarCollections } from "@/lib/db/collections";
import { getSidebarItemTypes } from "@/lib/db/items";
import { SidebarCollectionsGroup } from "./SidebarCollectionsGroup";
import { SidebarTypesGroup } from "./SidebarTypesGroup";

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
        <SidebarTypesGroup itemTypes={itemTypes} />
        <SidebarSeparator />
        <SidebarCollectionsGroup favorites={favorites} recents={recents} />
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        {session.user ? <SidebarUser user={session.user} /> : null}
      </SidebarFooter>
    </Sidebar>
  );
}
