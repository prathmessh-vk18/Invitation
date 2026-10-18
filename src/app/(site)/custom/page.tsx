import type { Metadata } from "next";
import { formatINR, site } from "@/config/site";
import { Faq } from "@/site/sections";
import { Container, Display, Lead, Panel, Reveal } from "@/ui";
import { CustomForm } from "./CustomForm";

export const metadata: Metadata = {
  title: "Custom wedding invitation",
  description: "An invitation website designed from scratch for your wedding: your art, your structure, your language.",
};

const points = [
  ["Original artwork", "Drawn for your wedding alone, not adapted from a template."],
  ["Your structure", "Any ceremony, any order, any language, including ones no template covers."],
  ["Quoted per project", `From ${formatINR(site.customFrom)}, depending on artwork and the number of functions.`],
  ["Same delivery", "One link that opens on any phone and stays live for life."],
];

const faqs = [
  { q: "How is this different from a template?", a: "Templates are ready designs we personalise. A custom invite starts from a blank page: new artwork, a new opening animation and a layout built around your functions." },
  { q: "How long does it take?", a: "Usually 7 to 10 days from the first brief, depending on the artwork. We share sketches before anything is finalised." },
  { q: "Can you copy a design we saw elsewhere?", a: "We won't copy another studio's work, but we're happy to take inspiration from it and make something that is properly yours." },
  { q: "What if a template would be enough?", a: "We'll tell you. If one of our designs fits, we'll suggest it and save you the cost." },
];

export default function CustomPage() {
  return (
    <>
      <section className="pt-20 pb-16">
        <Container className="grid gap-14 lg:grid-cols-[1fr_1.1fr]">
          <Reveal>
            <Display>Designed from scratch, just for you.</Display>
            <Lead className="mt-6">
              Some families already have the whole thing pictured: a painting they love, a ritual nobody else does, the colour of the lehenga. That&rsquo;s a
              custom invitation.
            </Lead>
            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              {points.map(([h, b]) => (
                <Panel key={h} className="p-5">
                  <p className="text-title">{h}</p>
                  <p className="mt-1 text-body text-muted">{b}</p>
                </Panel>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <Panel className="p-6 sm:p-8">
              <p className="text-title">Tell us what you have in mind</p>
              <p className="mt-1 mb-6 text-body text-muted">The more you share, the better our first reply. This opens WhatsApp with your brief ready to send.</p>
              <CustomForm />
            </Panel>
          </Reveal>
        </Container>
      </section>
      <Faq items={faqs} title="Before you ask." />
    </>
  );
}
