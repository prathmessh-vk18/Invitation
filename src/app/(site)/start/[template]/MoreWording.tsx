"use client";

import { useMemo, useState } from "react";
import { editorSections, fieldsFor, getAt, hasEditor, type Ctx, type Field } from "@/config/editor";
import type { Invite } from "@/data/invites";
import { defaultWord, langOf } from "@/invites/i18n";

/**
 * Every other word the design prints, for the new-order form: the headings and small lines of each
 * part ("Until we say “I do”", "Will you join us?"…) and their small layout options. It draws the
 * same fields as the invite editor (src/config/editor.ts), minus the ones the form already asks
 * for, so a couple can change any word on their invite before they pay.
 */

/** Asked for elsewhere in the form, so not repeated here. */
const IN_FORM = new Set([
  "groom.first",
  "bride.first",
  "lead",
  "date",
  "city",
  "invocation",
  "invocationMeaning",
  "heroKicker",
  "joiner",
  "hideHeroDate",
  "hideHeroCity",
  "hosts",
  "message",
  "closing",
  "hashtag",
  "rsvp.phone",
  "rsvp.by",
]);

type Simple = Extract<Field, { kind: "text" | "toggle" | "choice" }>;
const simple = (f: Field): f is Simple => (f.kind === "text" || f.kind === "toggle" || f.kind === "choice") && !IN_FORM.has(f.key);

/** The editor's fields for these parts of the invite on this design, as groups with their titles. */
export function moreGroups(design: string, sections: string[]) {
  // Only on designs whose every heading follows these words (the editor's designs).
  if (!hasEditor(design)) return [];
  return editorSections
    .filter((s) => sections.includes(s.id))
    .map((s) => ({ id: s.id, title: s.title, optional: s.optional, fields: fieldsFor(s.fields, design).filter(simple) }))
    .filter((g) => g.fields.length);
}

export type More = Record<string, string | boolean>;

export function MoreWording({
  design,
  invite,
  sections,
  more,
  onChange,
  hidden = [],
  title = "Change the design's own words",
}: {
  design: string;
  invite: Invite;
  sections: string[];
  more: More;
  onChange: (key: string, value: string | boolean | undefined) => void;
  hidden?: string[];
  title?: string;
}) {
  const [open, setOpen] = useState(() => Object.keys(more).some((k) => moreGroups(design, sections).some((g) => g.fields.some((f) => f.key === k))));
  const lang = langOf(invite);
  const ctx: Ctx = useMemo(() => ({ invite, lang, design, word: (k: string) => invite.words?.[k] ?? defaultWord(lang, k) }), [invite, lang, design]);
  // A part the couple turned off has nothing to word.
  const groups = moreGroups(design, sections).filter((g) => !(g.optional && hidden.includes(g.optional)));
  if (!groups.length) return null;

  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)} className="h-10 rounded-full border border-line bg-white px-4 text-[14px] font-medium whitespace-nowrap transition hover:border-faint">
        ✎ {title}
      </button>
    );

  return (
    <div className="space-y-5 rounded-[16px] bg-white/60 p-4 ring-1 ring-line">
      <p className="text-[13px] leading-snug text-subtle">These start as the design has them. Change any word; clear a small line to hide it.</p>
      {groups.map((g) => (
        <div key={g.id} className="space-y-4">
          {groups.length > 1 && <p className="text-[12px] font-semibold tracking-[0.08em] text-subtle uppercase">{g.title}</p>}
          {g.fields.map((f) => (
            <FieldRow key={f.key} f={f} ctx={ctx} value={more[f.key]} onChange={(v) => onChange(f.key, v)} />
          ))}
        </div>
      ))}
    </div>
  );
}

function FieldRow({ f, ctx, value, onChange }: { f: Simple; ctx: Ctx; value: string | boolean | undefined; onChange: (v: string | boolean | undefined) => void }) {
  const id = `more-${f.key}`;
  if (f.kind === "text") {
    const design = f.fallback?.(ctx) ?? "";
    const saved = getAt(ctx.invite, f.key);
    const shown = typeof value === "string" ? value : typeof saved === "string" ? saved : design;
    const set = (v: string) => {
      // Back to the design's own words when they match it; an empty small line hides it.
      if (v === design) onChange(undefined);
      else if (!v.trim()) onChange(f.emptyHides ? "" : undefined);
      else onChange(v);
    };
    return (
      <div className="min-w-0">
        <label htmlFor={id} className="text-[14px] font-semibold">
          {f.label}
        </label>
        {f.multiline ? (
          <textarea id={id} value={shown} rows={3} maxLength={f.max} onChange={(e) => set(e.target.value)} placeholder={f.placeholder ?? (f.emptyHides ? "Hidden" : "")} className={field} />
        ) : (
          <input id={id} value={shown} maxLength={f.max} onChange={(e) => set(e.target.value)} placeholder={f.placeholder ?? (f.emptyHides ? "Hidden" : "")} className={field} />
        )}
        {f.help && <p className="mt-1.5 text-[13px] text-subtle">{f.help}</p>}
      </div>
    );
  }
  if (f.kind === "toggle") {
    const stored = typeof value === "boolean" ? value : Boolean(getAt(ctx.invite, f.key));
    const on = f.invert ? !stored : stored;
    return (
      <Switch
        label={f.label}
        help={f.help}
        on={on}
        onChange={(next) => {
          const v = f.invert ? !next : next;
          onChange(v ? true : undefined);
        }}
      />
    );
  }
  const current = value ?? f.current?.(ctx) ?? (getAt(ctx.invite, f.key) as string | boolean | undefined) ?? f.fallback;
  return (
    <div>
      <p className="text-[14px] font-semibold">{f.label}</p>
      <div role="radiogroup" aria-label={f.label} className="mt-2 flex flex-wrap gap-2">
        {f.options.map((o) => (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={current === o.value}
            onClick={() => onChange(o.value === f.fallback ? undefined : o.value)}
            className={`h-10 rounded-full px-4 text-[14px] font-medium whitespace-nowrap transition ${current === o.value ? "bg-ink text-white" : "bg-white text-ink ring-1 ring-line hover:bg-white/70"}`}
          >
            {o.label}
          </button>
        ))}
      </div>
      {f.help && <p className="mt-1.5 text-[13px] text-subtle">{f.help}</p>}
    </div>
  );
}

const field = "mt-1.5 block w-full min-w-0 appearance-none rounded-[14px] border border-line bg-white px-3.5 py-3 text-[16px] text-ink outline-none transition placeholder:text-faint focus:border-ink resize-none leading-snug";

function Switch({ label, help, on, onChange }: { label: string; help?: string; on: boolean; onChange: (on: boolean) => void }) {
  return (
    <div className="flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-medium">{label}</p>
        {help && <p className="text-[13px] leading-snug text-subtle">{help}</p>}
      </div>
      <div role="radiogroup" aria-label={label} className="flex shrink-0 rounded-full bg-white p-1 ring-1 ring-line">
        {(["Yes", "No"] as const).map((w, i) => {
          const picked = i === 0 ? on : !on;
          return (
            <button key={w} type="button" role="radio" aria-checked={picked} onClick={() => onChange(i === 0)} className={`h-9 min-w-[52px] rounded-full px-3 text-[14px] font-semibold transition ${picked ? "bg-ink text-white" : "text-muted"}`}>
              {w}
            </button>
          );
        })}
      </div>
    </div>
  );
}
