// scripts/scrub-plaintext-passwords.mjs — one-time scrub of legacy raw
// passwords out of the live database.
//
// Historical state: both `tradespeople.password_hash` and
// `clients.password_hash` were written with the raw password by client-side /
// pre-hashing code (see app/register/client, app/reset-password*, old
// register pages). New writes are scrypt hashes from lib/auth/password.ts;
// logins now verify against the hash. This script finds every remaining
// non-hash value, re-hashes it with the exact same scrypt format the login
// util understands, and overwrites it — permanently destroying the only
// recoverable copy of each password. That is the point.
//
// Deliberately conservative:
//   - Runs as a DRY RUN by default (prints counts, writes nothing).
//     Pass --apply to actually overwrite rows.
//   - Never prints a stored password value, only counts + (for unusual rows)
//     a masked email.
//   - Skips (never touches):
//       * any value already in scrypt format   -> already safe, idempotent
//       * 'ANONYMOUS_NOT_SET'                  -> sentinel for walk-in clients
//       * NULL / ''                            -> nothing to hash
//       * values > 128 chars                   -> not a real password; flag for
//                                                 manual review instead of bricking
//   - Idempotent: re-running after a successful --apply finds zero candidates.
//
// Uses the service-role key from .env.local over PostgREST (HTTP/443), the
// same path the read-only probes use. Service role bypasses RLS.

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

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
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      out[k] = v;
    }
  } catch (e) {
    console.error(`!! could not read ${file}: ${e.message}`);
  }
  return out;
}

const APPLY = process.argv.includes('--apply');

const env = loadEnv('.env.local');
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('!! NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing in .env.local');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// scrypt — parameters and stored format MUST mirror lib/auth/password.ts
// (scrypt$<N>$<r>$<p>$<saltHex>$<hashHex>, N=16384 r=8 p=1, 64-byte key,
// 16-byte salt). Any divergence would produce hashes the login route cannot
// verify.
// ---------------------------------------------------------------------------
const N = 16384;
const R = 8;
const P = 1;
const KEY_LEN = 64;
const SALT_BYTES = 16;

function scryptAsync(password, salt, keylen, opts) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, keylen, opts, (err, derived) =>
      err ? reject(err) : resolve(derived),
    );
  });
}

async function hashPassword(password) {
  const salt = crypto.randomBytes(SALT_BYTES);
  const derived = await scryptAsync(password, salt, KEY_LEN, { N, r: R, p: P });
  return ['scrypt', String(N), String(R), String(P), salt.toString('hex'), derived.toString('hex')].join('$');
}

// Skip classification helpers.
const SENTINEL = 'ANONYMOUS_NOT_SET';
const MAX_PASSWORD_LEN = 128;
const isScryptShape = (v) => typeof v === 'string' && v.startsWith('scrypt$');
// An scrypt$-prefixed value that is NOT 6 parts is anomalous — flag, never hash.
const isMalformedScrypt = (v) => isScryptShape(v) && v.split('$').length !== 6;

const TABLES = ['tradespeople', 'clients'];
const PAGE = 500;

const headers = { apikey: key, Authorization: `Bearer ${key}`, Accept: 'application/json' };

async function fetchAllRows(table) {
  const rows = [];
  let from = 0;
  for (;;) {
    const res = await fetch(`${url}/rest/v1/${table}?select=id,email,password_hash&order=id`, {
      headers: { ...headers, Range: `${from}-${from + PAGE - 1}` },
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`${table} fetch failed ${res.status}: ${body.slice(0, 300)}`);
    }
    const data = await res.json();
    rows.push(...data);
    if (!Array.isArray(data) || data.length < PAGE) break;
    from += PAGE;
  }
  return rows;
}

