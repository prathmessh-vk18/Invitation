"use client";

import Link from "next/link";
import { unstable_isUnrecognizedActionError, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { fontStyles } from "@/config/customise";
import { getAt, lookFields, sectionsFor, setAt, TEXT_SCALES, type Ctx, type Field } from "@/config/editor";
import { instrumentals, songs, type Track } from "@/config/music";
import type { EventKind, Invite, InviteEvent, Person } from "@/data/invites";
import { saveEdits } from "@/lib/editor-actions";
import { mediaUrl } from "@/lib/media";
import { createPhotoUpload, createSongUpload } from "@/lib/order-actions";
import { eventKinds, kindName, type InviteDetails } from "@/lib/orders";
import { shrink, uploadTo } from "@/lib/upload-client";
import { EDIT_SECTION, PREVIEW_INVITE, PREVIEW_READY, PREVIEW_SCROLL, PREVIEW_SELECT } from "@/invites/editing";
import { defaultWord, langOf } from "@/invites/i18n";
import { useInviteMusic } from "@/invites/music";

type Props = {
  /** null for a demo, which never saves. */
  orderId: string | null;
  design: string;
  /** The invite's parts that aren't the couple's details: slug, template (and a demo's photos). */
  extra: Pick<Invite, "slug" | "template"> & Partial<Invite>;
  details: InviteDetails;
  songPath: string | null;
  photoPaths: string[];
  backHref: string;
  /** Before payment: saving is free and paying comes next. After: each Save uses one edit. None for a demo. */
  account?: { kind: "unpaid"; pay: string | null } | { kind: "paid"; editsLeft: number | null; allowed: number | null };
};

/** Everything the couple can change: their details, and the song and photos kept beside them. */
type Doc = { details: InviteDetails; songPath: string | null; photoPaths: string[] };
type Sheet = { kind: "section"; id: string; text?: string } | { kind: "parts" } | { kind: "style" } | { kind: "song" } | null;
type Status = { tone: "ok" | "info" | "error"; text: string } | null;

const MAX_PHOTOS = 8;
const stale = (e: unknown) => unstable_isUnrecognizedActionError(e);
const STALE = "Aavjoo was just updated. Please refresh this page and try again.";

/**
 * The couple's own editor, like a design app: their invite full screen, every part outlined; tap a
 * part (or any words on it) and its settings open in a panel from the bottom, with the tapped line's
 * box picked out. Changes show on the invite as they type; Save puts them live.
 */
export function InviteEditor({ orderId, design, extra, details: startDetails, songPath: startSong, photoPaths: startPhotos, backHref, account }: Props) {
  const router = useRouter();
  const [editsLeft, setEditsLeft] = useState(account?.kind === "paid" ? account.editsLeft : null);
  const [confirming, setConfirming] = useState(false);
  const start: Doc = useMemo(() => ({ details: startDetails, songPath: startSong, photoPaths: startPhotos }), [startDetails, startSong, startPhotos]);
  const [doc, setDoc] = useState<Doc>(start);
  const [saved, setSaved] = useState<Doc>(start);
  const [history, setHistory] = useState<Doc[]>([]);
  const lastPush = useRef(0);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [status, setStatus] = useState<Status>(null);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(0);
  const [tapped, setTapped] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);
  const sheetBody = useRef<HTMLDivElement>(null);
  const ready = useRef(false);

  const { details } = doc;
  const invite = useMemo(
    () =>
      ({
        ...extra,
        ...details,
        music: doc.songPath ? mediaUrl("songs", doc.songPath) : details.music,
        gallery: doc.photoPaths.length ? doc.photoPaths.map((p) => mediaUrl("photos", p)) : orderId ? undefined : extra.gallery,
      }) as Invite,
    [extra, details, doc.songPath, doc.photoPaths, orderId],
  );
  const lang = langOf(invite);
  const ctx: Ctx = useMemo(() => ({ invite, lang, design, word: (k: string) => defaultWord(lang, k) }), [invite, lang, design]);
  const sections = useMemo(() => sectionsFor(design), [design]);
  const dirty = JSON.stringify(doc) !== JSON.stringify(saved);

  const post = useCallback((msg: object) => frame.current?.contentWindow?.postMessage(msg, window.location.origin), []);

  // The invite in the frame follows every change.
  const inviteRef = useRef(invite);
  useEffect(() => {
    inviteRef.current = invite;
    if (ready.current) post({ type: PREVIEW_INVITE, invite });
  }, [invite, post]);

  const openSection = useCallback(
    (id: string, text?: string, scroll = true) => {
      setTapped(true);
      setSheet({ kind: "section", id, text });
      post({ type: PREVIEW_SELECT, id });
      if (scroll) post({ type: PREVIEW_SCROLL, id, offset: id === "cover" ? 0 : -8 });
    },
    [post],
  );
  const closeSheet = useCallback(() => {
    setSheet(null);
    post({ type: PREVIEW_SELECT, id: null });
  }, [post]);
  const openPanel = (kind: "parts" | "style" | "song") => {
    post({ type: PREVIEW_SELECT, id: null });
    setTapped(true);
    setSheet({ kind });
  };

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.source !== frame.current?.contentWindow) return;
      if (e.data?.type === PREVIEW_READY) {
        ready.current = true;
        post({ type: PREVIEW_INVITE, invite: inviteRef.current });
      }
      // A tap on the invite: the tapped part opens where it is, without scrolling.
      if (e.data?.type === EDIT_SECTION) openSection(String(e.data.id), typeof e.data.text === "string" ? e.data.text : undefined, false);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [post, openSection]);

  // The words tapped on the invite pick out the box that holds them.
  const tappedText = sheet?.kind === "section" ? sheet.text : undefined;
  useEffect(() => {
    if (!tappedText) return;
    const t = window.setTimeout(() => {
      const want = norm(tappedText);
      if (want.length < 2) return;
      const boxes = Array.from(sheetBody.current?.querySelectorAll<HTMLElement>("[data-match]") ?? []);
      const hit = boxes.find((b) => norm(b.dataset.match).includes(want)) ?? boxes.find((b) => norm(b.dataset.match).length > 1 && want.includes(norm(b.dataset.match)));
      if (!hit) return;
      hit.scrollIntoView({ block: "center", behavior: "smooth" });
      hit.classList.add("editor-flash");
      window.setTimeout(() => hit.classList.remove("editor-flash"), 1600);
    }, 350);
    return () => window.clearTimeout(t);
  }, [tappedText, sheet]);

  // Leaving with unsaved changes asks first.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  /** Changes the document; typing in one box within a moment counts as one step for Undo. */
  const update = useCallback((next: (d: Doc) => Doc) => {
    setDoc((d) => {
      const now = Date.now();
      if (now - lastPush.current > 800) setHistory((h) => [...h.slice(-49), d]);
      lastPush.current = now;
      return next(d);
    });
    setStatus(null);
  }, []);
  const change = useCallback((next: (d: InviteDetails) => InviteDetails) => update((d) => ({ ...d, details: next(d.details) })), [update]);
  const set = useCallback((path: string, value: unknown) => change((d) => setAt(d, path, value)), [change]);

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

  const undo = () => {
    const prev = history[history.length - 1];
    if (!prev) return;
    setHistory((h) => h.slice(0, -1));
    lastPush.current = 0;
    setDoc(prev);
  };

  const unpaid = account?.kind === "unpaid";
  const payHref = orderId ? `/order/${orderId}?pay=1` : backHref;

  /** Saves; true when the changes were kept (or there was nothing to keep). */
  const save = async (): Promise<boolean> => {
    setConfirming(false);
    if (!orderId) {
      setStatus({ tone: "info", text: "This is a demo, so nothing is saved. On your own invite, Save puts your changes live." });
      return false;
    }
    setSaving(true);
    let ok = false;
    try {
      const res = await saveEdits(orderId, doc);
      if ("errors" in res) setStatus({ tone: "error", text: res.errors.join(" ") });
      else if ("needsEdits" in res) setStatus({ tone: "error", text: "You've used all your edits. Get 3 more for ₹99 on your order page, then save again." });
      else if ("dryRun" in res) {
        ok = true;
        setStatus({ tone: "info", text: "Test copy: your changes were checked and are fine, but not saved (on this computer only test orders save)." });
      } else if ("unchanged" in res) {
        ok = true;
        setSaved(doc);
        setStatus({ tone: "info", text: "Nothing had changed, so no edit was used." });
      } else if ("pending" in res) {
        ok = true;
        setSaved(doc);
        setStatus({ tone: "info", text: "Saved. Because this changes both names or moves the date a lot, we'll check it quickly before it goes live." });
      } else {
        ok = true;
        setSaved(doc);
        if (res.editsLeft !== null) setEditsLeft(res.editsLeft);
        setStatus({
          tone: "ok",
          text: res.live
            ? `Saved ✓ Your invite is updated on the same link.${res.editsLeft !== null ? ` ${res.editsLeft} edit${res.editsLeft === 1 ? "" : "s"} left.` : ""}`
            : "Saved ✓ Your invite will look like this when it goes live.",
        });
      }
    } catch (e) {
      setStatus({ tone: "error", text: stale(e) ? STALE : "We couldn't save. Check your internet and try again." });
    }
    setSaving(false);
    return ok;
  };

  /** The main button: before payment it saves and goes on to pay; after, it asks before using an edit. */
  const primary = async () => {
    if (unpaid && account.pay) {
      if (!dirty || (await save())) router.push(payHref);
      return;
    }
    if (account?.kind === "paid") {
      if (editsLeft === 0) {
        setStatus({ tone: "error", text: "You've used all your edits. Get 3 more for ₹99 on your order page, then save again." });
        return;
      }
      setConfirming(true);
      return;
    }
    await save();
  };
  const primaryLabel = saving ? "Saving…" : busy > 0 ? "Uploading…" : unpaid && account.pay ? (dirty ? "Save & pay" : account.pay) : dirty || !orderId ? "Save" : "Saved ✓";

  const current = sheet?.kind === "section" ? sections.find((s) => s.id === sheet.id) : null;
  const hidden = (id: string) => (details.hide ?? []).includes(id as never);
  const fieldProps = { ctx, details, set, change, reveal, doc, update, setBusy, setStatus };
  const title = current?.title ?? (sheet?.kind === "style" ? "Style" : sheet?.kind === "song" ? "Song" : "Parts of your invite");

  return (
    <div className="fixed inset-0 flex justify-center bg-[#2a2622]">
      <style>{`.editor-flash{animation:editor-flash 1.6s ease}@keyframes editor-flash{0%,60%{box-shadow:0 0 0 3px #7c3aed;border-radius:14px}100%{box-shadow:0 0 0 0 transparent}}`}</style>
      <div className="relative h-full w-full max-w-[480px] overflow-hidden bg-black">
        <iframe ref={frame} src="/preview?edit=1" title="Your invite" className="absolute inset-x-0 top-0 h-[calc(100%-72px)] w-full border-0" allow="autoplay" />

        {/* Top: back, undo. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-2 p-3">
          <Link href={backHref} className="pointer-events-auto rounded-full bg-white/95 px-3.5 py-2 text-[14px] font-medium text-ink shadow-lg">
            ← {orderId ? "Order" : "Back"}
          </Link>
          <div className="flex items-center gap-2">
            {!orderId && <span className="rounded-full bg-[#fff3c4] px-3 py-2 text-[13px] font-medium text-[#7a5b00] shadow-lg">Demo</span>}
            {editsLeft !== null && (
              <span className="rounded-full bg-white/95 px-3 py-2 text-[13px] font-medium text-ink shadow-lg">
                {editsLeft} edit{editsLeft === 1 ? "" : "s"} left
              </span>
            )}
            <button
              type="button"
              onClick={undo}
              disabled={!history.length}
              className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-2 text-[14px] font-medium text-ink shadow-lg disabled:opacity-40"
            >
              <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M7 5 3.5 8.5 7 12M4 8.5h7a5 5 0 0 1 0 10H8" />
              </svg>
              Undo
            </button>
          </div>
        </div>

        {!tapped && !sheet && (
          <div className="pointer-events-none absolute inset-x-6 bottom-[92px] z-10 rounded-2xl bg-[#7c3aed] px-4 py-3 text-center text-[15px] leading-snug font-medium text-white shadow-xl">
            Tap any part of your invite to change it
          </div>
        )}

        {confirming && (
          <div className="absolute inset-x-3 bottom-[84px] z-40 rounded-2xl bg-white p-4 shadow-2xl">
            <p className="text-[16px] font-semibold text-ink">Save and put these changes live?</p>
            <p className="mt-1 text-[14px] leading-snug text-muted">
              This uses 1 edit{editsLeft !== null ? ` (${Math.max(0, editsLeft - 1)} left after)` : ""}. Make all your changes first, then save once.
            </p>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => setConfirming(false)} className="h-11 flex-1 rounded-full bg-panel text-[15px] font-medium text-ink">
                Keep editing
              </button>
              <button type="button" onClick={save} className="h-11 flex-1 rounded-full bg-ink text-[15px] font-semibold text-white">
                Save
              </button>
            </div>
          </div>
        )}
        {status && (
          <div
            role="status"
            className={`absolute inset-x-3 bottom-[84px] z-40 rounded-2xl px-4 py-3 text-[15px] leading-snug shadow-xl ${status.tone === "ok" ? "bg-[#1d6b35] text-white" : status.tone === "error" ? "bg-[#8a1c1c] text-white" : "bg-white text-ink"}`}
            onClick={() => setStatus(null)}
          >
            {status.text}
          </div>
        )}

        {/* Bottom bar. */}
        <div className="absolute inset-x-0 bottom-0 z-10 flex h-[72px] items-center gap-0.5 border-t border-white/10 bg-[#1c1917] px-1.5 pb-[env(safe-area-inset-bottom)] text-white">
          <BarButton active={sheet?.kind === "parts"} onClick={() => openPanel("parts")} icon={<path d="M3.5 4.5h13v4h-13zM3.5 11.5h6v4h-6zM12.5 11.5h4v4h-4z" />}>
            Parts
          </BarButton>
          <BarButton active={sheet?.kind === "style"} onClick={() => openPanel("style")} icon={<path d="M4 15 8.5 5h1L14 15M6 11h6M15.5 9.5v5.5" />}>
            Style
          </BarButton>
          <BarButton active={sheet?.kind === "song"} onClick={() => openPanel("song")} icon={<path d="M8 15.5V5l8-1.5V14M8 15.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM16 14a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" />}>
            Song
          </BarButton>
          <BarButton active={sheet?.kind === "section" && sheet.id === "gallery"} onClick={() => openSection("gallery")} icon={<path d="M3.5 5.5h13v10h-13zM3.5 13l4-4 3 3 2-2 4 4M13 8.5h.01" />}>
            Photos
          </BarButton>
          <BarButton active={sheet?.kind === "section" && sheet.id === "events"} onClick={() => openSection("events")} icon={<path d="M4 5.5h12v11H4zM4 8.5h12M7.5 3.5v3M12.5 3.5v3M7 11.5h2M11 11.5h2M7 14h2" />}>
            Functions
          </BarButton>
          <button
            type="button"
            onClick={primary}
            disabled={saving || busy > 0 || (!dirty && !!orderId && !(unpaid && account.pay))}
            className="ml-auto h-12 min-w-0 shrink rounded-full bg-white px-3.5 text-[15px] leading-tight font-semibold text-ink transition disabled:opacity-40"
          >
            {primaryLabel}
          </button>
        </div>

        <BottomSheet open={!!sheet} title={title} onClose={closeSheet} bodyRef={sheetBody}>
          {current && (
            <div className="space-y-6">
              {current.note && <p className="text-[14px] leading-snug text-muted">{current.note}</p>}
              {current.optional && hidden(current.optional) && (
                <p className="rounded-xl bg-[#fff3c4] px-3 py-2 text-[14px] text-[#7a5b00]">This part is hidden. Turn on “Show this part” to bring it back.</p>
              )}
              {current.fields.map((f) => (
                <FieldView key={f.key + f.label} f={f} {...fieldProps} />
              ))}
            </div>
          )}
          {sheet?.kind === "style" && (
            <div className="space-y-7">
              {lookFields.map((f) => (
                <FieldView key={f.key} f={f} {...fieldProps} />
              ))}
            </div>
          )}
          {sheet?.kind === "song" && <SongPicker doc={doc} update={update} setBusy={setBusy} demo={!orderId} />}
          {sheet?.kind === "parts" && (
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

const norm = (s?: string) => (s ?? "").replace(/\s+/g, " ").trim().toLowerCase();

function BarButton({ onClick, active, icon, children }: { onClick: () => void; active?: boolean; icon: ReactNode; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={`flex h-14 w-[54px] shrink-0 flex-col items-center justify-center gap-1 rounded-xl text-[12px] font-medium ${active ? "bg-white/15" : "active:bg-white/10"}`}>
      <svg viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {icon}
      </svg>
      {children}
    </button>
  );
}

/** A panel from the bottom, over the lower part of the invite, so the part being edited stays in view above it. */
function BottomSheet({ open, title, onClose, bodyRef, children }: { open: boolean; title: string; onClose: () => void; bodyRef: RefObject<HTMLDivElement | null>; children: ReactNode }) {
  return (
    <div
      className={`absolute inset-x-0 bottom-0 z-30 flex max-h-[54%] flex-col rounded-t-[22px] bg-white shadow-[0_-10px_40px_rgba(0,0,0,.35)] transition-transform duration-300 ${open ? "translate-y-0" : "pointer-events-none translate-y-full"}`}
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
      <div ref={bodyRef} className="overflow-y-auto overscroll-contain px-4 pt-4 pb-[calc(24px+env(safe-area-inset-bottom))]">
        {open && children}
      </div>
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
  doc: Doc;
  update: (next: (d: Doc) => Doc) => void;
  setBusy: (f: (n: number) => number) => void;
  setStatus: (s: Status) => void;
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
  const key = prefix + f.key;
  const value = getAt(details, key);
  // Switches and choices in a family card show that family's lines.
  const near = person ? person.elders || person.parents || person.full || person.first : undefined;

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
      const pick = (v: string | boolean) => {
        if (f.key === "textStyle") change((d) => ({ ...d, readable: v !== "normal", boldText: v === "bold" }));
        else if (f.key === "lang") set("lang", v === "hi" ? "hi" : undefined);
        else set(key, v);
        reveal(near);
      };
      return (
        <div>
          <Label help={f.help}>{f.label}</Label>
          <div className="flex flex-wrap gap-2">
            {f.options.map((o) => (
              <button
                key={String(o.value)}
                type="button"
                onClick={() => pick(o.value)}
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
    case "datetime":
      return <DateTimeField {...props} />;
    case "date": {
      const iso = (value as string | undefined) ?? "";
      return (
        <div data-match={iso ? prettyDay(iso) : ""}>
          <Label help={f.help}>{f.label}</Label>
          <input
            type="date"
            value={iso.slice(0, 10)}
            onChange={(e) => e.target.value && set(key, iso.includes("T") ? e.target.value + iso.slice(10) : e.target.value)}
            className={`${box} h-12`}
          />
        </div>
      );
    }
    case "phone": {
      const raw = String(value ?? "");
      // Saved with the country code (91…); shown as the ten digits people know.
      const shown = /^91\d{10}$/.test(raw) ? raw.slice(2) : raw;
      return (
        <div data-match={shown}>
          <Label help={f.help}>{f.label}</Label>
          <input type="tel" inputMode="tel" value={shown} maxLength={16} placeholder="10-digit mobile number" onChange={(e) => set(key, e.target.value)} className={`${box} h-12`} />
        </div>
      );
    }
    case "lists":
      return <ListsField {...props} />;
    case "functions":
      return <FunctionsField {...props} />;
    case "photos":
      return <PhotosField {...props} />;
    case "font":
      return <FontField {...props} />;
    case "textSize": {
      const n = (value as number | undefined) ?? 1;
      const i = Math.max(0, TEXT_SCALES.indexOf(n));
      const step = (by: number) => {
        const next = TEXT_SCALES[Math.min(TEXT_SCALES.length - 1, Math.max(0, i + by))];
        set(key, next === 1 ? undefined : next);
      };
      return (
        <div>
          <Label help={f.help}>{f.label}</Label>
          <div className="flex items-center gap-3">
            <button type="button" aria-label="Smaller text" disabled={i === 0} onClick={() => step(-1)} className="h-12 w-16 rounded-xl border border-[#d9d9d9] text-[16px] font-semibold text-ink disabled:opacity-35">
              A−
            </button>
            <span className="flex-1 text-center text-[16px] font-semibold text-ink">{Math.round(n * 100)}%</span>
            <button type="button" aria-label="Bigger text" disabled={i === TEXT_SCALES.length - 1} onClick={() => step(1)} className="h-12 w-16 rounded-xl border border-[#d9d9d9] text-[20px] font-semibold text-ink disabled:opacity-35">
              A+
            </button>
          </div>
        </div>
      );
    }
    case "contacts":
      return <ContactsField {...props} />;
    case "people": {
      const order = details.lead === "bride" ? (["bride", "groom"] as const) : (["groom", "bride"] as const);
      return (
        <div className="space-y-4">
          {order.map((who) => (
            <div key={who} className="rounded-2xl bg-panel p-4">
              <p className="mb-4 text-[16px] font-semibold text-ink">
                {details[who].first || (who === "bride" ? "Bride" : "Groom")}&rsquo;s family <span className="font-normal text-subtle">({who})</span>
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
    <div data-match={shown}>
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

/* ───────── Dates ───────── */

/** An ISO time's day and time in India ("2027-02-20", "19:30"). */
function ist(iso: string): { d: string; t: string } {
  const m = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/.exec(iso);
  if (m && iso.endsWith("+05:30")) return { d: m[1], t: m[2] };
  const x = new Date(iso);
  if (Number.isNaN(x.getTime())) return { d: "", t: "" };
  const s = new Date(x.getTime() + 330 * 60000).toISOString();
  return { d: s.slice(0, 10), t: s.slice(11, 16) };
}
const joinIst = (d: string, t: string) => `${d}T${t || "00:00"}:00+05:30`;
const prettyDay = (iso: string) => {
  const x = new Date(iso.length === 10 ? `${iso}T12:00:00+05:30` : iso);
  return Number.isNaN(x.getTime()) ? "" : x.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" });
};

function DateTimeField({ f, details, set, reveal }: FieldProps) {
  const { d, t } = ist(details.date);
  // The invite can't show a date that isn't there: an emptied box keeps the last good one.
  const put = (nd: string, nt: string) => {
    if (!nd) return;
    set(f.key, joinIst(nd, nt));
    reveal(prettyDay(joinIst(nd, nt)));
  };
  return (
    <div data-match={prettyDay(details.date)}>
      <Label help={f.help}>{f.label}</Label>
      <div className="grid grid-cols-[1.4fr_1fr] gap-2">
        <input type="date" value={d} onChange={(e) => put(e.target.value, t)} className={`${box} h-12`} />
        <input type="time" value={t} onChange={(e) => put(d, e.target.value)} className={`${box} h-12`} />
      </div>
    </div>
  );
}

/* ───────── Functions ───────── */

const KIND_PICKS = eventKinds.filter((k) => k.kind !== "other").map((k) => ({ kind: k.kind, name: kindName(k.kind) }));
// Optional details of a function: emptied, they're dropped rather than kept blank.
const OPTIONAL_EVENT_KEYS = new Set<keyof InviteEvent>(["timeText", "mapUrl", "dress", "note"]);

function FunctionsField({ details, change, reveal, f }: FieldProps) {
  const events = details.events;
  const [open, setOpen] = useState<number | null>(events.length === 1 ? 0 : null);
  const put = (i: number, e: InviteEvent | null) =>
    change((d) => {
      const list = [...d.events];
      if (e) list[i] = e;
      else list.splice(i, 1);
      return { ...d, events: list };
    });
  const move = (i: number, by: number) =>
    change((d) => {
      const list = [...d.events];
      const [x] = list.splice(i, 1);
      list.splice(i + by, 0, x);
      return { ...d, events: list };
    });
  const add = () => {
    const last = events[events.length - 1];
    change((d) => ({
      ...d,
      events: [...d.events, { kind: "other" as EventKind, name: "", start: last?.start ?? d.date, venue: last?.venue ?? "", address: last?.address ?? "", ...(last?.mapUrl ? { mapUrl: last.mapUrl } : {}) }],
    }));
    setOpen(events.length);
  };
  return (
    <div>
      <Label help={f.help}>{f.label}</Label>
      <div className="space-y-3">
        {events.map((e, i) => {
          const { d, t } = ist(e.start);
          const edit = (patch: Partial<InviteEvent>) => {
            const next = { ...e, ...patch } as InviteEvent;
            for (const k of Object.keys(patch) as (keyof InviteEvent)[]) if (OPTIONAL_EVENT_KEYS.has(k) && patch[k] === "") delete next[k];
            put(i, next);
            reveal(next.name || next.venue);
          };
          const isOpen = open === i;
          return (
            <div key={i} data-match={`${e.name} ${e.venue}`} className="rounded-2xl bg-panel">
              <button type="button" onClick={() => (setOpen(isOpen ? null : i), reveal(e.name))} className="flex w-full items-center gap-3 p-4 text-left">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white text-[14px] font-semibold text-ink">{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[16px] font-semibold text-ink">{e.name || "New function"}</span>
                  <span className="block truncate text-[13px] text-subtle">
                    {prettyDay(e.start)}
                    {e.venue ? ` · ${e.venue}` : ""}
                  </span>
                </span>
                <span className="text-[20px] text-subtle">{isOpen ? "−" : "+"}</span>
              </button>
              {isOpen && (
                <div className="space-y-4 px-4 pb-4">
                  <div>
                    <Label>Name</Label>
                    <input value={e.name} maxLength={40} placeholder="e.g. Haldi" onChange={(x) => edit({ name: x.target.value })} className={`${box} h-12`} />
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {KIND_PICKS.map((k) => (
                        <button key={k.kind} type="button" onClick={() => edit({ name: k.name, kind: k.kind })} className={`h-9 rounded-full px-3 text-[14px] ${e.name === k.name ? "bg-ink text-white" : "bg-white text-ink"}`}>
                          {k.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Date & time</Label>
                    <div className="grid grid-cols-[1.4fr_1fr] gap-2">
                      <input type="date" value={d} onChange={(x) => x.target.value && edit({ start: joinIst(x.target.value, t) })} className={`${box} h-12`} />
                      <input type="time" value={t} onChange={(x) => x.target.value && edit({ start: joinIst(d, x.target.value) })} className={`${box} h-12`} />
                    </div>
                  </div>
                  <div>
                    <Label help="Leave empty to show the start time.">Time, in your own words</Label>
                    <input value={e.timeText ?? ""} maxLength={60} placeholder="e.g. 7 pm till late" onChange={(x) => edit({ timeText: x.target.value })} className={`${box} h-12`} />
                  </div>
                  <div>
                    <Label>Venue</Label>
                    <input value={e.venue} maxLength={120} placeholder="e.g. Hotel Clarks Amer" onChange={(x) => edit({ venue: x.target.value })} className={`${box} h-12`} />
                  </div>
                  <div>
                    <Label>Address</Label>
                    <textarea value={e.address} maxLength={200} rows={2} placeholder="Area, city" onChange={(x) => edit({ address: x.target.value })} className={`${box} resize-none`} />
                  </div>
                  <div>
                    <Label help="Paste the venue's Google Maps link, so Directions opens the right place.">Map link</Label>
                    <input value={e.mapUrl ?? ""} inputMode="url" maxLength={300} placeholder="https://maps.app.goo.gl/…" onChange={(x) => edit({ mapUrl: x.target.value })} className={`${box} h-12`} />
                  </div>
                  <div>
                    <Label>Dress code</Label>
                    <input value={e.dress ?? ""} maxLength={80} placeholder="e.g. Yellow" onChange={(x) => edit({ dress: x.target.value })} className={`${box} h-12`} />
                  </div>
                  <div>
                    <Label>Note</Label>
                    <input value={e.note ?? ""} maxLength={240} placeholder="e.g. Followed by dinner" onChange={(x) => edit({ note: x.target.value })} className={`${box} h-12`} />
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button type="button" disabled={i === 0} onClick={() => (move(i, -1), setOpen(i - 1))} className="h-10 rounded-full bg-white px-4 text-[14px] font-medium text-ink disabled:opacity-40">
                      ↑ Move up
                    </button>
                    <button type="button" disabled={i === events.length - 1} onClick={() => (move(i, 1), setOpen(i + 1))} className="h-10 rounded-full bg-white px-4 text-[14px] font-medium text-ink disabled:opacity-40">
                      ↓ Move down
                    </button>
                    {events.length > 1 && (
                      <button type="button" onClick={() => (put(i, null), setOpen(null))} className="ml-auto h-10 px-2 text-[14px] font-medium text-[#8a1c1c]">
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {events.length < 12 && (
          <button type="button" onClick={add} className="h-12 w-full rounded-xl border border-dashed border-[#bdbdbd] text-[15px] font-medium text-ink">
            + Add a function
          </button>
        )}
      </div>
    </div>
  );
}

/* ───────── Photos ───────── */

function PhotosField({ doc, update, setBusy, setStatus, f, details, change, ctx }: FieldProps) {
  const [uploading, setUploading] = useState(0);
  const photos = doc.photoPaths;
  const demoPhotos = !photos.length ? (ctx.invite.gallery ?? []) : [];
  const add = async (files: FileList | null) => {
    if (!files?.length) return;
    const room = MAX_PHOTOS - photos.length;
    const list = Array.from(files).slice(0, room);
    if (files.length > room) setStatus({ tone: "info", text: `You can add up to ${MAX_PHOTOS} photos. We added the first ${room}.` });
    // Adding photos to a hidden photos part shows it again.
    if ((details.hide ?? []).includes("gallery")) change((d) => ({ ...d, hide: (d.hide ?? []).filter((x) => x !== "gallery") }));
    setUploading((n) => n + list.length);
    setBusy((n) => n + list.length);
    await Promise.all(
      list.map(async (file) => {
        try {
          const blob = await shrink(file);
          const type = blob.type || file.type;
          const res = await createPhotoUpload(type, blob.size);
          if ("error" in res) throw new Error(res.error);
          if (!(await uploadTo("photos", res, blob, type))) throw new Error("A photo didn't finish uploading. Please try again.");
          update((d) => (d.photoPaths.length < MAX_PHOTOS ? { ...d, photoPaths: [...d.photoPaths, res.path] } : d));
        } catch (e) {
          setStatus({ tone: "error", text: stale(e) ? STALE : e instanceof Error ? e.message : "A photo didn't finish uploading. Please try again." });
        } finally {
          setUploading((n) => n - 1);
          setBusy((n) => n - 1);
        }
      }),
    );
  };
  const move = (i: number, by: number) =>
    update((d) => {
      const list = [...d.photoPaths];
      const [x] = list.splice(i, 1);
      list.splice(i + by, 0, x);
      return { ...d, photoPaths: list };
    });
  return (
    <div>
      <Label help={f.help}>
        {f.label} <span className="font-normal text-subtle">· {photos.length}/{MAX_PHOTOS}</span>
      </Label>
      {demoPhotos.length > 0 && <p className="mb-2 text-[13px] text-subtle">The demo&rsquo;s photos show until you add your own.</p>}
      <div className="grid grid-cols-3 gap-2">
        {photos.map((p, i) => (
          <div key={p} className="relative aspect-square overflow-hidden rounded-xl bg-panel">
            {/* eslint-disable-next-line @next/next/no-img-element -- the couple's own upload, already resized */}
            <img src={mediaUrl("photos", p)} alt={`Photo ${i + 1}`} className="size-full object-cover" />
            <button
              type="button"
              aria-label={`Remove photo ${i + 1}`}
              onClick={() => update((d) => ({ ...d, photoPaths: d.photoPaths.filter((x) => x !== p) }))}
              className="absolute top-1 right-1 grid size-8 place-items-center rounded-full bg-black/65 text-[15px] text-white"
            >
              ✕
            </button>
            {i > 0 && (
              <button type="button" aria-label={`Move photo ${i + 1} earlier`} onClick={() => move(i, -1)} className="absolute bottom-1 left-1 grid size-8 place-items-center rounded-full bg-black/65 text-[15px] text-white">
                ←
              </button>
            )}
          </div>
        ))}
        {Array.from({ length: uploading }).map((_, i) => (
          <div key={`u${i}`} className="grid aspect-square animate-pulse place-items-center rounded-xl bg-panel text-[13px] text-subtle">
            Uploading…
          </div>
        ))}
        {photos.length + uploading < MAX_PHOTOS && (
          <label className="grid aspect-square cursor-pointer place-items-center rounded-xl border border-dashed border-[#bdbdbd] text-center text-[14px] font-medium text-ink">
            <span>
              <span className="block text-[26px] leading-none">+</span>
              Add photos
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(e) => {
                add(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        )}
      </div>
    </div>
  );
}

/* ───────── Font ───────── */

function FontField({ details, set, f, ctx }: FieldProps) {
  const [a, b] = ctx.invite.lead === "bride" ? [details.bride.first, details.groom.first] : [details.groom.first, details.bride.first];
  const sample = `${a || "Aarav"} & ${b || "Meera"}`;
  const options = [{ id: "", name: "The design's own", note: "As the design was made", script: "" }, ...fontStyles];
  return (
    <div>
      <Label help="Changes the lettering of the names and headings.">{f.label}</Label>
      <div className="grid grid-cols-2 gap-2">
        {options.map((o) => {
          const on = (details.font ?? "") === o.id;
          return (
            <button key={o.id || "own"} type="button" onClick={() => set("font", o.id || undefined)} className={`rounded-2xl border p-3 text-left transition ${on ? "border-ink bg-ink text-white" : "border-[#d9d9d9] bg-white text-ink"}`}>
              <span className="block truncate text-[22px] leading-tight" style={o.script ? { fontFamily: o.script } : undefined}>
                {sample}
              </span>
              <span className="mt-1 block text-[13px] font-semibold">{o.name}</span>
              <span className={`block text-[12px] ${on ? "text-white/70" : "text-subtle"}`}>{o.note}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ───────── Song ───────── */

function SongPicker({ doc, update, setBusy, demo }: { doc: Doc; update: FieldProps["update"]; setBusy: FieldProps["setBusy"]; demo: boolean }) {
  const [playing, setPlaying] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");
  const chosen = doc.songPath ? "upload" : (doc.details.music ?? "");
  const choose = (music: string | undefined) => update((d) => ({ ...d, songPath: null, details: setAt(d.details, "music", music) }));
  const upload = async (file: File | undefined) => {
    if (!file) return;
    setError("");
    setProgress(0);
    setBusy((n) => n + 1);
    try {
      const res = await createSongUpload(file.name, file.type, file.size);
      if ("error" in res) throw new Error(res.error);
      if (!(await uploadTo("songs", res, file, res.contentType ?? file.type, setProgress)))
        throw new Error("The upload didn't finish. This is usually a weak network: please try again on Wi-Fi or a stronger signal.");
      update((d) => ({ ...d, songPath: res.path, details: setAt(d.details, "music", undefined) }));
    } catch (e) {
      setError(stale(e) ? STALE : e instanceof Error ? e.message : "The upload didn't finish. Please try again.");
    }
    setProgress(null);
    setBusy((n) => n - 1);
  };
  return (
    <div className="space-y-6">
      <p className="text-[14px] leading-snug text-muted">It plays softly when guests open your invite. Tap ▶ to listen.</p>
      <div>
        <Label help="An MP3 or M4A from your phone, up to 15 MB.">Your own song</Label>
        {doc.songPath && (
          <div className="mb-2 flex items-center gap-3 rounded-2xl bg-ink p-3 text-white">
            <PlayButton id="upload" src={mediaUrl("songs", doc.songPath)} playing={playing} setPlaying={setPlaying} />
            <span className="flex-1 text-[15px] font-semibold">Your uploaded song ✓</span>
          </div>
        )}
        <label className={`flex h-12 cursor-pointer items-center justify-center rounded-xl border border-dashed border-[#bdbdbd] text-[15px] font-medium text-ink ${progress !== null ? "pointer-events-none opacity-60" : ""}`}>
          {progress !== null ? `Uploading… ${progress}%` : doc.songPath ? "Upload a different song" : "+ Upload a song"}
          <input
            type="file"
            accept="audio/*,.mp3,.m4a,.aac,.wav,.ogg,.opus"
            className="sr-only"
            onChange={(e) => {
              upload(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </label>
        {error && <p className="mt-2 text-[13px] text-[#b42318]">{error}</p>}
        {demo && <p className="mt-2 text-[13px] text-subtle">In the demo, an upload is only for trying it out.</p>}
      </div>
      <TrackList title="Songs" list={songs} chosen={chosen} choose={choose} playing={playing} setPlaying={setPlaying} />
      <TrackList title="Instrumentals" list={instrumentals} chosen={chosen} choose={choose} playing={playing} setPlaying={setPlaying} />
      <button type="button" onClick={() => choose(undefined)} className={`h-12 w-full rounded-xl border text-[15px] font-medium ${chosen === "" ? "border-ink bg-ink text-white" : "border-[#d9d9d9] text-ink"}`}>
        No music
      </button>
    </div>
  );
}

function TrackList({ title, list, chosen, choose, playing, setPlaying }: { title: string; list: Track[]; chosen: string; choose: (id: string) => void; playing: string | null; setPlaying: (id: string | null) => void }) {
  return (
    <div>
      <Label>{title}</Label>
      <div className="space-y-2">
        {list.map((t) => {
          const on = chosen === t.id;
          return (
            <div key={t.id} className={`flex items-center gap-3 rounded-2xl p-2.5 pr-3 ${on ? "bg-ink text-white" : "bg-panel text-ink"}`}>
              <PlayButton id={t.id} src={t.id} playing={playing} setPlaying={setPlaying} />
              <button type="button" onClick={() => choose(t.id)} className="min-w-0 flex-1 text-left" aria-pressed={on}>
                <span className="block truncate text-[15px] font-semibold">{t.name}</span>
                <span className={`block truncate text-[12px] ${on ? "text-white/70" : "text-subtle"}`}>{t.mood}</span>
              </button>
              {on && <span className="text-[13px] font-semibold">Chosen ✓</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Plays one song at a time: starting one stops the others. */
function PlayButton({ id, src, playing, setPlaying }: { id: string; src: string; playing: string | null; setPlaying: (id: string | null) => void }) {
  const player = useInviteMusic(src);
  const mine = playing === id;
  const { pause } = player;
  useEffect(() => {
    if (!mine && player.playing) pause();
  }, [mine, player.playing, pause]);
  useEffect(() => pause, [pause]);
  return (
    <button
      type="button"
      aria-label={player.playing ? "Stop" : "Play"}
      onClick={() => {
        if (player.playing) {
          pause();
          setPlaying(null);
        } else {
          setPlaying(id);
          player.play();
        }
      }}
      className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-[14px] text-ink shadow-sm"
    >
      {player.playing ? "❚❚" : "▶"}
    </button>
  );
}

/* ───────── Lists and contacts ───────── */

function ListsField({ details, change, f, reveal }: FieldProps) {
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
      <Label help={f.help}>{f.label}</Label>
      <div className="space-y-3">
        {groups.map((g, i) => (
          <div key={i} data-match={`${g.title} ${g.lines.join(" ")}`} className="space-y-2 rounded-2xl bg-panel p-3">
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

function ContactsField({ details, change, reveal }: FieldProps) {
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
          <div key={i} data-match={c.name} className="space-y-2 rounded-2xl bg-panel p-3">
            <input value={c.name} maxLength={60} placeholder="Name, e.g. Rajesh Sharma (Bride's father)" onChange={(e) => put(i, { ...c, name: e.target.value })} className={`${box} h-12`} />
            <input
              value={c.phones[0] ?? ""}
              inputMode="tel"
              maxLength={16}
              placeholder="Mobile number"
              onChange={(e) => put(i, { ...c, phones: [e.target.value, ...c.phones.slice(1)] })}
              className={`${box} h-12`}
            />
            <Row label="WhatsApp button">
              <Switch on={!!c.whatsapp} label="WhatsApp button" onChange={(v) => put(i, { ...c, whatsapp: v || undefined })} />
            </Row>
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
