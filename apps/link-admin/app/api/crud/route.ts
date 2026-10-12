import { db } from '@/app/prisma/db'

export async function GET() {
  const users = await db.orm.public.user
    .select('id', 'name', 'email')
    .limit(2)
    .all()

  return Response.json(users)
}
