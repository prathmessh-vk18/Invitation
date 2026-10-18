import type { Metadata } from "next";
import Link from "next/link";
import { categories } from "@/data/categories";
import { templatesIn } from "@/data/templates";
import { Gallery } from "@/site/gallery";
import { ClosingCta, HowItWorks } from "@/site/sections";
import { Container, Display, Lead, Reveal } from "@/ui";

export const metadata: Metadata = {
  title: "All designs",
  description: "Every invitation design, with live demos: Hindu, Muslim, Sikh and South Indian weddings.",
};

export default function DesignsPage() {
  return (
    <>
      <section className="pt-20 pb-12 text-center">
        <Container>
          <Reveal>
            <Display className="mx-auto max-w-3xl">Find your design.</Display>
            <Lead className="mx-auto mt-6">Tap any design to open its live demo before you choose. Every one includes music, maps, countdown and RSVP.</Lead>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {categories.map((c) => (
                <Link key={c.id} href={`/${c.slug}`} className="rounded-full bg-panel px-4 py-2 text-[14px] font-medium transition hover:bg-panel-strong">
                  {c.label} · {templatesIn(c.id).length}
                </Link>
              ))}
            </div>
          </Reveal>
        </Container>
      </section>
      <section className="pb-8">
        <Container wide className="px-3 sm:px-5">
          <Gallery />
        </Container>
      </section>
      <HowItWorks />
      <ClosingCta />
    </>
  );
}
