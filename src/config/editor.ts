// What a couple can change themselves in the invite editor (/customise/<order>), part by part.
// One entry here is all a new option needs: the editor draws it, and the save keeps only these keys
// (cleanEdits in src/lib/editor-clean.ts), each within its limits.

import type { SectionId } from "@/config/customise";
import type { Invite, Person } from "@/data/invites";

/** Designs the editor is open for. */
export const EDITOR_DESIGNS = ["mandir", "gaurishankar"] as const;
export const hasEditor = (template: string) => (EDITOR_DESIGNS as readonly string[]).includes(template);

type Design = (typeof EDITOR_DESIGNS)[number];
/** What a field needs to know to show its starting text. */
export type Ctx = { invite: Invite; lang: "en" | "hi"; design: string; word: (key: string) => string };

type Base = {
  /** A path into the details: "heroKicker", "words.eventsTitle", or on a person "elders". */
  key: string;
  label: string;
  help?: string;
  only?: Design[];
  /** Shown only when this is true (e.g. the grandparents' placement once there are grandparents). */
  when?: (ctx: Ctx, person?: Person) => boolean;
};

export type Field =
  | (Base & {
      kind: "text";
      max: number;
      multiline?: boolean;
      /** What the invite prints when the couple hasn't written their own. */
      fallback?: (ctx: Ctx) => string;
      /** Clearing it hides the line, instead of going back to the design's wording. */
      emptyHides?: boolean;
      /** One of the couple's own details (always a string, "" allowed), not an optional setting. */
      core?: boolean;
      /** Quick picks under the box. */
      suggestions?: string[];
      placeholder?: string;
    })
  // `invert`: the switch reads "Show …" for a setting stored as "hide…".
  | (Base & { kind: "toggle"; invert?: boolean })
  | (Base & { kind: "choice"; options: { value: string | boolean; label: string }[]; current?: (ctx: Ctx, person?: Person) => string | boolean; fallback: string | boolean })
  | (Base & { kind: "slider"; min: number; max: number; step: number; fallback: number })
  // A part of the invite that can be turned off (stored in `hide`).
  | (Base & { kind: "show"; section: SectionId })
  // Headings with lines under them at the end (`extras`).
  | (Base & { kind: "lists" })
  // The wedding's date and time (`date`), or a day (e.g. `rsvp.by`).
  | (Base & { kind: "datetime" })
  | (Base & { kind: "date" })
  // A mobile number (e.g. `rsvp.phone`).
  | (Base & { kind: "phone" })
  // The functions: add, remove, reorder, and every detail of each (`events`).
  | (Base & { kind: "functions" })
  // The couple's photos (the order's photo_paths, not the details).
  | (Base & { kind: "photos" })
  // The font style (`font`).
  | (Base & { kind: "font" })
  // People guests can call (`contacts`).
  | (Base & { kind: "contacts" })
  // The bride's and the groom's family lines, each with these fields.
  | (Base & { kind: "people"; fields: Field[] });

export type EditorSection = { id: string; title: string; note?: string; fields: Field[]; optional?: SectionId };

const w = (key: string) => (ctx: Ctx) => ctx.word(key);
const en = (ctx: Ctx, english: string, k: string) => (ctx.lang === "hi" ? ctx.word(k) : english);
const names = (ctx: Ctx) => {
  const [a, b] = ctx.invite.lead === "bride" ? [ctx.invite.bride, ctx.invite.groom] : [ctx.invite.groom, ctx.invite.bride];
  return [a.first, b.first];
};

/** Kicker (small line) and title of a part whose words come from the design's fixed wording. */
const heading = (kicker: string, title: string, kickerFallback?: (c: Ctx) => string, titleFallback?: (c: Ctx) => string): Field[] => [
  { kind: "text", key: `words.${kicker}`, label: "Small line above the heading", max: 60, emptyHides: true, fallback: kickerFallback ?? w(kicker), help: "Clear it to hide the line." },
  { kind: "text", key: `words.${title}`, label: "Heading", max: 60, fallback: titleFallback ?? w(title) },
];

