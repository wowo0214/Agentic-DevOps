#!/usr/bin/env -S bun
import type { Contract as End } from '../../snapshots/0374580a9ba88ea1728509300102b26dcc287dd778fdcef9266703ec253bedf6/contract';
import endContract from '../../snapshots/0374580a9ba88ea1728509300102b26dcc287dd778fdcef9266703ec253bedf6/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/673d7cf63d206d2045493b2aab127d48eccc3aa3829840f7c8f8c037fa4333e9/contract';
import startContract from '../../snapshots/673d7cf63d206d2045493b2aab127d48eccc3aa3829840f7c8f8c037fa4333e9/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  lit,
  primaryKey,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'conversation',
        columns: [
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('created_by', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('direct_key', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('title', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('type', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'conversation_shape_1e306abd',
            "(type = 'direct' AND direct_key IS NOT NULL AND length(btrim(direct_key)) > 0 AND title IS NULL) OR (type = 'group' AND direct_key IS NULL AND title IS NOT NULL AND length(btrim(title)) > 0)",
          ),
          checkExpression('conversation_type_check_142a40eb', `"type" IN ('direct', 'group')`),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'conversation_member',
        columns: [
          col('conversation_id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('joined_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('last_read_message_id', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('member_role', 'text', {
            notNull: true,
            default: lit('member'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('user_id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [
          primaryKey(['conversation_id', 'user_id']),
          checkExpression(
            'conversation_member_member_role_check_8a1d7bb3',
            `"member_role" IN ('owner', 'member')`,
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'message',
        columns: [
          col('client_message_id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('content', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('conversation_id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('created_at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('sender_id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'message_client_id_not_empty_56264250',
            'length(btrim(client_message_id)) > 0',
          ),
          checkExpression('message_content_not_empty_9b428f84', 'length(btrim(content)) > 0'),
        ],
      }),
      this.addUnique({
        schema: 'public',
        table: 'conversation',
        constraint: 'conversation_direct_key_key',
        columns: ['direct_key'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'message',
        constraint: 'message_conversation_id_id_key',
        columns: ['conversation_id', 'id'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'message',
        constraint: 'message_client_dedup',
        columns: ['conversation_id', 'sender_id', 'client_message_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'conversation',
        index: 'conversation_created_by_idx_e13bb8bf',
        columns: ['created_by'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'conversation_member',
        index: 'conversation_member_conversation_id_idx_0c3639df',
        columns: ['conversation_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'conversation_member',
        index: 'conversation_member_user_id_conversation_id_idx_d9ceba10',
        columns: ['user_id', 'conversation_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'conversation_member',
        index: 'conversation_member_user_id_idx_6c952402',
        columns: ['user_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'conversation_member',
        index: 'member_last_read_idx_ce681a0b',
        columns: ['conversation_id', 'last_read_message_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'message',
        index: 'message_conversation_id_created_at_id_idx_3c009cf9',
        columns: ['conversation_id', 'created_at', 'id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'message',
        index: 'message_conversation_id_idx_0c3639df',
        columns: ['conversation_id'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'message',
        index: 'message_sender_id_idx_311853a4',
        columns: ['sender_id'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'conversation',
        foreignKey: {
          name: 'conversation_created_by_fkey',
          columns: ['created_by'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
          onDelete: 'restrict',
          onUpdate: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'conversation_member',
        foreignKey: {
          name: 'conversation_member_conversation_id_fkey',
          columns: ['conversation_id'],
          references: { schema: 'public', table: 'conversation', columns: ['id'] },
          onDelete: 'restrict',
          onUpdate: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'conversation_member',
        foreignKey: {
          name: 'conversation_member_user_id_fkey',
          columns: ['user_id'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
          onDelete: 'restrict',
          onUpdate: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'conversation_member',
        foreignKey: {
          name: 'member_last_read_message_fkey',
          columns: ['conversation_id', 'last_read_message_id'],
          references: { schema: 'public', table: 'message', columns: ['conversation_id', 'id'] },
          onDelete: 'restrict',
          onUpdate: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'message',
        foreignKey: {
          name: 'message_conversation_id_fkey',
          columns: ['conversation_id'],
          references: { schema: 'public', table: 'conversation', columns: ['id'] },
          onDelete: 'restrict',
          onUpdate: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'message',
        foreignKey: {
          name: 'message_sender_id_fkey',
          columns: ['sender_id'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
          onDelete: 'restrict',
          onUpdate: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
