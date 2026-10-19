import { httpUrl } from "./env.ts";

export const apps = {
  "link-admin": {
    url: httpUrl("LINK_ADMIN_E2E_URL", process.env.LINK_ADMIN_E2E_URL),
    agentContext:
      "This is a local admin app. Guest login is labelled Continue as guest. The current user's dropdown is at the bottom of the sidebar. Do not change account settings or business data.",
  },
} as const;

export type AppId = keyof typeof apps;
export const appIds = Object.keys(apps) as AppId[];

export function getAppId(value: string): AppId {
  if (!Object.hasOwn(apps, value)) {
    throw new Error(
      `Unknown E2E app: ${value}. Available: ${appIds.join(", ")}`,
    );
  }
  return value as AppId;
}
