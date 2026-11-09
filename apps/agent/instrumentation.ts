// Dev only: DevTools records every AI SDK call into .devtools/generations.json.
export async function register() {
  if (process.env.NODE_ENV !== 'development') return
  const { registerTelemetry } = await import('ai')
  const { DevToolsTelemetry } = await import('@ai-sdk/devtools')
  registerTelemetry(DevToolsTelemetry())
}
