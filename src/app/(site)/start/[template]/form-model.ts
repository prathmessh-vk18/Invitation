import type { SectionId } from "@/config/customise";
import type { EventKind, Invite } from "@/data/invites";
import type { InviteDetails } from "@/lib/orders";
import { isMapUrl, splitMapLink } from "@/lib/format";

/* ───────── State ───────── */

export type Person = { first: string; full: string; parents: string };
// `devanagari` and `end` aren't in the form, but are kept when editing an order that has them.
export type EventRow = { kind: EventKind; name: string; date: string; time: string; venue: string; address: string; mapUrl: string; dress: string; note: string; devanagari?: string; end?: string };
export type FormState = {
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
  rsvpSame: boolean;
  rsvpPhone: string;
  rsvpBy: string;
  customer: { name: string; phone: string; email: string };
  // A chosen Aavjoo track ("synth:…"); an uploaded song replaces it.
  music: string;
  // Optional sections turned off, and the font style ("" = the design's own fonts).
  hide: SectionId[];
  font: string;
  // Not in the form: kept so editing a Hindi invite doesn't turn it back into English.
  lang?: "hi";
};

export const LIMITS = { name: 40, fullName: 80, parents: 160, city: 80, message: 400, closing: 240, venue: 120, address: 200 };

const emptyPerson: Person = { first: "", full: "", parents: "" };
export const blankEvent = (kind: EventKind = "phere", name = ""): EventRow => ({ kind, name, date: "", time: "", venue: "", address: "", mapUrl: "", dress: "", note: "" });

/** Ceremonies whose date and time usually match the wedding's own. */
export const mainCeremonies: EventKind[] = ["phere", "nikah", "anandkaraj", "muhurtham"];

/** Starts from the design's demo so the wording fits its tradition; personal details are left empty. */
export function initialState(demo: Invite): FormState {
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
    rsvpSame: true,
    rsvpPhone: "",
    rsvpBy: "",
    customer: { name: "", phone: "", email: "" },
    music: demo.music ?? "synth:bhupali",
    hide: [],
    font: "",
  };
}

/* ───────── Steps ───────── */

export const steps = [
  { id: "couple", title: "The couple", note: "Whose wedding is it? Names appear on the invite exactly as you type them." },
  { id: "wedding", title: "Date & place", note: "The countdown on the invite runs to this time." },
  { id: "functions", title: "Functions", note: "Each one gets its own card with directions and a save-the-date button." },
  { id: "wording", title: "Wording", note: "We've started you with lines that suit this design. Change anything, or keep them.", optional: true },
  { id: "style", title: "Look & sections", note: "Try a different font style, and turn off any part of the invite you don't want.", optional: true },
  { id: "photos", title: "Our moments", note: "Add up to 8 photos of the two of you. Guests see them as polaroids they can swipe through.", optional: true },
  { id: "music", title: "Your song", note: "It plays softly when guests open the invite. Pick one of ours or upload your own.", optional: true },
  { id: "contact", title: "Your contact", note: "We'll send your invite link here on WhatsApp." },
  { id: "review", title: "Review", note: "Check everything once. You can go back to any step." },
] as const;

export type StepId = (typeof steps)[number]["id"];

/** Which step a field belongs to, from its error key. */
export function stepOf(key: string): StepId {
  if (key.startsWith("bride.") || key.startsWith("groom.")) return "couple";
  if (key === "weddingDate" || key === "weddingTime" || key === "city") return "wedding";
  if (key.startsWith("events")) return "functions";
  if (key.startsWith("customer.") || key.startsWith("rsvp")) return "contact";
  return "wording";
}

/** The input id for an error key, so we can focus the first problem. */
export const idOf = (key: string) => key.replace(/\./g, "-");

/* ───────── Validation ───────── */

const NAME = /^[\p{L}\p{M}][\p{L}\p{M}\s.'-]*$/u;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** The 10-digit Indian mobile number inside what someone typed, or "" if there isn't one. */
export function mobile10(v: string) {
  let d = v.replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  else if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d) ? d : "";
}

