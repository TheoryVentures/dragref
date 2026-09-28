import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const src = (file: string) => fileURLToPath(new URL(`./src/${file}`, import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      { find: "@adamconway/dragref/testing", replacement: src("testing.ts") },
      { find: /^@adamconway\/dragref$/, replacement: src("index.ts") },
    ],
  },
  test: {
    environment: "node",
  },
});
