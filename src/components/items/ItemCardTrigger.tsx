"use client";

import type { ReactNode } from "react";

import { useItemDrawer } from "./ItemDrawerProvider";

/** Wraps a (server-rendered) ItemCard in a clickable button that opens the drawer. */
export function ItemCardTrigger({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  const { openItem } = useItemDrawer();
  return (
    <button
      type="button"
      onClick={() => openItem(id)}
      className="block w-full cursor-pointer text-left"
    >
      {children}
    </button>
  );
}
