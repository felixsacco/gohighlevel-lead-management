// Route-to-DB contract sweep.
//
// Statically extracts every Supabase table + column a route references, then
// probes each against the LIVE canonical schema via the service-role REST API.
// A column that returns 200 exists; a 400/42703 names a column the code uses
// that the schema does not provide; a 404/PGRST205 means the table itself is
// missing. This is the same authoritative probe technique used to prove the
// schema drift (quotes/request 503 <-> clients.first_name 42703).
//
// Scope: the four remaining endpoint areas (jobs, chat, transactions,
// lead-purchases) plus quotes/request. A route file is included if it sits in
// one of those route dirs OR references one of the six core canonical tables.
//
// Run: node scripts/route-contract-sweep.mjs
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const API = path.join(ROOT, 'app', 'api');

// ── env (never printed) ──────────────────────────────────────────────────────
function loadEnv(file) {
  const out = {};
  const txt = fs.readFileSync(path.join(ROOT, file), 'utf8');
  for (const raw of txt.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq < 0) continue;
    out[line.slice(0, eq).trim()] = line
      .slice(eq + 1)
      .trim()
      .replace(/^["']|["']$/g, '');
  }
  return out;
}
const env = loadEnv('.env.local');
const URL = env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) {
  console.error('!! NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing in .env.local');
  process.exit(1);
}

// ── file set ─────────────────────────────────────────────────────────────────
const CORE_RE =
  /\.from\(["'](jobs|chat_rooms|chat_messages|transactions|leads|lead_purchases)["']\)/;
const AREA_DIRS = ['jobs', 'chat', 'leads', 'payments'];

function walk(dir, acc) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (e.name === 'route.ts') acc.push(p);
  }
  return acc;
}
const allRoutes = walk(API, []);
const files = allRoutes.filter((p) => {
  const rel = path.relative(API, p).split(path.sep);
  if (rel[0] === 'quotes') return true; // quotes/request — already verified, keep for continuity
  if (AREA_DIRS.includes(rel[0])) return true;
  return CORE_RE.test(fs.readFileSync(p, 'utf8'));
});

// ── mini-lexer / method-call scanner ─────────────────────────────────────────
const FILTER_METHODS = new Set([
  'eq','neq','gt','gte','lt','lte','like','ilike','is','in','contains',
  'containedBy','overlaps','not','match','textSearch','order','cs','cd',
  'adj','ov','sl','sr','nxr','nxl',
]);
const OBJECT_METHODS = new Set(['insert', 'upsert', 'update', 'match', 'set']);

// Scan a source file, returning an array of {name, content} for every
// `.name(...)` method call whose parens close, skipping strings/comments.
function scanMethodCalls(src) {
  const calls = [];
  let i = 0;
  const n = src.length;
  let inLine = false;
  let inBlock = false;
  let inStr = null; // ' " `
  while (i < n) {
    const c = src[i];
    if (inLine) {
      if (c === '\n') inLine = false;
      i++;
      continue;
    }
    if (inBlock) {
      if (c === '*' && src[i + 1] === '/') { inBlock = false; i += 2; continue; }
      i++;
      continue;
    }
    if (inStr) {
      if (c === '\\') { i += 2; continue; }
      if (c === inStr) inStr = null;
      i++;
      continue;
    }
    if (c === '/' && src[i + 1] === '/') { inLine = true; i += 2; continue; }
    if (c === '/' && src[i + 1] === '*') { inBlock = true; i += 2; continue; }
    if (c === '"' || c === "'" || c === '`') { inStr = c; i++; continue; }
    // method call: .name(
    if (c === '.') {
      // Receiver token: the identifier (or ')' ']' quote) immediately left of
      // the dot. Used to tell `.storage.from('bucket')` (a Storage op) apart
      // from `.from('table')` (a PostgREST op).
      let rcvr = null;
      let r = i - 1;
      while (r >= 0 && /\s/.test(src[r])) r--;
      if (r >= 0 && /[A-Za-z0-9_$]/.test(src[r])) {
        let s = r;
        while (s >= 0 && /[A-Za-z0-9_$]/.test(src[s])) s--;
        rcvr = src.slice(s + 1, r + 1);
      } else if (r >= 0) {
        rcvr = src[r]; // ) ] } ' " `
      }
      let j = i + 1;
      while (j < n && /[A-Za-z0-9_$]/.test(src[j])) j++;
      if (j < n && src[j] === '(' && j > i + 1) {
        const name = src.slice(i + 1, j);
        const { end } = findClosing(src, j + 1, n);
        if (end > 0) {
          calls.push({ name, content: src.slice(j + 1, end), receiver: rcvr });
          i = end + 1;
          continue;
        }
      }
    }
    i++;
  }
  return calls;
}

