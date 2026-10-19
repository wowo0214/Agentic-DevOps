import { deepseek } from "@ai-sdk/deepseek";
import { web } from "@e2e-dev/web";
import type { E2EConfig } from "e2e";
import { apps, type AppId } from "../shared/apps.ts";

export function createAgentConfig(appId: AppId): E2EConfig {
  const app = apps[appId];
  return {
    targets: [
      {
        name: `${appId}-chromium`,
        engine: web({ viewport: { width: 1360, height: 900 } }),
        app: { url: app.url },
      },
    ],
    agents: {
      default: {
        model: deepseek(process.env.E2E_MODEL ?? "deepseek-flash"),
        context: app.agentContext,
        maxSteps: 8,
        maxModelCalls: 8,
      },
    },
    tests: [`__tests__/${appId}/agent/**/*.e2e.ts`],
    workers: 1,
    retries: 0,
    timeout: 180_000,
    assertionTimeout: 15_000,
    maxDuration: 240_000,
    trace: "on",
  };
}
