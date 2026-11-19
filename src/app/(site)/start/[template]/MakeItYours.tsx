"use client";

import { AnimatePresence, motion } from "framer-motion";
import { unstable_isUnrecognizedActionError, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { WhatsAppMessage } from "@/site/whatsapp-message";
import { track } from "@vercel/analytics";
import { fontStyles, sectionsFor, type SectionId } from "@/config/customise";
import { instrumentals, songs, type Track } from "@/config/music";
import { cleanPartnerCode, readRefCookie } from "@/config/partners";
import { formatINR, site } from "@/config/site";
import { getInvite, type EventKind } from "@/data/invites";
import type { TemplateMeta } from "@/data/templates";
import { FullInvitePreview } from "@/invites/FullInvitePreview";
import { InvitePreview } from "@/invites/InvitePreview";
import { useInviteMusic } from "@/invites/music";
import { themes } from "@/invites/registry";
import { SectionPreview, type PreviewPart } from "@/invites/SectionPreview";
import { mediaUrl } from "@/lib/media";
import { checkPartnerCode, createOrder, createPhotoUpload, createSongUpload, previewLink } from "@/lib/order-actions";
import { eventKinds, kindName } from "@/lib/orders";
import { shrink, uploadTo } from "@/lib/upload-client";
import { PriceTag } from "@/site/offer";
import { PhoneFrame } from "@/ui";
import { addDays, blankEvent, coverDefaults, initialState, LIMITS, mainCeremonies, supports, toDetails, toPreview, validate, waNumber, type EventRow, type FormState } from "./form-model";

/**
 * "Make it yours": a new order, one part of the invite per screen (as guests meet them: cover,
 * families, functions, ending), then its look, photos and song, and the couple's details. Each
 * screen shows what most couples fill; everything else opens on a tap. A bar at the bottom keeps
 * Back, Preview and Next under the thumb.
 */
const PARTS = [
  { id: "cover", title: "The cover", note: "The first screen your guests see.", secs: 40 },
  { id: "families", title: "Families", note: "Who's inviting, in your own words.", secs: 35 },
  { id: "functions", title: "Functions", note: "Each one gets its own card, with directions.", secs: 60 },
  { id: "ending", title: "The ending", note: "The last words your guests read.", secs: 15 },
  { id: "look", title: "The look", note: "Lettering, size and which parts show.", secs: 15 },
  { id: "media", title: "Photos & song", note: "Optional. You can add them later too.", secs: 25 },
  { id: "details", title: "Your details", note: "Where we send your invite link.", secs: 30 },
] as const;
type PartId = (typeof PARTS)[number]["id"];

/** Which screen a field's error belongs to. */
function partOf(key: string): PartId {
  if (key.startsWith("events")) return "functions";
  if (key === "message" || key.endsWith(".parents") || key.endsWith(".elders") || key === "hosts") return "families";
  if (key === "closing" || key === "hashtag") return "ending";
  if (key.startsWith("customer") || key.startsWith("rsvp")) return "details";
  return "cover";
}

const MAX_PHOTOS = 8;
type Draft = { v: 1; s: FormState; step: number; song: { path: string; name: string } | null; photos: string[] };

export function MakeItYours({ t }: { t: TemplateMeta }) {
  const demo = getInvite(t.demoSlug)!;
  const router = useRouter();
  const draftKey = `nim-make-${t.id}`;
  const occasion = t.occasion ?? "wedding";

  const [s, setS] = useState<FormState>(() => initialState(demo));
  const [step, setStep] = useState(0);
  const [song, setSong] = useState<{ path: string; name: string } | null>(null);
  // A design made for one couple (prefill) starts with its demo's photos, as the old form did.
  const [photos, setPhotos] = useState<string[]>(() =>
    t.prefill ? (demo.gallery ?? []).map((u) => u.match(/\/photos\/(moments\/[0-9a-f-]{36}\.(?:jpg|png|webp))$/)?.[1]).filter((x): x is string => Boolean(x)) : [],
  );
  const [opened, setOpened] = useState<Set<string>>(() => new Set());
  const [openEvent, setOpenEvent] = useState(0);
  const [attempted, setAttempted] = useState<Set<PartId>>(() => new Set());
  const [today, setToday] = useState("");
  const [busy, setBusy] = useState(0);
  const [notice, setNotice] = useState("");
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [pdfAddon, setPdfAddon] = useState(false);
  const [brandAddon, setBrandAddon] = useState(false);
  const [refCode, setRefCode] = useState("");
  const [partner, setPartner] = useState<{ code: string; name: string } | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const closePreview = useCallback(() => setPreviewOpen(false), []);
  const [songPct, setSongPct] = useState<number | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);
  const restored = useRef(false);
  const top = useRef<HTMLDivElement>(null);
  const stepStart = useRef(0);
  const formStart = useRef(0);

  // Today in India, and a draft from this browser.
  useEffect(() => {
    const t0 = window.setTimeout(() => {
      setToday(new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date()));
      stepStart.current = formStart.current = Date.now();
      try {
        const d = JSON.parse(window.localStorage.getItem(draftKey) ?? "null") as Draft | null;
        if (d?.v === 1) {
          setS({ ...initialState(demo), ...d.s });
          setStep(Math.min(d.step, PARTS.length - 1));
          setSong(d.song);
          if (d.photos?.length || !t.prefill) setPhotos(d.photos ?? []);
        }
      } catch {}
      const code = cleanPartnerCode(readRefCookie());
      if (code) {
        setRefCode(code);
        checkPartnerCode(code)
          .then(setPartner)
          .catch(() => {});
      }
      restored.current = true;
    }, 0);
    return () => window.clearTimeout(t0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey]);

  useEffect(() => {
    if (!restored.current) return;
    try {
      window.localStorage.setItem(draftKey, JSON.stringify({ v: 1, s, step, song, photos } satisfies Draft));
    } catch {}
  }, [s, step, song, photos, draftKey]);

  // Their link, once both names are in.
  useEffect(() => {
    if (!s.bride.first.trim() || !s.groom.first.trim()) return;
    const timer = window.setTimeout(async () => {
      const slug = await previewLink({ bride: s.bride.first, groom: s.groom.first, lead: s.lead, date: s.weddingDate, city: s.city }).catch(() => null);
      setLink(slug);
    }, 600);
    return () => window.clearTimeout(timer);
  }, [s.bride.first, s.groom.first, s.lead, s.weddingDate, s.city]);

  const errors = useMemo(() => validate(s, today, occasion, true), [s, today, occasion]);
  const part = PARTS[step];
  const err = (k: string) => (attempted.has(partOf(k)) ? errors[k] : undefined);
  const partErrors = (id: PartId) => Object.keys(errors).filter((k) => partOf(k) === id);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setS((p) => ({ ...p, [k]: v }));
  const setEvent = (i: number, patch: Partial<EventRow>) => setS((p) => ({ ...p, events: p.events.map((e, j) => (j === i ? { ...e, ...patch } : e)) }));
  const open = (k: string) => setOpened((p) => new Set(p).add(k));
  const coverDefault = coverDefaults(t.id, occasion);
  const isOpen = (k: string, v?: unknown) => opened.has(k) || (typeof v === "string" ? v.trim() !== "" : !!v);
  const showing = (id: SectionId) => !s.hide.includes(id);
  const [a, b] = s.lead === "groom" ? [s.groom, s.bride] : [s.bride, s.groom];

  const preview = useMemo(() => toPreview(s, demo), [s, demo]);
  const live = useMemo(
    () => ({
      ...preview,
      music: song ? mediaUrl("songs", song.path) : s.music || preview.music,
      ...(photos.length ? { gallery: photos.map((p) => mediaUrl("photos", p)) } : {}),
    }),
    [preview, song, s.music, photos],
  );

  const go = (n: number) => {
    setStep(n);
    window.setTimeout(() => top.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 30);
  };
  const next = () => {
    const bad = partErrors(part.id);
    if (bad.length) {
      setAttempted((p) => new Set(p).add(part.id));
      if (part.id === "functions") setOpenEvent(Number(bad[0].split(".")[1]) || 0);
      window.setTimeout(() => document.querySelector<HTMLElement>("[data-error]")?.scrollIntoView({ behavior: "smooth", block: "center" }), 60);
      return;
    }
    // Leaving the cover: the main ceremony takes the wedding's date and time.
    if (part.id === "cover")
      setS((p) => ({ ...p, events: p.events.map((e) => (mainCeremonies.includes(e.kind) && !e.date ? { ...e, date: p.weddingDate, time: e.time || p.weddingTime } : e)) }));
    track("order_step", { design: t.id, step: part.id, seconds: secondsSince(stepStart.current) });
    stepStart.current = clock();
    if (step < PARTS.length - 1) go(step + 1);
    else submit();
  };

  async function submit() {
    const bad = PARTS.find((x) => partErrors(x.id).length);
    if (bad) {
      setAttempted(new Set(PARTS.map((x) => x.id)));
      go(PARTS.indexOf(bad));
      return;
    }
    setSending(true);
    setServerErrors([]);
    try {
      const res = await createOrder({
        template: t.id,
        details: toDetails(s, t.id),
        songPath: song?.path ?? null,
        photoPaths: showing("gallery") ? photos : [],
        customer: { ...s.customer, phone: `+${waNumber(s.customer.phone)}` },
        ...(refCode && partner ? { partnerCode: refCode } : {}),
        ...(pdfAddon || brandAddon ? { addons: [...(pdfAddon ? ["pdf"] : []), ...(brandAddon ? ["nobrand"] : [])] } : {}),
      });
      if ("errors" in res) {
        setServerErrors(res.errors);
        setSending(false);
        return;
      }
      try {
        window.localStorage.removeItem(draftKey);
      } catch {}
      track("order_done", { design: t.id, seconds: secondsSince(formStart.current) });
      router.push(`/order/${res.id}?pay=1`);
    } catch (e) {
      setServerErrors([unstable_isUnrecognizedActionError(e) ? "Aavjoo was just updated. Please refresh this page and send again: your details are saved." : "We couldn't send your order. Check your internet and try again."]);
      setSending(false);
    }
  }

  const left = PARTS.slice(step).reduce((n, x) => n + x.secs, 0);
  const total = t.price + (pdfAddon ? site.pdfAddon.price : 0) + (brandAddon ? site.brandingAddon.price : 0);
  const previewPart: PreviewPart | null =
    part.id === "functions" ? "events" : part.id === "families" || part.id === "ending" ? "wording" : part.id === "media" && showing("gallery") ? "gallery" : part.id === "details" && showing("rsvp") ? "rsvp" : null;

  /* ───────── Screens ───────── */

  const cover = (
    <>
      <Card title="Names">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Text k="bride.first" label={occasion === "engagement" ? "Bride-to-be" : "Bride"} value={s.bride.first} onChange={(v) => setS((p) => ({ ...p, bride: { ...p.bride, first: v } }))} placeholder="Meera" error={err("bride.first")} max={LIMITS.name} />
          <Text k="groom.first" label={occasion === "engagement" ? "Groom-to-be" : "Groom"} value={s.groom.first} onChange={(v) => setS((p) => ({ ...p, groom: { ...p.groom, first: v } }))} placeholder="Aarav" error={err("groom.first")} max={LIMITS.name} />
        </div>
        <Choice
          label="Whose name comes first"
          value={s.lead}
          onChange={(v) => set("lead", v as "bride" | "groom")}
          options={[
            { v: "groom", l: s.groom.first || "Groom" },
            { v: "bride", l: s.bride.first || "Bride" },
          ]}
        />
      </Card>
      <AnimatePresence>
        {link && s.bride.first.trim() && s.groom.first.trim() && (
          <ShareMessage slug={link} template={t.id} names={`${a.first} & ${b.first}`} occasion={occasion} when={[s.weddingDate && longDay(s.weddingDate), s.city].filter(Boolean).join(" · ")} />
        )}
      </AnimatePresence>
      <Card title={occasion === "engagement" ? "When & where" : "Wedding day"}>
        <div className="grid grid-cols-2 gap-3">
          <Text k="weddingDate" type="date" label="Date" value={s.weddingDate} min={today || undefined} onChange={(v) => set("weddingDate", v)} error={err("weddingDate")} />
          <Text k="weddingTime" type="time" label="Time" value={s.weddingTime} onChange={(v) => set("weddingTime", v)} error={err("weddingTime")} />
        </div>
        <Text k="city" label="City" value={s.city} onChange={(v) => set("city", v)} placeholder="Udaipur, Rajasthan" error={err("city")} max={LIMITS.city} />
      </Card>
      <Card title="On the cover" note="Filled in as the design has it. Change anything you like.">
        <Text k="invocation" label="Blessing at the top" optional value={s.invocation} onChange={(v) => set("invocation", v)} placeholder="Shri Ganeshaya Namah" max={120} />
        {!t.noInvocationMeaning && (
          <Text k="invocationMeaning" label="Its meaning, shown small" optional value={s.invocationMeaning} onChange={(v) => set("invocationMeaning", v)} placeholder="With the blessings of Lord Ganesha" max={120} />
        )}
        {supports(t.id, "heroKicker") && (
          <Text
            k="heroKicker"
            label="Line above the names"
            optional
            value={s.heroKicker ?? coverDefault.kicker}
            onChange={(v) => set("heroKicker", v === coverDefault.kicker ? undefined : v)}
            placeholder="Save the date for the wedding of"
            max={80}
          />
        )}
        {supports(t.id, "joiner") && (
          <Choice
            label="Between the names"
            value={s.joiner ?? coverDefault.joiner}
            onChange={(v) => set("joiner", v === coverDefault.joiner ? undefined : v)}
            options={[...new Set([coverDefault.joiner, "&", "weds", "and", "with"])].map((v) => ({ v, l: v }))}
          />
        )}
      </Card>
    </>
  );

  const families = (
    <>
      {(s.lead === "groom" ? (["groom", "bride"] as const) : (["bride", "groom"] as const)).map((who) => {
        const p = s[who];
        const name = p.first || (who === "bride" ? "The bride" : "The groom");
        const setP = (patch: Partial<typeof p>) => setS((x) => ({ ...x, [who]: { ...x[who], ...patch } }));
        return (
          <Card key={who} title={`${name}'s family`}>
            <Area k={`${who}.parents`} label="Parents" optional value={p.parents} onChange={(v) => setP({ parents: v })} placeholder={who === "bride" ? "Daughter of Mrs. Sunita & Mr. Rajendra Shekhawat" : "Son of Mrs. Kavita & Mr. Vikram Rathore"} max={LIMITS.parents} rows={2} />
            {isOpen(`${who}.full`, p.full) && <Text k={`${who}.full`} label="Full name" optional value={p.full} onChange={(v) => setP({ full: v })} placeholder={who === "bride" ? "Meera Shekhawat" : "Aarav Singh Rathore"} max={LIMITS.fullName} />}
            {supports(t.id, "elders") && isOpen(`${who}.elders`, p.elders) && (
              <>
                <Area
                  k={`${who}.elders`}
                  label="Grandparents"
                  optional
                  value={p.elders ?? ""}
                  // Set like the parents' line.
                  onChange={(v) => setP({ elders: v, ...(p.eldersPlain === undefined ? { eldersPlain: true } : {}) })}
                  placeholder={who === "bride" ? "Granddaughter of Smt. Kamla & Shri Ram Lal Sharma" : "Grandson of Smt. Kamla & Shri Ram Lal Sharma"}
                  max={200}
                  rows={2}
                />
                <Choice
                  label="Grandparents' line goes"
                  value={p.eldersBelow ? "below" : "above"}
                  onChange={(v) => setP({ eldersBelow: v === "below" })}
                  options={[
                    { v: "above", l: "Above the parents' line" },
                    { v: "below", l: "Below the parents' line" },
                  ]}
                />
              </>
            )}
            <Chips
              items={[
                !isOpen(`${who}.full`, p.full) && { label: "Full name", on: () => open(`${who}.full`) },
                supports(t.id, "elders") && !isOpen(`${who}.elders`, p.elders) && { label: "Grandparents", on: () => open(`${who}.elders`) },
              ]}
            />
          </Card>
        );
      })}
      <Card title="The invitation" note="We've started you with words that suit this design. Change anything.">
        <Text k="hosts" label="From" optional value={s.hosts} onChange={(v) => set("hosts", v)} placeholder={demo.hosts || "The Sharma & Verma families"} max={160} />
        <Area k="message" label="Message" value={s.message} onChange={(v) => set("message", v)} error={err("message")} max={LIMITS.message} rows={4} />
      </Card>
    </>
  );

  const functions = (
    <>
      {s.events.map((e, i) => {
        const k = `events.${i}`;
        const bad = Object.keys(errors).some((x) => x.startsWith(`${k}.`)) && attempted.has("functions");
        const isOn = openEvent === i;
        const extra = [
          { key: "mapUrl", label: "Map link", value: e.mapUrl },
          { key: "dress", label: "Dress code", value: e.dress },
          { key: "note", label: "Note", value: e.note },
        ];
        return (
          <div key={i} className={`overflow-hidden rounded-[20px] bg-panel ${bad ? "ring-2 ring-[#d64545]/40" : ""}`}>
            <div className="flex items-center gap-3 p-4">
              <button type="button" onClick={() => setOpenEvent(isOn ? -1 : i)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-[15px] font-semibold">{i + 1}</span>
                <span className="min-w-0">
                  <span className="block truncate text-[16px] font-semibold">{e.name || "New function"}</span>
                  <span className="block truncate text-[13px] text-subtle">{[e.date && short(e.date), e.venue].filter(Boolean).join(" · ") || "Tap to add the details"}</span>
                </span>
              </button>
              {s.events.length > 1 && (
                <button type="button" aria-label={`Remove ${e.name || "this function"}`} onClick={() => (set("events", s.events.filter((_, j) => j !== i)), setOpenEvent(-1))} className="grid size-10 shrink-0 place-items-center rounded-full text-subtle hover:text-[#b42318]">
                  <svg viewBox="0 0 20 20" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M4 6h12M8 6V4.5h4V6M6 6l.8 10h6.4L14 6" />
                  </svg>
                </button>
              )}
              <button type="button" aria-label={isOn ? "Close" : "Open"} onClick={() => setOpenEvent(isOn ? -1 : i)} className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-[18px]">
                {isOn ? "−" : "+"}
              </button>
            </div>
            {isOn && (
              <div className="space-y-4 border-t border-black/5 p-4">
                <Pick k={`${k}.kind`} label="Function" value={e.kind} onChange={(v) => setEvent(i, { kind: v as EventKind, name: v === "other" ? "" : kindName(v as EventKind) })} options={eventKinds.map((x) => ({ v: x.kind, l: x.label }))} />
                {e.kind === "other" && <Text k={`${k}.name`} label="Its name" value={e.name} onChange={(v) => setEvent(i, { name: v })} placeholder="Cocktail night" error={err(`${k}.name`)} max={40} />}
                <div className="grid grid-cols-2 gap-3">
                  <Text k={`${k}.date`} type="date" label="Date" value={e.date} min={today || undefined} maxDate={s.weddingDate ? addDays(s.weddingDate, 10) : undefined} onChange={(v) => setEvent(i, { date: v })} error={err(`${k}.date`)} />
                  <Text k={`${k}.time`} type="time" label="Time" value={e.time} onChange={(v) => setEvent(i, { time: v })} error={err(`${k}.time`)} />
                </div>
                <Text k={`${k}.venue`} label="Venue" value={e.venue} onChange={(v) => setEvent(i, { venue: v })} placeholder="The Courtyard, Jagmandir Palace" error={err(`${k}.venue`)} max={LIMITS.venue} />
                {i > 0 && s.events[i - 1].venue && !e.venue && (
                  <button type="button" onClick={() => setEvent(i, { venue: s.events[i - 1].venue, address: s.events[i - 1].address, mapUrl: s.events[i - 1].mapUrl })} className="-mt-2 text-[14px] font-medium underline underline-offset-4">
                    Same venue as {s.events[i - 1].name || `function ${i}`}
                  </button>
                )}
                {isOpen(`${k}.mapUrl`, e.mapUrl) && <Text k={`${k}.mapUrl`} label="Google Maps link" help="In Google Maps, tap Share and copy the link." value={e.mapUrl} onChange={(v) => setEvent(i, { mapUrl: v })} placeholder="https://maps.app.goo.gl/…" error={err(`${k}.mapUrl`)} max={300} />}
                {isOpen(`${k}.dress`, e.dress) && <Text k={`${k}.dress`} label="Dress code" value={e.dress} onChange={(v) => setEvent(i, { dress: v })} placeholder="Shades of yellow" max={80} />}
                {isOpen(`${k}.note`, e.note) && <Text k={`${k}.note`} label="Note" value={e.note} onChange={(v) => setEvent(i, { note: v })} placeholder="Lunch to follow" max={240} />}
                <Chips items={extra.map((x) => !isOpen(`${k}.${x.key}`, x.value) && { label: x.label, on: () => open(`${k}.${x.key}`) })} />
              </div>
            )}
          </div>
        );
      })}
      {s.events.length < 12 && (
        <button
          type="button"
          onClick={() => {
            set("events", [...s.events, { ...blankEvent("reception", kindName("reception")), date: s.weddingDate }]);
            setOpenEvent(s.events.length);
          }}
          className="h-14 w-full rounded-[20px] border-2 border-dashed border-[#cfcfcf] text-[15px] font-semibold transition hover:border-faint"
        >
          + Add a function
        </button>
      )}
    </>
  );

  const ending = (
    <>
      <Card title="Closing words">
        <Area k="closing" label="Closing line" value={s.closing} onChange={(v) => set("closing", v)} error={err("closing")} max={LIMITS.closing} rows={2} />
        <Text k="hashtag" label="Hashtag" optional value={s.hashtag} onChange={(v) => set("hashtag", v)} placeholder="#AaravKiMeera" max={40} />
      </Card>
      {(t.extraFields?.length || supports(t.id, "lists")) && (
        <Card title="Family at the end" optional note="Names printed after your closing words, as on a printed card.">
          {t.extraFields?.includes("compliments") && <Area k="compliments" label="With best compliments from" optional value={s.compliments} onChange={(v) => set("compliments", v)} placeholder={"Sri S. Sridhar Rao\nSri S. Srikrishna"} max={800} rows={3} />}
          {t.extraFields?.includes("signoff") && <Text k="signoff" label="Sign-off" optional value={s.signoff} onChange={(v) => set("signoff", v)} placeholder="With love · the Saranala family" max={80} />}
          {(t.extraFields?.includes("lists") || supports(t.id, "lists")) &&
            (isOpen("lists", s.listTitle || s.listLines) ? (
              <>
                <Text k="listTitle" label="Heading" value={s.listTitle} onChange={(v) => set("listTitle", v)} placeholder="With best compliments from" max={80} />
                <Area k="listLines" label="Names, one per line" value={s.listLines} onChange={(v) => set("listLines", v)} placeholder={"Nanke & Dadke\nThe Sharma family\nThe Verma family"} max={6000} rows={4} />
              </>
            ) : (
              <Chips items={[{ label: "Family names at the end", on: () => open("lists") }]} />
            ))}
        </Card>
      )}
    </>
  );

  const designScript = String((themes[t.id].vars as Record<string, string>)["--inv-script"] ?? "serif");
  const sample = `${a.first || "Aarav"} & ${b.first || "Meera"}`;
  const sizes = [0.85, 0.92, 1, 1.08, 1.16, 1.25];
  const sizeAt = Math.max(0, sizes.indexOf(s.textScale ?? 1));
  const look = (
    <>
      <Card title="Lettering">
        <div role="radiogroup" aria-label="Lettering" className="grid grid-cols-2 gap-2">
          {[{ id: "", name: "As designed", script: designScript }, ...fontStyles].map((f) => {
            const on = s.font === f.id;
            return (
              <button key={f.id || "design"} type="button" role="radio" aria-checked={on} onClick={() => set("font", f.id)} className={`min-w-0 rounded-[16px] p-3 text-left transition ${on ? "bg-ink text-white" : "bg-white hover:bg-white/70"}`}>
                <span className="block truncate text-[22px] leading-tight" style={{ fontFamily: f.script }}>
                  {sample}
                </span>
                <span className="mt-1 block text-[13px] font-semibold">{f.name}</span>
              </button>
            );
          })}
        </div>
      </Card>
      <Card title="Text size" note="Bigger for older guests. Names keep their size.">
        <div className="flex items-center gap-3">
          <button type="button" aria-label="Smaller text" disabled={sizeAt === 0} onClick={() => set("textScale", sizes[sizeAt - 1])} className="h-12 w-16 rounded-[14px] bg-white text-[16px] font-semibold disabled:opacity-35">
            A−
          </button>
          <span className="w-16 text-center text-[16px] font-semibold tabular-nums">{Math.round((s.textScale ?? 1) * 100)}%</span>
          <button type="button" aria-label="Bigger text" disabled={sizeAt === sizes.length - 1} onClick={() => set("textScale", sizes[sizeAt + 1])} className="h-12 w-16 rounded-[14px] bg-white text-[20px] font-semibold disabled:opacity-35">
            A+
          </button>
        </div>
      </Card>
      <Card title="Parts of your invite" note="The cover, families, functions and ending always show.">
        {sectionsFor(t.id).map((x) => (
          <Toggle key={x.id} label={x.name} note={x.note} on={showing(x.id)} onChange={(on) => set("hide", on ? s.hide.filter((h) => h !== x.id) : [...s.hide, x.id])} />
        ))}
        {supports(t.id, "hideHeroDate") && <Toggle label="Date on the cover" on={!s.hideHeroDate} onChange={(on) => set("hideHeroDate", !on || undefined)} />}
        {supports(t.id, "hideHeroCity") && <Toggle label="City on the cover" on={!s.hideHeroCity} onChange={(on) => set("hideHeroCity", !on || undefined)} />}
      </Card>
    </>
  );

  const addPhotos = async (files: FileList | null) => {
    if (!files?.length) return;
    const list = Array.from(files).slice(0, MAX_PHOTOS - photos.length);
    if (files.length > list.length) setNotice(`Up to ${MAX_PHOTOS} photos: we added the first ${list.length}.`);
    if (!showing("gallery")) set("hide", s.hide.filter((h) => h !== "gallery"));
    setBusy((n) => n + list.length);
    await Promise.all(
      list.map(async (file) => {
        try {
          const blob = await shrink(file);
          const type = blob.type || file.type;
          const res = await createPhotoUpload(type, blob.size);
          if ("error" in res) throw new Error(res.error);
          if (!(await uploadTo("photos", res, blob, type))) throw new Error("A photo didn't finish uploading. Please try again.");
          setPhotos((p) => (p.length < MAX_PHOTOS ? [...p, res.path] : p));
        } catch (e) {
          setNotice(e instanceof Error ? e.message : "A photo didn't finish uploading. Please try again.");
        } finally {
          setBusy((n) => n - 1);
        }
      }),
    );
  };
  const pickSong = async (file: File | undefined) => {
    if (!file) return;
    setSongPct(0);
    setBusy((n) => n + 1);
    try {
      const res = await createSongUpload(file.name, file.type, file.size);
      if ("error" in res) throw new Error(res.error);
      if (!(await uploadTo("songs", res, file, res.contentType ?? file.type, setSongPct))) throw new Error("The upload didn't finish. Try again on Wi-Fi or a stronger signal.");
      setSong({ path: res.path, name: file.name });
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "The upload didn't finish. Please try again.");
    }
    setSongPct(null);
    setBusy((n) => n - 1);
  };
  const media = (
    <>
      <Card title="Your photos" optional note={`Up to ${MAX_PHOTOS}. Guests swipe through them as polaroids.`}>
        <div className="grid grid-cols-3 gap-2">
          {photos.map((p, i) => (
            <div key={p} className="relative aspect-[4/5] overflow-hidden rounded-[14px] bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element -- their own upload, already resized */}
              <img src={mediaUrl("photos", p)} alt={`Photo ${i + 1}`} className="size-full object-cover" />
              <button type="button" aria-label={`Remove photo ${i + 1}`} onClick={() => setPhotos((x) => x.filter((y) => y !== p))} className="absolute top-1 right-1 grid size-8 place-items-center rounded-full bg-black/60 text-white">
                ✕
              </button>
            </div>
          ))}
          {photos.length < MAX_PHOTOS && (
            <label className="grid aspect-[4/5] cursor-pointer place-items-center rounded-[14px] border-2 border-dashed border-[#cfcfcf] bg-white text-center text-[14px] font-semibold">
              <span>
                <span className="block text-[24px] leading-none">+</span>
                Add
              </span>
              <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => (addPhotos(e.target.files), (e.target.value = ""))} />
            </label>
          )}
        </div>
      </Card>
      <Card title="Your song" note="It plays softly when guests open your invite. Tap ▶ to listen.">
        <div className="space-y-2">
          {[...songs, ...instrumentals].map((tr) => (
            <SongRow key={tr.id} track={tr} chosen={!song && s.music === tr.id} playing={playing} setPlaying={setPlaying} onChoose={() => (set("music", tr.id), setSong(null))} />
          ))}
        </div>
        <label className={`flex h-14 cursor-pointer items-center justify-center rounded-[16px] border-2 border-dashed bg-white text-[15px] font-semibold ${song ? "border-ink" : "border-[#cfcfcf]"}`}>
          {songPct !== null ? `Uploading… ${songPct}%` : song ? `✓ ${song.name} · change` : "+ Upload your own song"}
          <input type="file" accept="audio/*,.mp3,.m4a,.aac,.wav,.ogg,.opus" className="sr-only" onChange={(e) => (pickSong(e.target.files?.[0]), (e.target.value = ""))} />
        </label>
      </Card>
    </>
  );

  const details = (
    <>
      <Card title="Contact" note="We send your invite link and edit link here.">
        <Text k="customer.name" label="Your name" value={s.customer.name} onChange={(v) => set("customer", { ...s.customer, name: v })} error={err("customer.name")} max={80} autoComplete="name" />
        <Text k="customer.phone" type="tel" label="WhatsApp number" value={s.customer.phone} onChange={(v) => set("customer", { ...s.customer, phone: v })} placeholder="98765 43210" error={err("customer.phone")} max={20} autoComplete="tel" />
        <Text k="customer.email" type="email" label="Email" value={s.customer.email} onChange={(v) => set("customer", { ...s.customer, email: v })} placeholder="name@gmail.com" error={err("customer.email")} max={120} autoComplete="email" />
        {isOpen("partner", refCode) ? (
          <Text k="partner" label="Partner code" optional value={refCode} onChange={(v) => (setRefCode(cleanPartnerCode(v)), setPartner(null))} help={partner ? `✓ ${partner.code} applied · ${partner.name}` : "From the friend or creator who sent you."} max={20} onBlur={() => refCode && checkPartnerCode(refCode).then(setPartner).catch(() => {})} />
        ) : (
          <Chips items={[{ label: "Partner code", on: () => open("partner") }]} />
        )}
      </Card>
      {showing("rsvp") && (
        <Card title="RSVPs" note="Guests reply on WhatsApp.">
          <Toggle label="Send RSVPs to my WhatsApp" words={["Yes", "No"]} on={s.rsvpSame} onChange={(on) => set("rsvpSame", on)} />
          {!s.rsvpSame && <Text k="rsvpPhone" type="tel" label="RSVP number" value={s.rsvpPhone} onChange={(v) => set("rsvpPhone", v)} placeholder="98765 43210" error={err("rsvpPhone")} max={20} />}
          {isOpen("rsvpBy", s.rsvpBy) ? (
            <Text k="rsvpBy" type="date" label="Reply by" optional value={s.rsvpBy} min={today || undefined} maxDate={s.weddingDate || undefined} onChange={(v) => set("rsvpBy", v)} error={err("rsvpBy")} />
          ) : (
            <Chips items={[{ label: "Reply-by date", on: () => open("rsvpBy") }]} />
          )}
        </Card>
      )}
      {!t.payDirect && (
        <Card title="Extras" optional>
          <Addon on={pdfAddon} set={setPdfAddon} title={`Printable PDF for elders · ${formatINR(site.pdfAddon.price)}`} note="The same design as a PDF with large, clear text, for printing and family groups." />
          <Addon on={brandAddon} set={setBrandAddon} title={`Remove our branding · ${formatINR(site.brandingAddon.price)}`} note="Hides the small “Crafted with love by Aavjoo” line at the end." />
        </Card>
      )}
      <div className="rounded-[20px] bg-ink p-5 text-white">
        <p className="text-[13px] font-medium text-white/60">{t.name} · everything included</p>
        <div className="mt-1 flex items-end justify-between gap-3">
          <PriceTag price={total} mrp={t.mrp + (total - t.price)} size="md" tone="dark" />
          <span className="text-right text-[13px] text-white/70">Live within minutes of paying</span>
        </div>
      </div>
      {serverErrors.length > 0 && (
        <div role="alert" className="rounded-[16px] bg-[#fdecec] p-4 text-[14px] text-[#8a1c1c]">
          {serverErrors.map((x) => (
            <p key={x}>{x}</p>
          ))}
        </div>
      )}
    </>
  );

  const screens: Record<PartId, ReactNode> = { cover, families, functions, ending, look, media, details };
  const last = step === PARTS.length - 1;

  return (
    <div ref={top} className="scroll-mt-24 pb-32 lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10">
      <div className="min-w-0">
        {step === 0 && (
          <div className="mb-6">
            <h2 className="text-[32px] leading-[1.05] font-semibold tracking-[-0.03em] sm:text-[44px]">Make {t.name} yours</h2>
            <p className="mt-2 text-[16px] text-muted">Ready in 3 minutes. Watch it come alive as you type.</p>
          </div>
        )}
        {/* Where they are, and what's left of the form. */}
        <div className="flex items-center justify-between gap-3 text-[13px]">
          <span className="font-semibold text-subtle">
            Step {step + 1} of {PARTS.length}
          </span>
          <span className="shrink-0 text-subtle">About {Math.max(1, Math.round(left / 60))} min left</span>
        </div>
        <div className="mt-2 grid gap-1" style={{ gridTemplateColumns: `repeat(${PARTS.length}, minmax(0, 1fr))` }}>
          {PARTS.map((x, i) => (
            <button key={x.id} type="button" aria-label={x.title} onClick={() => i < step && go(i)} className={`h-1.5 rounded-full transition ${i <= step ? "bg-ink" : "bg-line"}`} />
          ))}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={part.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }} className="mt-6">
            <h3 className="text-[26px] leading-tight font-semibold tracking-[-0.02em]">{part.title}</h3>
            <p className="mt-1 text-[15px] text-muted">{part.note}</p>
            <div className="mt-5 space-y-4">{screens[part.id]}</div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Computers: the invite beside the form. */}
      <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
        <div className="rounded-frame p-6" style={{ background: t.tint }}>
          <div className="mx-auto w-[230px]">
            <PhoneFrame className="shadow-phone">{previewPart ? <SectionPreview invite={live} part={previewPart} eventIndex={openEvent >= 0 ? openEvent : undefined} /> : <InvitePreview invite={live} stage="open" loop={false} />}</PhoneFrame>
          </div>
          <p className="mt-3 text-center text-[13px] font-medium text-ink/70">Live preview · {part.title}</p>
        </div>
      </aside>

      {notice && (
        <div role="status" onClick={() => setNotice("")} className="fixed inset-x-4 bottom-28 z-40 mx-auto max-w-[520px] rounded-[16px] bg-ink px-4 py-3 text-[14px] text-white shadow-xl">
          {notice}
        </div>
      )}

      {/* Under the thumb: back, preview and the next step. */}
      <div data-sticky-cta="on" className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1100px] items-center gap-2 px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))]">
          <button type="button" aria-label="Back" disabled={step === 0} onClick={() => go(step - 1)} className="grid size-12 shrink-0 place-items-center rounded-full bg-panel text-[20px] disabled:opacity-30">
            ←
          </button>
          <button type="button" onClick={() => setPreviewOpen(true)} className="flex h-12 shrink-0 items-center gap-1.5 rounded-full bg-panel px-4 text-[15px] font-semibold">
            <svg viewBox="0 0 20 20" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
              <path d="M1.5 10s3-5.5 8.5-5.5S18.5 10 18.5 10s-3 5.5-8.5 5.5S1.5 10 1.5 10Z" />
              <circle cx="10" cy="10" r="2.5" />
            </svg>
            Preview
          </button>
          <button type="button" onClick={next} disabled={sending || busy > 0} className="ml-auto h-12 min-w-0 flex-1 rounded-full bg-ink px-5 text-[16px] font-semibold text-white transition active:scale-[.98] disabled:opacity-60 sm:max-w-[260px]">
            {sending ? "Creating…" : busy > 0 ? "Uploading…" : last ? `Pay ${formatINR(total)}` : "Next →"}
          </button>
        </div>
      </div>

      <FullInvitePreview invite={live} open={previewOpen} onClose={closePreview} />
    </div>
  );
}

