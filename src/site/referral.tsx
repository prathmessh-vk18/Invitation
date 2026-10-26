"use client";

import { useEffect } from "react";
import { readRefCookie } from "@/config/partners";
import { site } from "@/config/site";

/**
 * Couples who arrived through a partner's link and then chat with us on WhatsApp instead of
 * ordering on the site: add the partner code to the prefilled message so the partner still
 * gets the credit. Works for every WhatsApp button, wherever it is on the page.
 */
export function ReferralWhatsApp() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || !a.href.startsWith(`https://wa.me/${site.whatsapp}`)) return;
      const code = readRefCookie();
      if (!code) return;
      const url = new URL(a.href);
      const text = url.searchParams.get("text") ?? "";
      if (text.includes(code)) return;
      url.searchParams.set("text", `${text}\n\nPartner code: ${code}`.trim());
      a.href = url.toString();
    };
    // Capture, so the link is updated before the browser follows it.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  return null;
}