// Find index just past the token that closes the paren opened at `start`,
// honoring strings, comments and nested brackets of all kinds.
function findClosing(src, start, n) {
  let depth = 1;
  let i = start;
  let inStr = null;
  let inBlock = false;
  while (i < n) {
    const c = src[i];
    if (inStr) {
      if (c === '\\') { i += 2; continue; }
      if (c === inStr) inStr = null;
      i++;
      continue;
    }
    if (inBlock) {
      if (c === '*' && src[i + 1] === '/') { inBlock = false; i += 2; continue; }
      i++;
      continue;
    }
    if (c === '/' && src[i + 1] === '*') { inBlock = true; i += 2; continue; }
    if (c === '"' || c === "'" || c === '`') { inStr = c; i++; continue; }
    if (c === '(' || c === '[' || c === '{') depth++;
    else if (c === ')' || c === ']' || c === '}') {
      depth--;
      if (depth === 0) return { end: i };
    }
    i++;
  }
  return { end: -1 };
}

// Read the first string-literal token in `s`. Returns {value, rest} or null.
function firstString(s) {
  let i = 0;
  const n = s.length;
  while (i < n && /\s/.test(s[i])) i++;
  if (i >= n) return null;
  const q = s[i];
  if (q !== '"' && q !== "'" && q !== '`') return null;
  let out = '';
  i++;
  while (i < n) {
    const c = s[i];
    if (c === '\\' && q !== '`') { out += s[i + 1] ?? ''; i += 2; continue; }
    if (c === q) return { value: out, rest: s.slice(i + 1) };
    out += c;
    i++;
  }
  return null;
}

// Parse a PostgREST select projection string into top-level column tokens and
// embedded-resource relations. Comma splitting is DEPTH-AWARE: the inner
// columns of an embedded group (jobs(id, trade, budget)) must not leak out as
// phantom parent columns, and only the pre-"(" relation name is an embedded
// resource. A trailing bare relation (e.g. "clients") is a plain column too.
function parseProjection(str) {
  const cols = [];
  for (const part of splitTop(str, 0)) {
    let raw = part.trim();
    if (!raw || raw === '*') continue;
    // opening paren at depth 0 => embedded resource: rel(...) | rel!hint(...) |
    // rel!inner(...) | rel(count) | rel(...):alias. Only the relation name is
    // a resource; its inner projection columns belong to the child table.
    const paren = topParen(raw);
    if (paren >= 0) {
      let rel = raw.slice(0, paren).trim();
      rel = rel.split('!')[0].split(':').pop().trim();
      rel = rel.split(/->>|->|\/|\./)[0].trim();
      if (rel && rel !== '*') cols.push({ embedded: rel });
      continue;
    }
    // alias:col | col:alias  -> keep the real column side
    if (raw.includes(':')) {
      const a = raw.split(':')[0].trim();
      const b = raw.split(':').slice(1).join(':').trim();
      raw = /^[A-Za-z_][A-Za-z0-9_]*$/.test(b) ? b : a;
    }
    // json-path operators and casts leave the base column name
    raw = raw.split(/->>|->|\/|::/)[0].trim();
    raw = raw.split('!')[0].trim();
    if (raw && raw !== '*') cols.push({ col: raw });
  }
  return cols;
}

