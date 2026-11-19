"use client";

import { useState } from "react";
import { fill, fillParts, SAMPLE, type Fill, type Wording, type WordingLang } from "@/data/wordings";

/**
 * Wordings a couple can personalise and copy. Their details, once typed, fill every wording; until
 * then the sample names show (marked), and a copy leaves a clear blank like "[Bride's name]" so a
 * sample name is never pasted by mistake. Used on the wording pages and the wording generator.
 */

const BLANK: Fill = { bride: "[Bride's name]", groom: "[Groom's name]", family: "[Family name]", date: "[Day, date]", time: "[Time]", venue: "[Venue]" };
const FIELDS: { k: keyof Fill; label: string; placeholder: string }[] = [
  { k: "bride", label: "Bride", placeholder: "Meera" },
  { k: "groom", label: "Groom", placeholder: "Aarav" },
  { k: "family", label: "Family", placeholder: "Sharma family" },
  { k: "date", label: "Day & date", placeholder: "Sunday, 12 January" },
  { k: "time", label: "Time", placeholder: "11:00 am" },
  { k: "venue", label: "Venue", placeholder: "Sharma Residence, Jaipur" },
];

export function useDetails(initial?: Partial<Fill>) {
  return useState<Partial<Fill>>(initial ?? {});
}

/** The couple's details: names, date, time, venue. */
export function DetailsForm({ values, onChange, lang = "en" }: { values: Partial<Fill>; onChange: (v: Partial<Fill>) => void; lang?: WordingLang }) {
  // Hindi wordings read best with the details in Hindi too, so the examples are in Hindi.
  const example = lang === "hi" ? SAMPLE.hi : undefined;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {FIELDS.map((f) => (
        <label key={f.k} className="min-w-0">
          <span className="text-caption font-semibold text-ink">{f.label}</span>
          <input
            value={values[f.k] ?? ""}
            onChange={(e) => onChange({ ...values, [f.k]: e.target.value })}
            placeholder={example ? example[f.k] : f.placeholder}
            className="mt-1 block h-11 w-full min-w-0 rounded-[12px] border border-line bg-surface px-3 text-[15px] text-ink outline-none placeholder:text-faint focus:border-ink"
          />
        </label>
      ))}
    </div>
  );
}

export function WordingCards({ wordings, lang, values }: { wordings: Wording[]; lang: WordingLang; values: Partial<Fill> }) {
  const shown = { ...SAMPLE[lang], ...Object.fromEntries(Object.entries(values).filter(([, v]) => v?.trim())) };
  const copyWith = { ...BLANK, ...Object.fromEntries(Object.entries(values).filter(([, v]) => v?.trim())) };
  return (
    <div className="space-y-4">
      {wordings.map((w, i) => (
        <figure key={i} className="rounded-tile bg-panel p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <figcaption className="text-caption font-medium text-subtle uppercase">
              {i + 1}. {w.label}
            </figcaption>
            <CopyButton text={fill(w.text, copyWith)} />
          </div>
          <blockquote
            lang={lang}
            className="mt-3 text-[19px] leading-relaxed whitespace-pre-line text-ink"
            style={{ fontFamily: lang === "hi" ? "var(--font-deva), serif" : "var(--font-cormorant), var(--font-deva), serif" }}
          >
            {fillParts(w.text, shown).map((p, j) =>
              p.filled ? (
                <mark key={j} className="rounded-[4px] bg-[#fff1c2] px-0.5 text-ink">
                  {p.text}
                </mark>
              ) : (
                <span key={j}>{p.text}</span>
              ),
            )}
          </blockquote>
        </figure>
      ))}
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() =>
        navigator.clipboard?.writeText(text).then(() => {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        })
      }
      className="h-9 shrink-0 rounded-full bg-ink px-4 text-[14px] font-semibold text-white transition active:scale-95"
    >
      {copied ? "Copied ✓" : "Copy"}
    </button>
  );
}

/** A page's wordings with an "Add your names" panel above them that fills every one. */
export function PersonalWordings({ wordings, lang }: { wordings: Wording[]; lang: WordingLang }) {
  const [values, setValues] = useDetails();
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div className="rounded-tile bg-surface p-4 ring-1 ring-line">
        {open ? (
          <>
            <p className="text-body font-semibold">Your details</p>
            <p className="mt-0.5 mb-3 text-caption text-subtle">They fill every wording below. Nothing is saved or sent.</p>
            <DetailsForm values={values} onChange={setValues} lang={lang} />
          </>
        ) : (
          <button type="button" onClick={() => setOpen(true)} className="flex w-full items-center justify-between gap-3 text-left">
            <span>
              <span className="block text-body font-semibold">✎ Add your names and date</span>
              <span className="block text-caption text-subtle">Every wording below fills in, ready to copy.</span>
            </span>
            <span className="shrink-0 rounded-full bg-ink px-4 py-2 text-[14px] font-semibold text-white">Personalise</span>
          </button>
        )}
      </div>
      <div className="mt-5">
        <WordingCards wordings={wordings} lang={lang} values={values} />
      </div>
    </div>
  );
}
