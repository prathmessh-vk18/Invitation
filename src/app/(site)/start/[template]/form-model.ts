import type { EventKind, Invite } from "@/data/invites";

/* ───────── State ───────── */

export type Person = { first: string; full: string; parents: string };
export type EventRow = { kind: EventKind; name: string; date: string; time: string; venue: string; address: string; dress: string; note: string };
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
};

export const LIMITS = { name: 40, fullName: 80, parents: 160, city: 80, message: 400, closing: 240, venue: 120, address: 200 };

const emptyPerson: Person = { first: "", full: "", parents: "" };
export const blankEvent = (kind: EventKind = "phere", name = ""): EventRow => ({ kind, name, date: "", time: "", venue: "", address: "", dress: "", note: "" });

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
  };
}

/* ───────── Steps ───────── */

export const steps = [
  { id: "couple", title: "The couple", note: "Whose wedding is it? Names appear on the invite exactly as you type them." },
  { id: "wedding", title: "Date & place", note: "The countdown on the invite runs to this time." },
  { id: "functions", title: "Functions", note: "Each one gets its own card with directions and a save-the-date button." },
  { id: "wording", title: "Wording", note: "We've started you with lines that suit this design. Change anything, or keep them.", optional: true },
  { id: "music", title: "Your song", note: "It plays when guests open the invite. Skip it and the design plays its own soft music.", optional: true },
  { id: "contact", title: "Your contact", note: "We'll message you here with payment details and your invite link." },
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
  if (!s.weddingTime) e.weddingTime = "Add the ceremony time. Approximate is fine.";
  if (!s.city.trim()) e.city = "Enter the city, e.g. Udaipur, Rajasthan.";

  if (!s.events.length) e.events = "Add at least one function.";
  s.events.forEach((ev, i) => {
    const k = `events.${i}`;
    if (!ev.name.trim()) e[`${k}.name`] = "Give this function a name, e.g. Haldi.";
    if (!ev.date) e[`${k}.date`] = "Pick a date.";
    else if (today && ev.date < today) e[`${k}.date`] = "This date has already passed.";
    else if (s.weddingDate && ev.date > addDays(s.weddingDate, 10)) e[`${k}.date`] = "This is well after the wedding. Check the date.";
    if (!ev.time) e[`${k}.time`] = "Add a time.";
    if (!ev.venue.trim()) e[`${k}.venue`] = "Enter the venue name.";
  });

  if (s.message.length > LIMITS.message) e.message = `Keep it under ${LIMITS.message} characters.`;
  if (s.closing.length > LIMITS.closing) e.closing = `Keep it under ${LIMITS.closing} characters.`;

  if (!s.customer.name.trim()) e["customer.name"] = "Enter your name.";
  const phone = phoneError(s.customer.phone, "Enter your WhatsApp number. We'll send your link here.");
  if (phone) e["customer.phone"] = phone;
  if (s.customer.email.trim() && !EMAIL.test(s.customer.email.trim())) e["customer.email"] = "Check the email address, e.g. name@gmail.com.";
  if (!s.rsvpSame) {
    const rsvp = phoneError(s.rsvpPhone, "Enter the number guests should RSVP to.");
    if (rsvp) e.rsvpPhone = rsvp;
  }
  if (s.rsvpBy && s.weddingDate && s.rsvpBy > s.weddingDate) e.rsvpBy = "Pick a date before the wedding.";
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
    events: s.events.map((e) => ({ kind: e.kind, name: e.name, start: iso(e.date, e.time), venue: e.venue, address: e.address, dress: e.dress, note: e.note })),
    rsvp: { phone: mobile10(rsvp), by: s.rsvpBy ? iso(s.rsvpBy, "00:00") : "", contact: s.hosts },
    closing: s.closing,
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
