import { JsonLd, organizationLd } from "@/lib/seo";
import Link from "next/link";
import { Diya, MarigoldHead } from "@/art/ornaments";
import { formatINR } from "@/config/site";
import { stats } from "@/data/social-proof";
import { getTemplate } from "@/data/templates";
import { InvitePreview } from "@/invites/InvitePreview";
import { Showcase } from "@/site/showcase";
import { ClosingCta, Comparison, Faq, Features, HowItWorks, Testimonials } from "@/site/sections";
import { Badge, ButtonLink, Container, Display, Heading, InlineIcon, Lead, PhoneFrame, Reveal } from "@/ui";

export const metadata = {
  alternates: { canonical: "/" },
  openGraph: { url: "/", title: "Aavjoo — Designer Wedding Invitation Websites", description: "Animated wedding invitation websites for Indian weddings, with every function, venue, song and RSVP in one WhatsApp link. From ₹249." },
};

export default function Home() {
  const spotlight = getTemplate("rajwada")!;
  const [left, right] = [getTemplate("noor")!, getTemplate("kolam")!];
  return (
    <>
      <JsonLd data={organizationLd} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "WebSite", name: "Aavjoo", url: "https://aavjoo.in" }} />
      {/* Hero */}
      <section className="pt-20 pb-16 text-center sm:pt-28">
        <Container>
          <Reveal>
            <Link
              href="/designs"
              className="mb-7 inline-flex items-center gap-2 rounded-full bg-[#fff1e6] py-1.5 pr-4 pl-1.5 text-[14px] font-medium text-[#b4410f] transition hover:bg-[#ffe6d2]"
            >
              <span className="rounded-full bg-[#e8582a] px-2.5 py-0.5 text-[12px] font-semibold whitespace-nowrap text-white">🪔 Diwali offer</span>
              <span className="whitespace-nowrap">
                From ₹249<span className="max-sm:hidden">, up to 75% off</span> →
              </span>
            </Link>
            <Display className="mx-auto max-w-[1040px]">
              Wedding invites
              <InlineIcon bg="var(--color-icon-maroon)" rotate={-6}>
                <Diya className="size-[80%]" glow={false} />
              </InlineIcon>
              your family will
              <InlineIcon bg="var(--color-icon-blush)" rotate={5}>
                <span className="size-[46%] rounded-full bg-[radial-gradient(circle_at_35%_30%,#d4677f,#a2405f_55%,#6e2440)]" />
              </InlineIcon>
              open twice
              <InlineIcon bg="var(--color-icon-butter)" rotate={-4}>
                <svg viewBox="-12 -12 24 24" className="size-[70%]" aria-hidden>
                  <MarigoldHead r={11} />
                </svg>
              </InlineIcon>
            </Display>
            <Lead className="mx-auto mt-7">
              Designer invitation websites for Indian weddings. Every function, venue, song and RSVP in one link, shared on WhatsApp.
            </Lead>
            <div className="mt-9 flex flex-wrap justify-center gap-2">
              <ButtonLink href="/designs">Choose a design</ButtonLink>
              <ButtonLink href={`/i/${spotlight.demoSlug}`} variant="secondary" arrow newTab>
                See a live invite
              </ButtonLink>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Designs */}
      <section id="designs" className="scroll-mt-20">
        <Container wide className="px-3 sm:px-5">
          <Showcase />
        </Container>
      </section>

      {/* Stats — placeholders until real numbers exist */}
      <section className="py-20 text-center">
        <Container>
          <p className="text-body text-muted">Made for today&rsquo;s Indian weddings</p>
          <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map((x) => (
              <div key={x.label}>
                <p className="text-[32px] font-semibold tracking-[-0.03em]">{x.value}</p>
                <p className="mt-1 text-caption text-subtle">{x.label}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Spotlight */}
      <section>
        <Container>
          <Reveal className="grid items-center gap-10 overflow-hidden rounded-card bg-panel p-8 sm:p-14 md:grid-cols-2">
            <div>
              <Badge live>Most loved this season</Badge>
              <Heading className="mt-5">Meet {spotlight.name}.</Heading>
              <Lead className="mt-4">{spotlight.tagline} Tap the seal and watch your names appear in gold.</Lead>
              <div className="mt-7 flex flex-wrap gap-2">
                <ButtonLink href={`/i/${spotlight.demoSlug}`} newTab>Open the invite →</ButtonLink>
                <ButtonLink href={`/templates/${spotlight.id}`} variant="inverse" newTab>
                  Only {formatINR(spotlight.price)} · Details
                </ButtonLink>
              </div>
            </div>
            <div className="relative mx-auto h-[420px] w-full max-w-[420px]">
              <div className="absolute top-12 left-0 w-[42%] -rotate-6 opacity-90">
                <PhoneFrame>
                  <InvitePreview slug={left.demoSlug} stage="open" loop={false} />
                </PhoneFrame>
              </div>
              <div className="absolute top-12 right-0 w-[42%] rotate-6 opacity-90">
                <PhoneFrame>
                  <InvitePreview slug={right.demoSlug} stage="open" loop={false} />
                </PhoneFrame>
              </div>
              <div className="absolute top-0 left-1/2 z-10 w-[50%] -translate-x-1/2">
                <PhoneFrame className="shadow-phone">
                  <InvitePreview slug={spotlight.demoSlug} />
                </PhoneFrame>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      <Features />
      <HowItWorks />
      <Comparison />
      <Testimonials />
      <Faq />
      <ClosingCta />
    </>
  );
}
