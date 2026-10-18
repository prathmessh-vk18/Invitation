import type { Metadata } from "next";
import { site, whatsappLink } from "@/config/site";
import { templates } from "@/data/templates";
import { ButtonLink, Container, Display, Heading, Lead, Panel, Reveal, Section } from "@/ui";

export const metadata: Metadata = { title: "About", description: `Why ${site.name} exists and how we work.` };

export default function AboutPage() {
  return (
    <>
      <section className="pt-20 pb-16 text-center">
        <Container>
          <Reveal>
            <Display className="mx-auto max-w-3xl">Invitations your family will keep.</Display>
            <Lead className="mx-auto mt-6">
              {site.name} makes invitation websites for Indian weddings: one link that holds every function, venue and song, and opens beautifully on any phone.
            </Lead>
          </Reveal>
        </Container>
      </section>
      <Section className="pt-0">
        <Container className="grid gap-4 md:grid-cols-3">
          {[
            ["Why we started", "Printed cards cost a fortune and can't change once they're printed. WhatsApp videos are hard to read and impossible to update. We wanted something in between: beautiful, easy to share and easy to fix."],
            ["What you get", `A designed invitation website with an opening animation, every function with its venue and map, a countdown, music and RSVP on WhatsApp. ${templates.length} designs to start from, or one drawn from scratch.`],
            ["How we work", `Every invite is made for one family by a real person. We work with you on WhatsApp, deliver in ${site.deliveryDays} days and include ${site.revisionRounds} rounds of changes.`],
          ].map(([h, b], i) => (
            <Reveal key={h} delay={i * 0.08}>
              <Panel className="h-full p-7">
                <p className="text-title">{h}</p>
                <p className="mt-2 text-body text-muted">{b}</p>
              </Panel>
            </Reveal>
          ))}
        </Container>
      </Section>
      <Section tone="panel" center>
        <Container>
          <Heading muted="We'd love to be part of it.">Planning a wedding?</Heading>
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            <ButtonLink href={whatsappLink(`Hi ${site.name}!`)}>Chat on WhatsApp</ButtonLink>
            <ButtonLink href="/designs" variant="inverse">
              See the designs
            </ButtonLink>
          </div>
          <p className="mt-6 text-body text-muted">
            {site.whatsappDisplay} · {site.email} · {site.hours}
          </p>
        </Container>
      </Section>
    </>
  );
}
