import type { ReactNode } from "react";

import { TopBar } from "@/components/dashboard/TopBar";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <div className="flex flex-1">
        <aside className="w-64 shrink-0 border-r p-4">
          <h2 className="text-xl font-semibold">Sidebar</h2>
        </aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
