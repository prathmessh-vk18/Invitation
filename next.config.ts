import type { NextConfig } from "next";

const WEEK = 7 * 24 * 60 * 60;

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // Dev only: lets a phone on the home Wi-Fi open the dev server by the laptop's address (local
  // design previews). Without it the page shows but its scripts never start.
  allowedDevOrigins: ["192.168.31.101", "192.168.*.*"],
  // The printable-PDF add-on renders pages in a serverless Chrome: keep it out of the bundle and
  // ship its compressed browser with the PDF route.
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
  outputFileTracingIncludes: { "/order/**": ["./node_modules/@sparticuz/chromium/bin/**"] },
  partialPrefetching: true,
  // Optimised copies of the design art keep for a week, like the art itself (below).
  images: { minimumCacheTTL: WEEK },
  // Files in public/ default to max-age=0, so every page view re-checks every picture and song.
  // These change only with a deploy, and a changed file gets a new name (mahal-hero-v2.jpg), so
  // browsers can keep them for a week.
  async headers() {
    const cache = [{ key: "Cache-Control", value: `public, max-age=${WEEK}, stale-while-revalidate=86400` }];
    // On every page: other sites can't frame ours (clickjacking), browsers don't guess file types,
    // links to other sites don't carry full addresses, and pages can't ask for camera, microphone
    // or location. Our own iframes (design demos, the full-invite preview) are same-site, so allowed.
    const security = [
      { key: "Content-Security-Policy", value: "frame-ancestors 'self'; object-src 'none'; base-uri 'self'" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
    ];
    return [
      { source: "/:path*", headers: security },
      ...["/art/:path*", "/music/:path*", "/brand/:path*", "/icon.png", "/apple-icon.png"].map((source) => ({ source, headers: cache })),
    ];
  },
  // Invite addresses that were renamed after being shared, so old links keep working.
  async redirects() {
    return [
      // One address for search: www served a full copy of every page, which Google crawled twice
      // and listed as "Alternate page with proper canonical tag". Paths and queries carry over.
      { source: "/:path*", has: [{ type: "host", value: "www.aavjoo.in" }], destination: "https://aavjoo.in/:path*", permanent: true },
      { source: "/i/vidhi-weds-akshay", destination: "/i/akshay-weds-vidhi", permanent: false },
      { source: "/i/priya-weds-samridha", destination: "/i/samriddha-weds-priya", permanent: false },
      { source: "/i/simran-weds-sahil", destination: "/i/simran-and-sahil", permanent: false },
      { source: "/i/juhi-weds-jatin", destination: "/i/juhi-and-jatin", permanent: false },
      { source: "/i/anshul-weds-surbhi", destination: "/i/anshul-and-surbhi", permanent: false },
      { source: "/i/surbhi-weds-anshul", destination: "/i/surbhi-and-anshul", permanent: false },
      // Two brothers' weddings on one invite: the link names the hosting family (AAV-1812).
      { source: "/i/amaan-weds-warisha", destination: "/i/shamim-family-weddings", permanent: false },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
