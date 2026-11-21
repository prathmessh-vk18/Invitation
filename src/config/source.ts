// Where a buyer came from (an Instagram ad, Google, WhatsApp…), saved with their order so we can
// count orders per source and per ad. Safe to import from client components.
//
// Ads link to the site with a tag, e.g. https://aavjoo.in/?utm_source=instagram&utm_campaign=ad3,
// which gives "instagram:ad3". Without a tag we tell from the referrer or the app's own browser.
export const sourceCookie = { name: "aav_src", days: 30 };

/** "Instagram:Ad 3" → "instagram:ad-3". Lowercase letters, digits, - _ . : only; at most 60. */
export const cleanSource = (v: unknown) =>
  (typeof v === "string" ? v : "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_.:-]/g, "")
    .slice(0, 60);

/** The source for this visit, or "" when there's nothing to say (our own pages, or no clue). */
export function sourceOf(url: URL, referrer: string, userAgent: string): string {
  const utm = cleanSource(url.searchParams.get("utm_source"));
  if (utm) {
    const campaign = cleanSource(url.searchParams.get("utm_campaign"));
    return cleanSource(campaign ? `${utm}:${campaign}` : utm);
  }
  // Instagram and Facebook open links in their own browser, often without a referrer.
  if (/Instagram/i.test(userAgent)) return "instagram";
  if (/FBAN|FBAV|FB_IAB/i.test(userAgent)) return "facebook";
  let host = "";
  try {
    host = referrer ? new URL(referrer).hostname.replace(/^www\./, "") : "";
  } catch {
    host = "";
  }
  if (!host || host.endsWith("aavjoo.in") || host === "localhost") return "";
  const known: [RegExp, string][] = [
    [/instagram\.com$/, "instagram"],
    [/(facebook\.com|fb\.com|fb\.me)$/, "facebook"],
    [/(whatsapp\.com|wa\.me)$/, "whatsapp"],
    [/^(.+\.)?google\./, "google"],
    [/bing\.com$/, "bing"],
    [/(youtube\.com|youtu\.be)$/, "youtube"],
    [/pinterest\./, "pinterest"],
    [/(chatgpt\.com|openai\.com|perplexity\.ai|claude\.ai|gemini\.google)/, "ai-chat"],
  ];
  return known.find(([r]) => r.test(host))?.[1] ?? cleanSource(host);
}
