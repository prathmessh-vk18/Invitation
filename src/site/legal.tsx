import type { ReactNode } from "react";
import { Container, Display, Placeholder } from "@/ui";

/** Shared layout for legal pages. The draft banner stays until the text has been reviewed. */
export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <section className="pt-20 pb-28">
      <Container className="max-w-[720px]">
        <Display className="text-[clamp(36px,5vw,56px)]">{title}</Display>
        <p className="mt-4 text-caption text-subtle">Last updated {updated}</p>
        <p className="mt-6 rounded-tile bg-placeholder p-4 text-body text-placeholder-ink">
          Draft for review. This text is a starting point and must be checked by a qualified professional before the site goes live.{" "}
          <Placeholder>[Business name, address, GSTIN]</Placeholder>
        </p>
        <div className="mt-10 space-y-8 text-body text-ink-soft [&_h2]:text-title [&_h2]:text-ink [&_li]:mt-1 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:pl-5">{children}</div>
      </Container>
    </section>
  );
}
