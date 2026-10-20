"use client"

import Link from "next/link"
import { authClient } from "@/lib/auth-client"

export function DashboardContent() {
  const { data: session } = authClient.useSession()
  if (!session) return <main className="my-auto text-center">正在读取登录状态…</main>

  return (
    <main className="mx-auto my-auto flex max-w-xl flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">你好，{session.user.name}</h1>
      <p className="text-muted-foreground">当前登录邮箱：{session.user.email}</p>
      <Link href="/settings/account" className="underline">账号设置</Link>
      <Link href="/settings/security" className="underline">安全设置</Link>
      <Link href="/auth/sign-out" className="underline">退出登录</Link>
    </main>
  )
}
