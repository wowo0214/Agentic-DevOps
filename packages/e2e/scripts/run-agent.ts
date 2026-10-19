import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { appIds, getAppId } from "../shared/apps.ts";
import { packageRoot } from "../shared/env.ts";

const args = process.argv.slice(2);
const selection = args.shift();
if (!selection || selection.startsWith("-")) {
  throw new Error("Usage: run-agent.ts <app-id|all> [e2e options]");
}
const selected = selection === "all" ? appIds : [getAppId(selection)];
const command = args.includes("--list") ? "list" : "run";
const forwarded = args.filter((arg) => arg !== "--list");
const require = createRequire(import.meta.url);
const manifestPath = resolve(packageRoot, "node_modules/e2e/package.json");
const manifest = require(manifestPath) as { bin: { e2e: string } };
const cli = resolve(dirname(manifestPath), manifest.bin.e2e);

// Sequential batches avoid competing sessions and unbounded model costs.
for (const appId of selected) {
  console.log(`\n[Agent E2E] ${appId} (${command})`);
  const code = await new Promise<number>((resolveExit, reject) => {
    const child = spawn(process.execPath, [cli, command, ...forwarded], {
      cwd: packageRoot,
      env: { ...process.env, E2E_APP: appId },
      stdio: "inherit",
    });
    const interrupt = () => child.kill("SIGINT");
    const terminate = () => child.kill("SIGTERM");
    process.once("SIGINT", interrupt);
    process.once("SIGTERM", terminate);
    child.once("error", reject);
    child.once("exit", (exitCode, signal) => {
      process.removeListener("SIGINT", interrupt);
      process.removeListener("SIGTERM", terminate);
      resolveExit(signal ? 130 : (exitCode ?? 1));
    });
  });
  if (code === 130) {
    process.exitCode = code;
    break;
  }
  if (code !== 0) process.exitCode = 1;
}
