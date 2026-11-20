import type { Metadata } from "next";
import Link from "next/link";
import { FUNCTIONS, LANGS, TONES, findPage, WORDING_LIVE } from "@/data/wordings";
import { pageMeta } from "@/lib/seo";
import { ButtonLink, Container, Lead } from "@/ui";

export const metadata: Metadata = {
  ...pageMeta("/wording", "Indian wedding invitation wording: messages to copy", "Ready-to-copy invitation messages for Haldi, Mehndi, Sangeet, engagement and wedding, in English and Hindi: traditional, for WhatsApp, from parents and funny."),
  ...(WORDING_LIVE ? {} : { robots: { index: false, follow: true } }),
};

export default function WordingIndex() {
  return (
    <section className="pt-14 pb-24">
      <Container className="max-w-[900px]">
        <h1 className="text-heading text-balance text-ink">Invitation wording to copy</h1>
        <Lead className="mt-4">
          Messages for every function, in English and Hindi: traditional, short for WhatsApp, from parents, and funny. Add your names once and every wording fills in.
        </Lead>
        <ButtonLink href="/tools/invitation-wording-generator" className="mt-6">
          Try the wording generator →
        </ButtonLink>
        <div className="mt-12 space-y-10">
          {FUNCTIONS.map((f) => (
            <div key={f.id} id={f.id}>
              <h2 className="text-[26px] leading-tight font-semibold tracking-[-0.02em] text-ink">{f.name} invitation wording</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {LANGS.map((l) => (
                  <div key={l.id} className="rounded-tile bg-panel p-5">
                    <p className="text-caption font-semibold text-subtle uppercase">In {l.name}</p>
                    <ul className="mt-2 space-y-1.5">
                      {TONES.map((t) => {
                        const p = findPage(f.id, l.id, t.id);
                        return p ? (
                          <li key={t.id}>
                            <Link href={`/wording/${p.slug}`} className="text-[15px] font-medium text-ink underline-offset-4 hover:underline">
                              {p.title}
                            </Link>
                          </li>
                        ) : null;
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
