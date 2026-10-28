import postgres from '@prisma/orm-postgres/runtime'
import contractJson from './contract.json' with { type: 'json' }
import type { Contract } from './contract.d'
import 'dotenv/config'

export const db = postgres<Contract>({
  contractJson,
  url: process.env['DATABASE_URL']!,
})