// Read from event handlers only (timings for analytics).
const clock = () => Date.now();
const secondsSince = (from: number) => Math.round((clock() - from) / 1000);

const longDay = (date: string) => new Date(`${date}T12:00:00+05:30`).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" });
const short = (date: string) => new Date(`${date}T12:00:00+05:30`).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" });

/* ───────── The link ───────── */

// Each design's painted art for its share card, and where the band under the names starts (as
// src/lib/share-card.tsx draws it for WhatsApp), so the preview here matches what guests get.
const SHARE_ART: Record<string, { src: string; y: number }> = {
  gaurishankar: { src: "/art/illus/shiv-share.jpg", y: 0.27 },
  sarovar: { src: "/art/illus/sarovar-hero.jpg", y: 0.4 },
  mandir: { src: "/art/illus/mandir-temple.jpg", y: 0.45 },
  vachan: { src: "/art/illus/mandir-temple.jpg", y: 0.45 },
  haveli: { src: "/art/illus/haveli-arrival.jpg", y: 0.16 },
  mahal: { src: "/art/illus/mahal-hero.jpg", y: 0.15 },
  khat: { src: "/art/illus/khat-hero.jpg", y: 0.45 },
  mudrika: { src: "/art/illus/khat-hero.jpg", y: 0.45 },
  angoothi: { src: "/art/illus/angoothi-hero.jpg", y: 0.42 },
  chandni: { src: "/art/illus/chandni-hero.jpg", y: 0.44 },
  roka: { src: "/art/illus/roka-hero.jpg", y: 0.42 },
  khatred: { src: "/art/illus/khat-red-hero.jpg", y: 0.42 },
  gopuram: { src: "/art/illus/gopuram-hero.jpg", y: 0.19 },
  bagh: { src: "/art/illus/bagh-hero.jpg", y: 0.21 },
  chameli: { src: "/art/illus/chameli-envelope.jpg", y: 0.3 },
  chamelisagai: { src: "/art/illus/chameli-envelope.jpg", y: 0.3 },
  shivakalyanam: { src: "/art/illus/telugu-share.jpg", y: 0.38 },
};

