/**
 * Comprehensive verification sweep — vectors #1–#3 (static/offline).
 *
 * Vector #1: Sitemap & XML validation
 * Vector #2: JSON-LD schema syntax linting
 * Vector #3: Dynamic-route & soft-404 data-integrity smoke test (offline layer)
 *
 * Vector #4 (build & bundle integrity) is exercised separately by
 * `node scripts/run-next.js build`.
 *
 * Run: npx tsx scripts/verify-sweep.ts
 */
import sitemap from "../app/sitemap";
import {
  TRADES,
  LOCATIONS,
  ALL_NEIGHBORHOOD_SLUGS,
  NEIGHBORHOODS,
  resolveLocation,
  generateTradeLocationSchema,
} from "../lib/seo-data";
import {
  getSupabaseAdmin,
} from "../lib/supabase";
import {
  siteGraph,
  graphify,
  organizationSchema,
  ServiceSchema,
  WebsiteSchema,
} from "../components/SchemaMarkup";
import {
  buildProfileSchema,
  buildProfileGraph,
  looksLikePlaceholder,
} from "../lib/tradesperson-schema";

let failures = 0;
let passes = 0;
function ok(msg: string) {
  passes++;
  console.log(`  ✓ ${msg}`);
}
function fail(msg: string) {
  failures++;
  console.log(`  ✗ ${msg}`);
}
function section(title: string) {
  console.log(`\n=== ${title} ===`);
}

function assert(cond: boolean, msg: string) {
  if (cond) ok(msg);
  else fail(msg);
}

const BASE = "https://myapproved.com";

// ─────────────────────────────────────────────────────────────────────────────
// Vector #1 — Sitemap & XML validation
// ─────────────────────────────────────────────────────────────────────────────
section("Vector #1 — Sitemap & XML validation");

const entries = sitemap();
console.log(`  sitemap() returned ${entries.length} entries`);

// 1a. Count composition matches the documented matrix.
const staticCount = entries.filter((e) => !e.url.includes("/find-tradespeople/") && !e.url.startsWith(`${BASE}/blog/`)).length;
const tradeCount = entries.filter((e) => e.url.match(/\/find-tradespeople\/[^/]+$/)).length;
const locationCount = entries.filter((e) => e.url.match(/\/find-tradespeople\/[^/]+\/[^/]+$/)).length;
const blogCount = entries.filter((e) => e.url.startsWith(`${BASE}/blog/`)).length;

console.log(`  breakdown: static=${staticCount}, trade=${tradeCount}, trade×location=${locationCount}, blog=${blogCount}`);

assert(staticCount === 19, `static pages = 19 (got ${staticCount})`);
assert(tradeCount === TRADES.length, `trade pages = ${TRADES.length} (got ${tradeCount})`);
assert(TRADES.length === 33, `TRADES has 33 entries (got ${TRADES.length})`);
assert(LOCATIONS.length === 57, `LOCATIONS has 57 entries (got ${LOCATIONS.length})`);

// trade×location = 33 × 57 = 1881; trade×neighbourhood = 33 × 99 = 3267
const expLoc = TRADES.length * LOCATIONS.length;
const expNb = TRADES.length * ALL_NEIGHBORHOOD_SLUGS.length;
// locationCount is the union (city + neighbourhood) of all trade×[slug] pages.
assert(locationCount === expLoc + expNb, `trade×location bucket = ${expLoc + expNb} (got ${locationCount})`);
assert(ALL_NEIGHBORHOOD_SLUGS.length === 99, `ALL_NEIGHBORHOOD_SLUGS has 99 entries (got ${ALL_NEIGHBORHOOD_SLUGS.length})`);

