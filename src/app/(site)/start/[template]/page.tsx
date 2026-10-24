import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getTemplate, templates } from "@/data/templates";
import { Container, Eyebrow, Heading, Lead } from "@/ui";
import { OrderForm } from "./OrderForm";

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
        <Heading as="h2" className="mt-4">
          Make {t.name} yours.
        </Heading>
        <Lead className="mt-3 max-w-[640px]">
          Seven short steps, with a live preview of your invite as you go. No payment now: we&rsquo;ll message you on WhatsApp once you submit.
        </Lead>
        <div className="mt-10">
          <Suspense fallback={<div className="h-[60vh] rounded-card bg-panel" />}>
            <OrderForm t={t} />
          </Suspense>
        </div>
      </Container>
    </section>
  );
}
