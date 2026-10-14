import { defineConfig } from "tsdown"

export default defineConfig((["esm", "cjs"] as const).map((format) => ({
  entry: {
    "*": ["src/*.ts", "src/*.tsx", "!src/*.d.ts", "!src/*.{test,spec,stories}.{ts,tsx}"],
    "hooks/*": ["src/hooks/*.ts", "src/hooks/*.tsx", "!src/hooks/*.d.ts", "!src/hooks/*.{test,spec,stories}.{ts,tsx}"],
    "counter-button": "src/counter-button/index.tsx",
    link: "src/link/index.tsx",
  },
  format,
  outDir: format === "esm" ? "dist/es" : "dist/cjs",
  outExtensions: () => format === "esm"
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
})))
