"use client";

import type { ReactNode } from "react";

import { useItemDrawer } from "./ItemDrawerProvider";

/**
 * Makes a (server-rendered) card open the drawer. A `role="button"` container
 * rather than a real <button> so cards can contain their own actions (e.g. the
 * copy control) without nesting interactive elements inside a button.
 */
export function ItemCardTrigger({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  const { openItem } = useItemDrawer();
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => openItem(id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openItem(id);
        }
      }}
      className="block w-full cursor-pointer rounded-xl text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      {children}
    </div>
  );
}
