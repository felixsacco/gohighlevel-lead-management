/** @type {import('next').NextConfig} */
const nextConfig = {
  // Smaller per-module graphs for icon-heavy pages (Next 13.5+).
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  generateBuildId: async () => {
    return String(process.env.BUILD_ID || process.env.VERCEL_GIT_COMMIT_SHA || "build-" + Date.now());
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  async redirects() {
    const tradeSlugs = [
      'plumber',
      'electrician',
      'builder',
      'roofer',
      'carpenter',
      'painter-decorator',
      'kitchen-fitter',
      'bathroom-fitter',
      'tiler',
      'flooring',
      'gas-engineer',
      'plasterer',
      'locksmith',
      'window-fitter',
      'heating-engineer',
      'gardener',
      'landscaper',
      'fencer',
      'driveway-specialist',
      'cleaner',
      'waste-removal',
      'carpet-cleaner',
      'security-installer',
      'pest-control',
      'damp-specialist',
      'scaffolder',
      'chimney-sweep',
      'loft-insulation',
      'air-conditioning',
      'solar-panel-installer',
      'handyman',
      'loft-conversion',
      'conservatory',
    ];

    const tradePattern = tradeSlugs.join('|');

    return [
      {
        source: `/:trade(${tradePattern})`,
        destination: '/find-tradespeople/:trade',
        permanent: true,
      },
      {
        source: `/:trade(${tradePattern})/:location`,
        destination: '/find-tradespeople/:trade/:location',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-XSS-Protection',
            value: '0',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
          {
            key: 'Content-Security-Policy-Report-Only',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google-analytics.com https://ssl.google-analytics.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https://*.unsplash.com https://randomuser.me https://cdn.myapproved.com; connect-src 'self' https://*.supabase.co https://services.leadconnectorhq.com;",
          },
        ],
      },
    ];
  },
  images: {
    domains: ['randomuser.me', 'images.unsplash.com', 'cdn.myapproved.com'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  webpack: (config, { dev, isServer }) => {
    // Persistent pack cache can spike RAM on large graphs (e.g. homepage + lucide); memory is safer on low-RAM dev machines.
    if (dev) {
      config.cache = false;
    }

    // @supabase/realtime-js uses dynamic require(); webpack warns but it is safe to ignore here.
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      (warning) => {
        const msg = String(warning?.message || "");
        const res = warning?.module?.resource || "";
        return (
          msg.includes("Critical dependency") &&
          String(res).replace(/\\/g, "/").includes("@supabase/realtime-js")
        );
      },
    ];

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        bufferutil: false,
        "utf-8-validate": false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
