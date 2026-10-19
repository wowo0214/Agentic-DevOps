"use client"

import Link from "next/link"
import { UserButton } from "@repo/ui/auth"
import { SidebarTrigger } from "@repo/ui/sidebar"
import { Separator } from "@repo/ui/separator"

export function Header() {
  return (
    <header className="flex items-center justify-between gap-4 border-b px-4 py-3 md:px-6">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-4" />
        <Link href="/" className="font-semibold">工作区</Link>
      </div>
      <nav className="flex items-center gap-4">
        <div className="items-flex"></div>
        <UserButton />
      </nav>
    </header>
  )
}
