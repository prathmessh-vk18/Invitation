import { offer } from "@/config/offer";
import type { Metadata } from "next";
import { JsonLd, pageMeta } from "@/lib/seo";
import { site as siteConfig } from "@/config/site";
import Link from "next/link";
import { notFound } from "next/navigation";
import { site } from "@/config/site";
import { categoryOf } from "@/data/categories";
import { getTemplate, templates } from "@/data/templates";
import { OfferCountdown, PriceTag } from "@/site/offer";
import { TemplateTile } from "@/site/gallery";
import { ClosingCta, Faq, HowItWorks } from "@/site/sections";
import { ButtonLink, Container, Eyebrow, Heading, Lead, Panel, PhoneFrame, Reveal, Section } from "@/ui";

// Every design is prerendered from generateStaticParams.
export const instant = false;

/** The design's own artwork as its share preview (illustrated designs), else the site card. */
const illustrated = new Set(["mandir", "mahal", "khat", "gopuram", "bagh"]);
const shareImage = (id: string) => (illustrated.has(id) ? `/art/illus/${id}-hero.jpg` : "/opengraph-image");

export function generateStaticParams() {
  return templates.map((t) => ({ slug: t.id }));
}

export async function generateMetadata({ params }: PageProps<"/templates/[slug]">): Promise<Metadata> {
  const t = getTemplate((await params).slug);
  if (!t) return {};
  const meta = pageMeta(`/templates/${t.id}`, `${t.name} · ${categoryOf(t.category).title}`, `${t.tagline} Animated digital invitation from ₹${t.price}, shared on WhatsApp.`);
  return { ...meta, openGraph: { ...meta.openGraph, images: [{ url: shareImage(t.id), width: 864, height: 1536 }] } };
}

const highlights = [
  ["Opens in seconds", "On any phone, straight from WhatsApp. No app to install."],
  [`Live within ${site.publishWithin}`, "Once your UPI payment is confirmed."],
  [`${site.revisionRounds} rounds of changes`, "Venue moved or a name misspelt? We update the same link."],
  ["One tap to the venue", "Google Maps directions on every function card."],
  ["Live through the wedding", `Your link works until ${site.inviteDaysAfterWedding} days after the big day.`],
  ["A real person on WhatsApp", `We reply ${site.hours}, not a bot.`],
];

export default async function TemplatePage({ params }: PageProps<"/templates/[slug]">) {
  const t = getTemplate((await params).slug);
  if (!t) notFound();
  const cat = categoryOf(t.category);
  const others = templates.filter((x) => x.id !== t.id).slice(0, 3);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: `${t.name} digital wedding invitation`,
          description: t.description.join(" "),
          image: `${siteConfig.url}${shareImage(t.id)}`,
          brand: { "@type": "Brand", name: siteConfig.name },
          category: "Digital wedding invitation",
          offers: { "@type": "Offer", price: t.price, priceCurrency: "INR", availability: "https://schema.org/InStock", url: `${siteConfig.url}/templates/${t.id}` },
        }}
      />
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
              <p className="flex w-fit items-center gap-1.5 rounded-full bg-[#fff1e6] px-3 py-1 text-[13px] font-medium text-[#b4410f]">
                {offer.emoji} {offer.name} · {offer.endsAt ? <OfferCountdown /> : "introductory prices"}
              </p>
              <PriceTag price={t.price} mrp={t.mrp} size="lg" className="mt-3 flex" />
              <p className="mt-1 text-body text-muted">
                One price, everything included: music, maps, countdown and RSVP.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <ButtonLink href={`/start/${t.id}`}>Customise this design</ButtonLink>
                <ButtonLink href={`/i/${t.demoSlug}`} variant="inverse" arrow newTab>
                  Open full demo
                </ButtonLink>
              </div>
              <ol className="mt-8 space-y-4 border-t border-line pt-6">
                {[
                  ["Fill in your details", "Names, functions, venues and your song, with a live preview."],
                  ["We message you on WhatsApp", "With payment details. Pay by UPI from any app."],
                  ["Your link arrives", `Within ${site.publishWithin} of payment, on WhatsApp.`],
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
