import { defineConfig, type Options } from "tsup";

const shared: Options = {
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  target: "es2022",
};

export default defineConfig([
  {
    ...shared,
    entry: { index: "src/index.ts", testing: "src/testing.ts" },
    clean: true,
  },
  {
    ...shared,
    entry: { react: "src/react/index.ts" },
    external: ["react", "dragref"],
    // Lets Next.js App Router server components import these client components directly.
    banner: { js: '"use client";' },
  },
]);
