import pg from 'pg';
const { Pool } = pg;
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Read .env.local manually
const envPath = resolve(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const key = trimmed.substring(0, eqIdx).trim();
      const val = trimmed.substring(eqIdx + 1).trim();
      env[key] = val;
    }
  }
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

const match = supabaseUrl.match(/https:\/\/([a-z0-9]+)\.supabase\.co/);
const projectRef = match?.[1];
console.log('Project ref:', projectRef);

const sqlPath = resolve(process.cwd(), 'sql', 'phase5-job-reference-seq.sql');
const sql = readFileSync(sqlPath, 'utf-8');

const configs = [
  {
    label: 'Direct DB host (IPv4)',
    host: `db.${projectRef}.supabase.co`,
    port: 5432,
    database: 'postgres',
    user: `postgres`,
    password: env.SUPABASE_DB_PASSWORD || supabaseKey,
  },
  {
    label: 'Direct DB host (IPv6 - force)',
    host: `db.${projectRef}.supabase.co`,
    port: 5432,
    database: 'postgres',
    user: `postgres`,
    password: env.SUPABASE_DB_PASSWORD || supabaseKey,
    family: 6,
  },
  {
    label: 'IPv4 evrybod-e pooler (transaction)',
    host: 'aws-0-eu-west-2.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: `postgres.${projectRef}`,
    password: supabaseKey,
  },
  {
    label: 'IPv4 evrybod-e pooler (session)',
    host: 'aws-0-eu-west-2.pooler.supabase.com',
    port: 5432,
    database: 'postgres',
    user: `postgres.${projectRef}`,
    password: supabaseKey,
  },
];

for (const cfg of configs) {
  const { family, label, ...poolCfg } = cfg;
  if (family) poolCfg.family = family;
  console.log(`\nTrying: ${label} (${poolCfg.host}:${poolCfg.port})`);
  const pool = new Pool({ ...poolCfg, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 10000 });
  try {
    const client = await pool.connect();
    console.log('  Connected!');
    const ver = await client.query('SELECT version()');
    console.log('  Server:', ver.rows[0].version.substring(0, 60));

    console.log('  Executing migration...');
    await client.query(sql);
    console.log('  Migration applied successfully!\n');

    console.log('  --- Verification ---');
    const result = await client.query(
      'SELECT id, reference_code FROM jobs ORDER BY created_at DESC LIMIT 5'
    );
    console.table(result.rows);

    client.release();
    await pool.end();
    process.exit(0);
  } catch (e) {
    console.log(`  Failed: ${e.message?.substring(0, 300)}`);
    await pool.end().catch(() => {});
  }
}

console.log('\nAll connection attempts failed.');
process.exit(1);
