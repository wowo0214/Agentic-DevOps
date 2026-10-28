#!/usr/bin/env -S node
import {
  Migration,
  MigrationCLI,
  col,
  lit,
} from '@prisma/orm-postgres/migration'
import endContract from '../../snapshots/0fd973906684c6b70490ff138affa6178db8e3287691125107d13f5f228870e6/contract.json' with { type: 'json' }
import startContract from '../../snapshots/0374580a9ba88ea1728509300102b26dcc287dd778fdcef9266703ec253bedf6/contract.json' with { type: 'json' }
import type { Contract as End } from '../../snapshots/0fd973906684c6b70490ff138affa6178db8e3287691125107d13f5f228870e6/contract'
import type { Contract as Start } from '../../snapshots/0374580a9ba88ea1728509300102b26dcc287dd778fdcef9266703ec253bedf6/contract'

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract
  override readonly endContractJson = endContract

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'conversation',
        column: col('last_seq', 'int4', {
          notNull: true,
          default: lit(0),
          codecRef: { codecId: 'pg/int4@1' },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'message',
        column: col('seq', 'int4', {
          notNull: true,
          default: lit(0),
          codecRef: { codecId: 'pg/int4@1' },
        }),
      }),
      this.addUnique({
        schema: 'public',
        table: 'message',
        constraint: 'message_conversation_seq_key',
        columns: ['conversation_id', 'seq'],
      }),
    ]
  }
}

MigrationCLI.run(import.meta.url, M)