/** Their link as guests will get it on WhatsApp, with the share card drawn from what they've typed. */
function ShareMessage({ slug, template, names, occasion, when }: { slug: string; template: string; names: string; occasion: string; when: string }) {
  const art = SHARE_ART[template];
  // The art is portrait (864×1536) and the card 1200×630: show the same band the share card does.
  const posY = art ? `${Math.round(art.y * 1.4191 * 100)}%` : "50%";
  const card = (
    <div
      className="grid size-full place-items-center bg-cover text-center"
      style={art ? { backgroundImage: `url(${art.src})`, backgroundSize: "100% auto", backgroundPosition: `center ${posY}` } : { background: "linear-gradient(135deg,#fbf5ec,#f4ebe1)" }}
    >
      <div className="px-3 [text-shadow:0_0_14px_rgba(255,250,244,.95),0_0_4px_rgba(255,250,244,.9)]">
        <p className="text-[9px] font-semibold tracking-[0.2em] text-[#3b1f24] uppercase">{occasion === "engagement" ? "Engagement invitation" : occasion === "reception" ? "Wedding reception invitation" : "Wedding invitation"}</p>
        <p className="mt-0.5 font-serif text-[24px] leading-none font-semibold text-[#3b1f24]">{names}</p>
        {when && <p className="mt-1 text-[10px] font-medium text-[#3b1f24]">{when}</p>}
      </div>
    </div>
  );
  return (
    <motion.div initial={{ opacity: 0, y: 12, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} transition={{ type: "spring", stiffness: 240, damping: 22 }} className="overflow-hidden rounded-[20px] bg-panel pb-4">
      <div className="px-5 pt-5">
        <p className="text-[17px] font-semibold">✨ How your guests will get it</p>
        <p className="mt-0.5 text-[14px] leading-snug text-muted">Your invite on WhatsApp, with its own link.</p>
      </div>
      <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25, type: "spring", stiffness: 220, damping: 20 }} className="mx-4 mt-4">
        <WhatsAppMessage card={card} names={names} occasion={occasion} url={`https://aavjoo.in/i/${slug}`} />
      </motion.div>
    </motion.div>
  );
}

