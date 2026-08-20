import { NextRequest } from "next/server";

/**
 * Serves the MyApproved verified-member badge.
 *
 * The badge is served from our origin, never handed over as a file, so
 * verification can be withdrawn. If a trader is suspended, delisted or
 * lapses, this route stops returning artwork and the badge disappears
 * from their site without us having to ask them to remove it.
 *
 * GET /api/badge/[slug]           -> navy, with strapline
 * GET /api/badge/[slug]?v=light   -> light ground
 * GET /api/badge/[slug]?v=compact -> no strapline
 */

type Variant = "navy" | "light" | "dark" | "compact-navy" | "compact-light";

const VARIANTS: Record<string, Variant> = {
  navy: "navy",
  light: "light",
  dark: "dark",
  compact: "compact-navy",
  "compact-light": "compact-light",
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const variant = VARIANTS[req.nextUrl.searchParams.get("v") ?? "navy"] ?? "navy";

  const trader = await getTraderBySlug(slug);

  // Not found, suspended, delisted or lapsed: serve nothing.
  // 404 means the <img> renders as broken/absent rather than showing a
  // badge we no longer stand behind. Do NOT serve a "was verified" state.
  if (!trader || trader.status !== "active") {
    return new Response(null, {
      status: 404,
      headers: { "Cache-Control": "public, max-age=300" },
    });
  }

  const svg = await loadBadge(variant);

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      // Short TTL so revocation propagates within the hour. Do not raise
      // this: a long cache is the difference between withdrawing a badge
      // and asking a CDN nicely.
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=600",
      "Access-Control-Allow-Origin": "*",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'",
    },
  });
}

/** Replace with your Supabase query. */
async function getTraderBySlug(slug: string) {
  // const { data } = await supabase
  //   .from("traders")
  //   .select("slug, status")
  //   .eq("slug", slug)
  //   .single();
  // return data;
  return null as { slug: string; status: string } | null;
}

/** Reads the static badge SVG from /public/badge/. */
async function loadBadge(variant: Variant): Promise<string> {
  const { readFile } = await import("node:fs/promises");
  const path = await import("node:path");
  return readFile(
    path.join(process.cwd(), "public", "badge", `badge-${variant}.svg`),
    "utf8"
  );
}
