import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getTemplate, templates } from "@/data/templates";
import { Container, Eyebrow, Heading, Lead } from "@/ui";
import { hasEditor } from "@/config/editor";
import { OrderForm } from "./OrderForm";
import { QuickStart } from "./QuickStart";

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
  // Designs with the invite editor: three short steps, then the couple makes it theirs on the invite itself.
  if (hasEditor(t.id))
    return (
      <section className="pt-8 pb-10">
        <Container>
          <Eyebrow>
            <Link href={`/templates/${t.id}`} className="hover:text-ink">
              ← Back to {t.name}
            </Link>
          </Eyebrow>
          <div className="mt-6">
            <QuickStart t={t} />
          </div>
        </Container>
      </section>
    );
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
          {!t.payDirect
            ? "A few short steps, with a live preview of your invite as you go. Pay securely online at the end, and your invite goes live within minutes."
            : "A few short steps, with a live preview of your invite as you go. Send it when you're done: we'll confirm payment with you directly and put your invite live."}
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
