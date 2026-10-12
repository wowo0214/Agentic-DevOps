#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/844f47b52a1094d838a150ecb50e0210b108e94a0308b1e29c0736e0aa79c055/contract';
import endContractJson from '../../snapshots/844f47b52a1094d838a150ecb50e0210b108e94a0308b1e29c0736e0aa79c055/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/e27869d6512e402ca7d95b69d2336ed5a0acad13b1819ac37a8f51b6d38095a0/contract';
import startContract from '../../snapshots/e27869d6512e402ca7d95b69d2336ed5a0acad13b1819ac37a8f51b6d38095a0/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';
import postgresAdapter from '@prisma/orm-postgres/adapter/runtime';
import { sql } from '@prisma/orm-postgres/builder/runtime';
import { createExecutionContext, createSqlExecutionStack } from '@prisma/orm-postgres/family-runtime';
import postgresTarget, { PostgresContractSerializer } from '@prisma/orm-postgres/target/runtime';

const endContract = new PostgresContractSerializer().deserializeContract<End>(endContractJson);
const stack = createSqlExecutionStack({ target: postgresTarget, adapter: postgresAdapter });
const db = sql<End>({
  context: createExecutionContext({ contract: endContract, stack }),
  rawCodecInferer: stack.adapter.rawCodecInferer,
});

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContractJson;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('phone', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.dataTransform(endContract, 'backfill-user-phone', {
        check: () => db.public.user
          .select('id')
          .where((f, fns) => fns.eq(f.phone, null))
          .limit(1),
        run: () => db.public.user
          .update({ phone: '+18507644692' })
          .where((f, fns) => fns.eq(f.phone, null)),
      }),
      this.setNotNull({ schema: 'public', table: 'user', column: 'phone' }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