async function patchRow(table, id, passwordHash) {
  const res = await fetch(`${url}/rest/v1/${table}?id=eq.${id}`, {
    method: 'PATCH',
    headers: { ...headers, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify({ password_hash: passwordHash }),
  });
  if (!res.ok) {
    const body = await res.text();
    return { ok: false, error: `${res.status}: ${body.slice(0, 200)}` };
  }
  return { ok: true };
}

// Throttle so a bulk update doesn't hammer PostgREST.
async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

const maskEmail = (e) => (typeof e === 'string' && e.includes('@') ? e[0] + '***@' + e.split('@')[1] : '(none)');

(async () => {
  console.log(APPLY ? '*** APPLY MODE — hashes WILL be overwritten ***' : '*** DRY RUN — no writes ***');
  console.log('Project ref: ' + url.replace('https://', '').replace('.supabase.co', ''));
  console.log('');

  const summary = {};
  let totals = { migrated: 0, skippedScrypt: 0, skippedSentinel: 0, skippedEmpty: 0, skippedUnusual: 0, failed: 0 };

  for (const table of TABLES) {
    const rows = await fetchAllRows(table);
    const per = {
      migrated: [], sentinel: [], empty: [], scrypt: [], unusual: [], malformedScrypt: [],
    };
    for (const r of rows) {
      const v = r.password_hash;
      if (v == null || v === '') { per.empty.push(r); continue; }
      if (v === SENTINEL) { per.sentinel.push(r); continue; }
      if (isMalformedScrypt(v)) { per.unusual.push(r); per.unusual.labels = per.unusual.labels || []; per.unusual.labels.push(`${table}:${maskEmail(r.email)} (malformed scrypt prefix, len ${v.length})`); continue; }
      if (isScryptShape(v)) { per.scrypt.push(r); continue; }
      if (v.length > MAX_PASSWORD_LEN) { per.unusual.push(r); per.unusual.labels = per.unusual.labels || []; per.unusual.labels.push(`${table}:${maskEmail(r.email)} (len ${v.length})`); continue; }
      per.migrated.push(r);
    }

    summary[table] = per;
    totals.migrated += per.migrated.length;
    totals.skippedScrypt += per.scrypt.length;
    totals.skippedSentinel += per.sentinel.length;
    totals.skippedEmpty += per.empty.length;
    totals.skippedUnusual += per.unusual.length;

    console.log(`[${table}] total rows: ${rows.length}`);
    console.log(`   will migrate (legacy raw password): ${per.migrated.length}`);
    console.log(`   skip — already scrypt hash        : ${per.scrypt.length}`);
    console.log(`   skip — ANONYMOUS_NOT_SET sentinel  : ${per.sentinel.length}`);
    console.log(`   skip — empty/null                  : ${per.empty.length}`);
    console.log(`   REVIEW — >128 chars / malformed    : ${per.unusual.length}`);
    for (const lbl of (per.unusual.labels || []).slice(0, 10)) console.log(`      * ${lbl}`);
    console.log('');
  }

  if (totals.migrated === 0 && totals.skippedUnusual === 0) {
    console.log('No legacy plaintext candidates found. Nothing to do — already clean.');
    return;
  }

  console.log('TOTALS  ->');
  console.log(`   legacy plaintext to scrub : ${totals.migrated}`);
  console.log(`   already scrypt (safe)     : ${totals.skippedScrypt}`);
  console.log(`   sentinel kept             : ${totals.skippedSentinel}`);
  console.log(`   empty/null kept           : ${totals.skippedEmpty}`);
  console.log(`   unusual flagged for review: ${totals.skippedUnusual}`);

  if (!APPLY) {
    console.log('\nDRY RUN complete — nothing was written.');
    console.log('Re-run with --apply to scrub the legacy plaintext rows.');
    return;
  }

  if (totals.skippedUnusual > 0) {
    // Defensive gate: do not proceed to destroy values we flagged as unusual.
    console.log(`\nAborting APPLY: ${totals.skippedUnusual} unusual row(s) require manual review first.`);
    process.exit(2);
  }

  // Hash everything BEFORE writing anything, so a mid-run hash failure leaves
  // the DB untouched rather than half-scrubbed.
  console.log('\nHashing candidates in memory...');
  const jobs = [];
  for (const table of TABLES) {
    for (const r of summary[table].migrated) {
      try {
        const hash = await hashPassword(r.password_hash);
        jobs.push({ table, id: r.id, email: r.email, hash });
      } catch (e) {
        totals.failed++;
        console.error(`   !! hash failed for ${table}:${maskEmail(r.email)}: ${e.message}`);
      }
    }
  }
  console.log(`Prepared ${jobs.length} hashed update(s).`);

  const outcomes = await mapLimit(jobs, 5, async (j) => {
    const out = await patchRow(j.table, j.id, j.hash);
    if (!out.ok) {
      totals.failed++;
      console.error(`   !! update failed for ${j.table}:${maskEmail(j.email)}: ${out.error}`);
      return { ok: false };
    }
    return { ok: true };
  });

  const okCount = outcomes.filter((o) => o.ok).length;
  console.log(`\nApplied ${okCount}/${jobs.length} row(s).`);

  // Verification pass: recount candidates across both tables.
  console.log('\nVerification (post-apply) —');
  let remaining = 0;
  for (const table of TABLES) {
    const rows = await fetchAllRows(table);
    const cands = rows.filter(
      (r) => r.password_hash != null &&
        r.password_hash !== '' &&
        r.password_hash !== SENTINEL &&
        !isScryptShape(r.password_hash) &&
        r.password_hash.length <= MAX_PASSWORD_LEN,
    );
    remaining += cands.length;
    const scrypt = rows.filter((r) => isScryptShape(r.password_hash)).length;
    const sentinel = rows.filter((r) => r.password_hash === SENTINEL).length;
    console.log(`   ${table}: scrypt=${scrypt} sentinel=${sentinel} remainingPlaintext=${cands.length}`);
    for (const c of cands.slice(0, 5)) console.log(`      * still plaintext: ${maskEmail(c.email)}`);
  }
  console.log(remaining === 0 ? '\nSUCCESS: no legacy plaintext rows remain.' : `\nINCOMPLETE: ${remaining} plaintext row(s) remain.`);

  if (totals.failed > 0) process.exit(1);
})().catch((e) => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
