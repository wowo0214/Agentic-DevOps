import { createAgentUIStreamResponse, type UIMessage } from 'ai'
import { agent } from '@/agent'

export async function POST(request: Request) {
  const { messages }: { messages: UIMessage[] } = await request.json()
  return createAgentUIStreamResponse({ agent, uiMessages: messages })
}
