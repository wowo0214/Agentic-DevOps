import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

export const packageRoot = fileURLToPath(new URL("../", import.meta.url));

// Resolve relative overrides against the test package, not the calling app.
const override = process.env.E2E_ENV_FILE;
const envFile = override
  ? resolve(packageRoot, override)
  : resolve(packageRoot, ".env.local");

if (override || existsSync(envFile)) process.loadEnvFile(envFile);

export function httpUrl(name: string, value: string | undefined): string {
  if (!value?.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${name} must be a valid absolute HTTP(S) URL`);
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(`${name} must use http or https`);
  }
  return url.href;
}
