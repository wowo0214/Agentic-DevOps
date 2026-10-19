import { themePlugin as coreThemePlugin } from "@better-auth-ui/core/plugins/theme"

import type { themePlugin } from "./theme-plugin"

export const themePluginReference = Object.assign(
  (() => undefined) as unknown as typeof themePlugin,
  { id: coreThemePlugin.id }
)
