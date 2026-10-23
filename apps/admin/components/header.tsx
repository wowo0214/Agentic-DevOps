'use client'

import Link from 'next/link'
import { UserButton } from '@repo/ui/auth'
import { Separator } from '@repo/ui/separator'
import { SidebarTrigger } from '@repo/ui/sidebar'

export function Header() {
  return (
    <header className="flex items-center justify-between gap-4 border-b px-4 py-3 md:px-6">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-4" />
        <Link href="/" className="font-semibold">
          Workspace
        </Link>
      </div>
      <nav className="flex items-center gap-4">
        <div className="items-flex"></div>
        <UserButton />
      </nav>
    </header>
  )
}
