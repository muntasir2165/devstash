# Item Types — DevStash

DevStash organizes every saved item under a **type**. Seven **system types** ship built-in
and are immutable; users may add custom types later (Pro). Each type is an `ItemType` row
(`name`, `icon`, `color`, `isSystem`) and every `Item` points at one via `itemTypeId`.

> **Sources:** [prisma/schema.prisma](../prisma/schema.prisma) (`Item`, `ItemType`, `ContentType`),
> [prisma/seed.ts](../prisma/seed.ts) (`SYSTEM_TYPES` — authoritative icon/color), and
> [context/project-overview.md](../context/project-overview.md) (storage kind + tier).
> Note: the research prompt listed `src/lib/constants.tsx`, which **does not exist**. The type
> definitions live in `prisma/seed.ts`; [src/lib/mock-data.ts](../src/lib/mock-data.ts) holds a
> legacy copy (same icons/colors) and [src/components/dashboard/TypeIcon.tsx](../src/components/dashboard/TypeIcon.tsx)
> maps the Lucide icon names to components.

## The seven system types

| Type | Icon (Lucide) | Color (hex) | Swatch | Storage kind | `ContentType` | Tier |
|------|---------------|-------------|--------|--------------|---------------|------|
| `snippet` | `Code` | `#3b82f6` | blue | text | `TEXT` | Free |
| `prompt` | `Sparkles` | `#8b5cf6` | violet | text | `TEXT` | Free |
| `note` | `StickyNote` | `#fde047` | yellow | text | `TEXT` | Free |
| `command` | `Terminal` | `#f97316` | orange | text | `TEXT` | Free |
| `link` | `Link` | `#10b981` | emerald | url | `URL` | Free |
| `file` | `File` | `#6b7280` | gray | file | `FILE` | **Pro** |
| `image` | `Image` | `#ec4899` | pink | file | `FILE` | **Pro** |

Canonical display order (sidebar): snippet → prompt → command → note → file → image → link
(`SIDEBAR_TYPE_ORDER` in [src/lib/db/items.ts](../src/lib/db/items.ts)).

## Per-type detail

### `snippet` — Code
- **Color:** `#3b82f6` (blue) · **Storage:** text (`TEXT`) · **Tier:** Free
- **Purpose:** Reusable code snippets (hooks, utilities, boilerplate).
- **Key fields:** `content` (the code), `language` (e.g. `typescript`), `title`, `description`, `tags`.

### `prompt` — Sparkles
- **Color:** `#8b5cf6` (violet) · **Storage:** text (`TEXT`) · **Tier:** Free
- **Purpose:** AI prompts, system messages, and reusable instructions.
- **Key fields:** `content` (prompt text), `title`, `description`, `tags`.

### `note` — StickyNote
- **Color:** `#fde047` (yellow) · **Storage:** text (`TEXT`) · **Tier:** Free
- **Purpose:** Freeform notes / Markdown text.
- **Key fields:** `content`, `title`, `description`, `tags`.

### `command` — Terminal
- **Color:** `#f97316` (orange) · **Storage:** text (`TEXT`) · **Tier:** Free
- **Purpose:** Shell / CLI commands worth remembering.
- **Key fields:** `content` (the command), `title`, `description`, `tags`. (`language` optional.)

### `link` — Link
- **Color:** `#10b981` (emerald) · **Storage:** url (`URL`) · **Tier:** Free
- **Purpose:** Bookmarked URLs, docs, and references.
- **Key fields:** `url`, `title`, `description`, `tags`. (`content` is null.)

### `file` — File *(Pro)*
- **Color:** `#6b7280` (gray) · **Storage:** file (`FILE`) · **Tier:** Pro
- **Purpose:** Uploaded documents / arbitrary files (stored in Cloudflare R2).
- **Key fields:** `fileUrl`, `fileName`, `fileSize` (bytes), `title`, `description`.
- Rendered by `TypeIcon`'s **default** case (any unmapped icon falls back to the `File` glyph).

### `image` — Image *(Pro)*
- **Color:** `#ec4899` (pink) · **Storage:** file (`FILE`) · **Tier:** Pro
- **Purpose:** Uploaded images (stored in Cloudflare R2).
- **Key fields:** `fileUrl`, `fileName`, `fileSize` (bytes), `title`, `description`.

## Summaries

### Storage classification: text vs URL vs file
The `ContentType` enum (`TEXT` | `FILE` | `URL`) drives which fields an item populates:

- **TEXT** — `snippet`, `prompt`, `note`, `command` → data lives in `content`; `snippet`/`command`
  may also set `language`. `fileUrl`/`url` are null.
- **URL** — `link` → data lives in `url`; `content`/`file*` are null.
- **FILE** — `file`, `image` → data lives in `fileUrl` + `fileName` + `fileSize`; `content`/`url` are null.
  Both are **Pro-only** and are **not** created by the seed.

> Seed note: `prisma/seed.ts` sets `contentType: it.url ? URL : TEXT`, so all 18 seeded items are
> `TEXT` or `URL` only — there are no `FILE` items in seed data.

### Shared properties (all types)
Every `Item`, regardless of type, has: `id`, `title`, `description?`, `isFavorite`, `isPinned`,
`tags` (M2M), `collections` (M2M via `ItemCollection`), `userId` (owner), `itemTypeId`,
`createdAt`, `updatedAt`. Every `ItemType` has: `id`, `name`, `icon`, `color`, `isSystem`,
`userId?` (null for the seven system types).

### Display differences
- Each type renders its **Lucide icon tinted with its hex color** via `TypeIcon`
  ([TypeIcon.tsx](../src/components/dashboard/TypeIcon.tsx)). The switch maps `Code`, `Sparkles`,
  `Terminal`, `StickyNote`, `Image`, `Link`; anything else (including `File`) hits the default `File` glyph.
- `ItemCard` and `CollectionCard` use the type color for an accent border + icon; a collection's
  accent comes from its **dominant** (most-used) item type.
- `file` and `image` additionally show a **PRO** badge in the sidebar Types list
  (`PRO_TYPE_SLUGS = { file, image }` in `AppSidebar`).
- Type routes follow `/items/{name}` (e.g. `/items/snippet`).