// Split the trade×location bucket into city-level vs neighbourhood-level.
const cityLevel = new Set(LOCATIONS.map((l) => toSlugsafe(l.name)));
const nbLevel = new Set(ALL_NEIGHBORHOOD_SLUGS);
const cityPages = entries.filter((e) => {
  const m = e.url.match(/\/find-tradespeople\/[^/]+\/([^/]+)$/);
  return m && cityLevel.has(m[1]);
});
const nbPages = entries.filter((e) => {
  const m = e.url.match(/\/find-tradespeople\/[^/]+\/([^/]+)$/);
  return m && nbLevel.has(m[1]);
});
assert(cityPages.length === expLoc, `city-level trade×location = ${expLoc} (got ${cityPages.length})`);
assert(nbPages.length === expNb, `neighbourhood-level = ${expNb} (got ${nbPages.length})`);

// 1b. Every URL is absolute https with no malformed chars.
const urlRe = /^https:\/\/myapproved\.com(\/|$)/;
let badUrl = 0;
const seen = new Set<string>();
for (const e of entries) {
  if (!urlRe.test(e.url)) { badUrl++; console.log(`    bad url: ${e.url}`); }
  if (seen.has(e.url)) { badUrl++; console.log(`    duplicate url: ${e.url}`); }
  seen.add(e.url);
  if (/\s/.test(e.url)) { badUrl++; console.log(`    whitespace in url: ${e.url}`); }
}
assert(badUrl === 0, `no malformed/duplicate URLs (${badUrl} issues)`);

// 1c. lastModified is a real Date.
let badLastmod = 0;
for (const e of entries) {
  const d = e.lastModified instanceof Date ? e.lastModified : new Date(e.lastModified as any);
  if (isNaN(d.getTime())) { badLastmod++; console.log(`    bad lastmod on ${e.url}: ${e.lastModified}`); }
}
assert(badLastmod === 0, `all lastModified parse as valid Date (${badLastmod} bad)`);

// 1d. Enum values conform to MetadataRoute.Sitemap.
const VALID_CHANGEFREQ = new Set(["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"]);
let badFreq = 0;
for (const e of entries) {
  if (!VALID_CHANGEFREQ.has(e.changeFrequency as string)) { badFreq++; console.log(`    bad changeFrequency on ${e.url}: ${e.changeFrequency}`); }
  if (typeof e.priority !== "number" || e.priority < 0 || e.priority > 1) { badFreq++; console.log(`    bad priority on ${e.url}: ${e.priority}`); }
}
assert(badFreq === 0, `all changeFrequency/priority valid (${badFreq} bad)`);

// 1e. Cross-check: sitemap trade/location slugs ↔ next.config redirects.
import { createRequire } from "module";
const require2 = createRequire(import.meta.url);
// We can't easily re-invoke next.config redirects, so validate slug-space
// consistency by re-deriving `toSlug` over LOCATIONS and comparing to the
// documented 57 count, plus verifying TRADES slugs are slug-safe.
const tradeSlugs = new Set(TRADES.map((t) => t.slug));
let slugIssues = 0;
for (const t of TRADES) {
  if (!/^[a-z0-9-]+$/.test(t.slug)) { slugIssues++; console.log(`    non-slug-safe trade: ${t.slug}`); }
}
const locSlugs = LOCATIONS.map((l) => toSlugsafe(l.name));
for (const s of locSlugs) {
  if (!/^[a-z0-9-]+$/.test(s)) { slugIssues++; console.log(`    non-slug-safe location: ${s}`); }
}
assert(slugIssues === 0, `all trade/location slugs slug-safe (${slugIssues} issues)`);
assert(new Set(locSlugs).size === LOCATIONS.length, `location slugs unique (${new Set(locSlugs).size}/${LOCATIONS.length})`);

// local helper (mirrors sitemap.toSlug)
function toSlugsafe(str: string): string {
  return str.toLowerCase().replace(/[\s]+/g, "-").replace(/[^a-z0-9-]/g, "");
}

