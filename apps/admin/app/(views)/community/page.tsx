import { Suspense } from 'react'
import { requirePagePermission } from '@/lib/permissions/server'
import { requireSession } from '@/lib/require-session'
import { ChatWorkspace } from './_components/chat-workspace'

export default function CommunityPage() {
  return (
    <Suspense
      fallback={<div className="p-6 text-muted-foreground">正在打开社群…</div>}
    >
      <CommunityContent />
    </Suspense>
  )
}

async function CommunityContent() {
  const { session } = await requireSession()
  const principal = await requirePagePermission(
    session.user,
    'conversation:read',
  )
  return (
    <ChatWorkspace
      userId={principal.id}
      userName={session.user.name}
      userImage={session.user.image ?? null}
      guest={principal.role === 'guest'}
    />
  )
}
