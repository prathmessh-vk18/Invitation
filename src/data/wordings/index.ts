import { engagementPages } from "./engagement";
import { haldiPages } from "./haldi";
import { mehndiPages } from "./mehndi";
import { sangeetPages } from "./sangeet";
import type { WordingFunction, WordingLang, WordingPage, WordingTone } from "./types";
import { weddingPages } from "./wedding";

export type { Wording, WordingFunction, WordingLang, WordingPage, WordingTone } from "./types";

/**
 * Whether the wording pages and free tools are open to search engines: in the sitemap, indexable and
 * linked from the footer. Off while a batch is being reviewed; the pages still open by link.
 */
export const WORDING_LIVE = false;

export const wordingPages: WordingPage[] = [...haldiPages, ...mehndiPages, ...sangeetPages, ...engagementPages, ...weddingPages];

export const getWordingPage = (slug: string) => wordingPages.find((p) => p.slug === slug);

export const FUNCTIONS: { id: WordingFunction; name: string; hi: string; guide?: string }[] = [
  { id: "haldi", name: "Haldi", hi: "हल्दी", guide: "haldi-invitation-wording" },
  { id: "mehndi", name: "Mehndi", hi: "मेहंदी", guide: "mehndi-invitation-wording" },
  { id: "sangeet", name: "Sangeet", hi: "संगीत", guide: "sangeet-invitation-wording" },
  { id: "engagement", name: "Engagement", hi: "सगाई" },
  { id: "wedding", name: "Wedding", hi: "विवाह", guide: "wedding-invitation-wording-guide" },
];
export const fnName = (fn: WordingFunction) => FUNCTIONS.find((f) => f.id === fn)!.name;

export const TONES: { id: WordingTone; name: string; note: string }[] = [
  { id: "traditional", name: "Traditional", note: "Warm, card-style wording" },
  { id: "whatsapp", name: "For WhatsApp", note: "Short messages to forward" },
  { id: "family", name: "From parents", note: "The family invites" },
  { id: "fun", name: "Funny", note: "Light-hearted, for friends" },
];
export const LANGS: { id: WordingLang; name: string }[] = [
  { id: "en", name: "English" },
  { id: "hi", name: "Hindi" },
];

export const findPage = (fn: WordingFunction, lang: WordingLang, tone: WordingTone) => wordingPages.find((p) => p.fn === fn && p.lang === lang && p.tone === tone);

/** The details a wording is filled with: sample ones on the page, the couple's own in the generator. */
export type Fill = { bride: string; groom: string; family: string; date: string; time: string; venue: string };
export const SAMPLE: Record<WordingLang, Fill> = {
  en: { bride: "Meera", groom: "Aarav", family: "Sharma family", date: "Sunday, 12 January", time: "11:00 am", venue: "Sharma Residence, Jaipur" },
  hi: { bride: "मीरा", groom: "आरव", family: "शर्मा परिवार", date: "रविवार, 12 जनवरी", time: "प्रातः 11 बजे", venue: "शर्मा निवास, जयपुर" },
};

/** The wording split into plain text and filled-in parts, so a page can mark what changes. */
export function fillParts(text: string, values: Partial<Fill>): { text: string; filled: boolean }[] {
  return text.split(/(\{(?:bride|groom|family|date|time|venue)\})/).filter(Boolean).map((part) => {
    const m = part.match(/^\{(\w+)\}$/);
    if (!m) return { text: part, filled: false };
    const v = values[m[1] as keyof Fill]?.trim();
    return { text: v || part, filled: true };
  });
}
export const fill = (text: string, values: Partial<Fill>) => fillParts(text, values).map((p) => p.text).join("");

/** Pages to suggest from one: the same function in the other tones and language, then the same tone for other functions. */
export function relatedPages(p: WordingPage) {
  const sameFn = wordingPages.filter((x) => x.fn === p.fn && x.slug !== p.slug);
  const sameTone = wordingPages.filter((x) => x.fn !== p.fn && x.tone === p.tone && x.lang === p.lang);
  return { sameFn, sameTone };
}
