import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getTemplate, templates } from "@/data/templates";
import { Container, Eyebrow } from "@/ui";
import { MakeItYours } from "./MakeItYours";

// One page per design, prerendered.
export const instant = false;

export function generateStaticParams() {
  return templates.map((t) => ({ template: t.id }));
}

export async function generateMetadata({ params }: PageProps<"/start/[template]">): Promise<Metadata> {
  const t = getTemplate((await params).template);
  return t ? { title: `Customise ${t.name}`, robots: { index: false } } : {};
}

export default async function StartPage({ params }: PageProps<"/start/[template]">) {
  const t = getTemplate((await params).template);
  if (!t) notFound();
  return (
    <section className="pt-10 pb-24">
      <Container wide>
        <Eyebrow>
          <Link href={`/templates/${t.id}`} className="hover:text-ink">
            ← Back to {t.name}
          </Link>
        </Eyebrow>
        {/* The form says the rest (its title shows on the first step only). */}
        <div className="mt-6">
          <Suspense fallback={<div className="h-[60vh] rounded-card bg-panel" />}>
            <MakeItYours t={t} />
          </Suspense>
        </div>
      </Container>
    </section>
  );
}