/* ───────── Pieces ───────── */

function Card({ title, note, optional, children }: { title: string; note?: string; optional?: boolean; children: ReactNode }) {
  return (
    <section className="space-y-4 rounded-[20px] bg-panel p-5">
      <div>
        <h4 className="text-[17px] font-semibold">
          {title}
          {optional && <span className="ml-2 text-[13px] font-medium text-subtle">optional</span>}
        </h4>
        {note && <p className="mt-0.5 text-[14px] leading-snug text-muted">{note}</p>}
      </div>
      {children}
    </section>
  );
}

const box = "mt-1.5 block w-full min-w-0 appearance-none rounded-[14px] border bg-white px-3.5 py-3 text-[16px] text-ink outline-none transition placeholder:text-faint [&::-webkit-date-and-time-value]:text-left";
const tone = (error?: string) => (error ? "border-[#d64545]" : "border-line focus:border-ink");

function Label({ k, label, optional, help, error, children }: { k: string; label: string; optional?: boolean; help?: string; error?: string; children: ReactNode }) {
  return (
    <div className="min-w-0" {...(error ? { "data-error": "" } : {})}>
      <label htmlFor={k} className="text-[14px] font-semibold">
        {label}
        {optional && <span className="font-normal text-subtle"> · optional</span>}
      </label>
      {children}
      {error ? <p className="mt-1.5 text-[13px] text-[#b42318]">{error}</p> : help ? <p className="mt-1.5 text-[13px] text-subtle">{help}</p> : null}
    </div>
  );
}

