import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/** Labelled block used throughout the item detail drawer. */
export function DrawerSection({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: LucideIcon;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {Icon ? <Icon className="size-3.5" /> : null}
        {label}
      </div>
      {children}
    </section>
  );
}
