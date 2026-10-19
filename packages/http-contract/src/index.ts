export interface HResponse<T = unknown> {
  code: number
  message: string
  data: T
}

function json<T>(code: number, message: string, data: T): Response {
  const body: HResponse<T> = { code, message, data }
  return Response.json(body, { status: code })
}

export const R = {
  ok<T = never[]>(data?: T, message = '操作成功'): Response {
    return json(200, message, data ?? [])
  },

  created<T = never[]>(data?: T, message = '创建成功'): Response {
    return json(201, message, data ?? [])
  },

  noContent(): Response {
    return new Response(null, { status: 204 })
  },

  resetContent(): Response {
    return new Response(null, { status: 205 })
  },

  error(message = '操作失败', status = 500): Response {
    if (!Number.isInteger(status) || status < 400 || status > 599) {
      throw new RangeError('R.error requires a 4xx or 5xx status')
    }

    return json(status, message, [])
  },
}
