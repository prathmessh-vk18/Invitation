import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Invite addresses that were renamed after being shared, so old links keep working.
  async redirects() {
    return [
      { source: "/i/vidhi-weds-akshay", destination: "/i/akshay-weds-vidhi", permanent: false },
      { source: "/i/priya-weds-samridha", destination: "/i/samriddha-weds-priya", permanent: false },
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
