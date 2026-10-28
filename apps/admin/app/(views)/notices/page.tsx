import { redirect } from 'next/navigation'
import type { Route } from 'next'

export const instant = false

export default function Page() {
  redirect('/community' as Route)
}
