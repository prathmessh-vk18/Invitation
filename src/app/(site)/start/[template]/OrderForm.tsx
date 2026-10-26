"use client";

import { offer } from "@/config/offer";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition, type ReactNode } from "react";
import { formatINR } from "@/config/site";
import { getInvite } from "@/data/invites";
import type { TemplateMeta } from "@/data/templates";
import { InvitePreview } from "@/invites/InvitePreview";
import { fmtDate } from "@/lib/format";
import { fontStyles, getFontStyle, sections, type SectionId } from "@/config/customise";
import { instrumentals, songs, tracks, type Track } from "@/config/music";
import { themes } from "@/invites/registry";
import { useInviteMusic } from "@/invites/music";
import { eventKinds } from "@/lib/orders";
import { checkPartnerCode, createOrder, createPhotoUpload, createSongUpload } from "@/lib/order-actions";
import { cleanPartnerCode, readRefCookie } from "@/config/partners";
import { browserSupabase } from "@/lib/supabase-browser";
import { OfferCountdown, PriceTag } from "@/site/offer";
import { Button, Panel, PhoneFrame, ease } from "@/ui";
import {
  addDays,
  blankEvent,
  idOf,
  initialState,
  LIMITS,
  mainCeremonies,
  mobile10,
  stepOf,
  steps,
  toDetails,
  toPreview,
  validate,
  type EventRow,
  type FormState,
  type Person,
  type StepId,
} from "./form-model";

/* ───────── Field pieces ───────── */

const inputBase = "mt-1.5 w-full rounded-field border bg-surface px-3.5 py-2.5 text-[16px] text-ink outline-none transition placeholder:text-faint";
const inputTone = (error?: string) => (error ? "border-[#d64545] focus:border-[#d64545] focus:shadow-[0_0_0_3px_rgb(214_69_69/.15)]" : "border-line focus:border-ink focus:shadow-[0_0_0_3px_rgb(0_0_0/.06)]");

