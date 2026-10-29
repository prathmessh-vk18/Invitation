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
  { kind: "haldi", label: "Haldi / Maiyan" },
  { kind: "mehndi", label: "Mehndi / Engagement" },
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

/** "Aarav", "Meera" → "aarav-weds-meera"; ASCII letters, digits and hyphens only. */
export function suggestSlug(d: InviteDetails) {
  const [a, b] = d.lead === "groom" ? [d.groom.first, d.bride.first] : [d.bride.first, d.groom.first];
  const clean = (s: string) =>
    s
      .normalize("NFKD")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .toLowerCase()
      .replace(/[\s_]+/g, "-");
  return [clean(a), "weds", clean(b)].filter(Boolean).join("-").replace(/-+/g, "-");
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
    return { first, full: str(o.full, 80) || first, parents: str(o.parents, 160) };
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
      note: str(o.note, 160) || undefined,
      ...(mapUrl ? { mapUrl } : {}),
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
  const rsvpPhone = str(rsvp.phone, 20).replace(/\D/g, "");
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
        phone: rsvpPhone.length === 10 ? `91${rsvpPhone}` : rsvpPhone,
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
      ...(typeof d.seal === "string" && /^\/art\/seals\/[\w-]+\.(png|jpg|webp)$/.test(d.seal) ? { seal: d.seal } : {}),
      ...(d.lang === "hi" ? { lang: "hi" as const } : {}),
    },
  };
}

export function cleanPhone(v: unknown) {
  const digits = str(v, 20).replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

/** Only files uploaded through our signed URLs: a song in uploads/, photos in moments/ (at most 8). */
export const cleanSongPath = (v: unknown) => (typeof v === "string" && /^uploads\/[0-9a-f-]{36}\.[a-z0-9]{1,5}$/.test(v) ? v : null);
export const cleanPhotoPaths = (v: unknown) =>
  (Array.isArray(v) ? v : []).filter((x): x is string => typeof x === "string" && /^moments\/[0-9a-f-]{36}\.(jpg|png|webp)$/.test(x)).slice(0, 8);
