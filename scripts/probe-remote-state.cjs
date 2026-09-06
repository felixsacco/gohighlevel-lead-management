// Read-only probe of the live Supabase project's table state.
// Uses the service-role key from .env.local via PostgREST (count=exact).
// Prints ONLY existence + row counts per table. Never prints the key.
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function loadEnv(file) {
  const out = {};
  try {
    const txt = fs.readFileSync(path.join(root, file), 'utf8');
    for (const raw of txt.split(/\r?\n/)) {
      const line = raw.trim();
      if (!line || line.startsWith('#')) continue;
      const eq = line.indexOf('=');
      if (eq < 0) continue;
      let k = line.slice(0, eq).trim();
      let v = line.slice(eq + 1).trim();
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1);
      }
      out[k] = v;
    }
  } catch (e) {
    console.error(`!! could not read ${file}: ${e.message}`);
  }
  return out;
}

const env = loadEnv('.env.local');
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    '!! NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing in .env.local'
  );
  process.exit(1);
}

// Base tables the consolidated schema provisions (from sql/master-consolidated.sql header).
const TABLES = [
  'clients',
  'tradespeople',
  'documents',
  'jobs',
  'leads',
  'lead_purchases',
  'job_applications',
  'chat_rooms',
  'chat_messages',
  'notification_logs',
  'scheduled_notifications',
  'support_tickets',
  'admin_activity_log',
  'postcode_cache',
  'places_cache',
  'outreach_prospects',
  'transactions',
];

(async () => {
  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    Prefer: 'count=exact',
    Range: '0-0',
    Accept: 'application/json',
  };
  const rows = [];
  for (const t of TABLES) {
    try {
      const res = await fetch(`${url}/rest/v1/${t}?select=*`, { headers });
      const cr = res.headers.get('content-range') || '';
      let total = 'n/a';
      const ranged = /^\d+-\d+\/(\d+)$/.exec(cr);
      if (cr.endsWith('/0')) total = '0';
      else if (ranged) total = ranged[1];
      else if (res.status === 200) total = '?';

      if (res.status === 200) {
        rows.push(`${t.padEnd(24)} EXISTS   rows=${total}`);
      } else if (res.status === 404) {
        rows.push(`${t.padEnd(24)} MISSING (404)`);
      } else {
        const body = await res.text();
        const code = /"code":"([^"]+)"/.exec(body)?.[1] || String(res.status);
        rows.push(`${t.padEnd(24)} ${res.status} code=${code}`);
      }
    } catch (e) {
      rows.push(`${t.padEnd(24)} ERROR ${e.message}`);
    }
  }
  console.log(rows.join('\n'));
  console.log(
    '\nProject ref: ' + (url.replace('https://', '').replace('.supabase.co', '') || url)
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
