import { createAgentConfig } from "./config/agent.ts";
import { getAppId } from "./shared/apps.ts";

const appId = process.env.E2E_APP;

if (!appId?.trim()) {
  throw new Error(
    "Missing E2E_APP. Run tests through an application package script or test:agent <app-id>.",
  );
}

export default createAgentConfig(getAppId(appId));