function Text(p: {
  k: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  optional?: boolean;
  help?: string;
  error?: string;
  max?: number;
  min?: string;
  maxDate?: string;
  autoComplete?: string;
  onBlur?: () => void;
}) {
  return (
    <Label k={p.k} label={p.label} optional={p.optional} help={p.help} error={p.error}>
      <input
        id={p.k}
        type={p.type ?? "text"}
        inputMode={p.type === "tel" ? "tel" : p.type === "email" ? "email" : undefined}
        value={p.value}
        onChange={(e) => p.onChange(e.target.value)}
        onBlur={p.onBlur}
        placeholder={p.placeholder}
        maxLength={p.max}
        min={p.type === "date" ? p.min : undefined}
        max={p.type === "date" ? p.maxDate : undefined}
        autoComplete={p.autoComplete}
        className={`${box} ${tone(p.error)} ${p.type === "date" || p.type === "time" ? "h-12" : ""}`}
      />
    </Label>
  );
}

function Area(p: { k: string; label: string; value: string; onChange: (v: string) => void; placeholder?: string; optional?: boolean; error?: string; max?: number; rows?: number }) {
  return (
    <Label k={p.k} label={p.label} optional={p.optional} error={p.error}>
      <textarea id={p.k} value={p.value} rows={p.rows ?? 3} onChange={(e) => p.onChange(e.target.value)} placeholder={p.placeholder} maxLength={p.max} className={`${box} ${tone(p.error)} resize-none leading-snug`} />
    </Label>
  );
}

