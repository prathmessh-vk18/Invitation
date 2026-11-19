"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { findPage, FUNCTIONS, LANGS, TONES, type WordingFunction, type WordingLang, type WordingTone } from "@/data/wordings";
import { DetailsForm, useDetails, WordingCards } from "@/site/wording-cards";

/** Choose a function, language and style; the matching page's wordings fill with the couple's details. */
export function WordingGenerator() {
  const q = useSearchParams();
  const pick = <T extends string>(v: string | null, ok: readonly T[], d: T) => (v && (ok as readonly string[]).includes(v) ? (v as T) : d);
  const [fn, setFn] = useState<WordingFunction>(() => pick(q.get("fn"), FUNCTIONS.map((f) => f.id), "wedding"));
  const [lang, setLang] = useState<WordingLang>(() => pick(q.get("lang"), LANGS.map((l) => l.id), "en"));
  const [tone, setTone] = useState<WordingTone>(() => pick(q.get("tone"), TONES.map((t) => t.id), "traditional"));
  const [values, setValues] = useDetails();
  const page = findPage(fn, lang, tone);

  return (
    <div>
      <div className="space-y-5 rounded-card bg-panel p-5 sm:p-7">
        <Row label="Function">
          {FUNCTIONS.map((f) => (
            <Chip key={f.id} on={fn === f.id} onClick={() => setFn(f.id)}>
              {f.name}
            </Chip>
          ))}
        </Row>
        <Row label="Language">
          {LANGS.map((l) => (
            <Chip key={l.id} on={lang === l.id} onClick={() => setLang(l.id)}>
              {l.name}
            </Chip>
          ))}
        </Row>
        <Row label="Style">
          {TONES.map((t) => (
            <Chip key={t.id} on={tone === t.id} onClick={() => setTone(t.id)}>
              {t.name}
            </Chip>
          ))}
        </Row>
        <div>
          <p className="mb-2 text-caption font-semibold text-subtle uppercase">Your details</p>
          <DetailsForm values={values} onChange={setValues} lang={lang} />
          <p className="mt-2 text-caption text-subtle">Nothing is saved or sent. Leave a box empty and the copy keeps a blank to fill.</p>
        </div>
      </div>

      {page ? (
        <div className="mt-8">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-title">{page.wordings.length} wordings</p>
            <Link href={`/wording/${page.slug}`} className="text-caption font-medium text-ink underline underline-offset-4">
              Tips and FAQs for this →
            </Link>
          </div>
          <WordingCards wordings={page.wordings} lang={lang} values={values} />
        </div>
      ) : (
        <p className="mt-8 rounded-tile bg-panel p-6 text-body text-muted">Coming soon for this choice.</p>
      )}

      <div className="mt-10 rounded-card bg-ink p-8 text-white">
        <p className="text-title text-white">Now make it an invitation</p>
        <p className="mt-2 text-body text-white/70">Put your wording on a designed invite with every function, maps and your song, shared as one link on WhatsApp. RSVPs counted for you, free.</p>
        <Link href="/designs" className="mt-5 inline-flex h-12 items-center rounded-full bg-white px-6 text-[15px] font-semibold text-ink">
          See the designs →
        </Link>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-caption font-semibold text-subtle uppercase">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick} className={`h-10 rounded-full px-4 text-[14px] font-medium whitespace-nowrap transition ${on ? "bg-ink text-white" : "bg-surface text-ink hover:bg-white"}`}>
      {children}
    </button>
  );
}
