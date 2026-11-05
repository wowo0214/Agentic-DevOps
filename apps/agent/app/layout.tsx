import type { ReactNode } from 'react'

export const metadata = { title: 'Agent' }

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