function Pick({ k, label, value, onChange, options }: { k: string; label: string; value: string; onChange: (v: string) => void; options: { v: string; l: string }[] }) {
  return (
    <Label k={k} label={label}>
      <select id={k} value={value} onChange={(e) => onChange(e.target.value)} className={`${box} ${tone()} h-12 py-0`}>
        {options.map((o) => (
          <option key={o.v} value={o.v}>
            {o.l}
          </option>
        ))}
      </select>
    </Label>
  );
}

/** Choices as chips that wrap on a phone. */
function Choice({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { v: string; l: string }[] }) {
  return (
    <div>
      <p className="text-[14px] font-semibold">{label}</p>
      <div role="radiogroup" aria-label={label} className="mt-2 flex flex-wrap gap-2">
        {options.map((o) => (
          <button key={o.v || "none"} type="button" role="radio" aria-checked={value === o.v} onClick={() => onChange(o.v)} className={`h-10 rounded-full px-4 text-[14px] font-medium whitespace-nowrap transition ${value === o.v ? "bg-ink text-white" : "bg-white text-ink hover:bg-white/70"}`}>
            {o.l}
          </button>
        ))}
      </div>
    </div>
  );
}

/** An on/off choice in words ("Show" or "Hide"): a switch alone wasn't clear to many couples. */
function Toggle({ label, note, on, onChange, words = ["Show", "Hide"] }: { label: string; note?: string; on: boolean; onChange: (on: boolean) => void; words?: [string, string] }) {
  return (
    <div className="flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-medium">{label}</p>
        {note && <p className="text-[13px] leading-snug text-subtle">{note}</p>}
      </div>
      <div role="radiogroup" aria-label={label} className="flex shrink-0 rounded-full bg-white p-1 ring-1 ring-line">
        {words.map((w, i) => {
          const picked = i === 0 ? on : !on;
          return (
            <button key={w} type="button" role="radio" aria-checked={picked} onClick={() => onChange(i === 0)} className={`h-9 min-w-[60px] rounded-full px-3 text-[14px] font-semibold transition ${picked ? "bg-ink text-white" : "text-muted"}`}>
              {w}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Extra fields, each opened with a tap. */
function Chips({ items }: { items: (false | undefined | "" | 0 | { label: string; on: () => void })[] }) {
  const list = items.filter((x): x is { label: string; on: () => void } => !!x);
  if (!list.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {list.map((x) => (
        <button key={x.label} type="button" onClick={x.on} className="h-10 rounded-full border border-line bg-white px-4 text-[14px] font-medium whitespace-nowrap transition hover:border-faint">
          + {x.label}
        </button>
      ))}
    </div>
  );
}

function Addon({ on, set, title, note }: { on: boolean; set: (v: boolean) => void; title: string; note: string }) {
  return (
    <label className={`flex cursor-pointer items-start gap-3 rounded-[16px] border-2 bg-white p-4 transition ${on ? "border-ink" : "border-transparent"}`}>
      <input type="checkbox" checked={on} onChange={(e) => set(e.target.checked)} className="mt-1 size-5 shrink-0 accent-[#141414]" />
      <span className="min-w-0">
        <span className="block text-[15px] font-semibold">{title}</span>
        <span className="mt-0.5 block text-[13px] text-subtle">{note}</span>
      </span>
    </label>
  );
}

/** A song to choose, with ▶ to listen; one plays at a time. */
function SongRow({ track: tr, chosen, playing, setPlaying, onChoose }: { track: Track; chosen: boolean; playing: string | null; setPlaying: (id: string | null) => void; onChoose: () => void }) {
  const player = useInviteMusic(tr.id);
  const mine = playing === tr.id;
  const { pause } = player;
  useEffect(() => {
    if (!mine && player.playing) pause();
  }, [mine, player.playing, pause]);
  return (
    <div className={`flex items-center gap-3 rounded-[16px] p-2.5 pr-4 ${chosen ? "bg-ink text-white" : "bg-white"}`}>
      <button
        type="button"
        aria-label={player.playing ? `Stop ${tr.name}` : `Play ${tr.name}`}
        onClick={() => (player.playing ? (pause(), setPlaying(null)) : (setPlaying(tr.id), player.play()))}
        className={`grid size-10 shrink-0 place-items-center rounded-full ${chosen ? "bg-white text-ink" : "bg-panel text-ink"}`}
      >
        {player.playing ? "❚❚" : "▶"}
      </button>
      <button type="button" onClick={onChoose} className="min-w-0 flex-1 text-left" aria-pressed={chosen}>
        <span className="block truncate text-[15px] font-semibold">{tr.name}</span>
        <span className={`block truncate text-[12px] ${chosen ? "text-white/70" : "text-subtle"}`}>{tr.mood}</span>
      </button>
      {chosen && <span className="text-[13px] font-semibold">✓</span>}
    </div>
  );
}
