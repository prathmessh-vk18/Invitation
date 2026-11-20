"use client";

import { Analytics } from "@vercel/analytics/next";

/**
 * Vercel Analytics on our own pages only. Guests opening couples' invites (/i/…) were most of the
 * page views we paid for; Google Analytics still counts them, free.
 */
export function SiteAnalytics() {
  return <Analytics beforeSend={(e) => (new URL(e.url).pathname.startsWith("/i/") ? null : e)} />;
}
