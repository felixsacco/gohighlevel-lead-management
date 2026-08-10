import http from 'http';
import https from 'https';

// 20 Representative URLs spanning all key route archetypes
const REPRESENTATIVE_PATHS = [
  // 1. Static Core Pages
  '/',
  '/find-tradespeople',
  '/instant-quote',
  '/post-job',
  '/for-tradespeople',
  '/how-it-works',
  '/blog',
  '/faq',
  '/locations',
  '/about',
  '/contact',
  '/privacy',
  '/terms',

  // 2. Programmatic Trade Pages (Canonical path under /find-tradespeople/)
  '/find-tradespeople/plumber',
  '/find-tradespeople/electrician',
  '/find-tradespeople/builder',

  // 3. Programmatic Trade + Location Pages (Canonical path under /find-tradespeople/)
  '/find-tradespeople/plumber/london',
  '/find-tradespeople/electrician/birmingham',
  '/find-tradespeople/builder/manchester',

  // 4. Blog Post Page
  '/blog/how-much-does-a-plumber-cost-london'
];

// Read target base URL from CLI args or default to local development port 3000
const TARGET_HOST = process.argv[2] || 'http://localhost:3000';
console.log(`\n🔍 STARTING CANONICAL TAG VERIFICATION AGAINST: ${TARGET_HOST}\n`);

function fetchHtml(urlStr: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const client = urlStr.startsWith('https') ? https : http;
    client.get(urlStr, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // Follow redirects once if redirect occurs
        const redirectUrl = res.headers.location.startsWith('http')
          ? res.headers.location
          : new URL(res.headers.location, urlStr).toString();
        fetchHtml(redirectUrl).then(resolve).catch(reject);
        return;
      }

      if (res.statusCode !== 200) {
        reject(new Error(`Failed to fetch ${urlStr}: Status code ${res.statusCode}`));
        return;
      }

      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => { resolve(data); });
    }).on('error', (err) => { reject(err); });
  });
}

function verifyCanonical(html: string, expectedPath: string): { success: boolean; found: string; error?: string } {
  // Regex to match canonical link element robustly (handles varied spacing and attributes ordering)
  const canonicalRegex = /<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i;
  const match = html.match(canonicalRegex);

  // Also support the reverse attributes order (href before rel)
  const reverseRegex = /<link\s+[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["'][^>]*>/i;
  const reverseMatch = match ? null : html.match(reverseRegex);

  const foundHref = match ? match[1] : (reverseMatch ? reverseMatch[1] : '');

  if (!foundHref) {
    return { success: false, found: '', error: 'No canonical tag found in HTML head!' };
  }

  // Expect absolute URL starting with production domain https://myapproved.com
  const expectedUrl = `https://myapproved.com${expectedPath}`;
  const success = foundHref === expectedUrl;

  return { success, found: foundHref };
}

async function runVerification() {
  let passedCount = 0;
  let failedCount = 0;
  const failures: string[] = [];

  for (const path of REPRESENTATIVE_PATHS) {
    const testUrl = `${TARGET_HOST.replace(/\/$/, '')}${path}`;
    try {
      const html = await fetchHtml(testUrl);
      const result = verifyCanonical(html, path);

      if (result.success) {
        console.log(`✅ [PASS] Path: "${path}"`);
        console.log(`   └─ Found: "${result.found}" (Matches expected canonical)\n`);
        passedCount++;
      } else {
        console.log(`❌ [FAIL] Path: "${path}"`);
        console.log(`   ├─ Expected: "https://myapproved.com${path}"`);
        console.log(`   ├─ Found:    "${result.found}"`);
        if (result.error) console.log(`   ├─ Error:    ${result.error}`);
        console.log(`   └─ Status:   Canonical tag mismatch!\n`);
        failedCount++;
        failures.push(path);
      }
    } catch (err: any) {
      console.log(`❌ [ERROR] Could not fetch "${path}"`);
      console.log(`   └─ Error: ${err.message}\n`);
      failedCount++;
      failures.push(`${path} (Fetch error: ${err.message})`);
    }
  }

  console.log(`📊 VERIFICATION REPORT SUMMARY:`);
  console.log(`   └─ Total Verified: ${REPRESENTATIVE_PATHS.length} pages`);
  console.log(`   └─ Passed:         ${passedCount}`);
  console.log(`   └─ Failed:         ${failedCount}\n`);

  if (failedCount > 0) {
    console.log(`🚨 CANONICAL VERIFICATION FAILED FOR THE FOLLOWING PATHS:`);
    failures.forEach(f => console.log(`   - ${f}`));
    process.exit(1);
  } else {
    console.log(`🎉 ALL CANONICAL TAGS SUCCESSFULLY VERIFIED!`);
    process.exit(0);
  }
}

runVerification();
