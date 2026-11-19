import type { Metadata } from "next";
import { Suspense } from "react";
import { WORDING_LIVE } from "@/data/wordings";
import { JsonLd, pageMeta } from "@/lib/seo";
import { site } from "@/config/site";
import { Container, Lead } from "@/ui";
import { WordingGenerator } from "./WordingGenerator";

export const metadata: Metadata = {
  ...pageMeta(
    "/tools/invitation-wording-generator",
    "Free invitation wording generator for Indian weddings",
    "Make Haldi, Mehndi, Sangeet, engagement and wedding invitation messages with your names, date and venue, in English or Hindi. Free, copy in one tap.",
  ),
  ...(WORDING_LIVE ? {} : { robots: { index: false, follow: true } }),
};

export default function Page() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Invitation wording generator",
          url: `${site.url}/tools/invitation-wording-generator`,
          applicationCategory: "LifestyleApplication",
          operatingSystem: "Any",
          offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
        }}
      />
      <section className="pt-14 pb-24">
        <Container className="max-w-[760px]">
          <p className="text-caption font-medium text-subtle">Free tool</p>
          <h1 className="mt-2 text-heading text-balance text-ink">Invitation wording generator</h1>
          <Lead className="mt-4">Pick the function, language and style, add your names, date and venue, and copy a ready message for your card or WhatsApp.</Lead>
          <div className="mt-8">
            <Suspense>
              <WordingGenerator />
            </Suspense>
          </div>
        </Container>
      </section>
    </>
  );
}
