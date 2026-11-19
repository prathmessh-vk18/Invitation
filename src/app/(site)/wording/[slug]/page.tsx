import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { site } from "@/config/site";
import { getTemplate } from "@/data/templates";
import { FUNCTIONS, fnName, getWordingPage, LANGS, relatedPages, TONES, wordingPages, WORDING_LIVE } from "@/data/wordings";
import { JsonLd, pageMeta } from "@/lib/seo";
import { TemplateTile } from "@/site/gallery";
import { PersonalWordings } from "@/site/wording-cards";
import { Accordion, ButtonLink, Container, Eyebrow, Heading, Lead, Section } from "@/ui";

// Every wording page is prerendered.
export const instant = false;

export function generateStaticParams() {
  return wordingPages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = getWordingPage((await params).slug);
  if (!p) return {};
  const meta = pageMeta(`/wording/${p.slug}`, `${p.title}: ${p.wordings.length} ready-to-copy wordings`, p.description);
  return { ...meta, openGraph: { ...meta.openGraph, type: "article" }, ...(WORDING_LIVE ? {} : { robots: { index: false, follow: true } }) };
}

export default async function WordingPageView({ params }: { params: Promise<{ slug: string }> }) {
  const p = getWordingPage((await params).slug);
  if (!p) notFound();
  const fn = FUNCTIONS.find((f) => f.id === p.fn)!;
  const tone = TONES.find((t) => t.id === p.tone)!;
  const designs = p.designs.map(getTemplate).filter((t) => t !== undefined);
  const { sameFn, sameTone } = relatedPages(p);
  // The choice rides after "#", so Google sees one generator address (no ?… duplicates).
  const generator = `/tools/invitation-wording-generator#fn=${p.fn}&lang=${p.lang}&tone=${p.tone}`;
  const url = `${site.url}/wording/${p.slug}`;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: p.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Invitation wording", item: `${site.url}/wording` },
            { "@type": "ListItem", position: 2, name: `${fn.name} invitation wording`, item: `${site.url}/wording#${fn.id}` },
            { "@type": "ListItem", position: 3, name: p.title, item: url },
          ],
        }}
      />
      <article className="pt-14 pb-16">
        <Container className="max-w-[760px]">
          <Eyebrow>
            <Link href="/wording" className="hover:text-ink">
              Invitation wording
            </Link>{" "}
            / {fn.name} · {LANGS.find((l) => l.id === p.lang)!.name} · {tone.name}
          </Eyebrow>
          <h1 className="mt-4 text-heading text-balance text-ink">{p.title}</h1>
          <p className="mt-3 text-caption text-subtle">
            {p.wordings.length} wordings to copy · personalise them with your names in one go
          </p>
          <Lead className="mt-6 max-w-none">{p.intro}</Lead>

          <div className="mt-8">
            <PersonalWordings wordings={p.wordings} lang={p.lang} />
          </div>

          <section className="mt-12">
            <h2 className="text-[26px] leading-tight font-semibold tracking-[-0.02em] text-ink">Tips before you send it</h2>
            <ul className="mt-4 space-y-2.5 pl-5 text-[17px] leading-relaxed text-ink-soft [&>li]:list-disc">
              {p.tips.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </section>

          <div className="mt-12 rounded-card bg-ink p-8 text-white">
            <p className="text-title text-white">Turn your wording into an invitation</p>
            <p className="mt-2 text-body text-white/70">
              Pick a design, add your {fn.name.toLowerCase()} and every other function with maps and your song, and share one link on WhatsApp. RSVPs are counted for you, free.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <ButtonLink href="/designs" variant="inverse">
                See the designs →
              </ButtonLink>
              <ButtonLink href={generator} variant="secondary">
                Open the wording generator
              </ButtonLink>
            </div>
          </div>
        </Container>
      </article>

      {designs.length > 0 && (
        <Section className="pt-6">
          <Container>
            <Heading as="h2">Designs for your {fn.name.toLowerCase()}</Heading>
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
          <Accordion items={p.faqs} />
        </Container>
      </Section>

      <Section>
        <Container>
          <p className="text-title">More {fn.name.toLowerCase()} wordings</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {sameFn.map((x) => (
              <Link key={x.slug} href={`/wording/${x.slug}`} className="rounded-tile bg-panel p-5 transition hover:bg-panel-strong">
                <p className="text-[15px] font-semibold">{x.title}</p>
                <p className="mt-1 text-caption text-muted">{x.wordings.length} wordings →</p>
              </Link>
            ))}
          </div>
          <p className="mt-10 text-title">{tone.name} wordings for other functions</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {sameTone.map((x) => (
              <Link key={x.slug} href={`/wording/${x.slug}`} className="rounded-tile bg-panel p-5 transition hover:bg-panel-strong">
                <p className="text-[15px] font-semibold">{x.title}</p>
                <p className="mt-1 text-caption text-muted">{fnName(x.fn)} →</p>
              </Link>
            ))}
          </div>
          {fn.guide && (
            <p className="mt-10 text-body text-muted">
              Planning the whole {fn.name.toLowerCase()} invite?{" "}
              <Link href={`/guides/${fn.guide}`} className="font-medium text-ink underline underline-offset-4">
                Read our {fn.name.toLowerCase()} invitation guide
              </Link>
              .
            </p>
          )}
        </Container>
      </Section>
    </>
  );
}
