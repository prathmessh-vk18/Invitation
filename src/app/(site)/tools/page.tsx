import type { Metadata } from "next";
import Link from "next/link";
import { WORDING_LIVE } from "@/data/wordings";
import { pageMeta } from "@/lib/seo";
import { Container, Lead } from "@/ui";

export const metadata: Metadata = {
  ...pageMeta("/tools", "Free wedding tools", "Free tools for Indian weddings: an invitation wording generator and a wedding hashtag generator."),
  ...(WORDING_LIVE ? {} : { robots: { index: false, follow: true } }),
};

const tools = [
  { href: "/tools/invitation-wording-generator", name: "Invitation wording generator", note: "Haldi, Mehndi, Sangeet, engagement and wedding messages with your names, in English or Hindi." },
  { href: "/tools/wedding-hashtag-generator", name: "Wedding hashtag generator", note: "Hashtags from your names for the wedding and every function." },
];

export default function ToolsPage() {
  return (
    <section className="pt-14 pb-24">
      <Container className="max-w-[760px]">
        <h1 className="text-heading text-ink">Free wedding tools</h1>
        <Lead className="mt-4">Quick, free helpers for planning your invitations. Nothing to sign up for.</Lead>
        <div className="mt-10 grid gap-3">
          {tools.map((t) => (
            <Link key={t.href} href={t.href} className="rounded-tile bg-panel p-6 transition hover:bg-panel-strong">
              <p className="text-title">{t.name} →</p>
              <p className="mt-1 text-body text-muted">{t.note}</p>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
