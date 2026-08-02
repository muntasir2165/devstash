"use client";

import Link from "next/link";
import { ChevronsUpDown, LogOut, User } from "lucide-react";

import { signOutAction } from "@/lib/auth-actions";
import { UserAvatar } from "@/components/auth/UserAvatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SidebarUser({
  user,
}: {
  user: { name?: string | null; email?: string | null; image?: string | null };
}) {
  const displayName = user.name?.trim() || "User";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-md p-2 text-left transition-colors hover:bg-sidebar-accent"
          />
        }
      >
        <UserAvatar name={user.name} image={user.image} />
        <div className="grid min-w-0 flex-1 leading-tight">
          <span className="truncate text-sm font-medium">{displayName}</span>
          {user.email ? (
            <span className="truncate text-xs text-sidebar-foreground/60">
              {user.email}
            </span>
          ) : null}
        </div>
        <ChevronsUpDown className="size-4 shrink-0 text-sidebar-foreground/60" />
      </DropdownMenuTrigger>

      <DropdownMenuContent side="top" align="start" className="w-56">
        <DropdownMenuItem render={<Link href="/profile" />}>
          <User className="size-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <form action={signOutAction} className="w-full">
          <DropdownMenuItem
            variant="destructive"
            render={<button type="submit" className="w-full" />}
          >
            <LogOut className="size-4" />
            Sign out
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
