import { db } from '@/app/prisma/db'
import { R } from '@repo/http-contract'
import type { NextRequest } from 'next/server'
// 同一个 /api/crud 地址，根据请求的 HTTP 方法执行下面对应的函数。
// 以下 fetch 示例在当前应用页面的浏览器开发者工具 Console 中执行。
// GET 保留真实数据库查询；其他方法仅演示接收参数和响应，不修改数据库。

// GET：有查询参数时按参数筛选，没有查询参数时查询全部用户。
// 触发方式：http://localhost:3000/api/crud?email=xx@example.com
// 多个条件：http://localhost:3000/api/crud?name=张三&phone=13800000000
// 查询全部：地址栏访问 http://localhost:3000/api/crud。
export async function GET(res: NextRequest) {
  // Best Practice
  const filters = Object.fromEntries(res.nextUrl.searchParams)

  const qeury = Object.keys(filters).length
    ? db.orm.public.user.where(filters)
    : db.orm.public.user

  const users = await qeury.select('id', 'name', 'email', 'phone').all()

  return Response.json(users)
}

// POST：演示创建用户，JSON 数据通过请求体传入。
// 触发方式：
// await fetch('/api/crud', {
//   method: 'POST',
//   headers: { 'Content-Type': 'application/json' },
//   body: JSON.stringify({ name: '张三', email: 'zhangsan@example.com', phone: '13800000000' }),
// }).then(res => res.json())
export async function POST(request: Request) {
  const body = await request.json()
  return Response.json({ method: 'POST', received: body }, { status: 201 })
}

// PUT：演示完整替换用户资料，id 从 URL 查询参数读取，完整资料从请求体读取。
// 触发方式：
// await fetch('/api/crud?id=123', {
//   method: 'PUT',
//   headers: { 'Content-Type': 'application/json' },
//   body: JSON.stringify({ name: '李四', email: 'lisi@example.com', phone: '13900000000' }),
// }).then(res => res.json())
export async function PUT(request: Request) {
  const id = new URL(request.url).searchParams.get('id')
  const body = await request.json()
  return Response.json({ method: 'PUT', id, replacement: body })
}

// PATCH：局部修改，只传入需要修改的字段
export async function PATCH() {
  try {
    const user = await db.orm.public.user
      .where((u) => u.email.eq('admin1@next.com'))
      .select('id', 'name', 'role')
      .update({ role: 'admin' })

    if (!user) {
      return R.error('用户不存在', 404)
    }
    return R.ok(user, '更新成功')
  } catch (error) {
    // 查询或更新过程中抛出异常
    console.error(error)

    return R.error('更新用户角色失败')
  }
}

// DELETE：演示接收要删除的用户 id，并返回它，方便观察请求结果。
// 触发方式：
// await fetch('/api/crud?id=123', { method: 'DELETE' }).then(res => res.json())
export async function DELETE(request: Request) {
  const id = new URL(request.url).searchParams.get('id')
  return Response.json({ method: 'DELETE', id })
}

// HEAD：只返回状态码和响应头，没有响应正文，所以不要调用 res.json()。
// 触发方式：
// const head = await fetch('/api/crud', { method: 'HEAD' })
// console.log(head.status, head.headers.get('X-Example-Method'))
export async function HEAD() {
  return new Response(null, {
    status: 200,
    headers: { 'X-Example-Method': 'HEAD' },
  })
}

// OPTIONS：通过 Allow 响应头列出此路由支持的方法，没有响应正文。
// 触发方式：
// const options = await fetch('/api/crud', { method: 'OPTIONS' })
// console.log(options.status, options.headers.get('Allow'))
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: { Allow: 'GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS' },
  })
}
