#!/usr/bin/env -S node
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration'
import endContract from '../../snapshots/31e9f1d26e4870e28623187d33d5bf3b513f539a6696c1c6a44ae895ccd8e3dd/contract.json' with { type: 'json' }
import startContract from '../../snapshots/844f47b52a1094d838a150ecb50e0210b108e94a0308b1e29c0736e0aa79c055/contract.json' with { type: 'json' }
import type { Contract as End } from '../../snapshots/31e9f1d26e4870e28623187d33d5bf3b513f539a6696c1c6a44ae895ccd8e3dd/contract'
import type { Contract as Start } from '../../snapshots/844f47b52a1094d838a150ecb50e0210b108e94a0308b1e29c0736e0aa79c055/contract'

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract
  override readonly endContractJson = endContract

  override get operations() {
    return [
      this.dropNotNull({ schema: 'public', table: 'user', column: 'phone' }),
    ]
  }
}

MigrationCLI.run(import.meta.url, M)
