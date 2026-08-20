"use client";

import { useState } from "react";

/**
 * Shown in the trader dashboard. Generates the embed snippet they paste
 * into their own site.
 *
 * The snippet wraps the badge in a link back to their MyApproved profile,
 * so every placement is a referral path, not just decoration. rel is set
 * so the link is useful to the trader without being an SEO liability
 * to either party.
 */

const ORIGIN = "https://myapproved.co.uk";

const VARIANTS = [
  { id: "navy", label: "Navy" },
  { id: "light", label: "Light" },
  { id: "dark", label: "Near-black" },
  { id: "compact", label: "Compact" },
] as const;

const WIDTHS = [220, 260, 320] as const;

export function BadgeEmbed({ slug, name }: { slug: string; name: string }) {
  const [variant, setVariant] = useState<string>("navy");
  const [width, setWidth] = useState<number>(260);
  const [copied, setCopied] = useState(false);

  const src = `${ORIGIN}/api/badge/${slug}${variant === "navy" ? "" : `?v=${variant}`}`;
  const href = `${ORIGIN}/trades/${slug}`;

  const snippet = `<a href="${href}" target="_blank" rel="noopener">
  <img src="${src}"
       alt="${name} is a MyApproved verified member"
       width="${width}" height="auto" loading="lazy" />
</a>`;

  async function copy() {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#0A2463]">Your verified badge</h2>
        <p className="mt-1 text-sm text-gray-600">
          Add this to your website to show customers you&apos;re verified. It links
          back to your MyApproved profile, so it sends you enquiries too.
        </p>
      </div>

      <div className="flex flex-wrap gap-6">
        <fieldset>
          <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Style
          </legend>
          <div className="flex gap-2">
            {VARIANTS.map((v) => (
              <button
                key={v.id}
                onClick={() => setVariant(v.id)}
                className={`rounded-lg border px-3 py-1.5 text-sm ${
                  variant === v.id
                    ? "border-[#0A2463] bg-[#0A2463] text-white"
                    : "border-gray-300 text-gray-700 hover:border-gray-400"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Size
          </legend>
          <div className="flex gap-2">
            {WIDTHS.map((w) => (
              <button
                key={w}
                onClick={() => setWidth(w)}
                className={`rounded-lg border px-3 py-1.5 text-sm ${
                  width === w
                    ? "border-[#0A2463] bg-[#0A2463] text-white"
                    : "border-gray-300 text-gray-700 hover:border-gray-400"
                }`}
              >
                {w}px
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="rounded-xl bg-gray-100 p-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Preview
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="Badge preview" width={width} />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Paste this into your website
          </p>
          <button
            onClick={copy}
            className="rounded-lg bg-[#FFB800] px-4 py-1.5 text-sm font-semibold text-[#0A2463] hover:bg-[#FFC933]"
          >
            {copied ? "Copied" : "Copy code"}
          </button>
        </div>
        <pre className="overflow-x-auto rounded-lg bg-[#111111] p-4 text-xs leading-relaxed text-gray-200">
          <code>{snippet}</code>
        </pre>
        <p className="mt-2 text-xs text-gray-500">
          Not sure where this goes? Send it to whoever looks after your website,
          or paste it into the footer section of your site builder.
        </p>
      </div>
    </div>
  );
}