function personErrors(p: Person, who: "bride" | "groom", e: Record<string, string>) {
  const label = who === "bride" ? "the bride's" : "the groom's";
  const first = p.first.trim();
  if (!first) e[`${who}.first`] = `Enter ${label} first name.`;
  else if (!NAME.test(first)) e[`${who}.first`] = "Use letters only, without numbers or symbols.";
  else if (first.includes(" ") && first.split(/\s+/).length > 2) e[`${who}.first`] = "Just the first name here. Add the full name below.";
}

function phoneError(v: string, empty: string) {
  if (!v.trim()) return empty;
  if (!mobile10(v)) return "Enter a 10-digit mobile number, e.g. 98765 43210.";
  return "";
}

/**
 * Every problem in the form, keyed by field. `today` is "YYYY-MM-DD" (empty until known,
 * which skips the past-date checks).
 */
export function validate(s: FormState, today: string): Record<string, string> {
  const e: Record<string, string> = {};

  personErrors(s.bride, "bride", e);
  personErrors(s.groom, "groom", e);
  if (s.bride.first.trim() && s.bride.first.trim().toLowerCase() === s.groom.first.trim().toLowerCase()) e["groom.first"] = "The bride's and groom's names are the same. Check for a typo.";

  if (!s.weddingDate) e.weddingDate = "Pick the wedding date.";
  else if (today && s.weddingDate < today) e.weddingDate = "This date has already passed.";
  else if (today && s.weddingDate > `${Number(today.slice(0, 4)) + 3}${today.slice(4)}`) e.weddingDate = "That's more than 3 years away. Check the year.";
  if (!s.weddingTime) e.weddingTime = "Add the wedding time. Approximate is fine.";
  if (!s.city.trim()) e.city = "Enter the city, e.g. Udaipur, Rajasthan.";

  if (!s.events.length) e.events = "Add at least one function.";
  s.events.forEach((ev, i) => {
    const k = `events.${i}`;
    if (!ev.name.trim()) e[`${k}.name`] = ev.kind === "other" ? "Name this function, e.g. Cocktail night." : "Pick which function this is.";
    if (!ev.date) e[`${k}.date`] = "Pick a date.";
    else if (today && ev.date < today) e[`${k}.date`] = "This date has already passed.";
    else if (s.weddingDate && ev.date > addDays(s.weddingDate, 10)) e[`${k}.date`] = "This is well after the wedding. Check the date.";
    if (!ev.time) e[`${k}.time`] = "Add a time.";
    if (!ev.venue.trim()) e[`${k}.venue`] = "Enter the venue name.";
    if (ev.mapUrl?.trim() && !isMapUrl(ev.mapUrl)) e[`${k}.mapUrl`] = "Paste a Google Maps link, e.g. https://maps.app.goo.gl/…";
  });

  if (s.message.length > LIMITS.message) e.message = `Keep it under ${LIMITS.message} characters.`;
  if (s.closing.length > LIMITS.closing) e.closing = `Keep it under ${LIMITS.closing} characters.`;

  if (!s.customer.name.trim()) e["customer.name"] = "Enter your name.";
  const phone = phoneError(s.customer.phone, "Enter your WhatsApp number. We'll send your link here.");
  if (phone) e["customer.phone"] = phone;
  if (s.customer.email.trim() && !EMAIL.test(s.customer.email.trim())) e["customer.email"] = "Check the email address, e.g. name@gmail.com.";
  if (!s.hide.includes("rsvp") && !s.rsvpSame) {
    const rsvp = phoneError(s.rsvpPhone, "Enter the number guests should RSVP to.");
    if (rsvp) e.rsvpPhone = rsvp;
  }
  if (s.hide.includes("rsvp")) {
    // No RSVP section, so its fields don't matter.
  } else if (s.rsvpBy && s.weddingDate && s.rsvpBy > s.weddingDate) e.rsvpBy = "Pick a date before the wedding.";
  else if (s.rsvpBy && today && s.rsvpBy < today) e.rsvpBy = "This date has already passed.";

  return e;
}

