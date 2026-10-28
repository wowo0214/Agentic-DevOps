import type { HResponse } from '@repo/http-contract'

// A FormData body uploads a file; a URLSearchParams reads; any other object is a JSON write.
export async function request<T>(
  params: URLSearchParams | FormData | Record<string, unknown>,
  signal?: AbortSignal,
): Promise<T> {
  const get = params instanceof URLSearchParams
  const upload = params instanceof FormData
  const response = await fetch(
    get
      ? `/api/chat?${params}`
      : upload
        ? '/api/chat/attachments'
        : '/api/chat',
    {
      method: get ? 'GET' : 'POST',
      signal,
      cache: 'no-store',
      ...(upload
        ? { body: params }
        : !get && {
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params),
          }),
    },
  )
  const { message, data } = (await response.json()) as HResponse<T>
  if (!response.ok) throw new Error(message || '请求失败')
  return data
}
