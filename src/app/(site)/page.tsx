import { Diya, MarigoldHead } from "@/art/ornaments";
import { formatINR } from "@/config/site";
import { getTemplate, templates } from "@/data/templates";
import { InvitePreview } from "@/invites/InvitePreview";
import { Gallery } from "@/site/gallery";
import { ClosingCta, Comparison, Faq, Features, HowItWorks, Testimonials } from "@/site/sections";
import { Badge, ButtonLink, Container, Display, Heading, InlineIcon, Lead, PhoneFrame, Placeholder, Reveal } from "@/ui";

export default function Home() {
  const spotlight = getTemplate("rajwada")!;
  const [left, right] = [getTemplate("noor")!, getTemplate("kolam")!];
  return (
    <>
      {/* Hero */}
      <section className="pt-20 pb-16 text-center sm:pt-28">
        <Container>
          <Reveal>
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
              <ButtonLink href={`/i/${spotlight.demoSlug}`} variant="secondary" arrow>
                See a live invite
              </ButtonLink>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Gallery */}
      <section id="designs" className="scroll-mt-20">
        <Container wide className="px-3 sm:px-5">
          <Reveal delay={0.1}>
            <Gallery />
          </Reveal>
        </Container>
      </section>

      {/* Stats — placeholders until real numbers exist */}
      <section className="py-20 text-center">
        <Container>
          <p className="text-body text-muted">Opened by guests in every corner of India</p>
          <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              [<Placeholder key="a">[0,000+]</Placeholder>, "Invites sent"],
              [<Placeholder key="b">[0.0★]</Placeholder>, "Couple rating"],
              ["3 days", "To your link"],
              [`${templates.length} designs`, "And growing"],
            ].map(([v, l]) => (
              <div key={l as string}>
                <p className="text-[32px] font-semibold tracking-[-0.03em]">{v}</p>
                <p className="mt-1 text-caption text-subtle">{l}</p>
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
                <ButtonLink href={`/i/${spotlight.demoSlug}`}>Open the invite →</ButtonLink>
                <ButtonLink href={`/templates/${spotlight.id}`} variant="inverse">
                  {formatINR(spotlight.price)} · Details
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
