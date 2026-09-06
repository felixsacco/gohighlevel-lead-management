// Read-only DB connectivity probe (no schema change, no data change).
// Tries the same endpoints/password strategy as run-migration.mjs so we know
// whether the approved job_reviews + jobs-column DDL can be applied from here.
'use strict';
import pg from 'pg';
const { Pool } = pg;
import { readFileSync } from 'fs';
import { resolve } from 'path';

const envPath = resolve(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      env[trimmed.substring(0, eqIdx).trim()] = trimmed.substring(eqIdx + 1).trim();
    }
  }
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;
const match = supabaseUrl?.match(/https:\/\/([a-z0-9]+)\.supabase\.co/);
const projectRef = match?.[1];
if (!projectRef) { console.error('!! cannot derive project ref'); process.exit(1); }
console.log('Project ref:', projectRef);

const pw = env.SUPABASE_DB_PASSWORD || supabaseKey;
const configs = [
  { label: 'Direct DB host (IPv4)', host: `db.${projectRef}.supabase.co`, port: 5432, database: 'postgres', user: 'postgres', password: pw },
  { label: 'Direct DB host (IPv6 force)', host: `db.${projectRef}.supabase.co`, port: 5432, database: 'postgres', user: 'postgres', password: pw, family: 6 },
  { label: 'Pooler (transaction 6543)', host: 'aws-0-eu-west-2.pooler.supabase.com', port: 6543, database: 'postgres', user: `postgres.${projectRef}`, password: supabaseKey },
  { label: 'Pooler (session 5432)', host: 'aws-0-eu-west-2.pooler.supabase.com', port: 5432, database: 'postgres', user: `postgres.${projectRef}`, password: supabaseKey },
];

let any = false;
for (const cfg of configs) {
  const { family, label, ...poolCfg } = cfg;
  if (family) poolCfg.family = family;
  const pool = new Pool({ ...poolCfg, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 8000 });
  try {
    const client = await pool.connect();
    console.log(`CONNECTED via: ${label} (${poolCfg.host}:${poolCfg.port})`);
    const ver = await client.query('SELECT version()');
    console.log('  server:', ver.rows[0].version.substring(0, 60));
    // existence probe only (no DDL)
    const tb = await client.query(`SELECT to_regclass('public.job_reviews') AS job_reviews, (SELECT count(*) FROM information_schema.columns WHERE table_schema='public' AND table_name='jobs' AND column_name IN ('is_flagged','is_completed','admin_notes','flag_reason','flagged_by','flagged_at','flagged_by_type','unflagged_by','unflagged_at','completed_at','completed_by')) AS new_jobs_cols`);
    console.log('  job_reviews table:', tb.rows[0].job_reviews || 'MISSING');
    console.log('  new jobs cols present:', tb.rows[0].new_jobs_cols, '/ 11');
    client.release();
    await pool.end();
    any = true;
    break;
  } catch (e) {
    console.log(`  failed: ${label} -> ${e.message?.substring(0, 160)}`);
    await pool.end().catch(() => {});
  }
}
if (!any) { console.log('\nNo DB connection succeeded from this environment.'); process.exit(1); }
