import { runAgentTUI } from '@ai-sdk/tui'
import { agent } from './agent.ts'

await runAgentTUI({
  title: 'Agent',
  agent,
  contextSize: 1_000_000,
})
