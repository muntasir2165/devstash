import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

// Unit tests cover server actions and utilities only — Node environment, no DOM.
// Test files are `*.test.ts`; `.tsx` component tests are intentionally excluded.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    exclude: ["node_modules", ".next", "src/generated/**"],
  },
});
