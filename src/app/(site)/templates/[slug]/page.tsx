import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatINR, site, whatsappLink } from "@/config/site";
import { categoryOf } from "@/data/categories";
import { getTemplate, templates } from "@/data/templates";
import { WaIcon } from "@/invites/shared";
import { AddonPicker } from "@/site/addons";
import { TemplateTile } from "@/site/gallery";
import { ClosingCta, Faq, HowItWorks } from "@/site/sections";
import { ButtonLink, Container, Eyebrow, Heading, Lead, Panel, PhoneFrame, Reveal, Section } from "@/ui";

// Every design is prerendered from generateStaticParams.
export const instant = false;

export function generateStaticParams() {
  return templates.map((t) => ({ slug: t.id }));
}

export async function generateMetadata({ params }: PageProps<"/templates/[slug]">): Promise<Metadata> {
  const t = getTemplate((await params).slug);
  if (!t) return {};
  return { title: `${t.name} · ${categoryOf(t.category).title}`, description: t.tagline };
}

const highlights = [
  ["Opens in seconds", "On any phone, straight from WhatsApp. No app to install."],
  [`Ready in ${site.deliveryDays} days`, "Counted from the day your details reach us."],
  [`${site.revisionRounds} rounds of changes`, "Venue moved or a name misspelt? We update the same link."],
  ["One tap to the venue", "Google Maps directions on every function card."],
  ["Yours for life", "The link never expires. Open it again on your anniversary."],
  ["A real person on WhatsApp", `We reply ${site.hours}, not a bot.`],
];

export default async function TemplatePage({ params }: PageProps<"/templates/[slug]">) {
  const t = getTemplate((await params).slug);
  if (!t) notFound();
  const cat = categoryOf(t.category);
  const others = templates.filter((x) => x.id !== t.id).slice(0, 3);

  return (
    <>
      <section className="pt-10 pb-20">
        <Container className="grid gap-14 lg:grid-cols-[minmax(0,400px)_1fr]">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-frame p-6 sm:p-10" style={{ background: t.tint }}>
              <div className="mx-auto w-[260px] sm:w-[300px]">
                <PhoneFrame className="shadow-phone">
                  <iframe src={`/i/${t.demoSlug}`} title={`${t.name} live demo`} className="h-full w-full border-0" loading="lazy" />
                </PhoneFrame>
              </div>
            </div>
            <p className="mt-4 flex items-center justify-center gap-2 text-caption text-muted">
              <span className="size-2 animate-pulse rounded-full bg-live" /> Live demo. Tap to open, then scroll inside the phone.
            </p>
          </div>

          <div>
            <Eyebrow>
              <Link href="/designs" className="hover:text-ink">
                Designs
              </Link>{" "}
              /{" "}
              <Link href={`/${cat.slug}`} className="hover:text-ink">
                {cat.label}
              </Link>
            </Eyebrow>
            <h1 className="mt-6 flex items-baseline gap-4 text-display text-ink">
              {t.name}
              <span className="text-[0.4em] font-normal text-faint" style={{ fontFamily: t.nativeFont }}>
                {t.native}
              </span>
            </h1>
            <Lead className="mt-4">{t.tagline}</Lead>

            <Panel className="mt-8 p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[44px] font-semibold tracking-[-0.04em]">{formatINR(t.price)}</span>
                <span className="text-lead text-faint line-through">{formatINR(t.mrp)}</span>
                <span className="rounded-full bg-surface px-3 py-1 text-caption font-medium">Save {formatINR(t.mrp - t.price)}</span>
              </div>
              <p className="mt-1 text-body text-muted">
                One price with {site.revisionRounds} rounds of changes and your link for life.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <ButtonLink href={whatsappLink(`Hi ${site.name}! I'd like to reserve the ${t.name} design (${formatINR(t.price)}).`)}>
                  <WaIcon /> Reserve on WhatsApp
                </ButtonLink>
                <ButtonLink href={`/i/${t.demoSlug}`} variant="inverse" arrow>
                  Open full demo
                </ButtonLink>
              </div>
              <ol className="mt-8 space-y-4 border-t border-line pt-6">
                {[
                  ["We reply on WhatsApp", `Usually within 15 minutes, ${site.hours}.`],
                  ["You share your details", "Names, functions, venues, photos and your song."],
                  ["Your link arrives", `Within ${site.deliveryDays} days, ready to share.`],
                ].map(([h, b], i) => (
                  <li key={h} className="flex gap-3">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-ink text-[12px] font-semibold text-white">{i + 1}</span>
                    <div>
                      <p className="text-[15px] font-semibold">{h}</p>
                      <p className="text-body text-muted">{b}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Panel>

            <Reveal className="mt-14">
              <p className="text-title">About {t.name}</p>
              <div className="mt-4 space-y-4 text-lead text-muted">
                {t.description.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </Reveal>

            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              <Panel className="p-6">
                <p className="text-caption font-medium text-subtle">Signature details</p>
                <ul className="mt-3 space-y-2 text-body">
                  {t.signature.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </Panel>
              <Panel className="p-6">
                <p className="text-caption font-medium text-subtle">Made for</p>
                <ul className="mt-3 space-y-2 text-body">
                  {t.suits.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </Panel>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-3">
              {t.palette.map((p) => (
                <div key={p.hex}>
                  <div className="h-14 rounded-tile shadow-[inset_0_0_0_1px_rgb(0_0_0/.06)]" style={{ background: p.hex }} />
                  <p className="mt-2 text-caption font-medium">{p.name}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <Section tone="panel">
        <Container>
          <Heading muted="Built into every design.">The highlights.</Heading>
          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {highlights.map(([h, b]) => (
              <Panel key={h} tone="surface" className="p-6">
                <p className="text-title">{h}</p>
                <p className="mt-1 text-body text-muted">{b}</p>
              </Panel>
            ))}
          </div>
        </Container>
      </Section>

      <Section id="addons">
        <Container>
          <Heading muted="Pick only what your family needs.">Add the extras.</Heading>
          <div className="mt-12">
            <AddonPicker t={t} />
          </div>
        </Container>
      </Section>

      <HowItWorks />

      <Section>
        <Container>
          <Heading>You might also like</Heading>
          <div className="mt-10 grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((o, i) => (
              <TemplateTile key={o.id} t={o} index={i} price />
            ))}
          </div>
        </Container>
      </Section>

      <Faq />
      <ClosingCta />
    </>
  );
}