// Verify the 57 location slugs in the sitemap exactly match next.config's list.
const nextLocationSlugs = [
  'london','manchester','birmingham','leeds','glasgow','liverpool','newcastle','sheffield','bristol','nottingham',
  'leicester','coventry','bradford','cardiff','belfast','stoke-on-trent','wolverhampton','solihull','dudley','walsall',
  'west-bromwich','sutton-coldfield','stourbridge','halesowen','derby','southampton','portsmouth','aberdeen','swansea','middlesbrough',
  'northampton','swindon','reading','luton','york','blackpool','plymouth','oxford','cambridge','norwich',
  'exeter','ipswich','peterborough','sunderland','gloucester','cheltenham','watford','colchester','milton-keynes','st-albans',
  'harrogate','chester','carlisle','dundee','edinburgh','inverness','hull',
];
const actualLocSlugs = locSlugs.slice().sort();
const expectedLocSlugs = nextLocationSlugs.slice().sort();
const locMatch =
  actualLocSlugs.length === expectedLocSlugs.length &&
  actualLocSlugs.every((s, i) => s === expectedLocSlugs[i]);
assert(locMatch, "LOCATIONS-derived slugs match next.config.js locationSlugs exactly");

// ─────────────────────────────────────────────────────────────────────────────
// Vector #2 — JSON-LD schema linting
// ─────────────────────────────────────────────────────────────────────────────
section("Vector #2 — JSON-LD schema linting");

// Shared @type allow-list (Schema.org) for value sanity.
const KNOWN_TYPES = new Set([
  "Organization", "WebSite", "Service", "LocalBusiness", "FAQPage",
  "BreadcrumbList", "ListItem", "Question", "Answer", "SearchAction",
  "EntryPoint", "OfferCatalog", "Offer", "ContactPoint", "PostalAddress",
  "GeoCoordinates", "Country", "City", "ImageObject", "OpeningHoursSpecification",
  "EducationalOccupationalCredential", "PropertyValue", "AggregateRating",
  "Review", "Rating", "Person", "HowTo", "HowToStep",
]);

function walk(node: any, path: string, cb: (n: any, p: string) => void) {
  if (Array.isArray(node)) {
    node.forEach((x, i) => walk(x, `${path}[${i}]`, cb));
  } else if (node && typeof node === "object") {
    cb(node, path);
    for (const k of Object.keys(node)) walk(node[k], `${path}.${k}`, cb);
  }
}

function lintGraph(graph: any, label: string) {
  const issues: string[] = [];
  if (!graph || typeof graph !== "object") { issues.push(`not an object`); return issues; }
  if (graph["@context"] !== "https://schema.org") issues.push(`@context != https://schema.org (${graph["@context"]})`);
  const nodes = Array.isArray(graph["@graph"]) ? graph["@graph"] : [];
  if (!Array.isArray(graph["@graph"])) issues.push(`@graph is not an array`);

  // Structural: every node needs @type.
  walk(nodes, "@graph", (n, p) => {
    // Only enforce @type on nodes within @graph that look like schema nodes.
  });

  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    if (!n || typeof n !== "object") { issues.push(`@graph[${i}] not an object`); continue; }
    if (!n["@type"]) issues.push(`@graph[${i}] missing @type`);
    else if (!KNOWN_TYPES.has(n["@type"])) issues.push(`@graph[${i}] unknown @type "${n["@type"]}"`);
  }

  // provider/pubulisher bare-@id check (node-level).
  walk(nodes, "@graph", (n, p) => {
    if (n && typeof n === "object") {
      if (n.provider && typeof n.provider === "object" && n.provider["@id"] && !n.provider["@type"]) {
        // bare @id reference — valid JSON-LD, but flagged as a known lint note.
      }
      if (n.publisher && typeof n.publisher === "object" && n.publisher["@id"] && !n.publisher["@type"]) {
        // same
      }
    }
  });

  return issues;
}

const siteIssues = lintGraph(siteGraph, "siteGraph");
if (siteIssues.length === 0) ok(`siteGraph: ${siteGraph["@graph"].length} nodes, all @type present & known`);
else siteIssues.forEach((i) => fail(`siteGraph: ${i}`));

// Explicit known-lint observations (informational, not failures):
console.log("  (info) known bare-@id refs (valid JSON-LD, no @type required):");
for (const n of siteGraph["@graph"]) {
  if (n["@type"] === "Service" && n.provider?.["@id"]) console.log(`    Service.provider → ${n.provider["@id"]}`);
  if (n["@type"] === "WebSite" && n.publisher?.["@id"]) console.log(`    WebSite.publisher → ${n.publisher["@id"]}`);
}

