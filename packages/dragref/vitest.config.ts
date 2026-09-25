import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const src = (file: string) => fileURLToPath(new URL(`./src/${file}`, import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      { find: "dragref/testing", replacement: src("testing.ts") },
      { find: /^dragref$/, replacement: src("index.ts") },
    ],
  },
  test: {
    environment: "node",
  },
});
