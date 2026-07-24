# Current Feature

<!-- Feature name and short description -->

## Status

<!-- Not Started | In Progress | Completed -->

## Goals

<!-- Goas and requirements -->

## Notes

<!-- Any extra notes -->

## History

<!-- Keep this updated. Earliest to latest. -->

- **2026-06-22 — Initial Next.js setup.** Scaffolded with `create-next-app`: Next.js 16.2.9 (App Router, `src/` structure), React 19.2.4 with the React Compiler, TypeScript, Tailwind CSS v4, and ESLint 9. Removed the default boilerplate.
- **2026-07-23 — Dashboard UI Phase 1.** Initialized shadcn/ui (Tailwind v4, Base UI) and installed `button` + `input`; added the `/dashboard` route with a layout shell (top bar with search plus display-only "New Collection" and "New Item" buttons, and `Sidebar`/`Main` placeholders); enabled dark mode by default via the `dark` class on `<html>`. `npm run build` and `npm run lint` pass; verified in the browser.
- **2026-07-23 — Dashboard UI Phase 2 (collapsible sidebar).** Added `AppSidebar` (shadcn `sidebar`/`collapsible`/`avatar`, Base UI variants): brand header, collapsible Types group (colored icons, counts, links to `/items/{slug}`), collapsible Collections group (Favorites with stars + All Collections with counts), and a user footer. Wrapped the dashboard layout in `SidebarProvider`/`SidebarInset` and moved the drawer toggle (`SidebarTrigger`) into the top bar; mobile renders an overlay drawer. Rewrote `use-mobile` with `useSyncExternalStore` to satisfy the React Compiler lint rule. `npm run build` and `npm run lint` pass; verified in the browser (desktop collapse, group toggles, mobile drawer, dark mode).
- **2026-07-23 — Dashboard UI Phase 3 (main area).** Built the dashboard main content: header, 4 stats cards (total items, collections, favorite items, favorite collections), a Collections grid (`CollectionCard` with type-color accent + type icons), a Pinned items list, and the 10 most recent items (`ItemCard`). Added a shared `TypeIcon` and `getItemType` lookup over the mock data. `npm run build` and `npm run lint` pass; verified in the browser (all sections render, dark mode).
