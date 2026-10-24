import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { Showcase } from "@/site/showcase";
import { ClosingCta, HowItWorks } from "@/site/sections";
import { Container, Display, Lead, Reveal } from "@/ui";

export const metadata: Metadata = pageMeta(
  "/designs",
  "Wedding invitation designs",
  "Animated digital wedding invitation designs for Hindu, Muslim, Sikh and South Indian weddings, with live demos. From ₹249.",
);

export default function DesignsPage() {
  return (
    <>
      <section className="pt-20 pb-12 text-center">
        <Container>
          <Reveal>
            <Display className="mx-auto max-w-3xl">Find your design.</Display>
            <Lead className="mx-auto mt-6">Tap any design to open its live demo before you choose. Every one includes music, maps, countdown and RSVP.</Lead>
          </Reveal>
        </Container>
      </section>
      <section className="pb-8">
        <Container wide className="px-3 sm:px-5">
          <Showcase />
        </Container>
      </section>
      <HowItWorks />
      <ClosingCta />
    </>
  );
}
