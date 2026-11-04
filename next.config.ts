import type { NextConfig } from "next";

const WEEK = 7 * 24 * 60 * 60;

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Optimised copies of the design art keep for a week, like the art itself (below).
  images: { minimumCacheTTL: WEEK },
  // Files in public/ default to max-age=0, so every page view re-checks every picture and song.
  // These change only with a deploy, and a changed file gets a new name (mahal-hero-v2.jpg), so
  // browsers can keep them for a week.
  async headers() {
    const cache = [{ key: "Cache-Control", value: `public, max-age=${WEEK}, stale-while-revalidate=86400` }];
    return ["/art/:path*", "/music/:path*", "/brand/:path*", "/icon.png", "/apple-icon.png"].map((source) => ({ source, headers: cache }));
  },
  // Invite addresses that were renamed after being shared, so old links keep working.
  async redirects() {
    return [
      { source: "/i/vidhi-weds-akshay", destination: "/i/akshay-weds-vidhi", permanent: false },
      { source: "/i/priya-weds-samridha", destination: "/i/samriddha-weds-priya", permanent: false },
      { source: "/i/simran-weds-sahil", destination: "/i/simran-and-sahil", permanent: false },
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