export const editorSections: EditorSection[] = [
  {
    id: "cover",
    title: "Cover",
    note: "The first screen guests see.",
    fields: [
      { kind: "text", key: "groom.first", label: "Groom's name", max: 40, core: true, help: "As it should appear on the cover." },
      { kind: "text", key: "bride.first", label: "Bride's name", max: 40, core: true },
      {
        kind: "choice",
        key: "lead",
        label: "Whose name comes first",
        options: [
          { value: "groom", label: "Groom's" },
          { value: "bride", label: "Bride's" },
        ],
        fallback: "groom",
        current: (c) => c.invite.lead ?? "groom",
      },
      { kind: "datetime", key: "date", label: "Wedding date & time", help: "The countdown runs to this." },
      { kind: "text", key: "city", label: "City", max: 80, core: true, placeholder: "e.g. Jaipur, Rajasthan" },
      { kind: "text", key: "invocation", label: "Blessing at the top", max: 120, core: true, placeholder: "|| श्री गणेशाय नमः ||" },
      { kind: "toggle", key: "invocationLines", label: "Blessing on separate lines", help: "A new line after each “।”.", only: ["gaurishankar"] },
      { kind: "text", key: "invocationMeaning", label: "Line under the blessing", max: 120, core: true, placeholder: "With the blessings of Lord Ganesha", only: ["gaurishankar"] },
      {
        kind: "text",
        key: "heroKicker",
        label: "Line above the names",
        max: 80,
        emptyHides: true,
        fallback: (c) => (c.design === "gaurishankar" ? (c.lang === "hi" ? "आप सपरिवार सादर आमंत्रित हैं" : "We cordially invite you to the wedding of") : ""),
        placeholder: "e.g. The wedding of",
        suggestions: ["The wedding of", "Together with their families", "Save the date for"],
      },
      {
        kind: "text",
        key: "joiner",
        label: "Word between the names",
        max: 12,
        fallback: (c) => (c.design === "gaurishankar" ? (c.lang === "hi" ? "एवं" : "&") : c.invite.occasion === "engagement" ? "&" : c.word("weds")),
        suggestions: ["weds", "&", "with"],
      },
      { kind: "slider", key: "nameScale", label: "Size of the names", min: 0.45, max: 1, step: 0.05, fallback: 1, only: ["mandir"], help: "Make long names smaller so they fit." },
      { kind: "toggle", key: "stackNames", label: "Names one below the other", only: ["gaurishankar"] },
      { kind: "toggle", key: "hideHeroDate", label: "Show the date", invert: true },
      { kind: "toggle", key: "hideHeroCity", label: "Show the city", invert: true },
    ],
  },
  {
    id: "blessing",
    title: "Families & message",
    fields: [
      { kind: "text", key: "invocationMeaning", label: "Blessing line", max: 120, core: true, placeholder: "With the blessings of Lord Ganesha", only: ["mandir"] },
      {
        kind: "choice",
        key: "blessingTop",
        label: "Where the blessing line sits",
        options: [
          { value: true, label: "At the top" },
          { value: false, label: "Under the names" },
        ],
        fallback: true,
        only: ["mandir"],
      },
      { kind: "text", key: "hosts", label: "Families' line", max: 400, multiline: true, core: true, fallback: (c) => en(c, "Together with their families", "togetherWithFamilies") },
      { kind: "toggle", key: "hostsLines", label: "One family per line", help: "Splits the line at each “&”.", only: ["mandir"] },
      { kind: "text", key: "message", label: "Invitation message", max: 400, multiline: true, core: true },
      { kind: "toggle", key: "justifyMessage", label: "Straight edges on the message", only: ["gaurishankar"] },
      { kind: "toggle", key: "namesFirst", label: "Each name above its family's line", only: ["mandir"] },
      {
        kind: "people",
        key: "people",
        label: "Parents & grandparents",
        fields: [
          { kind: "text", key: "full", label: "Full name", max: 80, core: true, help: "The name printed with the families." },
          { kind: "text", key: "parents", label: "Parents' line", max: 160, multiline: true, core: true, placeholder: "Daughter of Mrs. & Mr. …" },
          { kind: "text", key: "elders", label: "Grandparents' line", max: 200, multiline: true, placeholder: "Grandson / Granddaughter of Smt. & Shri …", help: "Optional. Press Enter for a new line." },
          {
            kind: "choice",
            key: "eldersBelow",
            label: "Grandparents' line goes",
            options: [
              { value: false, label: "Above the parents" },
              { value: true, label: "Below the parents" },
            ],
            fallback: false,
            when: (_, p) => !!p?.elders,
          },
          {
            kind: "choice",
            key: "eldersPlain",
            label: "Grandparents' line style",
            options: [
              { value: false, label: "Small capitals" },
              { value: true, label: "Like the parents' line" },
            ],
            // Gauri Shankar sets a line below the parents like theirs unless told otherwise.
            current: (c, p) => p?.eldersPlain ?? (c.design === "gaurishankar" && !!p?.eldersBelow),
            fallback: false,
            when: (_, p) => !!p?.elders,
          },
        ],
      },
    ],
  },
  {
    id: "scratch",
    title: "Save the date",
    optional: "scratch",
    fields: [{ kind: "show", key: "hide", section: "scratch", label: "Show this part" }, ...heading("scratchKicker", "scratchTitle")],
  },
  {
    id: "countdown",
    title: "Countdown",
    optional: "countdown",
    fields: [
      { kind: "show", key: "hide", section: "countdown", label: "Show this part" },
      { kind: "text", key: "words.countdownKicker", label: "Small line above the heading", max: 60, emptyHides: true, fallback: w("countdownKicker"), help: "Clear it to hide the line." },
      { kind: "text", key: "countdownTitle", label: "Heading", max: 60, fallback: w("countdownTitle") },
    ],
  },
  {
    id: "events",
    title: "Functions",
    fields: [
      { kind: "functions", key: "events", label: "Your functions", help: "Add each function guests are invited to, in order." },
      ...heading(
        "eventsKicker",
        "eventsTitle",
        (c) => (c.design === "gaurishankar" ? en(c, "Join us for", "eventsKicker") : c.word("eventsKicker")),
        (c) => (c.design === "gaurishankar" ? en(c, "The celebrations", "eventsTitle") : c.word("eventsTitle")),
      ),
      { kind: "toggle", key: "boldEvents", label: "Bolder function details", help: "Easier to read for older guests.", only: ["mandir"] },
      { kind: "toggle", key: "eventsByDay", label: "One card per day", help: "Functions on the same day share a card.", only: ["mandir"] },
      { kind: "toggle", key: "venueLines", label: "Venue on separate lines", help: "Splits the venue at each comma.", only: ["gaurishankar"] },
      {
        kind: "choice",
        key: "eventOm",
        label: "Om on the cards",
        options: [
          { value: false, label: "None" },
          { value: "maroon", label: "Maroon" },
          { value: "gold", label: "Gold" },
        ],
        current: (c) => (c.invite.eventOm === true ? "maroon" : (c.invite.eventOm ?? false)),
        fallback: false,
        only: ["gaurishankar"],
      },
      { kind: "toggle", key: "noMapSearch", label: "Directions only where you gave a map link", help: "For venues like “our residence” that maps can't find." },
    ],
  },
  {
    id: "gallery",
    title: "Photos",
    optional: "gallery",
    fields: [{ kind: "show", key: "hide", section: "gallery", label: "Show this part" }, { kind: "photos", key: "photos", label: "Your photos", help: "Up to 8. Guests swipe through them as polaroids." }, ...heading("momentsKicker", "momentsTitle")],
  },
  {
    id: "contacts",
    title: "Contacts",
    note: "People guests can call or message.",
    fields: [{ kind: "contacts", key: "contacts", label: "Contacts" }, ...heading("contactKicker", "contactTitle")],
  },
  {
    id: "rsvp",
    title: "RSVP",
    optional: "rsvp",
    fields: [
      { kind: "show", key: "hide", section: "rsvp", label: "Show this part" },
      { kind: "phone", key: "rsvp.phone", label: "WhatsApp number for replies", help: "Guests' replies come to this number." },
      { kind: "date", key: "rsvp.by", label: "Reply by" },
      { kind: "text", key: "words.rsvpKicker", label: "Small line above the heading", max: 60, emptyHides: true, fallback: w("rsvpKicker"), help: "Clear it to hide the line." },
      { kind: "text", key: "rsvpTitle", label: "Heading", max: 60, fallback: w("rsvpTitle") },
      { kind: "text", key: "rsvpLead", label: "Line under the heading", max: 160, placeholder: "e.g. with your blessings" },
      { kind: "toggle", key: "rsvpPlain", label: "No ornament under the heading", only: ["mandir"] },
    ],
  },
  {
    id: "closing",
    title: "Ending",
    fields: [
      { kind: "text", key: "closing", label: "Closing message", max: 240, multiline: true, core: true },
      { kind: "toggle", key: "closingLines", label: "One sentence per line", only: ["gaurishankar"] },
      {
        kind: "text",
        key: "closingNames",
        label: "Names at the end",
        max: 80,
        fallback: (c) => names(c).join(c.lang === "hi" ? " एवं " : " & "),
        only: ["mandir"],
        placeholder: "e.g. The Sharma & Verma families",
      },
      { kind: "text", key: "hashtag", label: "Hashtag", max: 60, core: true, placeholder: "#AaravWedsMeera" },
      { kind: "lists", key: "extras", label: "Extra sections", help: "A heading with names under it, e.g. “Our Associates” or “With best compliments from”." },
    ],
  },
];

