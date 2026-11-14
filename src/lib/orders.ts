import type { EventKind, Invite, InviteEvent } from "@/data/invites";
import { getTemplate, type TemplateId } from "@/data/templates";
import { getFontStyle, isSectionId } from "@/config/customise";
import { isTrackId } from "@/config/music";
import { splitMapLink } from "@/lib/format";

export type OrderStatus = "awaiting_payment" | "payment_submitted" | "paid" | "live" | "cancelled";

/** What the couple fills in: the invite minus the parts we assign. `music` is a chosen Aavjoo track, if any. */
export type InviteDetails = Omit<Invite, "slug" | "template">;

export type Order = {
  id: string;
  code: string;
  template: TemplateId;
  status: OrderStatus;
  amount: number;
  addons: string[];
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  details: InviteDetails;
  song_path: string | null;
  photo_paths?: string[] | null;
  utr: string | null;
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;
  nudge_count?: number | null;
  nudged_at?: string | null;
  /** Edits on top of the free ones, from packs or given in admin. */
  extra_edits?: number | null;
  /** Payment reminder emails sent, the last one's time, and whether they asked us to stop. */
  email_reminders?: number | null;
  email_reminded_at?: string | null;
  email_opt_out?: boolean | null;
  admin_notes: string | null;
  invite_slug: string | null;
  partner_code?: string | null;
  partner_commission?: number | null;
  created_at: string;
  updated_at: string;
  payment_submitted_at: string | null;
  paid_at: string | null;
  published_at: string | null;
};

export const statusLabel: Record<OrderStatus, string> = {
  awaiting_payment: "New · awaiting payment",
  payment_submitted: "Payment submitted",
  paid: "Paid",
  live: "Live",
  cancelled: "Cancelled",
};

export const eventKinds: { kind: EventKind; label: string }[] = [
  { kind: "engagement", label: "Engagement / Ring ceremony" },
  { kind: "haldi", label: "Haldi / Maiyan" },
  { kind: "mehndi", label: "Mehndi" },
  { kind: "sangeet", label: "Sangeet" },
  { kind: "jaggo", label: "Jaggo" },
  { kind: "baraat", label: "Baraat" },
  { kind: "phere", label: "Pheras / Wedding" },
  { kind: "anandkaraj", label: "Anand Karaj" },
  { kind: "nikah", label: "Nikah" },
  { kind: "muhurtham", label: "Muhurtham" },
  { kind: "walima", label: "Walima" },
  { kind: "reception", label: "Reception" },
  { kind: "other", label: "Other – add your own" },
];

/** The usual name on a function's card: "Haldi / Maiyan" → "Haldi". */
export const kindName = (kind: EventKind) => eventKinds.find((k) => k.kind === kind)?.label.split(" / ")[0] ?? "";

export function orderTotal(template: TemplateId) {
  const t = getTemplate(template);
  if (!t) throw new Error("Unknown design");
  return t.price;
}

/** "New Delhi" → "new-delhi"; ASCII letters, digits and hyphens only. */
export const slugPart = (s: string) =>
  s
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-");

/** "Aarav", "Meera" → "aarav-weds-meera". */
export function suggestSlug(d: InviteDetails) {
  const [a, b] = d.lead === "groom" ? [d.groom.first, d.bride.first] : [d.bride.first, d.groom.first];
  return [slugPart(a), "weds", slugPart(b)].filter(Boolean).join("-").replace(/-+/g, "-");
}

export const isValidSlug = (s: string) => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(s) && s.length <= 60;

/** The day after which a published invite stops opening. */
export function liveUntil(weddingIso: string, daysAfter: number) {
  const d = new Date(weddingIso);
  d.setUTCDate(d.getUTCDate() + daysAfter);
  return d.toISOString().slice(0, 10);
}

/* ───────── Validation ───────── */

const str = (v: unknown, max = 300) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const isIso = (v: string) => !Number.isNaN(new Date(v).getTime());

/**
 * Cleans and checks what a couple submitted. Returns the tidy details, or a list of
 * problems written for the person filling the form.
 */
