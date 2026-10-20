import { globSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig, type UserConfig } from "tsdown";

const sourceFiles = globSync("**/*.{ts,tsx}", {
  cwd: fileURLToPath(new URL("./src/", import.meta.url)),
  exclude: ["**/*.d.ts", "**/*.{test,spec,stories}.{ts,tsx}"],
});

const entries = Object.fromEntries(
  sourceFiles.map((file) => {
    const path = file.replace(/\\/g, "/");
    return [path.replace(/\.tsx?$/, ""), `src/${path}`];
  }),
);

export default defineConfig(
  (["esm", "cjs"] as const).map((format): UserConfig => ({
    entry: entries,
    format,
    outDir: format === "esm" ? "dist/es" : "dist/cjs",
    outExtensions: () =>
      format === "esm"
        ? { js: ".mjs", dts: ".d.mts" }
        : { js: ".js", dts: ".d.ts" },
    platform: "neutral",
    target: "es2022",
    // Keep each module's client/server boundary intact for Next.js.
    unbundle: true,
    // Rolldown preserves directives in unbundle mode.
    inputOptions: { checks: { moduleLevelDirective: false } },
    root: "src",
    dts: true,
    copy: [{ from: "src/styles.css", to: "dist" }],
  })),
);