/** The look of the whole invite, from the editor's "Style" button. */
export const lookFields: Field[] = [
  { kind: "font", key: "font", label: "Font style" },
  {
    kind: "choice",
    key: "lang",
    label: "Language of the invite's own words",
    help: "Headings, dates and buttons. What you type stays as you type it.",
    options: [
      { value: "en", label: "English" },
      { value: "hi", label: "हिन्दी" },
    ],
    current: (c) => (c.invite.lang === "hi" ? "hi" : "en"),
    fallback: "en",
  },
  {
    kind: "choice",
    key: "textStyle",
    label: "Text",
    options: [
      { value: "normal", label: "Normal" },
      { value: "clear", label: "Clearer" },
      { value: "bold", label: "Bold" },
    ],
    current: (c) => (c.invite.boldText ? "bold" : c.invite.readable ? "clear" : "normal"),
    fallback: "normal",
    help: "Clearer makes faded text solid; Bold makes it heavier too.",
  },
  { kind: "toggle", key: "largeText", label: "Larger text everywhere" },
];

/** The fields that apply to a design. */
export const fieldsFor = (fields: Field[], design: string) => fields.filter((f) => !f.only || (f.only as string[]).includes(design));

/** The parts of the invite the editor offers on a design. */
export const sectionsFor = (design: string) => editorSections.map((s) => ({ ...s, fields: fieldsFor(s.fields, design) }));

/* ───────── Paths into the details ───────── */

export function getAt(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined), obj);
}

/** A copy of `obj` with `path` set, or removed when `value` is undefined (and empty objects on the way dropped). */
export function setAt<T>(obj: T, path: string, value: unknown): T {
  const [k, ...rest] = path.split(".");
  const o = { ...(obj as Record<string, unknown>) };
  if (rest.length) {
    const inner = setAt((o[k] as object) ?? {}, rest.join("."), value) as Record<string, unknown>;
    if (Object.keys(inner).length) o[k] = inner;
    else delete o[k];
  } else if (value === undefined) delete o[k];
  else o[k] = value;
  return o as T;
}
