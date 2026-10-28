#!/usr/bin/env -S bun
import {
  Migration,
  MigrationCLI,
  col,
  fn,
  primaryKey,
} from '@prisma/orm-postgres/migration'
import endContract from '../../snapshots/8448c46f7837cc158790645be0e1d06217f69fcbd2bd9e262e3acbe06b1a6fa0/contract.json' with { type: 'json' }
import startContract from '../../snapshots/d2631dc71521defd432b76ae003227c3303deb9f37fb898c35dbb2ee74ecfee0/contract.json' with { type: 'json' }
import type { Contract as End } from '../../snapshots/8448c46f7837cc158790645be0e1d06217f69fcbd2bd9e262e3acbe06b1a6fa0/contract'
import type { Contract as Start } from '../../snapshots/d2631dc71521defd432b76ae003227c3303deb9f37fb898c35dbb2ee74ecfee0/contract'

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract
  override readonly endContractJson = endContract

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'message_attachment',
        columns: [
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('file_name', 'text', {
            notNull: true,
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('id', 'text', {
            notNull: true,
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('message_id', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('mime_type', 'text', {
            notNull: true,
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('size', 'int4', {
            notNull: true,
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('uploader_id', 'text', {
            notNull: true,
            codecRef: { codecId: 'pg/text@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createIndex({
        schema: 'public',
        table: 'message_attachment',
        index: 'message_attachment_message_id_idx_8a7ff1ba',
        columns: ['message_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'message_attachment',
        index: 'message_attachment_uploader_id_idx_7e6af2c2',
        columns: ['uploader_id'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'message_attachment',
        foreignKey: {
          name: 'message_attachment_message_id_fkey',
          columns: ['message_id'],
          references: { schema: 'public', table: 'message', columns: ['id'] },
          onDelete: 'restrict',
          onUpdate: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'message_attachment',
        foreignKey: {
          name: 'message_attachment_uploader_id_fkey',
          columns: ['uploader_id'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
          onDelete: 'restrict',
          onUpdate: 'cascade',
        },
      }),
    ]
  }
}

MigrationCLI.run(import.meta.url, M)
