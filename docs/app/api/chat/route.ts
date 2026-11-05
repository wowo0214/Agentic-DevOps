import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import {
  APICallError,
  StreamProviderError,
  convertToModelMessages,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
  safeValidateUIMessages,
  tool,
  toUIMessageStream,
  type InferToolOutput,
} from 'ai';
import { z } from 'zod';
import { source } from '@/lib/source';
import { Document, type DocumentData } from 'flexsearch';
import type { ChatUIMessage, SearchTool } from '../../../components/ai/search';

interface CustomDocument extends DocumentData {
  url: string;
  title: string;
  description: string;
  content: string;
}
const searchServer = createSearchServer();

async function createSearchServer() {
  const search = new Document<CustomDocument>({
    document: {
      id: 'url',
      index: ['title', 'description', 'content'],
      store: true,
    },
  });

  const docs = await chunkedAll(
    source.getPages().map((page) => async () => {
      if (!('getText' in page.data)) return null;

      return {
        title: page.data.title,
        description: page.data.description,
        url: page.url,
        content: await page.data.getText('processed'),
      } as CustomDocument;
    }),
  );

  for (const doc of docs) {
    if (doc) search.add(doc);
  }

  return search;
}

async function chunkedAll<O>(tasks: (() => Promise<O>)[]): Promise<O[]> {
  const SIZE = 50;
  const out: O[] = [];
  for (let i = 0; i < tasks.length; i += SIZE) {
    out.push(...(await Promise.all(tasks.slice(i, i + SIZE).map((task) => task()))));
  }
  return out;
}

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

/** System prompt, you can update it to provide more specific information */
const systemPrompt = [
  'You are an AI assistant for a documentation site.',
  'Use the `search` tool to retrieve relevant docs context before answering when needed.',
  'A user message may begin with [Client Context], the page they are reading. For questions about "this page", search its title.',
  'The `search` tool returns raw JSON results from documentation. Use those results to ground your answer and cite sources as markdown links using the document `url` field when available.',
  'If you cannot find the answer in search results, say you do not know and suggest a better search query.',
].join('\n');

export async function POST(req: Request) {
  const model = process.env.OPENROUTER_MODEL;
  if (!process.env.OPENROUTER_API_KEY || !model) {
    return Response.json(
      { error: 'Configure OPENROUTER_API_KEY and OPENROUTER_MODEL.' },
      { status: 503 },
    );
  }

  let reqJson: unknown;
  try {
    reqJson = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON request.' }, { status: 400 });
  }

  const body = z.object({ messages: z.array(z.unknown()).min(1) }).safeParse(reqJson);
  if (!body.success) {
    return Response.json({ error: 'A non-empty messages array is required.' }, { status: 400 });
  }
  const validated = await safeValidateUIMessages<ChatUIMessage>({
    messages: body.data.messages,
    dataSchemas: {
      client: z.object({ location: z.string(), title: z.string() }),
    },
    tools: { search: searchTool },
  });
  if (!validated.success || validated.data.some((message) => message.role === 'system')) {
    return Response.json({ error: 'Invalid chat messages.' }, { status: 400 });
  }

  const result = streamText({
    model: openrouter.chat(model),
    abortSignal: req.signal,
    stopWhen: stepCountIs(5),
    tools: {
      search: searchTool,
    },
    instructions: systemPrompt,
    messages: await convertToModelMessages<ChatUIMessage>(validated.data, {
      convertDataPart(part) {
        if (part.type === 'data-client')
          return {
            type: 'text',
            text: `[Client Context: ${JSON.stringify(part.data)}]`,
          };
      },
    }),
    toolChoice: 'auto',
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      onError(error) {
        if (APICallError.isInstance(error) || StreamProviderError.isInstance(error)) {
          if (error.statusCode === 503) return '模型服务暂时过载，请稍后重试。';
          if (error.statusCode === 429) return '已达到模型请求频率或免费额度限制，请稍后重试。';
          if (error.statusCode === 401 || error.statusCode === 403)
            return '模型服务认证失败，请检查 OpenRouter API Key 和模型访问权限。';
          if (error.statusCode === 402)
            return '模型服务要求账户余额，请检查 OpenRouter 账户与模型配置。';
        }
        return '聊天请求失败，请查看服务器日志。';
      },
    }),
  });
}

const searchTool = tool({
  description: 'Search the docs content and return raw JSON results.',
  inputSchema: z.object({
    query: z.string(),
    limit: z.number().int().min(1).max(100).default(10),
  }),
  async execute({ query, limit }): Promise<InferToolOutput<SearchTool>> {
    const search = await searchServer;
    return await search.searchAsync(query, {
      limit,
      merge: true,
      enrich: true,
    });
  },
}) satisfies SearchTool;
