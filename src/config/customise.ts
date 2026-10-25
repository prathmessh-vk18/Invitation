// What a couple can change on any design without touching the design itself.

/* ───────── Sections ───────── */

// Optional parts of an invite. The cover, wording, functions and closing always show.
export const sections = [
  { id: "scratch", name: "Scratch to reveal the date", note: "Guests scratch a foil to see the date, with a flower shower." },
  { id: "countdown", name: "Countdown", note: "Days, hours and minutes to the wedding." },
  { id: "gallery", name: "Our moments", note: "Your photos as polaroids guests can swipe through." },
  { id: "rsvp", name: "RSVP", note: "Guests reply on WhatsApp with their name and headcount." },
] as const;

export type SectionId = (typeof sections)[number]["id"];

export const isSectionId = (v: unknown): v is SectionId => sections.some((s) => s.id === v);

/** Whether an invite shows a section. Everything shows unless the couple hid it. */
export const shows = (invite: { hide?: string[] }, id: SectionId) => !invite.hide?.includes(id);

/* ───────── Font styles ───────── */

// Each style sets the three type roles every design uses:
// script (the couple's names and big titles), serif (body text) and label (small capitals).
// Regional scripts (Devanagari, Tamil, Gurmukhi, Arabic) keep the design's own fonts.
export type FontStyle = { id: string; name: string; note: string; script: string; serif: string; label: string };

export const fontStyles: FontStyle[] = [
  {
    id: "romantic",
    name: "Romantic",
    note: "Fine calligraphy",
    script: "var(--font-pinyon), cursive",
    serif: "var(--font-cormorant), serif",
    label: "var(--font-marcellus), serif",
  },
  {
    id: "brush",
    name: "Brush script",
    note: "Hand-lettered and lively",
    script: "var(--font-alex-brush), cursive",
    serif: "var(--font-cormorant), serif",
    label: "var(--font-cinzel), serif",
  },
  {
    id: "royal",
    name: "Royal",
    note: "Carved capitals, like a palace card",
    script: "var(--font-cinzel), serif",
    serif: "var(--font-cormorant), serif",
    label: "var(--font-cinzel), serif",
  },
  {
    id: "modern",
    name: "Modern",
    note: "Light, tall and minimal",
    script: "var(--font-italiana), serif",
    serif: "var(--font-cormorant), serif",
    label: "var(--font-manrope), sans-serif",
  },
  {
    id: "festive",
    name: "Festive",
    note: "Bold and celebratory",
    script: "var(--font-rozha), serif",
    serif: "var(--font-cormorant), serif",
    label: "var(--font-marcellus), serif",
  },
  {
    id: "playful",
    name: "Playful",
    note: "Friendly handwriting",
    script: "var(--font-dancing), cursive",
    serif: "var(--font-cormorant), serif",
    label: "var(--font-manrope), sans-serif",
  },
];

export const getFontStyle = (id: unknown) => fontStyles.find((f) => f.id === id);

/** CSS variables that switch an invite to the couple's font style, if they picked one. */
export function fontVars(id: unknown): Record<string, string> {
  const f = getFontStyle(id);
  return f ? { "--inv-script": f.script, "--inv-serif": f.serif, "--inv-label": f.label } : {};
}