export function validateDetails(input: unknown): { ok: true; details: InviteDetails } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  const d = (input ?? {}) as Record<string, unknown>;
  const person = (p: unknown) => {
    const o = (p ?? {}) as Record<string, unknown>;
    const first = str(o.first, 40);
    const elders = str(o.elders, 160);
    const cardName = str(o.cardName, 40);
    const coverName = str(o.coverName, 40);
    const title = str(o.title, 40);
    return { ...(cardName ? { cardName } : {}), ...(coverName ? { coverName } : {}), ...(title ? { title } : {}), ...(title && o.titleInline === true ? { titleInline: true } : {}), ...(title && o.titleScript === true ? { titleScript: true } : {}), first, full: str(o.full, 80) || first, parents: str(o.parents, 160), ...(elders ? { elders } : {}), ...(elders && o.eldersBelow === true ? { eldersBelow: true } : {}), ...(elders && o.eldersPlain === true ? { eldersPlain: true } : {}) };
  };
  const bride = person(d.bride);
  const groom = person(d.groom);
  if (!bride.first) errors.push("Add the bride's first name.");
  if (!groom.first) errors.push("Add the groom's first name.");

  const date = str(d.date, 40);
  if (!date || !isIso(date)) errors.push("Add the wedding date and time.");
  const city = str(d.city, 80);
  if (!city) errors.push("Add the wedding city.");

  const rawEvents = Array.isArray(d.events) ? d.events.slice(0, 12) : [];
  const kinds = new Set(eventKinds.map((k) => k.kind));
  const events: InviteEvent[] = rawEvents.map((e) => {
    const o = (e ?? {}) as Record<string, unknown>;
    const kind = (kinds.has(o.kind as EventKind) ? o.kind : "phere") as EventKind;
    // A map link typed into the address moves to mapUrl.
    const { url, rest } = splitMapLink(str(o.address, 300));
    const given = str(o.mapUrl, 300);
    const mapUrl = splitMapLink(given).url || url;
    return {
      kind,
      name: str(o.name, 40),
      devanagari: str(o.devanagari, 40) || undefined,
      start: str(o.start, 40),
      end: str(o.end, 40) || undefined,
      venue: str(o.venue, 120),
      address: rest.slice(0, 200),
      dress: str(o.dress, 80) || undefined,
      note: str(o.note, 240) || undefined,
      ...(mapUrl ? { mapUrl } : {}),
      ...(Array.isArray(o.schedule) && o.schedule.length
        ? {
            schedule: o.schedule.slice(0, 8).map((x) => {
              const s = (x ?? {}) as Record<string, unknown>;
              return { at: isIso(str(s.at, 40)) ? str(s.at, 40) : "", text: str(s.text, 120) };
            }).filter((x) => x.at && x.text),
          }
        : {}),
    };
  });
  if (!events.length) errors.push("Add at least one function.");
  events.forEach((e, i) => {
    const n = e.name || `Function ${i + 1}`;
    if (!e.name) errors.push(`Name function ${i + 1}.`);
    if (!e.start || !isIso(e.start)) errors.push(`Add a date and time for ${n}.`);
    if (!e.venue) errors.push(`Add the venue for ${n}.`);
  });

  const hide = Array.isArray(d.hide) ? [...new Set(d.hide.filter(isSectionId))] : [];
  const rsvp = (d.rsvp ?? {}) as Record<string, unknown>;
  const rsvpPhone = cleanPhone(rsvp.phone);
  if (rsvpPhone.length < 10 && !hide.includes("rsvp")) errors.push("Add the WhatsApp number guests should RSVP to.");
  const rsvpBy = str(rsvp.by, 40);

  if (errors.length) return { ok: false, errors };

  return {
    ok: true,
    details: {
      bride,
      groom,
      lead: d.lead === "bride" ? "bride" : "groom",
      invocation: str(d.invocation, 120),
      invocationMeaning: str(d.invocationMeaning, 120),
      hosts: str(d.hosts, 400),
      message: str(d.message, 400),
      date,
      city,
      hashtag: str(d.hashtag, 40) || undefined,
      events,
      rsvp: {
        phone: rsvpPhone,
        by: rsvpBy && isIso(rsvpBy) ? rsvpBy : date,
        contact: str(rsvp.contact, 80),
      },
      closing: str(d.closing, 240),
      ...(isTrackId(d.music) ? { music: d.music } : {}),
      ...(hide.length ? { hide } : {}),
      ...(getFontStyle(d.font) ? { font: d.font as string } : {}),
      ...(d.wardrobe === true ? { wardrobe: true } : {}),
      ...(Array.isArray(d.extras) && d.extras.length
        ? {
            extras: d.extras.slice(0, 8).map((g) => {
              const o = (g ?? {}) as Record<string, unknown>;
              return { title: str(o.title, 60), lines: (Array.isArray(o.lines) ? o.lines : []).slice(0, 20).map((l) => str(l, 120)).filter(Boolean) };
            }),
          }
        : {}),
      ...(str(d.welcome, 200) ? { welcome: str(d.welcome, 200) } : {}),
      ...(Array.isArray(d.contacts) && d.contacts.length
        ? {
            contacts: d.contacts.slice(0, 6).map((p) => {
              const o = (p ?? {}) as Record<string, unknown>;
              return { name: str(o.name, 60), phones: (Array.isArray(o.phones) ? o.phones : []).slice(0, 4).map(cleanPhone).filter((x) => x.length >= 10), ...(o.whatsapp === true ? { whatsapp: true } : {}) };
            }),
          }
        : {}),
      ...(typeof d.joiner === "string" && d.joiner.trim() ? { joiner: str(d.joiner, 12) } : {}),
      ...(d.plainCover === true ? { plainCover: true } : {}),
      ...(typeof d.monogram === "string" && d.monogram.trim() ? { monogram: str(d.monogram, 6) } : {}),
      ...(typeof d.openHint === "string" && d.openHint.trim() ? { openHint: str(d.openHint, 40) } : {}),
      ...(d.memorial && typeof d.memorial === "object" && /^https:\/\/[\w.-]+\/storage\/v1\/object\/public\/photos\/[\w/-]+\.(jpg|png|webp)$/.test(String((d.memorial as Record<string, unknown>).photo))
        ? (() => {
            const m = d.memorial as Record<string, unknown>;
            const name = str(m.name, 80);
            return { memorial: { photo: String(m.photo), ...(name ? { name } : {}), ...(m.large === true ? { large: true } : {}), ...(m.last === true ? { last: true } : {}) } };
          })()
        : {}),
      ...(typeof d.rsvpTitle === "string" && d.rsvpTitle.trim() ? { rsvpTitle: str(d.rsvpTitle, 60) } : {}),
      ...(typeof d.countdownTitle === "string" && d.countdownTitle.trim() ? { countdownTitle: str(d.countdownTitle, 60) } : {}),
      ...(d.rsvpHeading && typeof d.rsvpHeading === "object"
        ? (() => {
            const h = d.rsvpHeading as Record<string, unknown>;
            const kicker = str(h.kicker, 40), title = str(h.title, 40), lead = str(h.lead, 200);
            return kicker || title ? { rsvpHeading: { kicker, title, ...(lead ? { lead } : {}) } } : {};
          })()
        : {}),
      ...(d.largeText === true ? { largeText: true } : {}),
      ...(d.stackNames === true ? { stackNames: true } : {}),
      ...(d.noSignoff === true ? { noSignoff: true } : {}),
      ...(typeof d.signoff === "string" && d.signoff.trim() ? { signoff: str(d.signoff, 80) } : {}),
      ...(typeof d.heroKicker === "string" && d.heroKicker.trim() ? { heroKicker: str(d.heroKicker, 60) } : {}),
      ...(d.parentsWide === true ? { parentsWide: true } : {}),
      ...(d.noBranding === true ? { noBranding: true } : {}),
      ...(str(d.brandLine, 80) ? { brandLine: str(d.brandLine, 80) } : {}),
      ...(d.padDay === true ? { padDay: true } : {}),
      ...(d.occasion === "engagement" || d.occasion === "reception" ? { occasion: d.occasion as "engagement" | "reception" } : {}),
      ...(d.namesFirst === true ? { namesFirst: true } : {}),
      ...(d.boldEvents === true ? { boldEvents: true } : {}),
      ...(typeof d.nameScale === "number" && d.nameScale >= 0.45 && d.nameScale < 1 ? { nameScale: Math.round(d.nameScale * 100) / 100 } : {}),
      ...(d.tapAnywhere === true ? { tapAnywhere: true } : {}),
      ...(d.noMapSearch === true ? { noMapSearch: true } : {}),
      ...(typeof d.seal === "string" && /^\/art\/seals\/[\w-]+\.(png|jpg|webp)$/.test(d.seal) ? { seal: d.seal } : {}),
      ...(d.sealFull === true ? { sealFull: true } : {}),
      ...(d.doors === "maroon" ? { doors: "maroon" as const } : {}),
      ...(typeof d.invocationArt === "string" && /^\/art\/seals\/[\w-]+\.(png|webp)$/.test(d.invocationArt) ? { invocationArt: d.invocationArt } : {}),
      ...(d.hideHeroDate === true ? { hideHeroDate: true } : {}),
      ...(d.hideHeroCity === true ? { hideHeroCity: true } : {}),
      ...(d.hideHeroHosts === true ? { hideHeroHosts: true } : {}),
      ...(d.hideCountdownCity === true ? { hideCountdownCity: true } : {}),
      ...(typeof d.closingNote === "string" && d.closingNote.trim() ? { closingNote: str(d.closingNote, 120) } : {}),
      ...(typeof d.openingLine === "string" && d.openingLine.trim() ? { openingLine: str(d.openingLine, 80) } : {}),
      ...(d.justifyMessage === true ? { justifyMessage: true } : {}),
      ...(d.closingLines === true ? { closingLines: true } : {}),
      ...(d.venueLines === true ? { venueLines: true } : {}),
      ...(d.invocationLines === true ? { invocationLines: true } : {}),
      ...(typeof d.closingNames === "string" && d.closingNames.trim() ? { closingNames: str(d.closingNames, 60) } : {}),
      ...(d.hostsLines === true ? { hostsLines: true } : {}),
      ...(d.words && typeof d.words === "object" && !Array.isArray(d.words)
        ? {
            words: Object.fromEntries(
              Object.entries(d.words as Record<string, unknown>)
                .filter(([k, v]) => /^[a-zA-Z]{2,30}$/.test(k) && typeof v === "string")
                .slice(0, 20)
                .map(([k, v]) => [k, str(v as string, 80)]),
            ),
          }
        : {}),
      ...(d.eventsByDay === true ? { eventsByDay: true } : {}),
      ...(Array.isArray(d.dayNames) && d.dayNames.length ? { dayNames: d.dayNames.slice(0, 10).map((x) => str(x, 30)) } : {}),
      ...(d.lang === "hi" ? { lang: "hi" as const } : {}),
    },
  };
}

