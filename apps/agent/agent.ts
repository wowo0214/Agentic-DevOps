import { ToolLoopAgent, tool } from 'ai'
import MemoryClient from 'mem0ai'
import { z } from 'zod'

const memory = new MemoryClient({ apiKey: process.env.MEM0_API_KEY! })
const userId = process.env.MEM0_USER_ID!

// The one agent definition; the terminal UI and /api/chat both use it.
export const agent = new ToolLoopAgent({
  model: 'nvidia/nemotron-3.5-lightning-free',
  instructions:
    'You are a helpful assistant. Answer in markdown and use tools when they help. Use searchMemory to recall what you know about the user, and addMemory to save lasting facts or preferences they share.',
  tools: {
    searchMemory: tool({
      description: 'Search long-term memories about the user',
      inputSchema: z.object({
        query: z.string().describe('What to look up in memory'),
      }),
      execute: async ({ query }) => {
        const { results } = await memory.search(query, {
          filters: { user_id: userId },
        })
        return results.map((item) => item.memory)
      },
    }),
    addMemory: tool({
      description: 'Save a lasting fact or preference about the user',
      inputSchema: z.object({
        content: z.string().describe('The fact to remember, in one sentence'),
      }),
      execute: async ({ content }) => {
        await memory.add([{ role: 'user', content }], { userId })
        return { saved: true }
      },
    }),
    weather: tool({
      description: 'Get the weather in a location (fahrenheit)',
      inputSchema: z.object({
        location: z.string().describe('The location to get the weather for'),
      }),
      execute: async ({ location }) => ({
        location,
        temperature: Math.round(Math.random() * (90 - 32) + 32),
      }),
    }),
    convertFahrenheitToCelsius: tool({
      description: 'Convert a temperature in fahrenheit to celsius',
      inputSchema: z.object({
        temperature: z
          .number()
          .describe('The temperature in fahrenheit to convert'),
      }),
      execute: async ({ temperature }) => ({
        celsius: Math.round((temperature - 32) * (5 / 9)),
      }),
    }),
  },
})
