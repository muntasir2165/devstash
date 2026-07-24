# Current Feature

Prisma + Neon PostgreSQL Setup — set up Prisma 7 ORM backed by a serverless Neon PostgreSQL database.

## Status

In Progress

## Goals

- Use Neon PostgreSQL (serverless).
- Set up Prisma 7 ORM (read the upgrade guide first — it has breaking changes).
- Create an initial schema from the data models in `@context/project-overview.md` (will evolve).
- Include NextAuth models (Account, Session, VerificationToken).
- Add appropriate indexes and cascade deletes.

## Notes

- Work on a Neon development branch via `DATABASE_URL`; keep a separate production branch.
- ALWAYS create migrations — never push directly unless explicitly specified.
- Prisma 7 has breaking changes; follow the upgrade guide at https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7.
- References: setup quickstart (https://www.prisma.io/docs/getting-started/prisma-orm/quickstart/prisma-postgres), data models in `@context/project-overview.md`.

## History

<!-- Keep this updated. Earliest to latest. -->

- **2026-06-22 — Initial Next.js setup.** Scaffolded with `create-next-app`: Next.js 16.2.9 (App Router, `src/` structure), React 19.2.4 with the React Compiler, TypeScript, Tailwind CSS v4, and ESLint 9. Removed the default boilerplate.
- **2026-07-23 — Dashboard UI Phase 1.** Initialized shadcn/ui (Tailwind v4, Base UI) and installed `button` + `input`; added the `/dashboard` route with a layout shell (top bar with search plus display-only "New Collection" and "New Item" buttons, and `Sidebar`/`Main` placeholders); enabled dark mode by default via the `dark` class on `<html>`. `npm run build` and `npm run lint` pass; verified in the browser.
- **2026-07-23 — Dashboard UI Phase 2 (collapsible sidebar).** Added `AppSidebar` (shadcn `sidebar`/`collapsible`/`avatar`, Base UI variants): brand header, collapsible Types group (colored icons, counts, links to `/items/{slug}`), collapsible Collections group (Favorites with stars + All Collections with counts), and a user footer. Wrapped the dashboard layout in `SidebarProvider`/`SidebarInset` and moved the drawer toggle (`SidebarTrigger`) into the top bar; mobile renders an overlay drawer. Rewrote `use-mobile` with `useSyncExternalStore` to satisfy the React Compiler lint rule. `npm run build` and `npm run lint` pass; verified in the browser (desktop collapse, group toggles, mobile drawer, dark mode).
- **2026-07-23 — Dashboard UI Phase 3 (main area).** Built the dashboard main content: header, 4 stats cards (total items, collections, favorite items, favorite collections), a Collections grid (`CollectionCard` with type-color accent + type icons), a Pinned items list, and the 10 most recent items (`ItemCard`). Added a shared `TypeIcon` and `getItemType` lookup over the mock data. `npm run build` and `npm run lint` pass; verified in the browser (all sections render, dark mode).
- **2026-07-23 — Prisma 7 + Neon PostgreSQL setup.** On branch `feature/prisma-neon-setup`. Installed `prisma`/`@prisma/client` 7.9.0 with the `@prisma/adapter-pg` driver adapter (`pg`, `dotenv`, `@types/pg`). Applied Prisma 7 breaking changes: new ESM-first `prisma-client` generator with required `output` (`src/generated/prisma`, git/ESLint-ignored); DB URL moved out of the `datasource` block into `prisma.config.ts`; driver-adapter client singleton in `src/lib/prisma.ts` (hot-reload-safe global). Added the full schema (User/Account/Session/VerificationToken + Item/ItemType/Collection/ItemCollection/Tag, `ContentType` enum, indexes, cascade deletes) and `.env`/`.env.example`. Added `db:*` scripts + `postinstall: prisma generate` (migrations only — no `db push`). Created and applied the initial migration `20260724031415_init` to the Neon dev branch; `prisma migrate status` clean. `npm run build` and `npm run lint` pass.