// What the order form edits. Anything else on an order was set by us for one couple (a seal, a
// custom heading, "Dr." on the cover…), and a form save or an approved change must never drop it.
const FORM_FIELDS = new Set(["bride", "groom", "lead", "invocation", "invocationMeaning", "hosts", "message", "date", "city", "hashtag", "events", "rsvp", "closing", "music", "hide", "font", "lang"]);
const FORM_PERSON_FIELDS = new Set(["first", "full", "parents"]);
// Form fields that are left out when empty rather than sent blank, so a gap means "unchanged".
const KEPT_IF_MISSING = ["lang"] as const;

/**
 * `next` from a form, with every setting from `prev` that the form doesn't edit carried over:
 * at the top level and on each person. New per-invite settings are kept automatically.
 */
export function keepInviteSettings(prev: InviteDetails | null | undefined, next: InviteDetails): InviteDetails {
  if (!prev) return next;
  const out = { ...next } as Record<string, unknown>;
  const old = prev as unknown as Record<string, unknown>;
  for (const [k, v] of Object.entries(old)) if (!FORM_FIELDS.has(k) && out[k] === undefined && v !== undefined) out[k] = v;
  for (const k of KEPT_IF_MISSING) if (out[k] === undefined && old[k] !== undefined) out[k] = old[k];
  for (const who of ["bride", "groom"] as const) {
    const was = (prev[who] ?? {}) as unknown as Record<string, unknown>;
    const now = { ...(out[who] as Record<string, unknown>) };
    for (const [k, v] of Object.entries(was)) if (!FORM_PERSON_FIELDS.has(k) && now[k] === undefined && v !== undefined) now[k] = v;
    out[who] = now;
  }
  // The form edits a function's own fields; a schedule set by us stays with the function of the
  // same name.
  const schedules = new Map(prev.events.filter((e) => e.schedule).map((e) => [e.name.trim().toLowerCase(), e.schedule]));
  if (schedules.size)
    out.events = next.events.map((e) => {
      const schedule = schedules.get(e.name.trim().toLowerCase());
      return schedule && !e.schedule ? { ...e, schedule } : e;
    });
  return out as InviteDetails;
}

/** Digits with the country code. Ten digits are an Indian mobile; a leading + means the code is already there. */
export function cleanPhone(v: unknown) {
  const raw = str(v, 30).normalize("NFKC").replace(/[^\d+]/g, "");
  const digits = raw.replace(/\D/g, "");
  if (raw.startsWith("+")) return digits;
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

/** Only files uploaded through our signed URLs: a song in uploads/, photos in moments/ (at most 8). */
export const cleanSongPath = (v: unknown) => (typeof v === "string" && /^uploads\/[0-9a-f-]{36}\.[a-z0-9]{1,5}$/.test(v) ? v : null);
export const cleanPhotoPaths = (v: unknown) =>
  (Array.isArray(v) ? v : []).filter((x): x is string => typeof x === "string" && /^moments\/[0-9a-f-]{36}\.(jpg|png|webp)$/.test(x)).slice(0, 8);
