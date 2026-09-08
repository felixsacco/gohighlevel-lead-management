import { ImageResponse } from "next/server";
import { TRADES, resolveLocation } from "@/lib/seo-data";

/**
 * Dynamic OpenGraph image generator (1200×630 PNG).
 *
 * Routes:
 *   /og/:tradeSlug            → trade-hub card ("Verified Plumbers Near You")
 *   /og/:tradeSlug/:location  → trade + location card ("Verified Plumbers in Birmingham")
 *
 * The card is referenced as the canonical og:image for every programmatic
 * /find-tradespeople/[trade]/[location] page via generateMetadata, so link
 * previews (WhatsApp, LinkedIn, X, Slack) always resolve to an on-brand image
 * that mirrors the page's H1 rather than a generic fallback.
 *
 * Font note: ImageResponse's Node build registers a single default font family
 * ("sans serif", weight 700). Every text node therefore pins fontFamily to that
 * exact name and uses weight 700 so satori never looks for an unregistered
 * weight.
 */
export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: { slug: string[] } }
) {
  const slug = params.slug ?? [];
  if (slug.length === 0 || slug.length > 2) {
    return new Response("Not found", { status: 404 });
  }

  const trade = TRADES.find((t) => t.slug === slug[0]);
  if (!trade) {
    return new Response("Not found", { status: 404 });
  }

  const location = slug[1] ? resolveLocation(slug[1]) : null;
  if (slug[1] && !location) {
    return new Response("Not found", { status: 404 });
  }

  const title = location
    ? `Verified ${trade.plural} in ${location.name}`
    : `Verified ${trade.plural} Near You`;

  const titleSize = title.length > 46 ? 46 : title.length > 34 ? 56 : 64;
  const subtitle =
    "Free quotes from verified, insured local professionals";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px 56px",
          fontFamily: "sans serif",
          fontWeight: 700,
          color: "#FFFFFF",
          backgroundColor: "#0A2463",
          backgroundImage:
            "linear-gradient(135deg, #0A2463 0%, #1A3A8A 55%, #24439F 100%)",
        }}
      >
        {/* Brand header */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 12,
                backgroundColor: "#FFB800",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "sans serif",
                  fontWeight: 700,
                  fontSize: 22,
                  color: "#0A2463",
                }}
              >
                MA
              </div>
            </div>
            <div
              style={{
                fontFamily: "sans serif",
                fontWeight: 700,
                fontSize: 32,
                color: "#FFFFFF",
              }}
            >
              MyApproved
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "10px 22px",
              borderRadius: 999,
              backgroundColor: "#FFB800",
            }}
          >
            <div
              style={{
                fontFamily: "sans serif",
                fontWeight: 700,
                fontSize: 20,
                color: "#0A2463",
                letterSpacing: 1,
              }}
            >
              {"VERIFIED & APPROVED"}
            </div>
          </div>
        </div>

        {/* Headline block */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
            marginTop: 28,
          }}
        >
          <div
            style={{
              width: "100%",
              fontFamily: "sans serif",
              fontWeight: 700,
              fontSize: titleSize,
              lineHeight: 1.1,
              color: "#FFFFFF",
            }}
          >
            {title}
          </div>
          <div
            style={{
              width: "100%",
              fontFamily: "sans serif",
              fontWeight: 700,
              marginTop: 22,
              fontSize: 30,
              color: "#FFC933",
            }}
          >
            {subtitle}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            borderTopWidth: 2,
            borderTopStyle: "solid",
            borderTopColor: "rgba(255, 255, 255, 0.22)",
            paddingTop: 24,
          }}
        >
          <div
            style={{
              fontFamily: "sans serif",
              fontWeight: 700,
              fontSize: 26,
              color: "#FFFFFF",
            }}
          >
            myapproved.com
          </div>
          <div
            style={{
              fontFamily: "sans serif",
              fontWeight: 700,
              fontSize: 21,
              color: "#BBD3FF",
            }}
          >
            {"Free quotes | No obligation | 2-minute job post"}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
