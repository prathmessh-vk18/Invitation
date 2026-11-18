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
import { checkPartnerCode, createOrder, createPhotoUpload, createSongUpload } from "@/lib/order-actions";
import { cleanPartnerCode, readRefCookie } from "@/config/partners";
import { waNumber } from "@/app/(site)/start/[template]/form-model";
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
  /** A new invite with no order yet: kept on the phone until the couple adds their details and pays. */
  draft?: { price: string };
};

/** Everything the couple can change: their details, and the song and photos kept beside them. */
type Doc = { details: InviteDetails; songPath: string | null; photoPaths: string[] };
type Sheet =
  | { kind: "section"; id: string; text?: string }
  | { kind: "parts" }
  | { kind: "style" }
  | { kind: "song" }
  | { kind: "finish" }
  | null;
type Contact = { name: string; phone: string; email: string };
const draftKey = (design: string) => `aavjoo-draft-v1-${design}`;
type Status = { tone: "ok" | "info" | "error"; text: string } | null;

const MAX_PHOTOS = 8;
const stale = (e: unknown) => unstable_isUnrecognizedActionError(e);
const STALE = "Aavjoo was just updated. Please refresh this page and try again.";

/**
 * The couple's own editor, like a design app: their invite full screen, every part outlined; tap a
 * part (or any words on it) and its settings open in a panel from the bottom, with the tapped line's
 * box picked out. Changes show on the invite as they type; Save puts them live.
 */
