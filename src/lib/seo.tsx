import { site } from "@/config/site";

/** Canonical + share-preview metadata for a public page. `path` starts with "/". */
export function pageMeta(path: string, title: string, description: string) {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title: `${title} · ${site.name}`, description, url: path },
  };
}

/** A schema.org JSON-LD block for Google rich results. */
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.name,
  url: site.url,
  logo: `${site.url}/brand/aavjoo-logo.png`,
  email: site.email,
  contactPoint: { "@type": "ContactPoint", telephone: `+${site.whatsapp}`, contactType: "customer service", areaServed: "IN", availableLanguage: ["English", "Hindi"] },
};
