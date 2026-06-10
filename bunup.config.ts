import { defineConfig } from "bunup";

export default defineConfig({
  entry: ["src/cli.ts"],
  outDir: "dist",
  format: ["esm"],
  target: "node",
  clean: true,
  dts: false,
  splitting: false,
  minify: false,
});
