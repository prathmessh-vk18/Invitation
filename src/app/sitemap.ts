import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { categories } from "@/data/categories";
import { guides } from "@/data/guides";
import { templates } from "@/data/templates";
import { wordingPages, WORDING_LIVE, WORDING_UPDATED } from "@/data/wordings";

export default function sitemap(): MetadataRoute.Sitemap {
  const u = (path: string) => `${site.url}${path}`;
  // Real "last changed" dates, not the build time: a date that moves on every deploy teaches Google
  // to ignore our dates. Bump SITE_UPDATED when the home, designs or category pages change.
  const SITE_UPDATED = new Date("2026-11-19");
  const now = SITE_UPDATED;
  const guidesUpdated = new Date(guides.map((g) => g.updated).sort().at(-1) ?? "2026-11-19");
  const wordingUpdated = new Date(WORDING_UPDATED);
  const legal: Record<string, string> = { "/about": "2026-11-19", "/privacy": "2026-11-19", "/refunds": "2026-10-30", "/terms": "2026-10-18" };
  return [
    { url: u("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: u("/designs"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    ...categories.map((c) => ({ url: u(`/${c.slug}`), lastModified: now, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...templates.map((t) => ({ url: u(`/templates/${t.id}`), lastModified: new Date(t.addedOn), changeFrequency: "monthly" as const, priority: 0.8 })),
    { url: u("/guides"), lastModified: guidesUpdated, changeFrequency: "weekly", priority: 0.7 },
    ...guides.map((g) => ({ url: u(`/guides/${g.slug}`), lastModified: new Date(g.updated), changeFrequency: "monthly" as const, priority: 0.7 })),
    // Wording pages and free tools, once a batch has been reviewed (WORDING_LIVE).
    ...(WORDING_LIVE
      ? [
          { url: u("/wording"), lastModified: wordingUpdated, changeFrequency: "weekly" as const, priority: 0.7 },
          ...wordingPages.map((p) => ({ url: u(`/wording/${p.slug}`), lastModified: wordingUpdated, changeFrequency: "monthly" as const, priority: 0.6 })),
          { url: u("/tools"), lastModified: wordingUpdated, changeFrequency: "monthly" as const, priority: 0.6 },
          { url: u("/tools/invitation-wording-generator"), lastModified: wordingUpdated, changeFrequency: "monthly" as const, priority: 0.7 },
          { url: u("/tools/wedding-hashtag-generator"), lastModified: wordingUpdated, changeFrequency: "monthly" as const, priority: 0.7 },
        ]
      : []),
    ...Object.entries(legal).map(([p, d]) => ({ url: u(p), lastModified: new Date(d), changeFrequency: "yearly" as const, priority: 0.3 })),
  ];
}