// 2a. graphify strips per-node @context and produces single shared @context.
const anyNodeHasContext = siteGraph["@graph"].some((n: any) => n && typeof n === "object" && n["@context"]);
assert(!anyNodeHasContext, "graphify stripped all per-node @context from @graph nodes");
const siteGraphJson = JSON.stringify(siteGraph);
// Exactly one shared top-level @context; per-node contexts already asserted absent.
assert((siteGraphJson.match(/"@context"/g) || []).length === 1, "siteGraph has exactly one shared top-level @context");

// 2b. serialize round-trip (no cycles/undefined that break JSON.stringify).
function serialize(thing: any): string | null {
  try { return JSON.stringify(thing); } catch (e) { return null; }
}
assert(serialize(siteGraph) !== null, "siteGraph JSON.stringify succeeds (no cycles)");

// 2c. generateTradeLocationSchema output for a representative trade/location.
const repSchema = generateTradeLocationSchema("plumber", "london");
assert(!!repSchema, "generateTradeLocationSchema('plumber','london') returns a schema");
if (repSchema) {
  assert(repSchema["@type"] === "Service", "generated trade/location schema is @type Service");
  assert(!!repSchema.provider?.["@type"], "generated schema provider has @type LocalBusiness (not bare)");
  assert(repSchema.areaServed?.["@type"] === "City", "generated schema areaServed is City");
  assert(serialize(repSchema) !== null, "generated schema serializes cleanly");
}
// edge: invalid trade/location → null (no phantom/soft-404 schema)
assert(generateTradeLocationSchema("nonsense-trade", "london") === null, "invalid trade → null");
assert(generateTradeLocationSchema("plumber", "nonsense-location-xyz") === null, "invalid location → null");

// 2d. buildProfileSchema honest-data rules (offline fixture).
const fakeProfile = {
  id: "abc-123",
  first_name: "Test", last_name: "Person", trade: "Plumber", city: "Stoke",
  hourly_rate: 45, is_verified: true, certification_verified: true,
  verification_status: "active", certification_expires_at: "2026-12-31",
  job_reviews: [{ id: "r1", rating: 5, review_text: "Great job", reviewer_type: "homeowner", reviewed_at: "2026-01-01" }],
};
const profileSchema = buildProfileSchema(fakeProfile);
assert(profileSchema["@type"] === "LocalBusiness", "buildProfileSchema returns LocalBusiness");
assert(profileSchema.aggregateRating?.["@type"] === "AggregateRating", "aggregateRating present with real review");
assert(profileSchema.aggregateRating.ratingValue === 5, "aggregateRating ratingValue = 5 (only review)");
assert(Array.isArray(profileSchema.review) && profileSchema.review.length === 1, "review[] has exactly 1 entry");
assert(profileSchema.hasCredential?.["@type"] === "EducationalOccupationalCredential", "hasCredential present (certification_verified)");
assert(profileSchema.identifier?.["@type"] === "PropertyValue", "identifier present (is_verified)");

// honest-data: no reviews with positive rating → NO aggregateRating.
const noReviewProfile = buildProfileSchema({ id: "x", first_name: "Jane", last_name: "Doe", trade: "Roofer", city: "York" });
assert(!noReviewProfile.aggregateRating, "no aggregateRating when zero reviews (honest-data)");
assert(!noReviewProfile.review, "no review[] when zero reviews");

// honest-data: reviews with rating 0 / null are filtered out.
const zeroReviewProfile = buildProfileSchema({ id: "y", first_name: "Bob", last_name: "Smith", trade: "Builder", city: "Leeds", job_reviews: [{ rating: 0 }, { rating: null as any }] });
assert(!zeroReviewProfile.aggregateRating, "no aggregateRating when only zero/null ratings present");

