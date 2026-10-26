// The partner programme: friends and influencers who share their link and earn per paid order.
// Safe to import from client components.
export const partners = {
  // What a partner earns for each paid order. New partners start here; change one partner in /admin/partners.
  commission: 100,
  // The browser remembers a partner's link for this long.
  cookieDays: 30,
  cookie: "aav_ref",
};

/** "priya " → "PRIYA". Letters and digits only. */
export const cleanPartnerCode = (v: unknown) =>
  (typeof v === "string" ? v : "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 20);

export const isPartnerCode = (v: string) => /^[A-Z0-9]{3,20}$/.test(v);

/** The partner code this browser arrived with, if any. Client only. */
export function readRefCookie() {
  const m = document.cookie.match(new RegExp(`(?:^|; )${partners.cookie}=([^;]*)`));
  const code = cleanPartnerCode(m ? decodeURIComponent(m[1]) : "");
  return isPartnerCode(code) ? code : "";
}