export function InviteEditor({ orderId, design, extra, details: startDetails, songPath: startSong, photoPaths: startPhotos, backHref, account, draft }: Props) {
  const router = useRouter();
  // A new invite picks up where the couple left off on this phone.
  const [restored] = useState<{ doc: Doc; contact: Contact } | null>(() => {
    if (!draft || typeof window === "undefined") return null;
    try {
      const saved = JSON.parse(window.localStorage.getItem(draftKey(design)) ?? "null");
      return saved?.doc?.details ? saved : null;
    } catch {
      return null;
    }
  });
  const [contact, setContact] = useState<Contact>(restored?.contact ?? { name: "", phone: "", email: "" });
  const [editsLeft, setEditsLeft] = useState(account?.kind === "paid" ? account.editsLeft : null);
  const [confirming, setConfirming] = useState(false);
  const start: Doc = useMemo(() => ({ details: startDetails, songPath: startSong, photoPaths: startPhotos }), [startDetails, startSong, startPhotos]);
  const [doc, setDoc] = useState<Doc>(restored?.doc ?? start);
  const [saved, setSaved] = useState<Doc>(start);
  const [history, setHistory] = useState<Doc[]>([]);
  const lastPush = useRef(0);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [status, setStatus] = useState<Status>(null);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(0);
  // The "tap any part" tip shows until the couple closes it with ✕ (remembered on the phone).
  const [hintClosed, setHintClosed] = useState(() => {
    try {
      return typeof window !== "undefined" && window.localStorage.getItem("aavjoo-editor-hint") === "seen";
    } catch {
      return false;
    }
  });
  const dismissHint = () => setHintClosed(true);
  useEffect(() => {
    if (!hintClosed) return;
    try {
      window.localStorage.setItem("aavjoo-editor-hint", "seen");
    } catch {}
  }, [hintClosed]);
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
        gallery: doc.photoPaths.length ? doc.photoPaths.map((p) => mediaUrl("photos", p)) : orderId || draft ? undefined : extra.gallery,
      }) as Invite,
    [extra, details, doc.songPath, doc.photoPaths, orderId, draft],
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
    setSheet({ kind });
  };

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.source !== frame.current?.contentWindow) return;
      if (e.data?.type === PREVIEW_READY) {
        ready.current = true;
        post({ type: PREVIEW_INVITE, invite: inviteRef.current });
      }
      // A tap on the invite opens that part's panel where it is (no scrolling), with the box for
      // the tapped words picked out.
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

  // A new invite is kept on this phone as it's made.
  useEffect(() => {
    if (!draft) return;
    const t = window.setTimeout(() => {
      try {
        window.localStorage.setItem(draftKey(design), JSON.stringify({ doc, contact, at: Date.now() }));
      } catch {}
    }, 400);
    return () => window.clearTimeout(t);
  }, [draft, design, doc, contact]);

  // Leaving with unsaved changes asks first (a new invite is kept on the phone instead).
  useEffect(() => {
    if (!dirty || draft) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, draft]);

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
    if (draft) {
      post({ type: PREVIEW_SELECT, id: null });
      setSheet({ kind: "finish" });
      return;
    }
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
  const primaryLabel = draft ? (busy > 0 ? "Uploading…" : "Next →") : saving ? "Saving…" : busy > 0 ? "Uploading…" : unpaid && account.pay ? (dirty ? "Save & pay" : account.pay) : dirty || !orderId ? "Save" : "Saved ✓";

  const current = sheet?.kind === "section" ? sections.find((s) => s.id === sheet.id) : null;
  const hidden = (id: string) => (details.hide ?? []).includes(id as never);
  const fieldProps = { ctx, details, set, change, reveal, doc, update, setBusy, setStatus };
  const title = current?.title ?? (sheet?.kind === "style" ? "Style" : sheet?.kind === "song" ? "Song" : sheet?.kind === "finish" ? "Almost done" : "Parts of your invite");


  return (
    <div className="fixed inset-0 flex justify-center bg-black">
      <style>{`.editor-flash{animation:editor-flash 1.6s ease}@keyframes editor-flash{0%,60%{box-shadow:0 0 0 3px #fff;border-radius:14px}100%{box-shadow:0 0 0 0 transparent}}`}</style>
      <div className="relative h-full w-full max-w-[480px] overflow-hidden bg-black">
        <iframe ref={frame} src="/preview?edit=1" title="Your invite" className="absolute inset-0 h-full w-full border-0" allow="autoplay" />

        {/* Shades at the top and bottom, so the white buttons read over any invite. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-28 bg-gradient-to-b from-black/45 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-32 bg-gradient-to-t from-black/55 to-transparent" />

        {/* Top left: close. Top centre: where this invite stands. */}
        <Link href={backHref} aria-label="Close" className="absolute top-3 left-3 z-20 grid size-11 place-items-center rounded-full bg-black/35 text-white backdrop-blur-md">
          <svg viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
            <path d="M5 5l10 10M15 5 5 15" />
          </svg>
        </Link>
        <div className="pointer-events-none absolute inset-x-16 top-4 z-20 flex justify-center">
          {!orderId && !draft && <Pill>Demo</Pill>}
          {editsLeft !== null && (
            <Pill>
              {editsLeft} edit{editsLeft === 1 ? "" : "s"} left
            </Pill>
          )}
        </div>

        {/* Top right: undo. */}
        <button
          type="button"
          onClick={undo}
          disabled={!history.length}
          aria-label="Undo"
          className="absolute top-3 right-3 z-20 grid size-11 place-items-center rounded-full bg-black/35 text-white backdrop-blur-md disabled:opacity-40"
        >
          <Icon d="M7 5 3.5 8.5 7 12M4 8.5h7a5 5 0 0 1 0 10H8" />
        </button>

        {/* Bottom: the tools in a row, and the next step at the end. Only the buttons catch
            touches, so a swipe anywhere else scrolls the invite. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-1 px-2 pb-[max(12px,env(safe-area-inset-bottom))]">
          <div className="flex items-end gap-0.5">
            <Tool label="Style" active={sheet?.kind === "style"} onClick={() => openPanel("style")}>
              <span className="text-[17px] font-bold tracking-tight">Aa</span>
            </Tool>
            <Tool label="Song" active={sheet?.kind === "song"} onClick={() => openPanel("song")}>
              <Icon d="M8 15.5V5l8-1.5V14M8 15.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM16 14a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" />
            </Tool>
            <Tool label="Photos" active={sheet?.kind === "section" && sheet.id === "gallery"} onClick={() => openSection("gallery")}>
              <Icon d="M3.5 5.5h13v10h-13zM3.5 13l4-4 3 3 2-2 4 4M13 8.5h.01" />
            </Tool>
            <Tool label="Functions" active={sheet?.kind === "section" && sheet.id === "events"} onClick={() => openSection("events")}>
              <Icon d="M4 5.5h12v11H4zM4 8.5h12M7.5 3.5v3M12.5 3.5v3M7 11.5h2M11 11.5h2M7 14h2" />
            </Tool>
            <Tool label="Parts" active={sheet?.kind === "parts"} onClick={() => openPanel("parts")}>
              <Icon d="M3.5 4.5h13v4h-13zM3.5 11.5h6v4h-6zM12.5 11.5h4v4h-4z" />
            </Tool>
          </div>
          <button
            type="button"
            onClick={primary}
            disabled={saving || busy > 0 || (!draft && !dirty && !!orderId && !(unpaid && account.pay))}
            className="pointer-events-auto flex min-w-14 flex-col items-center gap-1 text-white disabled:opacity-50"
          >
            <span className="grid size-12 place-items-center rounded-full bg-white text-black shadow-lg transition active:scale-95">
              <svg viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M4 10h11M11 5.5 15.5 10 11 14.5" />
              </svg>
            </span>
            <span className="max-w-[90px] text-center text-[11px] leading-tight font-semibold [text-shadow:0_1px_3px_rgba(0,0,0,.7)]">{primaryLabel.replace(/\s*→$/, "")}</span>
          </button>
        </div>

        {!hintClosed && !sheet && (
          <div className="pointer-events-none absolute inset-x-0 bottom-[100px] z-20 flex justify-center px-4">
            <div className="pointer-events-auto flex items-center gap-1 rounded-full bg-black/55 py-1.5 pr-1.5 pl-4 text-[14px] leading-snug font-medium text-white backdrop-blur-md">
              <span>Tap any part to edit it · scroll to see more</span>
              <button type="button" onClick={dismissHint} aria-label="Close tip" className="grid size-8 shrink-0 place-items-center rounded-full text-[15px] active:bg-white/15">
                ✕
              </button>
            </div>
          </div>
        )}

        {confirming && (
          <div className="absolute inset-x-3 bottom-[96px] z-40 rounded-3xl bg-[#1c1c1e] p-5 text-white shadow-2xl">
            <p className="text-[17px] font-semibold">Save and put these changes live?</p>
            <p className="mt-1 text-[14px] leading-snug text-white/65">
              This uses 1 edit{editsLeft !== null ? ` (${Math.max(0, editsLeft - 1)} left after)` : ""}. Make all your changes first, then save once.
            </p>
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={() => setConfirming(false)} className="h-11 flex-1 rounded-full bg-white/10 text-[15px] font-medium">
                Keep editing
              </button>
              <button type="button" onClick={save} className="h-11 flex-1 rounded-full bg-white text-[15px] font-semibold text-black">
                Save
              </button>
            </div>
          </div>
        )}
        {status && (
          <div className="pointer-events-none absolute inset-x-0 top-[68px] z-40 flex justify-center px-4">
            <div
              role="status"
              onClick={() => setStatus(null)}
              className={`pointer-events-auto max-w-full rounded-2xl px-4 py-2.5 text-center text-[14px] leading-snug font-medium text-white shadow-xl backdrop-blur-md ${status.tone === "ok" ? "bg-[#1f7a3a]/90" : status.tone === "error" ? "bg-[#b3261e]/90" : "bg-black/70"}`}
            >
              {status.text}
            </div>
          </div>
        )}

        <BottomSheet open={!!sheet} title={title} onClose={closeSheet} bodyRef={sheetBody}>
          {current && (
            <div className="space-y-7">
              {current.note && <p className="text-[14px] leading-snug text-white/60">{current.note}</p>}
              {current.optional && hidden(current.optional) && (
                <p className="rounded-xl bg-[#3a3216] px-3 py-2 text-[14px] text-[#ffd479]">This part is hidden. Turn on “Show this part” to bring it back.</p>
              )}
              {current.fields.map((f) => (
                <FieldView key={f.key + f.label} f={f} {...fieldProps} />
              ))}
            </div>
          )}
          {sheet?.kind === "style" && (
            <div className="space-y-8">
              {lookFields.map((f) => (
                <FieldView key={f.key} f={f} {...fieldProps} />
              ))}
            </div>
          )}
          {sheet?.kind === "song" && <SongPicker doc={doc} update={update} setBusy={setBusy} demo={!orderId && !draft} />}
          {sheet?.kind === "finish" && draft && (
            <Finish
              design={design}
              price={draft.price}
              doc={doc}
              sample={start.details}
              contact={contact}
              setContact={setContact}
              open={(id) => openSection(id)}
              onDone={(id) => {
                try {
                  window.localStorage.removeItem(draftKey(design));
                } catch {}
                router.push(`/order/${id}?pay=1`);
              }}
            />
          )}
          {sheet?.kind === "parts" && (
            <ul className="divide-y divide-white/10">
              {sections.map((s) => (
                <li key={s.id} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[16px] font-medium text-white">{s.title}</p>
                    {s.optional && <p className="text-[13px] text-white/50">{hidden(s.optional) ? "Hidden" : "Showing"}</p>}
                    {s.id === "contacts" && !details.contacts?.length && <p className="text-[13px] text-white/50">None yet</p>}
                  </div>
                  {s.optional && (
                    <Switch
                      on={!hidden(s.optional)}
                      label={`Show ${s.title}`}
                      onChange={(on) => change((d) => ({ ...d, hide: on ? (d.hide ?? []).filter((x) => x !== s.optional) : [...(d.hide ?? []), s.optional!] }))}
                    />
                  )}
                  <button type="button" onClick={() => openSection(s.id)} className="h-9 rounded-full bg-white/10 px-4 text-[14px] font-medium text-white">
                    {s.id === "contacts" && !details.contacts?.length ? "Add" : "Edit"}
                  </button>
                </li>
              ))}
              {draft && (
                <li className="pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (!window.confirm("Start again from the sample? Your changes on this phone will be cleared.")) return;
                      update(() => start);
                      closeSheet();
                    }}
                    className="h-11 text-[14px] font-medium text-[#ff6b6b]"
                  >
                    Start again from the sample
                  </button>
                </li>
              )}
            </ul>
          )}
        </BottomSheet>
      </div>
    </div>
  );
}

const norm = (s?: string) => (s ?? "").replace(/\s+/g, " ").trim().toLowerCase();

function Pill({ children }: { children: ReactNode }) {
  return <span className="rounded-full bg-black/45 px-3 py-1.5 text-[13px] font-semibold text-white backdrop-blur-md">{children}</span>;
}

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 20 20" className="size-[22px]" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

/** One of the story-style tools along the bottom: a round button with its name under it. */
function Tool({ label, onClick, active, disabled, children }: { label: string; onClick: () => void; active?: boolean; disabled?: boolean; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={label} className="pointer-events-auto flex w-[58px] flex-col items-center gap-1 text-white disabled:opacity-40">
      <span className={`grid size-11 place-items-center rounded-full backdrop-blur-md transition active:scale-95 ${active ? "bg-white text-black" : "bg-black/35"}`}>{children}</span>
      <span className="text-[11px] leading-none font-semibold whitespace-nowrap [text-shadow:0_1px_3px_rgba(0,0,0,.7)]">{label}</span>
    </button>
  );
}

/** A dark panel from the bottom, like a story's music and sticker trays; drag it down to close. */
function BottomSheet({ open, title, onClose, bodyRef, children }: { open: boolean; title: string; onClose: () => void; bodyRef: RefObject<HTMLDivElement | null>; children: ReactNode }) {
  const startY = useRef<number | null>(null);
  const [drag, setDrag] = useState(0);
  return (
    <div
      className={`absolute inset-x-0 bottom-0 z-30 flex max-h-[58%] flex-col rounded-t-[26px] bg-[#1c1c1e] text-white shadow-[0_-12px_40px_rgba(0,0,0,.5)] ${drag ? "" : "transition-transform duration-300"} ${open ? "" : "pointer-events-none translate-y-full"}`}
      style={open && drag ? { transform: `translateY(${drag}px)` } : undefined}
      role="dialog"
      aria-label={title}
      aria-hidden={!open}
    >
      <div
        className="touch-none px-4 pt-2.5 pb-3"
        onTouchStart={(e) => (startY.current = e.touches[0].clientY)}
        onTouchMove={(e) => startY.current !== null && setDrag(Math.max(0, e.touches[0].clientY - startY.current))}
        onTouchEnd={() => {
          if (drag > 70) onClose();
          setDrag(0);
          startY.current = null;
        }}
      >
        <div className="mx-auto h-1.5 w-10 rounded-full bg-white/25" />
        <div className="mt-3 flex items-center justify-between">
          <p className="text-[18px] font-bold">{title}</p>
          <button type="button" onClick={onClose} className="h-9 rounded-full bg-white px-4 text-[15px] font-semibold text-black">
            Done
          </button>
        </div>
      </div>
      <div ref={bodyRef} className="overflow-y-auto overscroll-contain px-4 pt-2 pb-[calc(28px+env(safe-area-inset-bottom))]">
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

const box = "w-full rounded-xl border border-transparent bg-white/[0.09] px-3.5 py-3 text-[16px] leading-snug text-white outline-none [color-scheme:dark] placeholder:text-white/35 focus:border-white/40";

function Label({ children, help }: { children: ReactNode; help?: string }) {
  return (
    <div className="mb-2">
      <p className="text-[15px] font-semibold text-white">{children}</p>
      {help && <p className="mt-0.5 text-[13px] leading-snug text-white/50">{help}</p>}
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
                className={`min-h-11 rounded-full border px-4 text-[15px] font-medium transition ${cur === o.value ? "border-white bg-white text-black" : "border-transparent bg-white/10 text-white"}`}
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
            {f.label} <span className="font-normal text-white/50">· {Math.round(n * 100)}%</span>
          </Label>
          <input type="range" min={f.min} max={f.max} step={f.step} value={n} onChange={(e) => set(key, Number(e.target.value) === f.fallback ? undefined : Number(e.target.value))} className="h-11 w-full accent-white" />
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
            <button type="button" aria-label="Smaller text" disabled={i === 0} onClick={() => step(-1)} className="h-12 w-16 rounded-xl border border-[#d9d9d9] text-[16px] font-semibold text-white disabled:opacity-35">
              A−
            </button>
            <span className="flex-1 text-center text-[16px] font-semibold text-white">{Math.round(n * 100)}%</span>
            <button type="button" aria-label="Bigger text" disabled={i === TEXT_SCALES.length - 1} onClick={() => step(1)} className="h-12 w-16 rounded-xl border border-[#d9d9d9] text-[20px] font-semibold text-white disabled:opacity-35">
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
            <div key={who} className="rounded-2xl bg-white/[0.07] p-4">
              <p className="mb-4 text-[16px] font-semibold text-white">
                {details[who].first || (who === "bride" ? "Bride" : "Groom")}&rsquo;s family <span className="font-normal text-white/50">({who})</span>
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
        <p className="text-[15px] font-semibold text-white">{label}</p>
        {help && <p className="mt-0.5 text-[13px] leading-snug text-white/50">{help}</p>}
      </div>
      {children}
    </div>
  );
}

function Switch({ on, onChange, label }: { on: boolean; onChange: (on: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} className={`relative h-8 w-[52px] shrink-0 rounded-full transition ${on ? "bg-[#34c759]" : "bg-white/20"}`}>
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
          <button key={s} type="button" onClick={() => commit(s)} className="h-9 rounded-full bg-white/[0.07] px-3 text-[14px] text-white">
            {s}
          </button>
        ))}
        {!t.core && value === "" && t.emptyHides && <span className="text-[13px] text-white/50">Hidden on the invite</span>}
        {!t.core && value !== undefined && fallback && (
          <button type="button" onClick={() => (setDraft(null), set(path, undefined))} className="h-9 text-[14px] font-medium text-[#ffd479] underline underline-offset-2">
            Use the design&rsquo;s wording
          </button>
        )}
        {v.length > t.max * 0.8 && <span className="ml-auto text-[12px] text-white/50">{t.max - v.length} left</span>}
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
            <div key={i} data-match={`${e.name} ${e.venue}`} className="rounded-2xl bg-white/[0.07]">
              <button type="button" onClick={() => (setOpen(isOpen ? null : i), reveal(e.name))} className="flex w-full items-center gap-3 p-4 text-left">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/10 text-[14px] font-semibold text-white">{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[16px] font-semibold text-white">{e.name || "New function"}</span>
                  <span className="block truncate text-[13px] text-white/50">
                    {prettyDay(e.start)}
                    {e.venue ? ` · ${e.venue}` : ""}
                  </span>
                </span>
                <span className="text-[20px] text-white/50">{isOpen ? "−" : "+"}</span>
              </button>
              {isOpen && (
                <div className="space-y-4 px-4 pb-4">
                  <div>
                    <Label>Name</Label>
                    <input value={e.name} maxLength={40} placeholder="e.g. Haldi" onChange={(x) => edit({ name: x.target.value })} className={`${box} h-12`} />
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {KIND_PICKS.map((k) => (
                        <button key={k.kind} type="button" onClick={() => edit({ name: k.name, kind: k.kind })} className={`h-9 rounded-full px-3 text-[14px] ${e.name === k.name ? "bg-white text-black" : "bg-white/10 text-white"}`}>
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
                    <button type="button" disabled={i === 0} onClick={() => (move(i, -1), setOpen(i - 1))} className="h-10 rounded-full bg-white/10 px-4 text-[14px] font-medium text-white disabled:opacity-40">
                      ↑ Move up
                    </button>
                    <button type="button" disabled={i === events.length - 1} onClick={() => (move(i, 1), setOpen(i + 1))} className="h-10 rounded-full bg-white/10 px-4 text-[14px] font-medium text-white disabled:opacity-40">
                      ↓ Move down
                    </button>
                    {events.length > 1 && (
                      <button type="button" onClick={() => (put(i, null), setOpen(null))} className="ml-auto h-10 px-2 text-[14px] font-medium text-[#ff6b6b]">
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
          <button type="button" onClick={add} className="h-12 w-full rounded-xl border border-dashed border-white/25 text-[15px] font-medium text-white">
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
        {f.label} <span className="font-normal text-white/50">· {photos.length}/{MAX_PHOTOS}</span>
      </Label>
      {demoPhotos.length > 0 && <p className="mb-2 text-[13px] text-white/50">The demo&rsquo;s photos show until you add your own.</p>}
      <div className="grid grid-cols-3 gap-2">
        {photos.map((p, i) => (
          <div key={p} className="relative aspect-square overflow-hidden rounded-xl bg-white/[0.07]">
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
          <div key={`u${i}`} className="grid aspect-square animate-pulse place-items-center rounded-xl bg-white/[0.07] text-[13px] text-white/50">
            Uploading…
          </div>
        ))}
        {photos.length + uploading < MAX_PHOTOS && (
          <label className="grid aspect-square cursor-pointer place-items-center rounded-xl border border-dashed border-white/25 text-center text-[14px] font-medium text-white">
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
            <button key={o.id || "own"} type="button" onClick={() => set("font", o.id || undefined)} className={`rounded-2xl border p-3 text-left transition ${on ? "border-white bg-white text-black" : "border-transparent bg-white/10 text-white"}`}>
              <span className="block truncate text-[22px] leading-tight" style={o.script ? { fontFamily: o.script } : undefined}>
                {sample}
              </span>
              <span className="mt-1 block text-[13px] font-semibold">{o.name}</span>
              <span className={`block text-[12px] ${on ? "text-black/55" : "text-white/50"}`}>{o.note}</span>
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
      <p className="text-[14px] leading-snug text-white/65">It plays softly when guests open your invite. Tap ▶ to listen.</p>
      <div>
        <Label help="An MP3 or M4A from your phone, up to 15 MB.">Your own song</Label>
        {doc.songPath && (
          <div className="mb-2 flex items-center gap-3 rounded-2xl bg-white p-3 text-black">
            <PlayButton id="upload" src={mediaUrl("songs", doc.songPath)} playing={playing} setPlaying={setPlaying} />
            <span className="flex-1 text-[15px] font-semibold">Your uploaded song ✓</span>
          </div>
        )}
        <label className={`flex h-12 cursor-pointer items-center justify-center rounded-xl border border-dashed border-white/25 text-[15px] font-medium text-white ${progress !== null ? "pointer-events-none opacity-60" : ""}`}>
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
        {error && <p className="mt-2 text-[13px] text-[#ff8a80]">{error}</p>}
        {demo && <p className="mt-2 text-[13px] text-white/50">In the demo, an upload is only for trying it out.</p>}
      </div>
      <TrackList title="Songs" list={songs} chosen={chosen} choose={choose} playing={playing} setPlaying={setPlaying} />
      <TrackList title="Instrumentals" list={instrumentals} chosen={chosen} choose={choose} playing={playing} setPlaying={setPlaying} />
      <button type="button" onClick={() => choose(undefined)} className={`h-12 w-full rounded-xl border text-[15px] font-medium ${chosen === "" ? "border-white bg-white text-black" : "border-white/20 text-white"}`}>
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
            <div key={t.id} className={`flex items-center gap-3 rounded-2xl p-2.5 pr-3 ${on ? "bg-white text-black" : "bg-white/[0.07] text-white"}`}>
              <PlayButton id={t.id} src={t.id} playing={playing} setPlaying={setPlaying} />
              <button type="button" onClick={() => choose(t.id)} className="min-w-0 flex-1 text-left" aria-pressed={on}>
                <span className="block truncate text-[15px] font-semibold">{t.name}</span>
                <span className={`block truncate text-[12px] ${on ? "text-black/55" : "text-white/50"}`}>{t.mood}</span>
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
      className="grid size-10 shrink-0 place-items-center rounded-full border border-current/25 text-[14px]"
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
          <div key={i} data-match={`${g.title} ${g.lines.join(" ")}`} className="space-y-2 rounded-2xl bg-white/[0.07] p-3">
            <input value={g.title} maxLength={80} placeholder="Heading, e.g. Our Associates" onChange={(e) => put(i, { ...g, title: e.target.value })} className={`${box} h-12 font-semibold`} />
            <textarea
              value={g.lines.join("\n")}
              rows={Math.min(8, Math.max(3, g.lines.length + 1))}
              placeholder={"One name per line\nMr. & Mrs. Sharma\nThe Verma family"}
              onChange={(e) => put(i, { ...g, lines: e.target.value.split("\n") })}
              className={`${box} resize-none`}
            />
            <button type="button" onClick={() => put(i, null)} className="h-9 text-[14px] font-medium text-[#ff6b6b]">
              Remove this section
            </button>
          </div>
        ))}
        {groups.length < 8 && (
          <button type="button" onClick={() => put(groups.length, { title: "", lines: [] })} className="h-12 w-full rounded-xl border border-dashed border-white/25 text-[15px] font-medium text-white">
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
          <div key={i} data-match={c.name} className="space-y-2 rounded-2xl bg-white/[0.07] p-3">
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
            <button type="button" onClick={() => put(i, null)} className="h-9 text-[14px] font-medium text-[#ff6b6b]">
              Remove
            </button>
          </div>
        ))}
        {list.length < 6 && (
          <button type="button" onClick={() => put(list.length, { name: "", phones: [""], whatsapp: true })} className="h-12 w-full rounded-xl border border-dashed border-white/25 text-[15px] font-medium text-white">
            + Add a contact
          </button>
        )}
      </div>
    </div>
  );
}

/* ───────── Finish: a new invite becomes an order ───────── */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** What's still the design's sample, so a couple doesn't pay for an invite with someone else's details. */
function stillSample(d: InviteDetails, sample: InviteDetails) {
  const out: { label: string; part: string; must?: boolean }[] = [];
  if (d.bride.first.trim() === sample.bride.first || d.groom.first.trim() === sample.groom.first) out.push({ label: "The names", part: "cover", must: true });
  if (d.date === sample.date) out.push({ label: "The wedding date", part: "cover", must: true });
  if (d.city === sample.city) out.push({ label: "The city", part: "cover" });
  if (d.hosts && d.hosts === sample.hosts) out.push({ label: "The families' line", part: "blessing" });
  if ((d.bride.parents && d.bride.parents === sample.bride.parents) || (d.groom.parents && d.groom.parents === sample.groom.parents)) out.push({ label: "The parents' names", part: "blessing" });
  const sampleEvents = new Set(sample.events.map((e) => `${e.venue}|${e.start}`));
  if (d.events.some((e) => sampleEvents.has(`${e.venue}|${e.start}`))) out.push({ label: "Functions' dates and venues", part: "events" });
  if (d.hashtag && d.hashtag === sample.hashtag) out.push({ label: "The hashtag", part: "closing" });
  return out;
}

function Finish({
  design,
  price,
  doc,
  sample,
  contact,
  setContact,
  open,
  onDone,
}: {
  design: string;
  price: string;
  doc: Doc;
  sample: InviteDetails;
  contact: Contact;
  setContact: (c: Contact) => void;
  open: (part: string) => void;
  onDone: (orderId: string) => void;
}) {
  const [errors, setErrors] = useState<string[]>([]);
  const [tried, setTried] = useState(false);
  const [sending, setSending] = useState(false);
  const left = stillSample(doc.details, sample);
  const must = left.filter((x) => x.must);
  const phone = waNumber(contact.phone);
  const problems = [
    ...(!contact.name.trim() ? ["Add your name."] : []),
    ...(!phone ? ["Add your WhatsApp number (10 digits)."] : []),
    ...(!EMAIL.test(contact.email.trim()) ? ["Add your email, e.g. name@gmail.com."] : []),
  ];

  const create = async () => {
    setTried(true);
    if (must.length || problems.length) return;
    setSending(true);
    setErrors([]);
    try {
      const code = cleanPartnerCode(readRefCookie());
      const partner = code ? await checkPartnerCode(code).catch(() => null) : null;
      // The sample's RSVP number is no one's: replies come to the couple unless they set another.
      const details = doc.details.rsvp?.phone === sample.rsvp?.phone ? { ...doc.details, rsvp: { ...doc.details.rsvp, phone: `+${phone}` } } : doc.details;
      const res = await createOrder({
        template: design as never,
        details,
        songPath: doc.songPath,
        photoPaths: doc.photoPaths,
        customer: { name: contact.name.trim(), phone: `+${phone}`, email: contact.email.trim() },
        ...(partner ? { partnerCode: partner.code } : {}),
      });
      if ("errors" in res) setErrors(res.errors);
      else onDone(res.id);
    } catch (e) {
      setErrors([stale(e) ? STALE : "We couldn't save. Check your internet and try again."]);
    }
    setSending(false);
  };

  return (
    <div className="space-y-6">
      {left.length > 0 && (
        <div className="rounded-2xl bg-[#2b2513] p-4">
          <p className="text-[15px] font-semibold text-white">Still showing the sample</p>
          <p className="mt-0.5 text-[13px] leading-snug text-white/65">Change these to your own before you continue.</p>
          <ul className="mt-3 space-y-2">
            {left.map((x) => (
              <li key={x.label} className="flex items-center gap-3">
                <span className={`flex-1 text-[15px] ${x.must && tried ? "font-semibold text-[#ff6b6b]" : "text-white"}`}>
                  {x.label}
                  {x.must ? " *" : ""}
                </span>
                <button type="button" onClick={() => open(x.part)} className="h-9 rounded-full bg-white/10 px-4 text-[14px] font-medium text-white shadow-sm">
                  Change
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div>
        <Label help="We send your invite link and edit link here.">Your details</Label>
        <div className="space-y-2.5">
          <input value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} placeholder="Your name" autoComplete="name" maxLength={80} className={`${box} h-12`} />
          <input
            type="tel"
            inputMode="tel"
            value={contact.phone}
            onChange={(e) => setContact({ ...contact, phone: e.target.value })}
            placeholder="WhatsApp number"
            autoComplete="tel"
            className={`${box} h-12`}
          />
          <input
            type="email"
            inputMode="email"
            value={contact.email}
            onChange={(e) => setContact({ ...contact, email: e.target.value })}
            placeholder="Email"
            autoComplete="email"
            className={`${box} h-12`}
          />
        </div>
        <p className="mt-2 text-[13px] text-white/50">Guests&rsquo; RSVPs come to this WhatsApp number unless you set another in the RSVP part.</p>
      </div>
      {tried && (must.length > 0 || problems.length > 0 || errors.length > 0) && (
        <div role="alert" className="space-y-1 rounded-2xl bg-[#3a1717] p-4 text-[14px] text-[#ff6b6b]">
          {must.map((x) => (
            <p key={x.label}>{x.label}: still the sample. Tap Change to add yours.</p>
          ))}
          {[...problems, ...errors].map((x) => (
            <p key={x}>{x}</p>
          ))}
        </div>
      )}
      <button type="button" onClick={create} disabled={sending} className="h-13 w-full rounded-full bg-white text-[17px] font-semibold text-black disabled:opacity-60">
        {sending ? "Creating your invite…" : `Create my invite · Pay ${price}`}
      </button>
      <p className="text-center text-[13px] text-white/50">Your invite goes live the moment you pay. You can keep changing it after.</p>
    </div>
  );
}
