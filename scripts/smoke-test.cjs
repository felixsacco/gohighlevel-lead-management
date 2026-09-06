// End-to-end smoke test of POST /api/quotes/request against the running dev server.
// Uses Node 18+ global fetch (Node 22 confirmed). Safe: exercises only the auth
// error paths, so no DB rows are written and no notification emails are fired.
'use strict';

const BASE = process.env.SMOKE_BASE_URL || 'http://localhost:3000';

// A real client id and trade row are needed for the success path; both probes
// below deliberately stay on the rejection paths. Payload matches the fused
// route contract (camelCase, required fields present).
const PAYLOAD = {
  projectDescription: 'Emergency roof leak inspection after storm damage.',
  location: 'ST1 3HL',
  tradespersonId: '00000000-0000-0000-0000-000000000000',
  projectType: 'emergency',
  timeframe: 'asap',
  budget: '500-1000',
};

async function probe(label, token) {
  const t0 = Date.now();
  try {
    const res = await fetch(`${BASE}/api/quotes/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(PAYLOAD),
    });
    let body = null;
    const text = await res.text();
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
    const ms = Date.now() - t0;
    console.log(`\n[${label}]`);
    console.log(`  status: ${res.status}  (${ms}ms)`);
    console.log(`  body:   ${typeof body === 'string' ? body : JSON.stringify(body)}`);
    return { status: res.status, body };
  } catch (e) {
    console.log(`\n[${label}]`);
    console.log(`  ERROR: ${e.message}`);
    return { status: 0, body: null };
  }
}

(async () => {
  console.log(`Smoke test against ${BASE}/api/quotes/request`);
  console.log('Payload:', JSON.stringify(PAYLOAD, null, 2));

  // Probe 1: malformed token (fails CLIENT_TOKEN_RE) -> expect 401 requiresAuth.
  await probe('malformed token (expect 401 requiresAuth)', 'client_mock_token_test');

  // Probe 2: well-formed token shape but client uuid not in DB ->
  // expect 401 stale-session (proves auth reaches the PostgREST lookup).
  const fakeUuid = '00000000-0000-0000-0000-000000000000';
  const wellFormed = `client_${fakeUuid}_${Date.now()}`;
  await probe('well-formed token, unknown client (expect 401 stale-session)', wellFormed);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