// Index of the first '(' that sits at bracket depth 0 (outside { [ ( and
// strings) of `s`, or -1. Parens nested inside json operators are skipped.
function topParen(s) {
  let depth = 0;
  let inStr = null;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inStr) {
      if (c === '\\') { i++; continue; }
      if (c === inStr) inStr = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
    if (c === '{' || c === '[') depth++;
    else if (c === '}' || c === ']') depth--;
    else if (c === '(' && depth === 0) return i;
  }
  return -1;
}

// Top-level property keys of an object/array-of-objects literal. Returns null
// when `s` does not begin with a literal we can parse.
function objectKeys(s) {
  s = s.trim();
  if (s.startsWith('[')) {
    // union keys across array elements
    const parts = splitTop(s.slice(1, matchingBracket(s) - 1), 0);
    const union = new Set();
    for (const p of parts) {
      const ks = objectKeys(p);
      if (!ks) continue;
      for (const k of ks) union.add(k);
    }
    return [...union];
  }
  if (!s.startsWith('{')) return null;
  const inner = s.slice(1, matchingBracket(s) - 1);
  const parts = splitTop(inner, 0);
  const keys = [];
  for (const part of parts) {
    const colon = topColon(part);
    if (colon < 0) continue;
    let key = part.slice(0, colon).trim();
    if (
      (key.startsWith('"') && key.endsWith('"')) ||
      (key.startsWith("'") && key.endsWith("'"))
    ) key = key.slice(1, -1);
    if (/^[A-Za-z_][A-Za-z0-9_$]*$/.test(key) || /^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
      keys.push(key);
    }
  }
  return keys;
}

// Index just past the bracket that closes the one opened at 0 of `s`.
function matchingBracket(s) {
  const open = s[0];
  const close = open === '{' ? '}' : ']';
  let depth = 0;
  let inStr = null;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inStr) {
      if (c === '\\') { i++; continue; }
      if (c === inStr) inStr = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
    if (c === '{' || c === '[' || c === '(') depth++;
    else if (c === '}' || c === ']' || c === ')') {
      depth--;
      if (depth === 0) return i + 1;
    }
  }
  return s.length;
}

// Split `s` on commas that are not nested inside {}, [], () or a string.
function splitTop(s, _unused) {
  const parts = [];
  let depth = 0;
  let inStr = null;
  let cur = '';
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inStr) {
      cur += c;
      if (c === '\\') { cur += s[i + 1] ?? ''; i++; continue; }
      if (c === inStr) inStr = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { inStr = c; cur += c; continue; }
    if (c === '{' || c === '[' || c === '(') depth++;
    else if (c === '}' || c === ']' || c === ')') depth--;
    if (c === ',' && depth === 0) { parts.push(cur); cur = ''; continue; }
    cur += c;
  }
  if (cur.trim()) parts.push(cur);
  return parts;
}

// Index of the first top-level ':' (not inside brackets or a string).
function topColon(s) {
  let depth = 0;
  let inStr = null;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inStr) {
      if (c === '\\') { i++; continue; }
      if (c === inStr) inStr = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
    if (c === '{' || c === '[' || c === '(') depth++;
    else if (c === '}' || c === ']' || c === ')') depth--;
    if (c === ':' && depth === 0) return i;
  }
  return -1;
}

