<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# DevStash

A developer knowledge hub for snippets, commands, prompts, notes, files, images, links and custom types.

## Context Files

Read the following to get the full context of the project:

- @context/project-overview.md
- @context/coding-standards.md
- @context/ai-interaction.md
- @context/current-feature.md

## Commands

- **Dev server**: `npm run dev` (runs on http://localhost:3000)
- **Build**: `npm run build`
- **Production server**: `npm run start`
- **Lint**: `npm run lint`
- **Test**: `npm test` (Vitest — unit tests for server actions + utilities only; watch: `npm run test:watch`)

## Neon MCP / Database

When using the Neon MCP server, ALWAYS:

- Use the **`devstash`** project — `projectId: jolly-mud-67427347`.
- Target the **`development`** branch by default — `branchId: br-quiet-union-aya5ctl7`. Pass this `branchId` on every query/`run_sql` call.
- **Never touch the `production` branch** (`br-super-rain-ayowhf3b`) — no reads and no writes — unless I explicitly say "production" in that request.
- Never run destructive SQL (`DROP`, `DELETE`, `TRUNCATE`, `UPDATE`/`INSERT` without a `WHERE`, or schema changes) autonomously; ask first, and prefer a disposable temporary branch for experiments.