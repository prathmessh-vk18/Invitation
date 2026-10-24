import type { Metadata } from "next";
import Link from "next/link";
import { guides } from "@/data/guides";
import { pageMeta } from "@/lib/seo";
import { Container, Display, Lead, Reveal } from "@/ui";

export const metadata: Metadata = pageMeta(
  "/guides",
  "Wedding invitation guides",
  "Wording samples, timelines and traditions for Indian wedding invitations: Haldi, Mehndi, Sangeet, Nikah, Anand Karaj, Marathi and South Indian weddings.",
);

const topics = [...new Set(guides.map((g) => g.topic))];

export default function GuidesPage() {
  return (
    <section className="pt-20 pb-28">
      <Container>
        <Reveal className="text-center">
          <Display className="mx-auto max-w-3xl">Wedding invitation guides</Display>
          <Lead className="mx-auto mt-6">What to write, when to send it, and the traditions behind each ceremony. With sample wordings you can copy.</Lead>
        </Reveal>
        {topics.map((topic) => (
          <div key={topic} className="mt-16">
            <p className="text-caption font-medium text-subtle uppercase">{topic}</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {guides
                .filter((g) => g.topic === topic)
                .map((g) => (
                  <Link key={g.slug} href={`/guides/${g.slug}`} className="group flex flex-col rounded-card bg-panel p-6 transition hover:bg-panel-strong">
                    <h2 className="text-title text-balance">{g.title}</h2>
                    <p className="mt-2 flex-1 text-body text-muted">{g.description}</p>
                    <p className="mt-5 text-caption font-medium text-ink">
                      {g.readMins} min read <span className="transition group-hover:translate-x-1">→</span>
                    </p>
                  </Link>
                ))}
            </div>
          </div>
        ))}
      </Container>
    </section>
  );
}
