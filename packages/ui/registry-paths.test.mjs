import assert from "node:assert/strict";
import { existsSync, globSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);

const registryModules = [
  ["auth/auth-provider", "AuthProvider"],
  ["auth/anonymous/anonymous-button", "AnonymousButton"],
  ["lib/auth/anonymous-plugin", "anonymousPlugin"],
];

test("registry aliases match the source tree", () => {
  const config = JSON.parse(
    readFileSync(new URL("./components.json", import.meta.url), "utf8"),
  );
  assert.equal(config.aliases.components, "@repo/ui");
  assert.equal(config.aliases.ui, "@repo/ui");
  assert.equal(config.aliases.lib, "@repo/ui/lib");
});

test("registry modules are directly importable in ESM", async () => {
  for (const [path, name] of registryModules) {
    const specifier = `@repo/ui/${path}`;
    assert.equal(typeof (await import(specifier))[name], "function", specifier);
  }
});

// Better Auth UI dependencies are ESM-only; validate CJS export resolution without executing them.
test("registry modules resolve to CommonJS build outputs", () => {
  for (const [path] of registryModules) {
    const resolved = require.resolve(`@repo/ui/${path}`).replaceAll("\\", "/");
    assert.ok(resolved.endsWith(`/dist/cjs/${path}.js`), resolved);
  }
});

test("all auth and lib sources have build outputs and type declarations", () => {
  const files = globSync(["auth/**/*.{ts,tsx}", "lib/**/*.{ts,tsx}"], {
    cwd: fileURLToPath(new URL("./src/", import.meta.url)),
    exclude: ["**/*.d.ts", "**/*.{test,spec,stories}.{ts,tsx}"],
  });
  assert.ok(files.length > 0);
  for (const file of files) {
    const path = file.replaceAll("\\", "/").replace(/\.tsx?$/, "");
    for (const [format, extensions] of [
      ["es", ["mjs", "d.mts"]],
      ["cjs", ["js", "d.ts"]],
    ]) {
      for (const extension of extensions) {
        const output = `./dist/${format}/${path}.${extension}`;
        assert.ok(existsSync(new URL(output, import.meta.url)), output);
      }
    }
  }
});
