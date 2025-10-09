import { build } from "esbuild";

const buildOptions = {
  entryPoints: ["src/index.ts"],
  sourcemap: true,
  keepNames: true,
  minify: true,
  format: "esm" as const,
  logLevel: "info" as const,
  outdir: "dist",
  packages: "external" as const,
  platform: "node" as const,
  resolveExtensions: [".js", ".ts"],
  target: "node24.9",
};

await build(buildOptions);