// ── per-file extraction ──────────────────────────────────────────────────────
// table -> Set(column); table -> Set(embeddedRel); plus unresolved object inserts.
function extractFile(file, report) {
  const src = fs.readFileSync(file, 'utf8');
  const rel = path.relative(API, file).replace(/\\/g, '/');
  const cols = new Map(); // table -> Set(col)
  const embedded = new Map(); // table -> Set(rel)
  const tablesReferenced = new Set();
  let current = null;

  for (const call of scanMethodCalls(src)) {
    const { name, content } = call;
    if (name === 'from') {
      // Storage buckets (supabase.storage.from('bucket')) are not PostgREST
      // tables and must not set the DB context for subsequent columns.
      if (call.receiver === 'storage') continue;
      const ts = firstString(content);
      current = ts ? ts.value.trim() : null;
      if (current) tablesReferenced.add(current);
      continue;
    }
    if (!current) continue;
    if (name === 'select') {
      const ts = firstString(content);
      if (!ts) continue; // bare .select()
      for (const tok of parseProjection(ts.value)) {
        if (tok.embedded) {
          if (!embedded.has(current)) embedded.set(current, new Set());
          embedded.get(current).add(tok.embedded);
        } else if (tok.col) {
          if (!cols.has(current)) cols.set(current, new Set());
          cols.get(current).add(tok.col);
        }
      }
      continue;
    }
    if (OBJECT_METHODS.has(name)) {
      const ks = objectKeys(content);
      if (!ks) continue; // variable ref / non-literal — not resolvable statically
      if (!cols.has(current)) cols.set(current, new Set());
      for (const k of ks) cols.get(current).add(k);
      continue;
    }
    if (FILTER_METHODS.has(name)) {
      const ts = firstString(content);
      if (!ts) continue;
      // .eq('col', ...) etc. — some filters (eq('tradespeople.id', x)) use a path
      let col = ts.value.trim();
      col = col.split(/[.\/]/)[0];
      if (!col) continue;
      if (!cols.has(current)) cols.set(current, new Set());
      cols.get(current).add(col);
      continue;
    }
  }

  for (const t of tablesReferenced) {
    if (!report.has(t)) {
      report.set(t, { columns: new Set(), embedded: new Set(), files: new Set() });
    }
    report.get(t).files.add(rel);
  }
  for (const [t, cs] of cols) {
    if (!report.has(t)) {
      report.set(t, { columns: new Set(), embedded: new Set(), files: new Set() });
      report.get(t).files.add(rel);
    }
    for (const c of cs) report.get(t).columns.add(c);
  }
  for (const [t, es] of embedded) {
    if (!report.has(t)) {
      report.set(t, { columns: new Set(), embedded: new Set(), files: new Set() });
      report.get(t).files.add(rel);
    }
    for (const e of es) report.get(t).embedded.add(e);
  }
}

const report = new Map(); // table -> { columns:Set, embedded:Set, files:Set }
for (const f of files) extractFile(f, report);

// ── probe live schema ────────────────────────────────────────────────────────
async function probeTable(table, cols, embedded) {
  const headers = { apikey: KEY, Authorization: `Bearer ${KEY}`, Accept: 'application/json' };
  const missing = [];
  const embeddedMissing = [];
  const list = [...cols];
  // A table referenced only via .insert({var}) / .from() with no literal column
  // still gets an existence probe; SELECT * also validates the table is real.
  if (!list.length) list.push('*');
  while (list.length) {
    const url = `${URL}/rest/v1/${table}?select=${encodeURIComponent(list.join(','))}`;
    const res = await fetch(url, { headers });
    if (res.status === 200) break;
    const body = await res.text();
    const code = /"code":"([^"]+)"/.exec(body)?.[1];
    if (code === '42703') {
      const m = /column\s+(\S+)\s+does not exist/.exec(body);
      if (!m) { missing.push(`<unparsable:${body.slice(0, 80)}>`); break; }
      // PostgREST qualifies the name ("column jobs.is_completed does not exist").
      // Normalise to the bare column so it can be matched/removed from our list.
      const raw = m[1];
      const cand = raw.includes('.') ? raw.slice(raw.lastIndexOf('.') + 1) : raw;
      if (cand.startsWith('<')) { missing.push(cand); break; }
      missing.push(cand);
      const idx = list.findIndex((c) => c === cand || c === raw || c.endsWith('.' + cand));
      if (idx >= 0) list.splice(idx, 1);
      else break; // unknown — avoid infinite loop
    } else if (res.status === 404 || code === 'PGRST205') {
      return { tableMissing: true, missing: [], embeddedMissing, code };
    } else {
      return { tableMissing: true, missing: [], embeddedMissing, code: code || String(res.status), body: body.slice(0, 120) };
    }
  }
  // Embedded-resource relations must exist as resolvable FKs. A bare
  // `select=*,rel(*)` returns 200 when the relationship resolves, else a 400.
  for (const rel of embedded) {
    const url = `${URL}/rest/v1/${table}?select=${encodeURIComponent('*, ' + rel + '(*)')}`;
    const res = await fetch(url, { headers });
    if (res.status === 200) continue;
    const body = await res.text();
    const code = /"code":"([^"]+)"/.exec(body)?.[1];
    const hint = /message":"([^"]+)/.exec(body)?.[1] || body.slice(0, 90);
    embeddedMissing.push({ rel, code: code || String(res.status), hint });
  }
  return { tableMissing: false, missing, embeddedMissing, code: null };
}

