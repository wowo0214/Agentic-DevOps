import { Pool } from 'pg'
import { PERMISSIONS, ROLE_PERMISSIONS } from '../lib/permissions/catalog'

// Idempotent: makes permission / role_permission match the catalog for the roles it defines.
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const client = await pool.connect()
try {
  await client.query('BEGIN')
  const codes = Object.keys(PERMISSIONS)
  for (const [code, name] of Object.entries(PERMISSIONS)) {
    await client.query(
      'INSERT INTO permission (code, name) VALUES ($1, $2) ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name',
      [code, name],
    )
  }
  for (const [role, granted] of Object.entries(ROLE_PERMISSIONS)) {
    await client.query(
      'DELETE FROM role_permission WHERE role = $1 AND permission_code <> ALL($2::text[])',
      [role, granted],
    )
    await client.query(
      'INSERT INTO role_permission (role, permission_code) SELECT $1, unnest($2::text[]) ON CONFLICT DO NOTHING',
      [role, granted],
    )
  }
  await client.query(
    'DELETE FROM role_permission WHERE permission_code <> ALL($1::text[])',
    [codes],
  )
  await client.query('DELETE FROM permission WHERE code <> ALL($1::text[])', [
    codes,
  ])
  await client.query('COMMIT')
  console.log(
    `Synced ${codes.length} permissions for roles: ${Object.keys(ROLE_PERMISSIONS).join(', ')}`,
  )
} catch (error) {
  await client.query('ROLLBACK')
  throw error
} finally {
  client.release()
  await pool.end()
}
