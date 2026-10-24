import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categories, getCategory } from "@/data/categories";
import { templatesIn } from "@/data/templates";
import { TemplateTile } from "@/site/gallery";
import { ClosingCta, Faq, HowItWorks } from "@/site/sections";
import { Container, Display, Eyebrow, Heading, Lead, Panel, Reveal, Section } from "@/ui";

// Category slugs are a fixed list, prerendered at build.
export const instant = false;

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[category]">): Promise<Metadata> {
  const c = getCategory((await params).category);
  if (!c) return {};
  return { title: c.title, description: c.intro };
}

const included = [
  "An opening animation guests tap to open",
  "Every function with time, venue and dress code",
  "Google Maps directions for each venue",
  "A live countdown to the ceremony",
  "RSVP straight to your WhatsApp",
  "Background music",
  "Text in your family's script",
  "Your link, live for life",
];

export default async function CategoryPage({ params }: PageProps<"/[category]">) {
  const c = getCategory((await params).category);
  if (!c) notFound();
  const designs = templatesIn(c.id);
  const others = categories.filter((x) => x.id !== c.id);

  return (
    <>
      <section className="pt-20 pb-14 text-center">
        <Container>
          <Reveal>
            <Eyebrow>
              <Link href="/designs" className="hover:text-ink">
                Designs
              </Link>{" "}
              / {c.label}
            </Eyebrow>
            <Display className="mx-auto mt-4 max-w-3xl">{c.title}</Display>
            <Lead className="mx-auto mt-6">{c.intro}</Lead>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {c.ceremonies.map((x) => (
                <span key={x} className="rounded-full bg-panel px-4 py-2 text-[14px] font-medium">
                  {x}
                </span>
              ))}
            </div>
          </Reveal>
        </Container>
      </section>

      <section>
        <Container wide className="px-3 sm:px-5">
          <div className="rounded-frame bg-panel p-3 sm:p-10">
            <div className="grid gap-x-5 gap-y-8 rounded-[24px] bg-surface p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
              {designs.map((t, i) => (
                <Reveal key={t.id} delay={i * 0.08}>
                  <TemplateTile t={t} index={i} price />
                </Reveal>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <Section>
        <Container className="grid gap-12 md:grid-cols-[1fr_1.2fr]">
          <Heading muted="Nothing extra to buy.">Everything in one link.</Heading>
          <Panel className="grid gap-x-6 gap-y-4 p-8 sm:grid-cols-2">
            {included.map((x) => (
              <p key={x} className="flex gap-3 text-body">
                <svg viewBox="0 0 24 24" className="mt-0.5 size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.4} aria-hidden>
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
                {x}
              </p>
            ))}
          </Panel>
        </Container>
      </Section>

      <HowItWorks />
      <Faq items={c.faqs} title={`${c.label} weddings, answered.`} />

      <Section className="pt-0">
        <Container>
          <p className="text-title">Other celebrations</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {others.map((o) => (
              <Link key={o.id} href={`/${o.slug}`} className="rounded-tile bg-panel p-6 transition hover:bg-panel-strong">
                <p className="text-title">{o.title}</p>
                <p className="mt-1 text-caption text-muted">{templatesIn(o.id).length} designs →</p>
              </Link>
            ))}
          </div>
        </Container>
      </Section>
      <ClosingCta />
    </>
  );
}
