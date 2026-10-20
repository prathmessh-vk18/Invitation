"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { addons as addonCatalogue } from "@/config/addons";
import { formatINR } from "@/config/site";
import { getInvite, type EventKind, type Invite } from "@/data/invites";
import type { TemplateMeta } from "@/data/templates";
import { InvitePreview } from "@/invites/InvitePreview";
import { eventKinds } from "@/lib/orders";
import { createOrder, createSongUpload } from "@/lib/order-actions";
import { browserSupabase } from "@/lib/supabase-browser";
import { Button, Panel, PhoneFrame } from "@/ui";

/* ───────── Form state ───────── */

type Person = { first: string; full: string; parents: string };
type EventRow = { kind: EventKind; name: string; date: string; time: string; venue: string; address: string; dress: string; note: string };
type FormState = {
  lead: "bride" | "groom";
  bride: Person;
  groom: Person;
  weddingDate: string;
  weddingTime: string;
  city: string;
  invocation: string;
  invocationMeaning: string;
  hosts: string;
  message: string;
  closing: string;
  hashtag: string;
  events: EventRow[];
  rsvpPhone: string;
  rsvpBy: string;
  customer: { name: string; phone: string; email: string };
};

const emptyPerson: Person = { first: "", full: "", parents: "" };
const blankEvent = (kind: EventKind = "phere", name = ""): EventRow => ({ kind, name, date: "", time: "", venue: "", address: "", dress: "", note: "" });

/** Starts from the design's demo so the wording fits its tradition; personal details are left empty. */
function initialState(demo: Invite): FormState {
  return {
    lead: demo.lead,
    bride: emptyPerson,
    groom: emptyPerson,
    weddingDate: "",
    weddingTime: "",
    city: "",
    invocation: demo.invocation,
    invocationMeaning: demo.invocationMeaning,
    hosts: "",
    message: demo.message,
    closing: demo.closing,
    hashtag: "",
    events: demo.events.map((e) => blankEvent(e.kind, e.name)),
    rsvpPhone: "",
    rsvpBy: "",
    customer: { name: "", phone: "", email: "" },
  };
}

const iso = (date: string, time: string) => (date ? `${date}T${time || "12:00"}:00+05:30` : "");

/** The invite exactly as it will be published (used for submission). */
function toDetails(s: FormState) {
  return {
    bride: s.bride,
    groom: s.groom,
    lead: s.lead,
    invocation: s.invocation,
    invocationMeaning: s.invocationMeaning,
    hosts: s.hosts,
    message: s.message,
    date: iso(s.weddingDate, s.weddingTime),
    city: s.city,
    hashtag: s.hashtag,
    events: s.events.map((e) => ({ kind: e.kind, name: e.name, start: iso(e.date, e.time), venue: e.venue, address: e.address, dress: e.dress, note: e.note })),
    rsvp: { phone: s.rsvpPhone, by: s.rsvpBy ? iso(s.rsvpBy, "00:00") : "", contact: s.hosts },
    closing: s.closing,
  };
}

/** The same invite with friendly stand-ins for anything not filled yet, for the live preview. */
function toPreview(s: FormState, demo: Invite): Invite {
  const person = (p: Person, fallback: string) => ({ first: p.first || fallback, full: p.full || p.first || fallback, parents: p.parents });
  const date = iso(s.weddingDate, s.weddingTime) || demo.date;
  return {
    ...demo,
    bride: person(s.bride, "Bride"),
    groom: person(s.groom, "Groom"),
    lead: s.lead,
    invocation: s.invocation || demo.invocation,
    invocationMeaning: s.invocationMeaning,
    hosts: s.hosts || "Together with their families",
    message: s.message,
    date,
    city: s.city || "Your city",
    hashtag: s.hashtag || undefined,
    closing: s.closing,
    events: s.events.map((e) => ({
      kind: e.kind,
      name: e.name || "Function",
      start: iso(e.date, e.time) || date,
      venue: e.venue || "Venue",
      address: e.address,
      dress: e.dress || undefined,
      note: e.note || undefined,
    })),
  };
}

