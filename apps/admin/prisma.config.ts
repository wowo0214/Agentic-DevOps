import { definePrismaConfig } from '@prisma/cli-engine'
import { defineConfig as ormConfig } from '@prisma/orm-postgres/config'
import 'dotenv/config'

export default definePrismaConfig({
  orm: ormConfig({
    contract: './app/prisma/contract.prisma',
    migrations: {
      dir: './app/prisma/migrations',
    },
    db: {
      connection: process.env['DATABASE_URL']!,
    },
  }),
})