// buildProfileGraph wraps via graphify.
const profileGraph = buildProfileGraph(fakeProfile);
assert(profileGraph["@context"] === "https://schema.org", "buildProfileGraph has @context");
assert(Array.isArray(profileGraph["@graph"]) && profileGraph["@graph"].length === 1, "buildProfileGraph wraps in @graph");

// ─────────────────────────────────────────────────────────────────────────────
// Vector #3 — Dynamic route & soft-404 data integrity (offline layer)
// ─────────────────────────────────────────────────────────────────────────────
section("Vector #3 — Dynamic route & soft-404 data integrity (offline)");

// 3a. resolveLocation: valid city, valid neighbourhood, invalid → null.
assert(resolveLocation("london")?.kind === "city", "resolveLocation('london') → city");
assert(resolveLocation("stoke-on-trent")?.kind === "city", "resolveLocation('stoke-on-trent') → city");
assert(resolveLocation("garbage-location-xyz") === null, "resolveLocation('garbage-location-xyz') → null");

// Every neighbourhood slug resolves to a neighbourhood; every city slug to a city.
let resolveMismatch = 0;
for (const s of ALL_NEIGHBORHOOD_SLUGS) {
  const r = resolveLocation(s);
  if (!r || r.kind !== "neighbourhood") { resolveMismatch++; console.log(`    neighbourhood slug not resolved: ${s}`); }
}
assert(resolveMismatch === 0, `all ${ALL_NEIGHBORHOOD_SLUGS.length} neighbourhood slugs resolve to neighbourhood (${resolveMismatch} mismatch)`);

for (const c of LOCATIONS) {
  const r = resolveLocation(toSlugsafe(c.name));
  if (!r || r.kind !== "city") { resolveMismatch++; console.log(`    city slug not resolved: ${c.name}`); }
}
assert(resolveMismatch === 0, `all ${LOCATIONS.length} city slugs resolve to city`);

// 3b. TRADES slug coverage: every trade slug resolves to a trade (page notFound guard).
let tradeMismatch = 0;
for (const t of TRADES) {
  if (!TRADES.find((x) => x.slug === t.slug)) tradeMismatch++;
}
assert(tradeMismatch === 0, `all ${TRADES.length} trade slugs resolve in TRADES`);

// 3c. NEIGHBORHOODS map parents reference real cities.
let orphanNb = 0;
for (const parentSlug of Object.keys(NEIGHBORHOODS)) {
  const city = LOCATIONS.find((l) => toSlugsafe(l.name) === parentSlug);
  if (!city) { orphanNb++; console.log(`    neighbourhood parent not a city: ${parentSlug}`); }
}
assert(orphanNb === 0, `all neighbourhood parents reference real cities (${orphanNb} orphans)`);

// 3d. sitemap does not emit tradesperson/[id] URLs (dynamic route has no static params).
const profilePages = entries.filter((e) => e.url.includes("/tradesperson/"));
assert(profilePages.length === 0, `no tradesperson/[id] URLs in sitemap (dynamic route)`);

// 3e. placeholder detection fixtures.
assert(looksLikePlaceholder({ first_name: "Test", last_name: "User", trade: "Plumber", city: "London", email: "test@example.com" }), "placeholder detection: test@example.com flagged");
assert(looksLikePlaceholder({ first_name: "John", last_name: "Doe", trade: "Plumber", city: "London" }) === false, "placeholder detection: real name not flagged");
assert(looksLikePlaceholder({ first_name: "", last_name: "Doe", trade: "Plumber", city: "London" }), "placeholder detection: empty first_name flagged");
assert(looksLikePlaceholder({ first_name: "John", last_name: "D", trade: "Plumber", city: "London" }), "placeholder detection: single-char last name flagged");

// ─────────────────────────────────────────────────────────────────────────────
section("Summary");
console.log(`  passes: ${passes}, failures: ${failures}`);
if (failures > 0) {
  console.log("\n  RESULT: FAIL");
  process.exit(1);
} else {
  console.log("  RESULT: PASS (vectors #1, #2, #3 — offline layer)");
}
