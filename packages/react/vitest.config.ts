import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const coreSrc = (file: string) => fileURLToPath(new URL(`../core/src/${file}`, import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      { find: "@dragref/core/testing", replacement: coreSrc("testing.ts") },
      { find: "@dragref/core", replacement: coreSrc("index.ts") },
    ],
  },
  test: {
    environment: "jsdom",
  },
});
