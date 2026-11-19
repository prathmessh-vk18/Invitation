import type { TemplateId } from "../templates";

/**
 * Wording pages (/wording/<slug>): ready-to-copy invitation wordings for one function, in one
 * language and tone. Each answers one search ("haldi invitation message in hindi for whatsapp")
 * with many genuinely different wordings couples can copy or drop into the wording generator.
 *
 * Wordings use placeholders the page fills with sample details and the generator (/tools/
 * invitation-wording-generator) fills with the couple's own:
 *   {bride} {groom}   first names        {family}  the hosting family, e.g. "Sharma family"
 *   {date}  {time}    e.g. "Sunday, 12 January" / "10:30 am"
 *   {venue}           e.g. "Sharma Residence, Pune"
 * Any of them may be left out of a wording; use only what reads naturally.
 */
export type WordingFunction = "haldi" | "mehndi" | "sangeet" | "engagement" | "wedding";
export type WordingLang = "en" | "hi";
export type WordingTone = "traditional" | "whatsapp" | "family" | "fun";

export type Wording = {
  /** A short label above it, e.g. "Warm and simple", "Short for WhatsApp status". */
  label: string;
  /** The wording itself, with placeholders and "\n" between lines. */
  text: string;
};

export type WordingPage = {
  slug: string;
  fn: WordingFunction;
  lang: WordingLang;
  tone: WordingTone;
  /** <title> and H1: the search phrase, written naturally, e.g. "Haldi invitation message in Hindi". */
  title: string;
  /** Meta description, 140–160 characters. */
  description: string;
  /** 2–4 sentences in English: who this page is for and how to use the wordings. */
  intro: string;
  /** 10–15 wordings, each genuinely different (not the same lines reworded). */
  wordings: Wording[];
  /** 3–5 practical tips for this function and tone, in English. */
  tips: string[];
  /** 3–4 questions people ask about this, answered in 1–3 sentences, in English. */
  faqs: { q: string; a: string }[];
  /** 2–3 designs that suit this function (ids from src/data/templates.ts). */
  designs: TemplateId[];
};
