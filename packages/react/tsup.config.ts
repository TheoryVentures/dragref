import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  sourcemap: true,
  target: "es2022",
  external: ["react", "@dragref/core"],
  // Lets Next.js App Router server components import these client components directly.
  banner: { js: '"use client";' },
});
