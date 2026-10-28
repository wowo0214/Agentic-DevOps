#!/usr/bin/env -S node
import {
  Migration,
  MigrationCLI,
  col,
  primaryKey,
} from '@prisma/orm-postgres/migration'
import startContract from '../../snapshots/0fd973906684c6b70490ff138affa6178db8e3287691125107d13f5f228870e6/contract.json' with { type: 'json' }
import endContract from '../../snapshots/d2631dc71521defd432b76ae003227c3303deb9f37fb898c35dbb2ee74ecfee0/contract.json' with { type: 'json' }
import type { Contract as Start } from '../../snapshots/0fd973906684c6b70490ff138affa6178db8e3287691125107d13f5f228870e6/contract'
import type { Contract as End } from '../../snapshots/d2631dc71521defd432b76ae003227c3303deb9f37fb898c35dbb2ee74ecfee0/contract'

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract
  override readonly endContractJson = endContract

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'permission',
        columns: [
          col('code', 'text', {
            notNull: true,
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'text', {
            notNull: true,
            codecRef: { codecId: 'pg/text@1' },
          }),
        ],
        constraints: [primaryKey(['code'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'role_permission',
        columns: [
          col('permission_code', 'text', {
            notNull: true,
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('role', 'text', {
            notNull: true,
            codecRef: { codecId: 'pg/text@1' },
          }),
        ],
        constraints: [primaryKey(['role', 'permission_code'])],
      }),
      this.createIndex({
        schema: 'public',
        table: 'role_permission',
        index: 'role_permission_permission_code_idx_8904843b',
        columns: ['permission_code'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'role_permission',
        foreignKey: {
          name: 'role_permission_permission_code_fkey',
          columns: ['permission_code'],
          references: {
            schema: 'public',
            table: 'permission',
            columns: ['code'],
          },
          onDelete: 'restrict',
          onUpdate: 'cascade',
        },
      }),
    ]
  }
}

MigrationCLI.run(import.meta.url, M)
