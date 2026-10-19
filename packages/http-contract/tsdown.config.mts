import { defineConfig, type UserConfig } from "tsdown";

export default defineConfig(
  (["esm", "cjs"] as const).map((format): UserConfig => ({
    entry: { index: "src/index.ts" },
    format,
    outDir: format === "esm" ? "dist/es" : "dist/cjs",
    outExtensions: () =>
      format === "esm"
        ? { js: ".mjs", dts: ".d.mts" }
        : { js: ".js", dts: ".d.ts" },
    platform: "neutral",
    target: "es2022",
    dts: true,
  })),
);
