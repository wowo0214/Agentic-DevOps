#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/31e9f1d26e4870e28623187d33d5bf3b513f539a6696c1c6a44ae895ccd8e3dd/contract';
import startContract from '../../snapshots/31e9f1d26e4870e28623187d33d5bf3b513f539a6696c1c6a44ae895ccd8e3dd/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/673d7cf63d206d2045493b2aab127d48eccc3aa3829840f7c8f8c037fa4333e9/contract';
import endContract from '../../snapshots/673d7cf63d206d2045493b2aab127d48eccc3aa3829840f7c8f8c037fa4333e9/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, lit } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'session',
        column: col('impersonatedBy', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('banExpires', 'timestamptz', {
          codecRef: { codecId: 'pg/timestamptz-string@1' },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('banReason', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('banned', 'bool', { default: lit(false), codecRef: { codecId: 'pg/bool@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('isAnonymous', 'bool', { codecRef: { codecId: 'pg/bool@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('role', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
