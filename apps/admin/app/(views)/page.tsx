import { redirect } from 'next/navigation'

// This route only redirects; it has no UI for instant navigation to validate.
export const instant = false

export default function Page() {
  redirect('/dashboard')
}
