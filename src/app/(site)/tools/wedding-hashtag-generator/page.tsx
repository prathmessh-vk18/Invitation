import type { Metadata } from "next";
import { WORDING_LIVE } from "@/data/wordings";
import { site } from "@/config/site";
import { JsonLd, pageMeta } from "@/lib/seo";
import { Accordion, Container, Lead } from "@/ui";
import { HashtagGenerator } from "./HashtagGenerator";

export const metadata: Metadata = {
  ...pageMeta(
    "/tools/wedding-hashtag-generator",
    "Free wedding hashtag generator for Indian weddings",
    "Make wedding hashtags from your names in seconds: name blends, Weds and Ki Shaadi tags, Haldi, Mehndi and Sangeet tags. Free, tap to copy.",
  ),
  ...(WORDING_LIVE ? {} : { robots: { index: false, follow: true } }),
};

const faqs = [
  { q: "How do I pick a good wedding hashtag?", a: "Short, easy to spell and unique to you. Say it out loud: if guests can type it from hearing it once, it works. Check it on Instagram first so you don't share it with another couple." },
  { q: "Should we have one hashtag for every function?", a: "One main hashtag for the wedding is enough for most couples. Some add a small variation for the Haldi, Mehndi or Sangeet so photos from each function stay together." },
  { q: "Where should we put the hashtag?", a: "On the invitation, at the photo booth, on welcome boards and in the WhatsApp message you send with your invite, so guests see it before they start posting." },
];

export default function Page() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Wedding hashtag generator",
          url: `${site.url}/tools/wedding-hashtag-generator`,
          applicationCategory: "LifestyleApplication",
          operatingSystem: "Any",
          offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
        }}
      />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }} />
      <section className="pt-14 pb-24">
        <Container className="max-w-[760px]">
          <p className="text-caption font-medium text-subtle">Free tool</p>
          <h1 className="mt-2 text-heading text-balance text-ink">Wedding hashtag generator</h1>
          <Lead className="mt-4">Type your names and get hashtags for the wedding and every function. Tap one to copy it.</Lead>
          <div className="mt-8">
            <HashtagGenerator />
          </div>
          <div className="mt-14">
            <p className="text-title">Questions, answered</p>
            <div className="mt-4">
              <Accordion items={faqs} />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
