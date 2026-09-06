// Read-only RLS visibility probe (no writes, no DDL).
// Proves whether the ANON key can SELECT jobs whose status is OUTSIDE the live
// jobs RLS policy allow-set (is_approved=true OR status IN ('approved','open')).
// Service-role rows are used only to pick target ids; only id/status are read.
// Prints counts + id/status only. Never prints keys.
'use strict';

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');

function loadEnv(file) {
  const out = {};
  const txt = fs.readFileSync(path.join(root, file), 'utf8');
  for (const raw of txt.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq < 0) continue;
    out[line.slice(0, eq).trim()] = line.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
  }
  return out;
}

const env = loadEnv('.env.local');
const URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SRV = env.SUPABASE_SERVICE_ROLE_KEY;
const ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!URL || !SRV || !ANON) { console.error('!! missing env keys'); process.exit(1); }

const ALLOW = new Set(['approved', 'open']);

async function get(url, headers) {
  const res = await fetch(url, { headers });
  const body = await res.text();
  let json = null;
  try { json = JSON.parse(body); } catch { json = body; }
  return { status: res.status, json };
}

(async () => {
  const srvHeaders = { apikey: SRV, Authorization: `Bearer ${SRV}`, Accept: 'application/json' };
  const anonHeaders = { apikey: ANON, Authorization: `Bearer ${ANON}`, Accept: 'application/json' };

  // 1. service-role: status distribution (read-only)
  const { json: dist } = await get(`${URL}/rest/v1/jobs?select=status`, srvHeaders);
  const counts = {};
  const samples = {};
  if (Array.isArray(dist)) {
    for (const r of dist) {
      const s = r.status || 'null';
      counts[s] = (counts[s] || 0) + 1;
      if ((samples[s] || []).length < 2 && r.id) (samples[s] = samples[s] || []).push(r.id);
    }
  } else {
    console.log('service-role jobs read failed:', dist?.message || JSON.stringify(dist).slice(0, 200));
  }
  console.log('jobs status distribution (service role):', counts);

  const targets = [];
  for (const [s, ids] of Object.entries(samples)) {
    const policy = ALLOW.has(s);
    targets.push({ status: s, policy, ids });
  }

  console.log('\nanon visibility per status (read-only probe of up to 2 rows each):');
  for (const t of targets) {
    for (const id of t.ids) {
      const { status, json } = await get(`${URL}/rest/v1/jobs?select=id,status&id=eq.${id}`, anonHeaders);
      const got = Array.isArray(json) ? json.length : (status === 200 ? '?' : 'ERR:' + (json?.message || status));
      const marker = t.policy
        ? (got === 1 ? 'OK(policy-exposed)' : 'UNEXPECTED')
        : (got === 0 ? 'FILTERED(0 rows -> PGRST116 on .single())' : (status === 200 ? 'UNEXPECTED-visible' : 'ERR'));
      console.log(`  status=${String(t.status).padEnd(12)} anonRows=${String(got).padEnd(4)} ${marker}`);
    }
  }

  // 2. control: whole-table anon rowcount vs service-role rowcount
  const totalSrv = Array.isArray(dist) ? dist.length : '?';
  const anonAll = await get(`${URL}/rest/v1/jobs?select=id`, anonHeaders);
  const totalAnon = Array.isArray(anonAll.json) ? anonAll.json.length : (anonAll.status === 200 ? '?' : 'ERR');
  console.log(`\nwhole-table jobs visible: service=${totalSrv}, anon=${totalAnon}`);
  console.log('\nnote: any status outside the RLS allow-set returning 0 anon rows is a');
  console.log('silent-read block for every anon .single()/.eq() read of that job');
  console.log('(tradesperson dashboard, client dashboard, rate-tradesperson, flag list).');
})().catch((e) => { console.error(e); process.exit(1); });