/* ───────── Small inputs ───────── */

const inputClass = "mt-1.5 w-full rounded-field border border-line bg-surface px-3.5 py-2.5 text-[15px] text-ink outline-none transition placeholder:text-faint focus:border-ink";

function Field({ label, hint, children, className }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="text-[14px] font-semibold text-ink">
        {label}
        {hint && <span className="font-normal text-subtle"> · {hint}</span>}
      </span>
      {children}
    </label>
  );
}

function Section({ n, title, note, children }: { n: number; title: string; note?: string; children: React.ReactNode }) {
  return (
    <Panel className="p-6 sm:p-8">
      <div className="flex items-baseline gap-3">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-ink text-[13px] font-semibold text-white">{n}</span>
        <div>
          <p className="text-title">{title}</p>
          {note && <p className="mt-0.5 text-body text-muted">{note}</p>}
        </div>
      </div>
      <div className="mt-6 space-y-4">{children}</div>
    </Panel>
  );
}

/* ───────── The form ───────── */

export function OrderForm({ t }: { t: TemplateMeta }) {
  const demo = getInvite(t.demoSlug)!;
  const router = useRouter();
  const params = useSearchParams();
  const draftKey = `nim-draft-${t.id}`;

  const [s, setS] = useState<FormState>(() => initialState(demo));
  const [picked, setPicked] = useState<string[]>(() => (params.get("addons") ?? "").split(",").filter((id) => addonCatalogue.some((a) => a.id === id)));
  const [song, setSong] = useState<{ path: string; name: string; url: string } | null>(null);
  const [songState, setSongState] = useState<"idle" | "uploading" | "error">("idle");
  const [songError, setSongError] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [opening, setOpening] = useState(false);
  const [pending, start] = useTransition();
  const restored = useRef(false);

  // Bring back an unsent draft from this browser, then keep saving as they type.
  useEffect(() => {
    const t0 = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(draftKey);
        if (saved) setS({ ...initialState(demo), ...JSON.parse(saved) });
      } catch {}
      restored.current = true;
    }, 0);
    return () => window.clearTimeout(t0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey]);
  useEffect(() => {
    if (!restored.current) return;
    try {
      window.localStorage.setItem(draftKey, JSON.stringify(s));
    } catch {}
  }, [s, draftKey]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setS((p) => ({ ...p, [k]: v }));
  const setPerson = (who: "bride" | "groom", k: keyof Person, v: string) => setS((p) => ({ ...p, [who]: { ...p[who], [k]: v } }));
  const setEvent = (i: number, k: keyof EventRow, v: string) => setS((p) => ({ ...p, events: p.events.map((e, j) => (j === i ? { ...e, [k]: v } : e)) }));

  const preview = useMemo(() => toPreview(s, demo), [s, demo]);
  const total = t.price + addonCatalogue.filter((a) => picked.includes(a.id)).reduce((sum, a) => sum + a.price, 0);

  async function pickSong(file: File | undefined) {
    if (!file) return;
    setSongState("uploading");
    setSongError("");
    try {
      const res = await createSongUpload(file.name, file.type, file.size);
      if ("error" in res) throw new Error(res.error);
      const { error } = await browserSupabase().storage.from("songs").uploadToSignedUrl(res.path, res.token, file, { contentType: file.type });
      if (error) throw new Error("The upload didn't finish. Please try again.");
      setSong({ path: res.path, name: file.name, url: URL.createObjectURL(file) });
      setSongState("idle");
    } catch (e) {
      setSongState("error");
      setSongError(e instanceof Error ? e.message : "The upload didn't finish. Please try again.");
    }
  }

  function submit() {
    setErrors([]);
    start(async () => {
      const res = await createOrder({ template: t.id, addons: picked, details: toDetails(s), songPath: song?.path ?? null, customer: s.customer });
      if ("errors" in res) {
        setErrors(res.errors);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      try {
        window.localStorage.removeItem(draftKey);
      } catch {}
      router.push(`/order/${res.id}`);
    });
  }

  const people = (["bride", "groom"] as const).map((who) => (
    <div key={who} className="space-y-3">
      <p className="text-caption font-medium text-subtle uppercase">{who === "bride" ? "Bride" : "Groom"}</p>
      <Field label="First name">
        <input id={`${who}-first`} className={inputClass} value={s[who].first} onChange={(e) => setPerson(who, "first", e.target.value)} placeholder={who === "bride" ? "Meera" : "Aarav"} />
      </Field>
      <Field label="Full name" hint="optional">
        <input id={`${who}-full`} className={inputClass} value={s[who].full} onChange={(e) => setPerson(who, "full", e.target.value)} placeholder={who === "bride" ? "Meera Shekhawat" : "Aarav Singh Rathore"} />
      </Field>
      <Field label="Parents" hint="optional">
        <input
          id={`${who}-parents`}
          className={inputClass}
          value={s[who].parents}
          onChange={(e) => setPerson(who, "parents", e.target.value)}
          placeholder={who === "bride" ? "Daughter of Mrs. Sunita & Mr. Rajendra Shekhawat" : "Son of Mrs. Kavita & Mr. Vikram Rathore"}
        />
      </Field>
    </div>
  ));

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
      <div className="min-w-0 space-y-4">
        {errors.length > 0 && (
          <div role="alert" className="rounded-card bg-[#fdecec] p-6 text-[#8a1c1c]">
            <p className="text-title text-current">A few things to fix</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-body">
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        <Section n={1} title="Your WhatsApp number" note="We'll message you here with payment details and your invite link.">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Your name">
              <input id="customer-name" className={inputClass} value={s.customer.name} onChange={(e) => set("customer", { ...s.customer, name: e.target.value })} placeholder="Full name" />
            </Field>
            <Field label="WhatsApp number">
              <input
                id="customer-phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                className={inputClass}
                value={s.customer.phone}
                onChange={(e) => set("customer", { ...s.customer, phone: e.target.value })}
                placeholder="98765 43210"
              />
            </Field>
            <Field label="Email" hint="optional">
              <input id="customer-email" type="email" className={inputClass} value={s.customer.email} onChange={(e) => set("customer", { ...s.customer, email: e.target.value })} />
            </Field>
          </div>
        </Section>

        <Section n={2} title="The couple">
          <div className="grid gap-6 sm:grid-cols-2">{people}</div>
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-[14px] font-semibold">Name shown first</span>
            {(["groom", "bride"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => set("lead", v)}
                aria-pressed={s.lead === v}
                className={`rounded-full px-4 py-1.5 text-[14px] font-medium transition ${s.lead === v ? "bg-ink text-white" : "bg-surface"}`}
              >
                {v === "groom" ? "Groom" : "Bride"}
              </button>
            ))}
          </div>
        </Section>

        <Section n={3} title="The wedding" note="The countdown runs to this time.">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Date">
              <input id="wedding-date" type="date" className={inputClass} value={s.weddingDate} onChange={(e) => set("weddingDate", e.target.value)} />
            </Field>
            <Field label="Time">
              <input id="wedding-time" type="time" className={inputClass} value={s.weddingTime} onChange={(e) => set("weddingTime", e.target.value)} />
            </Field>
            <Field label="City">
              <input id="wedding-city" className={inputClass} value={s.city} onChange={(e) => set("city", e.target.value)} placeholder="Udaipur, Rajasthan" />
            </Field>
          </div>
        </Section>

        <Section n={4} title="The wording" note="We've started you with lines that suit this design. Change anything.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Opening line">
              <input id="invocation" className={inputClass} value={s.invocation} onChange={(e) => set("invocation", e.target.value)} />
            </Field>
            <Field label="Its meaning" hint="shown small">
              <input id="invocation-meaning" className={inputClass} value={s.invocationMeaning} onChange={(e) => set("invocationMeaning", e.target.value)} />
            </Field>
          </div>
          <Field label="Hosted by">
            <input id="hosts" className={inputClass} value={s.hosts} onChange={(e) => set("hosts", e.target.value)} placeholder={demo.hosts} />
          </Field>
          <Field label="Invitation message">
            <textarea id="message" rows={3} className={`${inputClass} resize-none`} value={s.message} onChange={(e) => set("message", e.target.value)} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
            <Field label="Closing line">
              <input id="closing" className={inputClass} value={s.closing} onChange={(e) => set("closing", e.target.value)} />
            </Field>
            <Field label="Hashtag" hint="optional">
              <input id="hashtag" className={inputClass} value={s.hashtag} onChange={(e) => set("hashtag", e.target.value)} placeholder="#AaravKiMeera" />
            </Field>
          </div>
        </Section>

        <Section n={5} title="The functions" note="Each one gets its own card with directions and a save-the-date button.">
          {s.events.map((e, i) => (
            <div key={i} className="rounded-tile bg-surface p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[14px] font-semibold">Function {i + 1}</p>
                {s.events.length > 1 && (
                  <button type="button" onClick={() => set("events", s.events.filter((_, j) => j !== i))} className="text-caption text-subtle underline underline-offset-4 hover:text-ink">
                    Remove
                  </button>
                )}
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Field label="Type">
                  <select id={`event-${i}-kind`} className={inputClass} value={e.kind} onChange={(ev) => setEvent(i, "kind", ev.target.value)}>
                    {eventKinds.map((k) => (
                      <option key={k.kind} value={k.kind}>
                        {k.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Name on the card">
                  <input id={`event-${i}-name`} className={inputClass} value={e.name} onChange={(ev) => setEvent(i, "name", ev.target.value)} placeholder="Haldi" />
                </Field>
                <Field label="Date">
                  <input id={`event-${i}-date`} type="date" className={inputClass} value={e.date} onChange={(ev) => setEvent(i, "date", ev.target.value)} />
                </Field>
                <Field label="Time">
                  <input id={`event-${i}-time`} type="time" className={inputClass} value={e.time} onChange={(ev) => setEvent(i, "time", ev.target.value)} />
                </Field>
                <Field label="Venue">
                  <input id={`event-${i}-venue`} className={inputClass} value={e.venue} onChange={(ev) => setEvent(i, "venue", ev.target.value)} placeholder="The Courtyard, Jagmandir Palace" />
                </Field>
                <Field label="Address" hint="for Google Maps">
                  <input id={`event-${i}-address`} className={inputClass} value={e.address} onChange={(ev) => setEvent(i, "address", ev.target.value)} placeholder="Lake Pichola, Udaipur 313001" />
                </Field>
                <Field label="Dress code" hint="optional">
                  <input id={`event-${i}-dress`} className={inputClass} value={e.dress} onChange={(ev) => setEvent(i, "dress", ev.target.value)} placeholder="Shades of yellow" />
                </Field>
                <Field label="Note" hint="optional">
                  <input id={`event-${i}-note`} className={inputClass} value={e.note} onChange={(ev) => setEvent(i, "note", ev.target.value)} placeholder="Lunch to follow" />
                </Field>
              </div>
            </div>
          ))}
          {s.events.length < 12 && (
            <button type="button" onClick={() => set("events", [...s.events, blankEvent()])} className="w-full rounded-tile border-2 border-dashed border-line py-4 text-[15px] font-medium transition hover:border-faint">
              + Add a function
            </button>
          )}
        </Section>

        <Section n={6} title="RSVPs" note="Guests' replies go straight to this WhatsApp number.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="WhatsApp number for RSVPs">
              <input id="rsvp-phone" inputMode="tel" className={inputClass} value={s.rsvpPhone} onChange={(e) => set("rsvpPhone", e.target.value)} placeholder="98765 43210" />
            </Field>
            <Field label="Reply by" hint="optional">
              <input id="rsvp-by" type="date" className={inputClass} value={s.rsvpBy} onChange={(e) => set("rsvpBy", e.target.value)} />
            </Field>
          </div>
        </Section>

        <Section n={7} title="Your song" note="It plays when guests open the invite. Skip this and the design plays its own soft music.">
          <label className={`flex cursor-pointer items-center justify-between gap-4 rounded-tile bg-surface p-5 transition hover:bg-panel-strong ${songState === "uploading" ? "pointer-events-none opacity-60" : ""}`}>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-medium">{song ? song.name : songState === "uploading" ? "Uploading…" : "Choose an audio file"}</p>
              <p className="text-caption text-subtle">MP3, M4A, AAC, WAV or OGG, up to 15 MB</p>
            </div>
            <span className="shrink-0 rounded-full bg-ink px-4 py-2 text-[14px] font-medium text-white">{song ? "Replace" : "Upload"}</span>
            <input id="song" type="file" accept="audio/*" className="sr-only" onChange={(e) => pickSong(e.target.files?.[0])} />
          </label>
          {song && (
            <div className="flex items-center gap-3">
              <audio controls src={song.url} className="h-10 flex-1" />
              <button type="button" onClick={() => setSong(null)} className="text-caption text-subtle underline underline-offset-4">
                Remove
              </button>
            </div>
          )}
          {songState === "error" && <p className="text-body text-[#8a1c1c]">{songError}</p>}
          <p className="text-caption text-subtle">Please only upload music you have the right to share.</p>
        </Section>

        <Section n={8} title="Add-ons" note="Optional extras.">
          <div className="grid gap-2 sm:grid-cols-2">
            {addonCatalogue.map((a) => {
              const on = picked.includes(a.id);
              return (
                <button
                  key={a.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setPicked((p) => (on ? p.filter((x) => x !== a.id) : [...p, a.id]))}
                  className={`flex items-start justify-between gap-3 rounded-tile p-4 text-left transition ${on ? "bg-ink text-white" : "bg-surface hover:bg-panel-strong"}`}
                >
                  <span>
                    <span className="block text-[15px] font-semibold">{a.name}</span>
                    <span className={`mt-0.5 block text-caption ${on ? "text-white/70" : "text-muted"}`}>{a.body}</span>
                  </span>
                  <span className="shrink-0 text-[15px] font-semibold">{formatINR(a.price)}</span>
                </button>
              );
            })}
          </div>
        </Section>

      </div>

      {/* Preview + total */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-frame p-6" style={{ background: t.tint }}>
          <div className="mx-auto w-[240px]">
            <PhoneFrame className="shadow-phone">
              <InvitePreview key={opening ? "open-anim" : "static"} invite={preview} stage={opening ? "closed" : "open"} loop={opening} />
            </PhoneFrame>
          </div>
          <div className="mt-4 flex justify-center gap-1.5">
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
        </div>
        <Panel className="mt-4 p-6">
          <div className="space-y-2 text-body">
            <p className="flex justify-between">
              <span>{t.name} design</span>
              <span>{formatINR(t.price)}</span>
            </p>
            {addonCatalogue
              .filter((a) => picked.includes(a.id))
              .map((a) => (
                <p key={a.id} className="flex justify-between text-muted">
                  <span className="truncate pr-3">{a.name}</span>
                  <span>{formatINR(a.price)}</span>
                </p>
              ))}
          </div>
          <p className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
            <span className="text-title">Total</span>
            <span className="text-[28px] font-semibold tracking-[-0.03em]">{formatINR(total)}</span>
          </p>
          <Button onClick={submit} disabled={pending || songState === "uploading"} className="mt-5 w-full">
            {pending ? "Sending…" : "Submit order"}
          </Button>
          <p className="mt-3 text-center text-caption text-subtle">No payment now. We&rsquo;ll send payment details on WhatsApp. Your details are saved in this browser as you type.</p>
        </Panel>
      </aside>
    </div>
  );
}
