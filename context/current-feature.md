# Current Feature

Seed Data — create a Prisma seed script (`prisma/seed.ts`) to populate the dev database with sample data for development and demos.

## Status

In Progress

## Goals

- Create/overwrite `prisma/seed.ts` and wire it up so `npx prisma db seed` runs it (Prisma 7 seeding is explicit — `migrate dev` no longer auto-seeds).
- Seed a demo **User**: `demo@devstash.io`, name "Demo User", password `12345678` hashed with **bcryptjs** (12 rounds), `isPro: false`, `emailVerified: now`.
- Seed the 7 **system item types** (`isSystem: true`) with Lucide icon + hex color: snippet/`Code`/#3b82f6, prompt/`Sparkles`/#8b5cf6, command/`Terminal`/#f97316, note/`StickyNote`/#fde047, file/`File`/#6b7280, image/`Image`/#ec4899, link/`Link`/#10b981.
- Seed 5 **collections** with items linked via `ItemCollection`:
  - React Patterns — 3 TypeScript snippets (custom hooks, component patterns, utilities).
  - AI Workflows — 3 prompts (code review, doc generation, refactoring).
  - DevOps — 1 snippet + 1 command + 2 links (real URLs).
  - Terminal Commands — 4 commands (git, docker, process mgmt, package manager).
  - Design Resources — 4 links (real URLs: CSS/Tailwind, component libs, design systems, icons).

## Notes

- Install `bcryptjs` (+ `@types/bcryptjs`) for password hashing.
- Make the seed idempotent (e.g. `upsert` / clear-then-insert) so it can be re-run safely.
- Items reference an `itemType` and belong to collections through the `ItemCollection` join table.
- Reference: `@context/features/seed-spec.md`.

## History

<!-- Keep this updated. Earliest to latest. -->

- **2026-06-22 — Initial Next.js setup.** Scaffolded with `create-next-app`: Next.js 16.2.9 (App Router, `src/` structure), React 19.2.4 with the React Compiler, TypeScript, Tailwind CSS v4, and ESLint 9. Removed the default boilerplate.
- **2026-07-23 — Dashboard UI Phase 1.** Initialized shadcn/ui (Tailwind v4, Base UI) and installed `button` + `input`; added the `/dashboard` route with a layout shell (top bar with search plus display-only "New Collection" and "New Item" buttons, and `Sidebar`/`Main` placeholders); enabled dark mode by default via the `dark` class on `<html>`. `npm run build` and `npm run lint` pass; verified in the browser.
- **2026-07-23 — Dashboard UI Phase 2 (collapsible sidebar).** Added `AppSidebar` (shadcn `sidebar`/`collapsible`/`avatar`, Base UI variants): brand header, collapsible Types group (colored icons, counts, links to `/items/{slug}`), collapsible Collections group (Favorites with stars + All Collections with counts), and a user footer. Wrapped the dashboard layout in `SidebarProvider`/`SidebarInset` and moved the drawer toggle (`SidebarTrigger`) into the top bar; mobile renders an overlay drawer. Rewrote `use-mobile` with `useSyncExternalStore` to satisfy the React Compiler lint rule. `npm run build` and `npm run lint` pass; verified in the browser (desktop collapse, group toggles, mobile drawer, dark mode).
- **2026-07-23 — Dashboard UI Phase 3 (main area).** Built the dashboard main content: header, 4 stats cards (total items, collections, favorite items, favorite collections), a Collections grid (`CollectionCard` with type-color accent + type icons), a Pinned items list, and the 10 most recent items (`ItemCard`). Added a shared `TypeIcon` and `getItemType` lookup over the mock data. `npm run build` and `npm run lint` pass; verified in the browser (all sections render, dark mode).
- **2026-07-23 — Prisma 7 + Neon PostgreSQL setup.** On branch `feature/prisma-neon-setup`. Installed `prisma`/`@prisma/client` 7.9.0 with the `@prisma/adapter-pg` driver adapter (`pg`, `dotenv`, `@types/pg`). Applied Prisma 7 breaking changes: new ESM-first `prisma-client` generator with required `output` (`src/generated/prisma`, git/ESLint-ignored); DB URL moved out of the `datasource` block into `prisma.config.ts`; driver-adapter client singleton in `src/lib/prisma.ts` (hot-reload-safe global). Added the full schema (User/Account/Session/VerificationToken + Item/ItemType/Collection/ItemCollection/Tag, `ContentType` enum, indexes, cascade deletes) and `.env`/`.env.example`. Added `db:*` scripts + `postinstall: prisma generate` (migrations only — no `db push`). Created and applied the initial migration `20260724031415_init` to the Neon dev branch; `prisma migrate status` clean. `npm run build` and `npm run lint` pass.
- **2026-07-23 — Seed data.** On branch `feature/seed-data`. Added `User.hashedPassword` (nullable, for credentials login) via migration `20260724034852_add_user_password`; installed `bcryptjs` (+ types). Registered the seed command in `prisma.config.ts` (`migrations.seed = "tsx prisma/seed.ts"`) and wrote an idempotent `prisma/seed.ts` (clears in FK-safe order, then reseeds). Seeds a demo user (`demo@devstash.io` / `12345678`, bcrypt 12 rounds, `emailVerified` now), the 7 system item types, and 5 collections with 18 items total (React Patterns ×3 snippets, AI Workflows ×3 prompts, DevOps = snippet + command + 2 links, Terminal Commands ×4, Design Resources ×4 links; links use real URLs). `npx prisma db seed` populated the Neon dev branch (verified counts 1/7/18/5). `npm run build` and `npm run lint` pass.
