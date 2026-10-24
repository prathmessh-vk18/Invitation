import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { site } from "@/config/site";
import { getGuide, guides } from "@/data/guides";
import { getTemplate } from "@/data/templates";
import { JsonLd, pageMeta } from "@/lib/seo";
import { TemplateTile } from "@/site/gallery";
import { Accordion, ButtonLink, Container, Eyebrow, Heading, Lead, Section } from "@/ui";

// Every guide is prerendered.
export const instant = false;

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: PageProps<"/guides/[slug]">): Promise<Metadata> {
  const g = getGuide((await params).slug);
  if (!g) return {};
  const meta = pageMeta(`/guides/${g.slug}`, g.title, g.description);
  return { ...meta, openGraph: { ...meta.openGraph, type: "article" } };
}

export default async function GuidePage({ params }: PageProps<"/guides/[slug]">) {
  const g = getGuide((await params).slug);
  if (!g) notFound();
  const designs = g.designs.map(getTemplate).filter((t) => t !== undefined);
  const more = guides.filter((x) => x.slug !== g.slug).slice(0, 3);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: g.title,
          description: g.description,
          dateModified: g.updated,
          datePublished: g.updated,
          author: { "@type": "Organization", name: site.name, url: site.url },
          publisher: { "@type": "Organization", name: site.name, logo: { "@type": "ImageObject", url: `${site.url}/brand/aavjoo-logo.png` } },
          mainEntityOfPage: `${site.url}/guides/${g.slug}`,
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: g.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />
      <article className="pt-14 pb-16">
        <Container className="max-w-[760px]">
          <Eyebrow>
            <Link href="/guides" className="hover:text-ink">
              Guides
            </Link>{" "}
            / {g.topic}
          </Eyebrow>
          <h1 className="mt-4 text-heading text-balance text-ink">{g.title}</h1>
          <p className="mt-4 text-caption text-subtle">
            {g.readMins} min read · Updated {new Date(g.updated).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </p>
          <Lead className="mt-8 max-w-none">{g.intro}</Lead>

          {g.sections.map((sec) => (
            <section key={sec.h} className="mt-12">
              <h2 className="text-[26px] leading-tight font-semibold tracking-[-0.02em] text-ink">{sec.h}</h2>
              {sec.p?.map((p, i) => (
                <p key={i} className="mt-4 text-[17px] leading-relaxed text-ink-soft">
                  {p}
                </p>
              ))}
              {sec.list && (
                <ul className="mt-4 space-y-2.5 pl-5 text-[17px] leading-relaxed text-ink-soft [&>li]:list-disc">
                  {sec.list.map((li) => (
                    <li key={li}>{li}</li>
                  ))}
                </ul>
              )}
              {sec.samples?.map((sm) => (
                <figure key={sm.label} className="mt-5 rounded-tile bg-panel p-6">
                  <figcaption className="text-caption font-medium text-subtle uppercase">{sm.label}</figcaption>
                  <blockquote className="mt-3 text-[17px] leading-relaxed whitespace-pre-line text-ink" style={{ fontFamily: "var(--font-cormorant), var(--font-deva), serif", fontSize: 20 }}>
                    {sm.text}
                  </blockquote>
                </figure>
              ))}
            </section>
          ))}

          <div className="mt-14 rounded-card bg-ink p-8 text-white">
            <p className="text-title text-white">Put this wording on a beautiful invitation</p>
            <p className="mt-2 text-body text-white/70">Pick a design, add your functions and song, and share one link on WhatsApp. From ₹249.</p>
            <ButtonLink href="/designs" variant="inverse" className="mt-5">
              See the designs →
            </ButtonLink>
          </div>
        </Container>
      </article>

      {designs.length > 0 && (
        <Section className="pt-6">
          <Container>
            <Heading as="h2">Designs that suit this</Heading>
            <div className="mt-8 grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {designs.map((t, i) => (
                <TemplateTile key={t.id} t={t} index={i} price />
              ))}
            </div>
          </Container>
        </Section>
      )}

      <Section tone="panel">
        <Container className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <Heading as="h2">Questions, answered.</Heading>
          <Accordion items={g.faqs} />
        </Container>
      </Section>

      <Section>
        <Container>
          <p className="text-title">More guides</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {more.map((m) => (
              <Link key={m.slug} href={`/guides/${m.slug}`} className="rounded-tile bg-panel p-5 transition hover:bg-panel-strong">
                <p className="text-[15px] font-semibold">{m.title}</p>
                <p className="mt-1 text-caption text-muted">{m.readMins} min read →</p>
              </Link>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
