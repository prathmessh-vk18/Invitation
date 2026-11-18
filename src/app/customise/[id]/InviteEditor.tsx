"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { getAt, lookFields, sectionsFor, setAt, type Ctx, type Field } from "@/config/editor";
import type { Invite, Person } from "@/data/invites";
import { saveEdits } from "@/lib/editor-actions";
import type { InviteDetails } from "@/lib/orders";
import { defaultWord, langOf } from "@/invites/i18n";
import { EDIT_SECTION, PREVIEW_INVITE, PREVIEW_READY, PREVIEW_SCROLL } from "@/invites/editing";

type Props = {
  /** null for a demo, which never saves. */
  orderId: string | null;
  design: string;
  /** The invite's parts that aren't details: slug, template, song, photos. */
  extra: Pick<Invite, "slug" | "template"> & Partial<Invite>;
  details: InviteDetails;
  backHref: string;
};

type Sheet = { kind: "section"; id: string } | { kind: "sections" } | { kind: "look" } | null;

/**
 * The couple's own editor: their invite full screen, an Edit button on each part, and that part's
 * settings in a sheet from the bottom. Changes show as they type; Save puts them live.
 */
export function InviteEditor({ orderId, design, extra, details: start, backHref }: Props) {
  const [details, setDetails] = useState<InviteDetails>(start);
  const [saved, setSaved] = useState<InviteDetails>(start);
  const [history, setHistory] = useState<InviteDetails[]>([]);
  const lastPush = useRef(0);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [status, setStatus] = useState<{ tone: "ok" | "info" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);
  const ready = useRef(false);

  const invite = useMemo(() => ({ ...extra, ...details }) as Invite, [extra, details]);
  const lang = langOf(invite);
  const ctx: Ctx = useMemo(() => ({ invite, lang, design, word: (k: string) => defaultWord(lang, k) }), [invite, lang, design]);
  const sections = useMemo(() => sectionsFor(design), [design]);
  const dirty = JSON.stringify(details) !== JSON.stringify(saved);

  const post = useCallback((msg: object) => frame.current?.contentWindow?.postMessage(msg, window.location.origin), []);

  // The invite in the frame follows every change.
  const inviteRef = useRef(invite);
  useEffect(() => {
    inviteRef.current = invite;
    if (ready.current) post({ type: PREVIEW_INVITE, invite });
  }, [invite, post]);

  // The preview follows what's being edited: the line with this text, in the open part.
  const openId = sheet?.kind === "section" ? sheet.id : null;
  const revealTimer = useRef(0);
  const reveal = useCallback(
    (text: string | undefined) => {
      if (!openId || !text?.trim()) return;
      window.clearTimeout(revealTimer.current);
      revealTimer.current = window.setTimeout(() => post({ type: PREVIEW_SCROLL, id: openId, text }), 250);
    },
    [openId, post],
  );

  const openSection = useCallback(
    (id: string) => {
      setSheet({ kind: "section", id });
      post({ type: PREVIEW_SCROLL, id, offset: id === "cover" ? 0 : -8 });
    },
    [post],
  );

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.source !== frame.current?.contentWindow) return;
      if (e.data?.type === PREVIEW_READY) {
        ready.current = true;
        post({ type: PREVIEW_INVITE, invite: inviteRef.current });
      }
      if (e.data?.type === EDIT_SECTION) openSection(String(e.data.id));
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [post, openSection]);

  // Leaving with unsaved changes asks first.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  /** Changes the details; typing in one box within a moment counts as one step for Undo. */
  const change = useCallback((next: (d: InviteDetails) => InviteDetails) => {
    setDetails((d) => {
      const now = Date.now();
      if (now - lastPush.current > 800) setHistory((h) => [...h.slice(-49), d]);
      lastPush.current = now;
      return next(d);
    });
    setStatus(null);
  }, []);
  const set = useCallback((path: string, value: unknown) => change((d) => setAt(d, path, value)), [change]);

  const undo = () => {
    const prev = history[history.length - 1];
    if (!prev) return;
    setHistory((h) => h.slice(0, -1));
    lastPush.current = 0;
    setDetails(prev);
  };

  const save = async () => {
    if (!orderId) {
      setStatus({ tone: "info", text: "This is a demo, so nothing is saved. On a real order, Save puts your changes live." });
      return;
    }
    setSaving(true);
    try {
      const res = await saveEdits(orderId, details);
      if ("error" in res) setStatus({ tone: "error", text: res.error });
      else if ("dryRun" in res) setStatus({ tone: "info", text: "Test copy: your changes were checked but not saved (saving is off on this computer)." });
      else if ("unchanged" in res) {
        setSaved(details);
        setStatus({ tone: "info", text: "Nothing had changed." });
      } else {
        setSaved(details);
        setStatus({ tone: "ok", text: res.live ? "Saved ✓ Your invite is updated on the same link." : "Saved ✓ Your invite will look like this when it goes live." });
      }
    } catch {
      setStatus({ tone: "error", text: "We couldn't save. Check your internet and try again." });
    }
    setSaving(false);
  };

  const current = sheet?.kind === "section" ? sections.find((s) => s.id === sheet.id) : null;
  const hidden = (id: string) => (details.hide ?? []).includes(id as never);

  return (
    <div className="fixed inset-0 flex justify-center bg-[#2a2622]">
      <div className="relative h-full w-full max-w-[480px] overflow-hidden bg-black">
        <iframe ref={frame} src="/preview?edit=1" title="Your invite" className="absolute inset-x-0 top-0 h-[calc(100%-68px)] w-full border-0" allow="autoplay" />

        {/* The top bar: back, and what state the changes are in. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between p-3">
          <Link href={backHref} className="pointer-events-auto rounded-full bg-white/95 px-3.5 py-2 text-[14px] font-medium text-ink shadow-lg">
            ← {orderId ? "Order" : "Back"}
          </Link>
          {!orderId && <span className="rounded-full bg-[#fff3c4] px-3 py-2 text-[13px] font-medium text-[#7a5b00] shadow-lg">Demo</span>}
        </div>

        {status && (
          <div
            role="status"
            className={`absolute inset-x-3 bottom-[80px] z-20 rounded-2xl px-4 py-3 text-[15px] leading-snug shadow-xl ${status.tone === "ok" ? "bg-[#1d6b35] text-white" : status.tone === "error" ? "bg-[#8a1c1c] text-white" : "bg-white text-ink"}`}
            onClick={() => setStatus(null)}
          >
            {status.text}
          </div>
        )}

        {/* The bottom bar. */}
        <div className="absolute inset-x-0 bottom-0 z-10 flex h-[68px] items-center gap-1 border-t border-white/10 bg-[#1c1917] px-2 pb-[env(safe-area-inset-bottom)] text-white">
          <BarButton onClick={() => setSheet({ kind: "sections" })} icon={<path d="M4 6h12M4 10h12M4 14h12" />}>
            Parts
          </BarButton>
          <BarButton onClick={() => setSheet({ kind: "look" })} icon={<path d="M4 15 8.5 5h1L14 15M6 11h6M15 9v6" />}>
            Text
          </BarButton>
          <BarButton onClick={undo} disabled={!history.length} icon={<path d="M7 5 3.5 8.5 7 12M4 8.5h7a5 5 0 0 1 0 10H8" />}>
            Undo
          </BarButton>
          <button
            type="button"
            onClick={save}
            disabled={saving || (!dirty && !!orderId)}
            className="ml-auto h-12 rounded-full bg-white px-6 text-[16px] font-semibold text-ink transition disabled:opacity-40"
          >
            {saving ? "Saving…" : dirty || !orderId ? "Save" : "Saved"}
          </button>
        </div>

        <BottomSheet open={!!sheet} title={current?.title ?? (sheet?.kind === "look" ? "Text" : "Parts of your invite")} onClose={() => setSheet(null)}>
          {current && (
            <div className="space-y-6">
              {current.note && <p className="text-[14px] leading-snug text-muted">{current.note}</p>}
              {current.optional && hidden(current.optional) && (
                <p className="rounded-xl bg-[#fff3c4] px-3 py-2 text-[14px] text-[#7a5b00]">This part is hidden. Turn on “Show this part” to bring it back.</p>
              )}
              {current.fields.map((f) => (
                <FieldView key={f.key + f.label} f={f} ctx={ctx} details={details} set={set} change={change} reveal={reveal} />
              ))}
            </div>
          )}
          {sheet?.kind === "look" && (
            <div className="space-y-6">
              {lookFields.map((f) => (
                <FieldView key={f.key} f={f} ctx={ctx} details={details} set={set} change={change} reveal={reveal} />
              ))}
            </div>
          )}
          {sheet?.kind === "sections" && (
            <ul className="divide-y divide-line">
              {sections.map((s) => (
                <li key={s.id} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[16px] font-medium text-ink">{s.title}</p>
                    {s.optional && <p className="text-[13px] text-subtle">{hidden(s.optional) ? "Hidden" : "Showing"}</p>}
                    {s.id === "contacts" && !details.contacts?.length && <p className="text-[13px] text-subtle">None yet</p>}
                  </div>
                  {s.optional && (
                    <Switch
                      on={!hidden(s.optional)}
                      label={`Show ${s.title}`}
                      onChange={(on) => change((d) => ({ ...d, hide: on ? (d.hide ?? []).filter((x) => x !== s.optional) : [...(d.hide ?? []), s.optional!] }))}
                    />
                  )}
                  <button type="button" onClick={() => openSection(s.id)} className="h-10 rounded-full bg-panel px-4 text-[14px] font-medium text-ink">
                    {s.id === "contacts" && !details.contacts?.length ? "Add" : "Edit"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </BottomSheet>
      </div>
    </div>
  );
}

function BarButton({ onClick, disabled, icon, children }: { onClick: () => void; disabled?: boolean; icon: ReactNode; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="flex h-14 w-16 flex-col items-center justify-center gap-1 rounded-xl text-[12px] font-medium active:bg-white/10 disabled:opacity-35">
      <svg viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {icon}
      </svg>
      {children}
    </button>
  );
}

/** A panel from the bottom, over the lower part of the invite, so the part being edited stays in view above it. */
function BottomSheet({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div
      className={`absolute inset-x-0 bottom-0 z-30 flex max-h-[52%] flex-col rounded-t-[22px] bg-white shadow-[0_-10px_40px_rgba(0,0,0,.35)] transition-transform duration-300 ${open ? "translate-y-0" : "pointer-events-none translate-y-full"}`}
      role="dialog"
      aria-label={title}
      aria-hidden={!open}
    >
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <p className="text-[17px] font-semibold text-ink">{title}</p>
        <button type="button" onClick={onClose} className="h-10 rounded-full bg-ink px-5 text-[15px] font-semibold text-white">
          Done
        </button>
      </div>
      <div className="overflow-y-auto overscroll-contain px-4 pt-4 pb-[calc(24px+env(safe-area-inset-bottom))]">{open && children}</div>
    </div>
  );
}

/* ───────── Fields ───────── */

type FieldProps = {
  f: Field;
  ctx: Ctx;
  details: InviteDetails;
  set: (path: string, value: unknown) => void;
  change: (next: (d: InviteDetails) => InviteDetails) => void;
  /** Brings the line with this text into view on the invite. */
  reveal: (text: string | undefined) => void;
  /** "bride." or "groom." inside a family card. */
  prefix?: string;
  person?: Person;
};

const box = "w-full rounded-xl border border-[#d9d9d9] bg-white px-3.5 py-3 text-[16px] leading-snug text-ink outline-none focus:border-ink";

function Label({ children, help }: { children: ReactNode; help?: string }) {
  return (
    <div className="mb-2">
      <p className="text-[15px] font-semibold text-ink">{children}</p>
      {help && <p className="mt-0.5 text-[13px] leading-snug text-subtle">{help}</p>}
    </div>
  );
}

function FieldView(props: FieldProps) {
  const { f, ctx, details, set, change, reveal, prefix = "", person } = props;
  if (f.when && !f.when(ctx, person)) return null;
  // Switches and choices in a family card show that family's lines.
  const near = person ? person.elders || person.parents || person.full || person.first : undefined;
  const key = prefix + f.key;
  const value = getAt(details, key);

  switch (f.kind) {
    case "text":
      return <TextField {...props} value={value as string | undefined} path={key} />;
    case "toggle": {
      const on = f.invert ? value !== true : value === true;
      return (
        <Row label={f.label} help={f.help}>
          <Switch on={on} label={f.label} onChange={(v) => (set(key, f.invert ? (v ? undefined : true) : v ? true : undefined), reveal(near))} />
        </Row>
      );
    }
    case "choice": {
      const cur = f.current ? f.current(ctx, person) : ((value as string | boolean | undefined) ?? f.fallback);
      return (
        <div>
          <Label help={f.help}>{f.label}</Label>
          <div className="flex flex-wrap gap-2">
            {f.options.map((o) => (
              <button
                key={String(o.value)}
                type="button"
                onClick={() =>
                  f.key === "textStyle" ? change((d) => ({ ...d, readable: o.value !== "normal", boldText: o.value === "bold" })) : (set(key, o.value), reveal(near))
                }
                className={`min-h-11 rounded-full border px-4 text-[15px] font-medium transition ${cur === o.value ? "border-ink bg-ink text-white" : "border-[#d9d9d9] bg-white text-ink"}`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      );
    }
    case "slider": {
      const n = (value as number | undefined) ?? f.fallback;
      return (
        <div>
          <Label help={f.help}>
            {f.label} <span className="font-normal text-subtle">· {Math.round(n * 100)}%</span>
          </Label>
          <input type="range" min={f.min} max={f.max} step={f.step} value={n} onChange={(e) => set(key, Number(e.target.value) === f.fallback ? undefined : Number(e.target.value))} className="h-11 w-full accent-[#141414]" />
        </div>
      );
    }
    case "show": {
      const on = !(details.hide ?? []).includes(f.section);
      return (
        <Row label={f.label}>
          <Switch on={on} label={f.label} onChange={(v) => change((d) => ({ ...d, hide: v ? (d.hide ?? []).filter((x) => x !== f.section) : [...(d.hide ?? []), f.section] }))} />
        </Row>
      );
    }
    case "lists":
      return <ListsField details={details} change={change} label={f.label} help={f.help} reveal={reveal} />;
    case "times":
      return <TimesField details={details} change={change} label={f.label} help={f.help} ctx={ctx} reveal={reveal} />;
    case "contacts":
      return <ContactsField details={details} change={change} reveal={reveal} />;
    case "people": {
      const order = details.lead === "bride" ? (["bride", "groom"] as const) : (["groom", "bride"] as const);
      return (
        <div className="space-y-4">
          {order.map((who) => (
            <div key={who} className="rounded-2xl bg-panel p-4">
              <p className="mb-4 text-[16px] font-semibold text-ink">
                {details[who].first}&rsquo;s family <span className="font-normal text-subtle">({who})</span>
              </p>
              <div className="space-y-5">
                {f.fields.map((sub) => (
                  <FieldView key={sub.key} {...props} f={sub} prefix={`${who}.`} person={details[who]} />
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }
  }
}

function Row({ label, help, children }: { label: string; help?: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold text-ink">{label}</p>
        {help && <p className="mt-0.5 text-[13px] leading-snug text-subtle">{help}</p>}
      </div>
      {children}
    </div>
  );
}

function Switch({ on, onChange, label }: { on: boolean; onChange: (on: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} className={`relative h-8 w-[52px] shrink-0 rounded-full transition ${on ? "bg-[#1d6b35]" : "bg-[#cfcfcf]"}`}>
      <span className={`absolute top-1 size-6 rounded-full bg-white shadow transition-all ${on ? "left-[24px]" : "left-1"}`} />
    </button>
  );
}

function TextField({ f, ctx, set, reveal, value, path }: FieldProps & { value: string | undefined; path: string }) {
  const t = f as Extract<Field, { kind: "text" }>;
  const fallback = t.fallback?.(ctx) ?? "";
  const shown = value ?? (t.core ? "" : fallback);
  // While typing, the box keeps exactly what's typed, even when empty means "the design's wording".
  const [draft, setDraft] = useState<string | null>(null);
  const commit = (x: string) => {
    setDraft(x);
    reveal(x.split("\n").pop() || x);
    if (t.core) set(path, x);
    else if (x === fallback) set(path, undefined);
    else if (x.trim() === "") set(path, t.emptyHides ? "" : undefined);
    else set(path, x);
  };
  const v = draft ?? shown;
  const Input = t.multiline ? "textarea" : "input";
  return (
    <div>
      <Label help={t.help}>{t.label}</Label>
      <Input
        value={v}
        maxLength={t.max}
        placeholder={t.core ? (t.placeholder ?? fallback) : (t.placeholder ?? "")}
        rows={t.multiline ? Math.min(6, Math.max(2, v.split("\n").length + Math.floor(v.length / 34))) : undefined}
        onFocus={() => (setDraft(shown), reveal(shown.split("\n")[0]))}
        onBlur={() => setDraft(null)}
        onChange={(e) => commit(e.target.value)}
        className={`${box} ${t.multiline ? "resize-none" : "h-12"}`}
      />
      <div className="mt-1.5 flex flex-wrap items-center gap-2">
        {t.suggestions?.map((s) => (
          <button key={s} type="button" onClick={() => commit(s)} className="h-9 rounded-full bg-panel px-3 text-[14px] text-ink">
            {s}
          </button>
        ))}
        {!t.core && value === "" && t.emptyHides && <span className="text-[13px] text-subtle">Hidden on the invite</span>}
        {!t.core && value !== undefined && fallback && (
          <button type="button" onClick={() => (setDraft(null), set(path, undefined))} className="h-9 text-[14px] font-medium text-[#8a5a00] underline underline-offset-2">
            Use the design&rsquo;s wording
          </button>
        )}
        {v.length > t.max * 0.8 && <span className="ml-auto text-[12px] text-subtle">{t.max - v.length} left</span>}
      </div>
    </div>
  );
}

function ListsField({ details, change, label, help, reveal }: { details: InviteDetails; change: FieldProps["change"]; label: string; help?: string; reveal: FieldProps["reveal"] }) {
  const groups = details.extras ?? [];
  const put = (i: number, g: { title: string; lines: string[] } | null) => {
    if (g) reveal(g.lines.filter(Boolean).pop() || g.title);
    change((d) => {
      const list = [...(d.extras ?? [])];
      if (g) list[i] = g;
      else list.splice(i, 1);
      return setAt(d, "extras", list.length ? list : undefined);
    });
  };
  return (
    <div>
      <Label help={help}>{label}</Label>
      <div className="space-y-3">
        {groups.map((g, i) => (
          <div key={i} className="space-y-2 rounded-2xl bg-panel p-3">
            <input value={g.title} maxLength={80} placeholder="Heading, e.g. Our Associates" onChange={(e) => put(i, { ...g, title: e.target.value })} className={`${box} h-12 font-semibold`} />
            <textarea
              value={g.lines.join("\n")}
              rows={Math.min(8, Math.max(3, g.lines.length + 1))}
              placeholder={"One name per line\nMr. & Mrs. Sharma\nThe Verma family"}
              onChange={(e) => put(i, { ...g, lines: e.target.value.split("\n") })}
              className={`${box} resize-none`}
            />
            <button type="button" onClick={() => put(i, null)} className="h-9 text-[14px] font-medium text-[#8a1c1c]">
              Remove this section
            </button>
          </div>
        ))}
        {groups.length < 8 && (
          <button type="button" onClick={() => put(groups.length, { title: "", lines: [] })} className="h-12 w-full rounded-xl border border-dashed border-[#bdbdbd] text-[15px] font-medium text-ink">
            + Add a section
          </button>
        )}
      </div>
    </div>
  );
}

function TimesField({ details, change, label, help, ctx, reveal }: { details: InviteDetails; change: FieldProps["change"]; label: string; help?: string; ctx: Ctx; reveal: FieldProps["reveal"] }) {
  const fmt = (iso: string) => new Date(iso).toLocaleString(ctx.lang === "hi" ? "hi-IN" : "en-IN", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" });
  return (
    <div>
      <Label help={help}>{label}</Label>
      <div className="space-y-3">
        {details.events.map((e, i) => (
          <div key={e.name + i}>
            <p className="mb-1 text-[14px] text-ink-soft">
              <span className="font-semibold">{e.name}</span> · {fmt(e.start)}
            </p>
            <input
              value={e.timeText ?? ""}
              maxLength={60}
              placeholder="e.g. 7 pm onwards"
              onFocus={() => reveal(e.timeText || e.name)}
              onChange={(ev) =>
                (reveal(ev.target.value || e.name),
                change((d) => ({
                  ...d,
                  events: d.events.map((x, j) => {
                    if (j !== i) return x;
                    const y = { ...x };
                    if (ev.target.value) y.timeText = ev.target.value;
                    else delete y.timeText;
                    return y;
                  }),
                })))
              }
              className={`${box} h-12`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function ContactsField({ details, change, reveal }: { details: InviteDetails; change: FieldProps["change"]; reveal: FieldProps["reveal"] }) {
  const list = details.contacts ?? [];
  const put = (i: number, c: { name: string; phones: string[]; whatsapp?: boolean } | null) => {
    if (c) reveal(c.name);
    change((d) => {
      const next = [...(d.contacts ?? [])];
      if (c) next[i] = c;
      else next.splice(i, 1);
      return setAt(d, "contacts", next.length ? next : undefined);
    });
  };
  return (
    <div>
      <Label help="Guests see a button to call, or to message on WhatsApp.">People guests can contact</Label>
      <div className="space-y-3">
        {list.map((c, i) => (
          <div key={i} className="space-y-2 rounded-2xl bg-panel p-3">
            <input value={c.name} maxLength={60} placeholder="Name, e.g. Rajesh Sharma (Bride's father)" onChange={(e) => put(i, { ...c, name: e.target.value })} className={`${box} h-12`} />
            <input
              value={c.phones[0] ?? ""}
              inputMode="tel"
              maxLength={16}
              placeholder="Mobile number"
              onChange={(e) => put(i, { ...c, phones: [e.target.value, ...c.phones.slice(1)] })}
              className={`${box} h-12`}
            />
            <div className="flex items-center justify-between">
              <Row label="WhatsApp button">
                <Switch on={!!c.whatsapp} label="WhatsApp button" onChange={(v) => put(i, { ...c, whatsapp: v || undefined })} />
              </Row>
            </div>
            <button type="button" onClick={() => put(i, null)} className="h-9 text-[14px] font-medium text-[#8a1c1c]">
              Remove
            </button>
          </div>
        ))}
        {list.length < 6 && (
          <button type="button" onClick={() => put(list.length, { name: "", phones: [""], whatsapp: true })} className="h-12 w-full rounded-xl border border-dashed border-[#bdbdbd] text-[15px] font-medium text-ink">
            + Add a contact
          </button>
        )}
      </div>
    </div>
  );
}