function FieldShell({ k, label, hint, error, help, counter, children }: { k: string; label: string; hint?: string; error?: string; help?: string; counter?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={idOf(k)} className="flex items-baseline justify-between gap-3 text-[14px] font-semibold text-ink">
        <span>
          {label}
          {hint && <span className="font-normal text-subtle"> · {hint}</span>}
        </span>
        {counter && <span className="text-caption font-normal text-subtle tabular-nums">{counter}</span>}
      </label>
      {children}
      <AnimatePresence initial={false}>
        {error ? (
          <motion.p
            key="err"
            id={`${idOf(k)}-error`}
            role="alert"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-1.5 flex items-start gap-1.5 overflow-hidden text-[13px] text-[#b42318]"
          >
            <svg viewBox="0 0 20 20" className="mt-px size-3.5 shrink-0" fill="currentColor" aria-hidden>
              <path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm-.75 4h1.5v5h-1.5V6Zm.75 8.25a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" />
            </svg>
            {error}
          </motion.p>
        ) : help ? (
          <p key="help" className="mt-1.5 text-[13px] text-subtle">
            {help}
          </p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

type InputProps = {
  k: string;
  label: string;
  hint?: string;
  help?: string;
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  error?: string;
  type?: "text" | "date" | "time" | "tel" | "email";
  placeholder?: string;
  maxLength?: number;
  min?: string;
  max?: string;
  autoComplete?: string;
  inputMode?: "text" | "tel" | "email" | "numeric";
  counter?: boolean;
};

function Input(p: InputProps) {
  return (
    <FieldShell k={p.k} label={p.label} hint={p.hint} help={p.help} error={p.error} counter={p.counter && p.maxLength ? `${p.value.length}/${p.maxLength}` : undefined}>
      <input
        id={idOf(p.k)}
        type={p.type ?? "text"}
        value={p.value}
        onChange={(e) => p.onChange(e.target.value)}
        onBlur={p.onBlur}
        placeholder={p.placeholder}
        maxLength={p.maxLength}
        min={p.min}
        max={p.max}
        autoComplete={p.autoComplete ?? "off"}
        inputMode={p.inputMode}
        aria-invalid={Boolean(p.error)}
        aria-describedby={p.error ? `${idOf(p.k)}-error` : undefined}
        className={`${inputBase} ${inputTone(p.error)}`}
      />
    </FieldShell>
  );
}

function TextArea(p: Omit<InputProps, "type" | "min" | "max" | "inputMode"> & { rows?: number }) {
  return (
    <FieldShell k={p.k} label={p.label} hint={p.hint} help={p.help} error={p.error} counter={p.maxLength ? `${p.value.length}/${p.maxLength}` : undefined}>
      <textarea
        id={idOf(p.k)}
        rows={p.rows ?? 3}
        value={p.value}
        onChange={(e) => p.onChange(e.target.value)}
        onBlur={p.onBlur}
        placeholder={p.placeholder}
        maxLength={p.maxLength}
        aria-invalid={Boolean(p.error)}
        aria-describedby={p.error ? `${idOf(p.k)}-error` : undefined}
        className={`${inputBase} ${inputTone(p.error)} resize-none`}
      />
    </FieldShell>
  );
}

function Toggle({ options, value, onChange, label }: { options: { v: string; l: string }[]; value: string; onChange: (v: string) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-full bg-surface p-1">
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          role="radio"
          aria-checked={value === o.v}
          onClick={() => onChange(o.v)}
          className={`rounded-full px-4 py-1.5 text-[14px] font-medium transition ${value === o.v ? "bg-ink text-white" : "text-muted hover:text-ink"}`}
        >
          {o.l}
        </button>
      ))}
    </div>
  );
}

function Switch({ id, on, onChange, label, note }: { id: string; on: boolean; onChange: (on: boolean) => void; label: string; note: string }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center justify-between gap-4 rounded-tile bg-surface p-4">
      <span className="min-w-0">
        <span className={`block text-[15px] font-semibold transition ${on ? "text-ink" : "text-subtle line-through decoration-1"}`}>{label}</span>
        <span className="block text-caption text-muted">{note}</span>
      </span>
      <input id={id} type="checkbox" role="switch" checked={on} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span aria-hidden className={`relative h-6 w-10 shrink-0 rounded-full transition peer-focus-visible:ring-2 peer-focus-visible:ring-ink/30 ${on ? "bg-ink" : "bg-line"}`}>
        <span className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-4" : ""}`} />
      </span>
    </label>
  );
}

/* ───────── Stepper ───────── */

function Stepper({ current }: { current: number }) {
  const s = steps[current];
  return (
    <div>
      <div className="flex items-center justify-between text-caption">
        <span className="font-medium text-ink">
          Step {current + 1} of {steps.length} · {s.title}
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-panel">
        <motion.div className="h-full rounded-full bg-ink" animate={{ width: `${((current + 1) / steps.length) * 100}%` }} transition={{ duration: 0.5, ease }} />
      </div>
    </div>
  );
}

/* ───────── Review ───────── */

function ReviewBlock({ title, onEdit, children }: { title: string; onEdit: () => void; children: ReactNode }) {
  return (
    <div className="rounded-tile bg-surface p-5">
      <div className="flex items-center justify-between">
        <p className="text-[15px] font-semibold">{title}</p>
        <button type="button" onClick={onEdit} className="text-caption font-medium text-muted underline underline-offset-4 hover:text-ink">
          Edit
        </button>
      </div>
      <div className="mt-2 space-y-1 text-body text-muted">{children}</div>
    </div>
  );
}

const nice = (date: string, time?: string) =>
  date ? `${fmtDate(`${date}T12:00:00+05:30`, { weekday: "short", day: "numeric", month: "short", year: "numeric" })}${time ? `, ${fmtDate(`${date}T${time}:00+05:30`, { hour: "numeric", minute: "2-digit", hour12: true })}` : ""}` : "—";

/* ───────── Song picker ───────── */

function TrackRow({ track, selected, active, onPreview, onChoose }: { track: Track; selected: boolean; active: boolean; onPreview: (on: boolean) => void; onChoose: () => void }) {
  const player = useInviteMusic(track.id);
  // Only one preview at a time: stop when another row starts.
  useEffect(() => {
    if (!active && player.playing) player.pause();
  }, [active, player]);
  return (
    <div className={`flex items-center gap-3 rounded-tile p-3 pr-4 transition ${selected ? "bg-ink text-white" : "bg-surface"}`}>
      <button
        type="button"
        onClick={() => {
          if (player.playing) {
            player.pause();
            onPreview(false);
          } else {
            onPreview(true);
            player.play();
          }
        }}
        aria-label={player.playing ? `Stop ${track.name}` : `Play ${track.name}`}
        className={`grid size-10 shrink-0 place-items-center rounded-full ${selected ? "bg-white text-ink" : "bg-panel text-ink"}`}
      >
        {player.playing ? (
          <span className="flex h-3.5 items-end gap-[2px]">
            {[0, 1, 2].map((i) => (
              <motion.span key={i} className="w-[3px] rounded-full bg-current" animate={{ height: ["30%", "100%", "40%", "80%", "30%"] }} transition={{ duration: 1 + i * 0.2, repeat: Infinity }} />
            ))}
          </span>
        ) : (
          <svg viewBox="0 0 24 24" className="ml-0.5 size-4" fill="currentColor" aria-hidden>
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
      <button type="button" onClick={onChoose} className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left" aria-pressed={selected}>
        <span className="min-w-0">
          <span className="block text-[15px] font-semibold">{track.name}</span>
          <span className={`block truncate text-caption ${selected ? "text-white/70" : "text-muted"}`}>{track.mood}</span>
        </span>
        <span className={`grid size-5 shrink-0 place-items-center rounded-full border-2 ${selected ? "border-white bg-white" : "border-line"}`}>
          {selected && <span className="size-2 rounded-full bg-ink" />}
        </span>
      </button>
    </div>
  );
}

/* ───────── The form ───────── */

type Song = { path: string; name: string };
type Photo = { path: string };
type Draft = { v: 2; s: FormState; step: number; furthest: number; song: Song | null; photos?: Photo[] };

const MAX_PHOTOS = 8;
const photoUrl = (path: string) => `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photos/${path}`;

/** Shrinks a phone photo to at most 1600px on its long side, as a JPEG. Falls back to the original. */
async function shrink(file: File): Promise<Blob> {
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", 0.82));
    return blob ?? file;
  } catch {
    return file;
  }
}

export function OrderForm({ t }: { t: TemplateMeta }) {
  const demo = getInvite(t.demoSlug)!;
  const router = useRouter();
  const draftKey = `nim-draft-${t.id}`;

  const [s, setS] = useState<FormState>(() => initialState(demo));
  const [step, setStep] = useState(0);
  const [furthest, setFurthest] = useState(0);
  const [song, setSong] = useState<Song | null>(null);
  const [previewing, setPreviewing] = useState<string | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [photoBusy, setPhotoBusy] = useState(0);
  const [photoError, setPhotoError] = useState("");
  const [songState, setSongState] = useState<"idle" | "uploading" | "error">("idle");
  const [songError, setSongError] = useState("");
  const [touched, setTouched] = useState<Set<string>>(() => new Set());
  const [attempted, setAttempted] = useState<Set<StepId>>(() => new Set());
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  const [today, setToday] = useState("");
  const [opening, setOpening] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [pending, start] = useTransition();
  // A partner's code: filled in from their share link, or typed by the couple.
  const [refCode, setRefCode] = useState("");
  const [partner, setPartner] = useState<{ code: string; name: string } | null>(null);
  const [refState, setRefState] = useState<"idle" | "checking" | "unknown">("idle");
  const restored = useRef(false);
  const topRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  // Today's date in India, and any unsent draft from this browser.
  useEffect(() => {
    const t0 = window.setTimeout(() => {
      setToday(new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date()));
      try {
        const raw = window.localStorage.getItem(draftKey);
        const saved = raw ? JSON.parse(raw) : null;
        if (saved?.v === 2) {
          const d = saved as Draft;
          setS({ ...initialState(demo), ...d.s });
          setStep(Math.min(d.step, steps.length - 1));
          setFurthest(Math.min(d.furthest, steps.length - 1));
          setSong(d.song ?? null);
          setPhotos(d.photos ?? []);
        }
      } catch {}
      restored.current = true;
    }, 0);
    return () => window.clearTimeout(t0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey]);

  useEffect(() => {
    if (!restored.current) return;
    try {
      const d: Draft = { v: 2, s, step, furthest, song, photos };
      window.localStorage.setItem(draftKey, JSON.stringify(d));
    } catch {}
  }, [s, step, furthest, song, photos, draftKey]);

  // Bring the new step into view and announce it.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    headingRef.current?.focus({ preventScroll: true });
  }, [step]);

  const errors = useMemo(() => validate(s, today), [s, today]);
  const shown = (k: string) => (touched.has(k) || attempted.has(stepOf(k)) ? errors[k] : undefined);
  const touch = (k: string) => setTouched((p) => (p.has(k) ? p : new Set(p).add(k)));
  const stepHasErrors = (id: StepId) => Object.keys(errors).some((k) => stepOf(k) === id);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setS((p) => ({ ...p, [k]: v }));
  const setPerson = (who: "bride" | "groom", k: keyof Person, v: string) => setS((p) => ({ ...p, [who]: { ...p[who], [k]: v } }));
  const setEvent = (i: number, k: keyof EventRow, v: string) => setS((p) => ({ ...p, events: p.events.map((e, j) => (j === i ? { ...e, [k]: v } : e)) }));

  const preview = useMemo(() => toPreview(s, demo), [s, demo]);
  const current = steps[step];
  const [a, b] = s.lead === "groom" ? [s.groom, s.bride] : [s.bride, s.groom];
  const showing = (id: SectionId) => !s.hide.includes(id);
  const setShowing = (id: SectionId, on: boolean) => setS((p) => ({ ...p, hide: on ? p.hide.filter((x) => x !== id) : [...p.hide, id] }));
  const hidden = sections.filter((x) => !showing(x.id));

  function focusFirstError(id: StepId) {
    const first = Object.keys(errors).find((k) => stepOf(k) === id);
    if (!first) return;
    window.setTimeout(() => {
      const el = document.getElementById(idOf(first));
      el?.focus();
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  }

  const stepIndex = (id: StepId) => steps.findIndex((x) => x.id === id);

  function goTo(i: number) {
    if (i > furthest) return;
    setStep(i);
  }

  function next() {
    const id = current.id;
    if (stepHasErrors(id)) {
      setAttempted((p) => new Set(p).add(id));
      focusFirstError(id);
      return;
    }
    // Moving on from the date: fill the main ceremony with the wedding's date and time.
    if (id === "wedding") {
      setS((p) => ({
        ...p,
        events: p.events.map((e) => (mainCeremonies.includes(e.kind) && !e.date ? { ...e, date: p.weddingDate, time: e.time || p.weddingTime } : e)),
      }));
    }
    const n = Math.min(step + 1, steps.length - 1);
    setStep(n);
    setFurthest((f) => Math.max(f, n));
  }

  async function pickSong(file: File | undefined) {
    if (!file) return;
    setSongState("uploading");
    setSongError("");
    try {
      const res = await createSongUpload(file.name, file.type, file.size);
      if ("error" in res) throw new Error(res.error);
      const { error } = await browserSupabase().storage.from("songs").uploadToSignedUrl(res.path, res.token, file, { contentType: file.type });
      if (error) throw new Error("The upload didn't finish. Please try again.");
      setSong({ path: res.path, name: file.name });
      setSongState("idle");
    } catch (e) {
      setSongState("error");
      setSongError(e instanceof Error ? e.message : "The upload didn't finish. Please try again.");
    }
  }

  async function addPhotos(files: FileList | null) {
    if (!files?.length) return;
    setPhotoError("");
    const room = MAX_PHOTOS - photos.length;
    const list = Array.from(files).slice(0, room);
    if (files.length > room) setPhotoError(`You can add up to ${MAX_PHOTOS} photos. We added the first ${room}.`);
    setPhotoBusy((n) => n + list.length);
    await Promise.all(
      list.map(async (file) => {
        try {
          const blob = await shrink(file);
          const type = blob.type || file.type;
          const res = await createPhotoUpload(type, blob.size);
          if ("error" in res) throw new Error(res.error);
          const { error } = await browserSupabase().storage.from("photos").uploadToSignedUrl(res.path, res.token, blob, { contentType: type });
          if (error) throw new Error("A photo didn't finish uploading. Please try again.");
          setPhotos((p) => (p.length < MAX_PHOTOS ? [...p, { path: res.path }] : p));
        } catch (e) {
          setPhotoError(e instanceof Error ? e.message : "A photo didn't finish uploading. Please try again.");
        } finally {
          setPhotoBusy((n) => n - 1);
        }
      }),
    );
  }

  async function applyRef(input: string) {
    const code = cleanPartnerCode(input);
    setRefCode(code);
    if (!code) {
      setPartner(null);
      setRefState("idle");
      return;
    }
    if (partner?.code === code) return;
    setRefState("checking");
    const found = await checkPartnerCode(code).catch(() => null);
    setPartner(found);
    setRefState(found ? "idle" : "unknown");
  }

  // Arrived through a partner's link: apply their code straight away.
  useEffect(() => {
    const code = readRefCookie();
    if (!code) return;
    const t0 = window.setTimeout(() => applyRef(code), 0);
    return () => window.clearTimeout(t0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function submit() {
    const bad = steps.find((st) => stepHasErrors(st.id));
    if (bad) {
      setAttempted(new Set(steps.map((st) => st.id)));
      setStep(steps.indexOf(bad));
      focusFirstError(bad.id);
      return;
    }
    setServerErrors([]);
    start(async () => {
      const res = await createOrder({
        template: t.id,
        details: toDetails(s),
        songPath: song?.path ?? null,
        photoPaths: showing("gallery") ? photos.map((x) => x.path) : [],
        customer: { ...s.customer, phone: mobile10(s.customer.phone) },
        ...(refCode ? { partnerCode: refCode } : {}),
      });
      if ("errors" in res) {
        setServerErrors(res.errors);
        return;
      }
      try {
        window.localStorage.removeItem(draftKey);
      } catch {}
      router.push(`/order/${res.id}`);
    });
  }

  const songUrl = song ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/songs/${song.path}` : "";

  /* ───── Step bodies ───── */

  const couple = (
    <div className="space-y-6">
      {(["bride", "groom"] as const).map((who) => (
        <div key={who} className="rounded-tile bg-surface p-5">
          <p className="text-[15px] font-semibold">{who === "bride" ? "The bride" : "The groom"}</p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <Input
              k={`${who}.first`}
              label="First name"
              value={s[who].first}
              onChange={(v) => setPerson(who, "first", v)}
              onBlur={() => touch(`${who}.first`)}
              error={shown(`${who}.first`)}
              placeholder={who === "bride" ? "Meera" : "Aarav"}
              maxLength={LIMITS.name}
              autoComplete="given-name"
            />
            <Input
              k={`${who}.full`}
              label="Full name"
              hint="optional"
              value={s[who].full}
              onChange={(v) => setPerson(who, "full", v)}
              onBlur={() => touch(`${who}.full`)}
              placeholder={who === "bride" ? "Meera Shekhawat" : "Aarav Singh Rathore"}
              maxLength={LIMITS.fullName}
            />
          </div>
          <div className="mt-4">
            <Input
              k={`${who}.parents`}
              label="Parents"
              hint="optional"
              value={s[who].parents}
              onChange={(v) => setPerson(who, "parents", v)}
              onBlur={() => touch(`${who}.parents`)}
              placeholder={who === "bride" ? "Daughter of Mrs. Sunita & Mr. Rajendra Shekhawat" : "Son of Mrs. Kavita & Mr. Vikram Rathore"}
              maxLength={LIMITS.parents}
            />
          </div>
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-[14px] font-semibold">Name shown first on the invite</span>
        <Toggle
          label="Name shown first"
          value={s.lead}
          onChange={(v) => set("lead", v as "bride" | "groom")}
          options={[
            { v: "groom", l: s.groom.first || "Groom" },
            { v: "bride", l: s.bride.first || "Bride" },
          ]}
        />
      </div>
    </div>
  );

  const wedding = (
    <div className="grid gap-4 sm:grid-cols-2">
      <Input k="weddingDate" type="date" label="Wedding date" value={s.weddingDate} min={today || undefined} onChange={(v) => set("weddingDate", v)} onBlur={() => touch("weddingDate")} error={shown("weddingDate")} />
      <Input
        k="weddingTime"
        type="time"
        label="Ceremony time"
        help="The muhurat or main ceremony time."
        value={s.weddingTime}
        onChange={(v) => set("weddingTime", v)}
        onBlur={() => touch("weddingTime")}
        error={shown("weddingTime")}
      />
      <div className="sm:col-span-2">
        <Input k="city" label="City" value={s.city} onChange={(v) => set("city", v)} onBlur={() => touch("city")} error={shown("city")} placeholder="Udaipur, Rajasthan" maxLength={LIMITS.city} autoComplete="address-level2" />
      </div>
    </div>
  );

  const functions = (
    <div className="space-y-4">
      {s.events.map((e, i) => {
        const k = `events.${i}`;
        const prev = s.events[i - 1];
        const hasErr = Object.keys(errors).some((x) => x.startsWith(`${k}.`) && shown(x));
        return (
          <div key={i} className={`rounded-tile bg-surface p-5 ${hasErr ? "ring-1 ring-[#d64545]/40" : ""}`}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-[15px] font-semibold">
                {i + 1}. {e.name || "New function"}
              </p>
              {s.events.length > 1 && (
                <button type="button" onClick={() => set("events", s.events.filter((_, j) => j !== i))} className="text-caption text-subtle underline underline-offset-4 hover:text-ink">
                  Remove
                </button>
              )}
            </div>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <FieldShell k={`${k}.kind`} label="Type">
                <select id={idOf(`${k}.kind`)} value={e.kind} onChange={(ev) => setEvent(i, "kind", ev.target.value)} className={`${inputBase} ${inputTone()}`}>
                  {eventKinds.map((x) => (
                    <option key={x.kind} value={x.kind}>
                      {x.label}
                    </option>
                  ))}
                </select>
              </FieldShell>
              <Input k={`${k}.name`} label="Name on the card" value={e.name} onChange={(v) => setEvent(i, "name", v)} onBlur={() => touch(`${k}.name`)} error={shown(`${k}.name`)} placeholder="Haldi" maxLength={40} />
              <Input
                k={`${k}.date`}
                type="date"
                label="Date"
                value={e.date}
                min={today || undefined}
                max={s.weddingDate ? addDays(s.weddingDate, 10) : undefined}
                onChange={(v) => setEvent(i, "date", v)}
                onBlur={() => touch(`${k}.date`)}
                error={shown(`${k}.date`)}
              />
              <Input k={`${k}.time`} type="time" label="Time" value={e.time} onChange={(v) => setEvent(i, "time", v)} onBlur={() => touch(`${k}.time`)} error={shown(`${k}.time`)} />
              <Input
                k={`${k}.venue`}
                label="Venue"
                value={e.venue}
                onChange={(v) => setEvent(i, "venue", v)}
                onBlur={() => touch(`${k}.venue`)}
                error={shown(`${k}.venue`)}
                placeholder="The Courtyard, Jagmandir Palace"
                maxLength={LIMITS.venue}
              />
              <Input
                k={`${k}.address`}
                label="Address"
                hint="for Google Maps"
                value={e.address}
                onChange={(v) => setEvent(i, "address", v)}
                onBlur={() => touch(`${k}.address`)}
                placeholder="Lake Pichola, Udaipur 313001"
                maxLength={LIMITS.address}
              />
              <Input
                k={`${k}.mapUrl`}
                label="Google Maps link"
                hint="optional"
                help="In Google Maps, tap Share and copy the link. Guests' Directions button opens it."
                value={e.mapUrl ?? ""}
                onChange={(v) => setEvent(i, "mapUrl", v)}
                onBlur={() => touch(`${k}.mapUrl`)}
                error={shown(`${k}.mapUrl`)}
                placeholder="https://maps.app.goo.gl/…"
                maxLength={300}
              />
              <Input k={`${k}.dress`} label="Dress code" hint="optional" value={e.dress} onChange={(v) => setEvent(i, "dress", v)} onBlur={() => touch(`${k}.dress`)} placeholder="Shades of yellow" maxLength={80} />
              <Input k={`${k}.note`} label="Note" hint="optional" value={e.note} onChange={(v) => setEvent(i, "note", v)} onBlur={() => touch(`${k}.note`)} placeholder="Lunch to follow" maxLength={160} />
            </div>
            {prev && prev.venue && !e.venue && (
              <button
                type="button"
                onClick={() => setS((p) => ({ ...p, events: p.events.map((x, j) => (j === i ? { ...x, venue: prev.venue, address: prev.address, mapUrl: prev.mapUrl } : x)) }))}
                className="mt-3 text-caption font-medium text-muted underline underline-offset-4 hover:text-ink"
              >
                Same venue as {prev.name || `function ${i}`}
              </button>
            )}
          </div>
        );
      })}
      {s.events.length < 12 && (
        <button
          type="button"
          onClick={() => set("events", [...s.events, { ...blankEvent("reception", ""), date: s.weddingDate }])}
          className="w-full rounded-tile border-2 border-dashed border-line py-4 text-[15px] font-medium transition hover:border-faint"
        >
          + Add a function
        </button>
      )}
    </div>
  );

  const wording = (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input k="invocation" label="Opening line" value={s.invocation} onChange={(v) => set("invocation", v)} onBlur={() => touch("invocation")} maxLength={120} />
        <Input k="invocationMeaning" label="Its meaning" hint="shown small" value={s.invocationMeaning} onChange={(v) => set("invocationMeaning", v)} onBlur={() => touch("invocationMeaning")} maxLength={120} />
      </div>
      <Input k="hosts" label="Hosted by" hint="optional" value={s.hosts} onChange={(v) => set("hosts", v)} onBlur={() => touch("hosts")} placeholder={demo.hosts} maxLength={160} />
      <TextArea k="message" label="Invitation message" value={s.message} onChange={(v) => set("message", v)} onBlur={() => touch("message")} error={shown("message")} maxLength={LIMITS.message} />
      <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
        <Input k="closing" label="Closing line" value={s.closing} onChange={(v) => set("closing", v)} onBlur={() => touch("closing")} error={shown("closing")} maxLength={LIMITS.closing} counter />
        <Input k="hashtag" label="Hashtag" hint="optional" value={s.hashtag} onChange={(v) => set("hashtag", v)} onBlur={() => touch("hashtag")} placeholder="#AaravKiMeera" maxLength={40} />
      </div>
      <button
        type="button"
        onClick={() => setS((p) => ({ ...p, invocation: demo.invocation, invocationMeaning: demo.invocationMeaning, message: demo.message, closing: demo.closing }))}
        className="text-caption font-medium text-muted underline underline-offset-4 hover:text-ink"
      >
        Reset to the suggested wording
      </button>
    </div>
  );

  const designScript = String((themes[t.id].vars as Record<string, string>)["--inv-script"] ?? "serif");
  const sample = `${a.first || (s.lead === "groom" ? "Aarav" : "Meera")} & ${b.first || (s.lead === "groom" ? "Meera" : "Aarav")}`;
  const styleStep = (
    <div className="space-y-8">
      <div>
        <p className="text-[14px] font-semibold">Font style</p>
        <p className="mt-0.5 text-caption text-muted">Changes the lettering on every part of the invite. The colours and art stay the same.</p>
        <div role="radiogroup" aria-label="Font style" className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {[{ id: "", name: `${t.name} original`, note: "The design's own lettering", script: designScript }, ...fontStyles].map((f) => {
            const on = s.font === f.id;
            return (
              <button
                key={f.id || "design"}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => set("font", f.id)}
                className={`rounded-tile p-4 text-left transition ${on ? "bg-ink text-white" : "bg-surface hover:bg-panel-strong"}`}
              >
                <span className="block truncate text-[24px] leading-tight" style={{ fontFamily: f.script }}>
                  {sample}
                </span>
                <span className="mt-2 block text-[14px] font-semibold">{f.name}</span>
                <span className={`block text-caption ${on ? "text-white/70" : "text-muted"}`}>{f.note}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <p className="text-[14px] font-semibold">Sections</p>
        <p className="mt-0.5 text-caption text-muted">The cover, wording, functions and closing always show. Turn off anything else.</p>
        <div className="mt-3 grid gap-2">
          {sections.map((x) => (
            <Switch key={x.id} id={`section-${x.id}`} on={showing(x.id)} onChange={(on) => setShowing(x.id, on)} label={x.name} note={x.note} />
          ))}
        </div>
      </div>
    </div>
  );

  const photosStep = showing("gallery") ? (    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {photos.map((ph, i) => (
          <div key={ph.path} className="group relative aspect-[4/5] overflow-hidden rounded-tile bg-panel">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photoUrl(ph.path)} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => setPhotos((p) => p.filter((x) => x.path !== ph.path))}
              aria-label={`Remove photo ${i + 1}`}
              className="absolute top-1.5 right-1.5 grid size-7 place-items-center rounded-full bg-black/55 text-white"
            >
              ×
            </button>
            {i === 0 && <span className="absolute bottom-1.5 left-1.5 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold">First</span>}
          </div>
        ))}
        {Array.from({ length: photoBusy }, (_, i) => (
          <div key={`busy${i}`} className="grid aspect-[4/5] animate-pulse place-items-center rounded-tile bg-panel text-caption text-subtle">
            Uploading…
          </div>
        ))}
        {photos.length + photoBusy < MAX_PHOTOS && (
          <label className="grid aspect-[4/5] cursor-pointer place-items-center rounded-tile border-2 border-dashed border-line text-center transition hover:border-faint">
            <span>
              <span className="mx-auto grid size-10 place-items-center rounded-full bg-panel text-xl">+</span>
              <span className="mt-2 block text-caption font-medium">Add photos</span>
            </span>
            <input id="photos" type="file" accept="image/*" multiple className="sr-only" onChange={(e) => addPhotos(e.target.files)} />
          </label>
        )}
      </div>
      <p className="text-caption text-subtle">
        {photos.length}/{MAX_PHOTOS} added · Pre-wedding shoots, candid moments, childhood photos. Photos are resized for fast loading.
      </p>
      {photoError && <p className="text-[13px] text-[#b42318]">{photoError}</p>}
    </div>
  ) : (
    <div className="rounded-tile bg-surface p-5">
      <p className="text-[15px] font-semibold">Our moments is turned off</p>
      <p className="mt-0.5 text-body text-muted">Your invite won&rsquo;t have a photo section, so there&rsquo;s nothing to upload.</p>
      <button type="button" onClick={() => setShowing("gallery", true)} className="mt-3 text-caption font-medium text-muted underline underline-offset-4 hover:text-ink">
        Turn it back on
      </button>
    </div>
  );

  const music = (
    <div className="space-y-3">
      {[
        ["Popular songs", songs],
        ["Aavjoo instrumentals", instrumentals],
      ].map(([label, list]) => (
        <div key={label as string} className="space-y-2 pb-2">
          <p className="text-[14px] font-semibold">{label as string}</p>
          <div className="grid gap-2">
        {(list as Track[]).map((tr) => (
          <TrackRow
            key={tr.id}
            track={tr}
            selected={!song && s.music === tr.id}
            active={previewing === tr.id}
            onPreview={(on) => setPreviewing(on ? tr.id : null)}
            onChoose={() => {
              set("music", tr.id);
              setSong(null);
            }}
          />
        ))}
          </div>
        </div>
      ))}

      <p className="pt-2 text-[14px] font-semibold">Or upload your own</p>
      <label
        className={`flex cursor-pointer items-center justify-between gap-4 rounded-tile p-4 transition ${song ? "bg-ink text-white" : "bg-surface hover:bg-panel-strong"} ${songState === "uploading" ? "pointer-events-none opacity-60" : ""}`}
      >
        <div className="min-w-0">
          <p className="truncate text-[15px] font-medium">{song ? song.name : songState === "uploading" ? "Uploading…" : "Your own song"}</p>
          <p className={`text-caption ${song ? "text-white/70" : "text-subtle"}`}>MP3, M4A, AAC, WAV or OGG, up to 15 MB</p>
        </div>
        <span className={`shrink-0 rounded-full px-4 py-2 text-[14px] font-medium ${song ? "bg-white text-ink" : "bg-ink text-white"}`}>{song ? "Replace" : "Upload"}</span>
        <input id="song" type="file" accept="audio/*" className="sr-only" onChange={(e) => pickSong(e.target.files?.[0])} />
      </label>
      {song && (
        <div className="flex items-center gap-3">
          <audio controls src={songUrl} className="h-10 flex-1" />
          <button type="button" onClick={() => setSong(null)} className="text-caption text-subtle underline underline-offset-4">
            Use an Aavjoo track instead
          </button>
        </div>
      )}
      {songState === "error" && <p className="text-[13px] text-[#b42318]">{songError}</p>}
      <p className="text-caption text-subtle">Please only upload music you have the right to share.</p>
    </div>
  );

  const contact = (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          k="customer.name"
          label="Your name"
          value={s.customer.name}
          onChange={(v) => set("customer", { ...s.customer, name: v })}
          onBlur={() => touch("customer.name")}
          error={shown("customer.name")}
          placeholder="Full name"
          maxLength={80}
          autoComplete="name"
        />
        <Input
          k="customer.phone"
          type="tel"
          inputMode="tel"
          label="WhatsApp number"
          value={s.customer.phone}
          onChange={(v) => set("customer", { ...s.customer, phone: v })}
          onBlur={() => touch("customer.phone")}
          error={shown("customer.phone")}
          placeholder="98765 43210"
          maxLength={16}
          autoComplete="tel-national"
        />
      </div>
      <Input
        k="customer.email"
        type="email"
        inputMode="email"
        label="Email"
        hint="optional"
        value={s.customer.email}
        onChange={(v) => set("customer", { ...s.customer, email: v })}
        onBlur={() => touch("customer.email")}
        error={shown("customer.email")}
        maxLength={120}
        autoComplete="email"
      />
      <Input
        k="partnerCode"
        label="Partner code"
        hint="optional"
        value={refCode}
        onChange={(v) => {
          setRefCode(cleanPartnerCode(v));
          setRefState("idle");
          setPartner(null);
        }}
        onBlur={() => applyRef(refCode)}
        error={refState === "unknown" ? "We don't recognise this code. Check it, or clear it." : undefined}
        help={
          partner
            ? `✓ Code ${partner.code} applied · referred by ${partner.name}`
            : refState === "checking"
              ? "Checking the code…"
              : "Did a friend or creator send you here? Add their code so they get the credit."
        }
        placeholder="e.g. PRIYA"
        maxLength={20}
      />
      {showing("rsvp") && (
      <div className="rounded-tile bg-surface p-5">
        <p className="text-[15px] font-semibold">RSVPs</p>
        <p className="mt-0.5 text-body text-muted">Guests&rsquo; replies go straight to a WhatsApp number.</p>
        <label className="mt-4 flex items-center gap-3 text-[15px]">
          <input id="rsvpSame" type="checkbox" checked={s.rsvpSame} onChange={(e) => set("rsvpSame", e.target.checked)} className="size-4 accent-[#141414]" />
          Send RSVPs to my WhatsApp number
        </label>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {!s.rsvpSame && (
            <Input
              k="rsvpPhone"
              type="tel"
              inputMode="tel"
              label="RSVP number"
              value={s.rsvpPhone}
              onChange={(v) => set("rsvpPhone", v)}
              onBlur={() => touch("rsvpPhone")}
              error={shown("rsvpPhone")}
              placeholder="98765 43210"
              maxLength={16}
            />
          )}
          <Input
            k="rsvpBy"
            type="date"
            label="Reply by"
            hint="optional"
            value={s.rsvpBy}
            min={today || undefined}
            max={s.weddingDate || undefined}
            onChange={(v) => set("rsvpBy", v)}
            onBlur={() => touch("rsvpBy")}
            error={shown("rsvpBy")}
          />
        </div>
      </div>
      )}
    </div>
  );

  const review = (
    <div className="space-y-3">
      {serverErrors.length > 0 && (
        <div role="alert" className="rounded-tile bg-[#fdecec] p-5 text-[#8a1c1c]">
          <p className="text-[15px] font-semibold">We couldn&rsquo;t send your order</p>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-body">
            {serverErrors.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
      )}
      <ReviewBlock title="The couple" onEdit={() => goTo(stepIndex("couple"))}>
        <p className="text-ink">
          {a.full || a.first} &amp; {b.full || b.first}
        </p>
        {s.bride.parents && <p>{s.bride.parents}</p>}
        {s.groom.parents && <p>{s.groom.parents}</p>}
      </ReviewBlock>
      <ReviewBlock title="Date & place" onEdit={() => goTo(stepIndex("wedding"))}>
        <p className="text-ink">{nice(s.weddingDate, s.weddingTime)}</p>
        <p>{s.city}</p>
      </ReviewBlock>
      <ReviewBlock title={`Functions · ${s.events.length}`} onEdit={() => goTo(stepIndex("functions"))}>
        {s.events.map((e, i) => (
          <p key={i}>
            <span className="text-ink">{e.name}</span> · {nice(e.date, e.time)} · {e.venue}
          </p>
        ))}
      </ReviewBlock>
      <ReviewBlock title="Wording" onEdit={() => goTo(stepIndex("wording"))}>
        <p className="line-clamp-2">{s.message}</p>
      </ReviewBlock>
      <ReviewBlock title="Look & sections" onEdit={() => goTo(stepIndex("style"))}>
        <p>Fonts: {getFontStyle(s.font)?.name ?? `${t.name} original`}</p>
        <p>{hidden.length ? `Turned off: ${hidden.map((x) => x.name).join(", ")}` : "All sections on"}</p>
      </ReviewBlock>
      <ReviewBlock title={showing("gallery") ? `Our moments · ${photos.length}` : "Our moments"} onEdit={() => goTo(stepIndex(showing("gallery") ? "photos" : "style"))}>
        {!showing("gallery") ? (
          <p>Turned off</p>
        ) : photos.length ? (
          <div className="mt-1 flex gap-1.5">
            {photos.map((ph) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={ph.path} src={photoUrl(ph.path)} alt="" className="size-12 rounded-md object-cover" />
            ))}
          </div>
        ) : (
          <p>No photos</p>
        )}
      </ReviewBlock>
      <ReviewBlock title="Song" onEdit={() => goTo(stepIndex("music"))}>
        <p>{song ? `Your upload: ${song.name}` : (tracks.find((x) => x.id === s.music)?.name ?? "Aavjoo track")}</p>
      </ReviewBlock>
      <ReviewBlock title="Your contact" onEdit={() => goTo(stepIndex("contact"))}>
        <p className="text-ink">
          {s.customer.name} · +91 {mobile10(s.customer.phone)}
        </p>
        <p>{showing("rsvp") ? `RSVPs to +91 ${mobile10(s.rsvpSame ? s.customer.phone : s.rsvpPhone)}` : "No RSVP section"}</p>
        {refCode && <p>{partner ? `Partner code ${partner.code} · ${partner.name}` : `Partner code ${refCode}`}</p>}
      </ReviewBlock>
      <p className="pt-2 text-caption text-subtle">No payment now. After you submit, we&rsquo;ll message you on WhatsApp with the payment details.</p>
    </div>
  );

  const bodies: Record<StepId, ReactNode> = { couple, wedding, functions, wording, style: styleStep, photos: photosStep, music, contact, review };
  const isLast = step === steps.length - 1;

  const phone = (
    <PhoneFrame className="shadow-phone">
      <InvitePreview key={opening ? "open-anim" : "static"} invite={preview} stage={opening ? "closed" : "open"} loop={opening} />
    </PhoneFrame>
  );
  const previewToggle = (
    <div className="flex justify-center gap-1.5">
      {[
        [false, "Invite"],
        [true, "Opening"],
      ].map(([v, l]) => (
        <button
          key={String(v)}
          type="button"
          onClick={() => setOpening(v as boolean)}
          className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition ${opening === v ? "bg-ink text-white" : "bg-white/80 text-ink"}`}
        >
          {l as string}
        </button>
      ))}
    </div>
  );

  return (
    <div ref={topRef} className="grid scroll-mt-24 gap-10 lg:grid-cols-[1fr_360px]">
      <div className="min-w-0">
        <Stepper current={step} />

        <Panel className="mt-6 p-6 sm:p-8">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={current.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25, ease }}>
              <h3 ref={headingRef} tabIndex={-1} className="text-[24px] font-semibold tracking-[-0.02em] outline-none">
                {current.title}
                {"optional" in current && current.optional && <span className="ml-2 align-middle text-caption font-medium text-subtle">Optional</span>}
              </h3>
              <p className="mt-1 text-body text-muted">{current.note}</p>
              <form
                className="mt-6"
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  if (isLast) submit();
                  else next();
                }}
              >
                {bodies[current.id]}

                <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-6">
                  {step > 0 ? (
                    <Button type="button" variant="ghost" onClick={() => setStep(step - 1)}>
                      ← Back
                    </Button>
                  ) : (
                    <span />
                  )}
                  <div className="flex items-center gap-3">
                    {"optional" in current && current.optional && !isLast && (
                      <button type="button" onClick={next} className="text-body font-medium text-muted hover:text-ink">
                        Skip
                      </button>
                    )}
                    <Button type="submit" disabled={pending || songState === "uploading" || photoBusy > 0}>
                      {isLast ? (pending ? "Sending…" : "Submit order") : `Continue to ${steps[step + 1].title.toLowerCase()} →`}
                    </Button>
                  </div>
                </div>
              </form>
            </motion.div>
          </AnimatePresence>
        </Panel>
        <p className="mt-3 text-center text-caption text-subtle">Saved in this browser as you type, so you can come back later.</p>
      </div>

      {/* Desktop: live preview + total */}
      <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
        <div className="rounded-frame p-6" style={{ background: t.tint }}>
          <div className="mx-auto w-[230px]">{phone}</div>
          <div className="mt-4">{previewToggle}</div>
        </div>
        <Panel className="mt-4 p-6">
          <p className="text-caption font-medium text-subtle">{t.name} design · everything included</p>
          <PriceTag price={t.price} mrp={t.mrp} size="lg" className="mt-1" />
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#fff1e6] px-3 py-1 text-[13px] font-medium text-[#b4410f]">
            {offer.emoji} {offer.name} · {offer.endsAt ? <OfferCountdown /> : "introductory prices"}
          </p>
        </Panel>
      </aside>

      {/* Mobile: preview on demand */}
      <button
        type="button"
        onClick={() => setPreviewOpen(true)}
        className="fixed bottom-4 left-4 z-40 flex items-center gap-2 rounded-full bg-ink py-2.5 pr-4 pl-3 text-[15px] font-medium text-white shadow-lg lg:hidden"
      >
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
          <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
          <path d="M10.5 18.5h3" />
        </svg>
        Preview · {formatINR(t.price)}
      </button>
      <AnimatePresence>
        {previewOpen && (
          <motion.div
            className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-4 bg-black/70 p-6 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Invite preview"
          >
            <motion.div initial={{ y: 30 }} animate={{ y: 0 }} className="w-[min(70vw,280px)]" onClick={(e) => e.stopPropagation()}>
              {phone}
              <div className="mt-4">{previewToggle}</div>
            </motion.div>
            <button type="button" onClick={() => setPreviewOpen(false)} className="rounded-full bg-white px-5 py-2.5 text-[15px] font-medium text-ink">
              Back to the form
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