// ── report ───────────────────────────────────────────────────────────────────
(async () => {
  console.log(`Sweeping ${files.length} route files across ${report.size} referenced tables.\n`);
  const ordered = [...report.keys()].sort();
  const problems = [];
  const allOk = [];
  for (const table of ordered) {
    const meta = report.get(table);
    const cols = [...meta.columns].sort();
    const embedded = [...meta.embedded].sort();
    const { tableMissing, missing, embeddedMissing } = await probeTable(table, cols, embedded);
    if (tableMissing) {
      problems.push({ table, kind: 'TABLE', cols, embedded });
      console.log(`\n✗ TABLE ${table}  — MISSING / unreachable from code: [${embedded.join(', ')}${embedded.length && cols.length ? '; ' : ''}${cols.join(', ')}]`);
      console.log(`    used by: ${[...meta.files].join(', ')}`);
      continue;
    }
    const missingCols = missing.filter((m) => !m.startsWith('<'));
    const bad = cols.filter((c) => missingCols.includes(c));
    const badEmb = embeddedMissing.filter((e) => e); // {rel, code, hint}
    if (bad.length || badEmb.length) {
      problems.push({ table, kind: bad.length ? 'COLUMN' : 'EMBEDDED', bad, badEmb, cols, embedded });
      console.log(`\n✗ TABLE ${table}  — contract mismatch`);
      if (bad.length) {
        console.log(`    missing column(s): ${bad.join(', ')}`);
        console.log(`    full referenced column set: ${cols.join(', ')}`);
      }
      if (badEmb.length) {
        for (const e of badEmb) {
          console.log(`    embedded relation not resolvable: ${e.rel}  (${e.code}: ${e.hint})`);
        }
        console.log(`    referenced embedded relations: ${embedded.join(', ')}`);
      }
      console.log(`    used by: ${[...meta.files].join(', ')}`);
    } else {
      allOk.push({ table, cols: cols.length, embedded: embedded.length });
      console.log(`\n✓ TABLE ${table}  — ${cols.length} column(s) all present${embedded.length ? `, ${embedded.length} embedded resource(s) referenced` : ''}`);
    }
  }

  console.log('\n══════════════════════════════════════════════════');
  console.log(`PASS: ${allOk.length} tables fully canonical-compatible`);
  console.log(`FAIL: ${problems.length} table(s) with contract mismatches`);
  if (problems.length) {
    console.log('\nMismatches to reconcile:');
    for (const p of problems) {
      if (p.kind === 'TABLE') console.log(`  • TABLE  ${p.table}`);
      else if (p.kind === 'COLUMN') console.log(`  • COLUMN ${p.table}.${p.bad.join(` / ${p.table}.`)}`);
      else console.log(`  • EMBED  ${p.table} -> ${p.badEmb.map((e) => e.rel).join(' , ')}`);
    }
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
