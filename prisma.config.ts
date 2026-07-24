import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // Prisma 7 seeding is explicit — run `npx prisma db seed`.
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Neon PostgreSQL. Use the DEVELOPMENT branch connection string in `.env`.
    // The Prisma CLI uses this URL for migrations — never `prisma db push`.
    url: env("DATABASE_URL"),
  },
});