export function addDays(date: string, n: number) {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/* ───────── Output ───────── */

const iso = (date: string, time: string) => (date ? `${date}T${time || "12:00"}:00+05:30` : "");

/** The invite exactly as it will be submitted. */
export function toDetails(s: FormState) {
  const rsvp = s.rsvpSame ? s.customer.phone : s.rsvpPhone;
  return {
    bride: { ...s.bride, first: s.bride.first.trim() },
    groom: { ...s.groom, first: s.groom.first.trim() },
    lead: s.lead,
    invocation: s.invocation,
    invocationMeaning: s.invocationMeaning,
    hosts: s.hosts,
    message: s.message,
    date: iso(s.weddingDate, s.weddingTime),
    city: s.city,
    hashtag: s.hashtag,
    events: s.events.map((e) => ({
      kind: e.kind,
      name: e.name,
      start: iso(e.date, e.time),
      venue: e.venue,
      address: e.address,
      mapUrl: splitMapLink(e.mapUrl ?? "").url,
      dress: e.dress,
      note: e.note,
      ...(e.devanagari ? { devanagari: e.devanagari } : {}),
      ...(e.end ? { end: e.end } : {}),
    })),
    rsvp: { phone: mobile10(rsvp), by: s.rsvpBy ? iso(s.rsvpBy, "00:00") : "", contact: s.hosts },
    closing: s.closing,
    music: s.music,
    hide: s.hide,
    font: s.font,
    ...(s.lang ? { lang: s.lang } : {}),
  };
}

/** "2027-02-07T18:30:00+05:30" → { date: "2027-02-07", time: "18:30" }, read in India time. */
function istParts(value?: string) {
  if (!value || Number.isNaN(new Date(value).getTime())) return { date: "", time: "" };
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
      .formatToParts(new Date(value))
      .map((x) => [x.type, x.value]),
  );
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}` };
}

/** An order's saved details back as form fields, for editing it. */
export function fromDetails(d: InviteDetails, demo: Invite, customer: FormState["customer"]): FormState {
  const wedding = istParts(d.date);
  const rsvp = d.rsvp.phone.replace(/^91(?=\d{10}$)/, "");
  const own = mobile10(customer.phone);
  return {
    ...initialState(demo),
    lead: d.lead,
    bride: { first: d.bride.first, full: d.bride.full === d.bride.first ? "" : d.bride.full, parents: d.bride.parents },
    groom: { first: d.groom.first, full: d.groom.full === d.groom.first ? "" : d.groom.full, parents: d.groom.parents },
    weddingDate: wedding.date,
    weddingTime: wedding.time,
    city: d.city,
    invocation: d.invocation,
    invocationMeaning: d.invocationMeaning,
    hosts: d.hosts,
    message: d.message,
    closing: d.closing,
    hashtag: d.hashtag ?? "",
    events: d.events.map((e) => {
      const start = istParts(e.start);
      return {
        kind: e.kind,
        name: e.name,
        date: start.date,
        time: start.time,
        venue: e.venue,
        address: e.address ?? "",
        mapUrl: e.mapUrl ?? "",
        dress: e.dress ?? "",
        note: e.note ?? "",
        ...(e.devanagari ? { devanagari: e.devanagari } : {}),
        ...(e.end ? { end: e.end } : {}),
      };
    }),
    rsvpSame: !rsvp || rsvp === own,
    rsvpPhone: rsvp === own ? "" : rsvp,
    rsvpBy: d.rsvp.by && d.rsvp.by !== d.date ? istParts(d.rsvp.by).date : "",
    customer,
    music: d.music ?? initialState(demo).music,
    hide: (d.hide ?? []) as FormState["hide"],
    font: d.font ?? "",
    ...(d.lang === "hi" ? { lang: "hi" as const } : {}),
  };
}

/** The same invite with friendly stand-ins for anything not filled yet, for the live preview. */
export function toPreview(s: FormState, demo: Invite): Invite {
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
    hide: s.hide,
    font: s.font || undefined,
    ...(s.lang ? { lang: s.lang } : {}),
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
