"use client";

import { useEffect } from "react";
import { cleanSource, sourceCookie, sourceOf } from "@/config/source";

/**
 * Remembers where this visitor came from, for 30 days, so their order records it (read by the
 * server when the order is placed). A tagged ad link always wins; otherwise the first source we
 * learn is kept, so browsing our own pages never overwrites it. A first-party cookie, no tracker.
 */
export function RememberSource() {
  useEffect(() => {
    const url = new URL(window.location.href);
    const now = sourceOf(url, document.referrer, navigator.userAgent);
    if (!now) return;
    const m = document.cookie.match(new RegExp(`(?:^|; )${sourceCookie.name}=([^;]*)`));
    const had = cleanSource(m ? decodeURIComponent(m[1]) : "");
    if (had && !url.searchParams.has("utm_source")) return;
    document.cookie = `${sourceCookie.name}=${encodeURIComponent(now)}; Max-Age=${sourceCookie.days * 86400}; Path=/; SameSite=Lax; Secure`;
  }, []);
  return null;
}
