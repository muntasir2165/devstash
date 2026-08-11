"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

import { ItemDetailDrawer } from "./ItemDetailDrawer";

type ItemDrawerContextValue = { openItem: (id: string) => void };

const ItemDrawerContext = createContext<ItemDrawerContextValue | null>(null);

export function useItemDrawer(): ItemDrawerContextValue {
  const ctx = useContext(ItemDrawerContext);
  if (!ctx) {
    throw new Error("useItemDrawer must be used within an ItemDrawerProvider");
  }
  return ctx;
}

/** Owns the drawer's open/selected state so the pages can stay Server Components. */
export function ItemDrawerProvider({ children }: { children: ReactNode }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  function openItem(id: string) {
    setActiveId(id);
    setOpen(true);
  }

  return (
    <ItemDrawerContext.Provider value={{ openItem }}>
      {children}
      <ItemDetailDrawer itemId={activeId} open={open} onOpenChange={setOpen} />
    </ItemDrawerContext.Provider>
  );
}
