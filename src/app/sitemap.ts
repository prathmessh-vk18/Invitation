import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { categories } from "@/data/categories";
import { guides } from "@/data/guides";
import { templates } from "@/data/templates";

export default function sitemap(): MetadataRoute.Sitemap {
  const u = (path: string) => `${site.url}${path}`;
  const now = new Date();
  return [
    { url: u("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: u("/designs"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    ...categories.map((c) => ({ url: u(`/${c.slug}`), lastModified: now, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...templates.map((t) => ({ url: u(`/templates/${t.id}`), lastModified: new Date(t.addedOn), changeFrequency: "monthly" as const, priority: 0.8 })),
    { url: u("/guides"), lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    ...guides.map((g) => ({ url: u(`/guides/${g.slug}`), lastModified: new Date(g.updated), changeFrequency: "monthly" as const, priority: 0.7 })),
    ...["/about", "/privacy", "/refunds", "/terms"].map((p) => ({ url: u(p), lastModified: now, changeFrequency: "yearly" as const, priority: 0.3 })),
  ];
}
