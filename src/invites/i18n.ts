"use client";

import { createContext, useContext, type CSSProperties } from "react";
import { fmtDate } from "@/lib/format";

/**
 * The words an invite prints around the couple's own details, in English or Hindi.
 * An invite is in Hindi when its details carry `lang: "hi"` (set by an admin for now).
 */
export type Lang = "en" | "hi";

const en = {
  tapToOpen: "Tap to open",
  scroll: "Scroll",
  scrollToWalkIn: "Scroll to walk in",
  scrollToSeeMore: "Scroll to see more",
  tapSeal: "Tap the seal to open",
  tapDoors: "Tap the seal to open the doors",
  tapRing: "Tap the ring to open",
  tapMoon: "Tap the moon to open",
  tapKolam: "Tap the kolam to step inside",
  tapDupatta: "Tap to open the dupatta",
  tapCircle: "Tap the circle to open",
  tapAnywhere: "Tap anywhere to open",
  weds: "weds",
  and: "and",
  togetherWithFamilies: "Together with their families",
  eventsKicker: "Mark your calendar",
  eventsTitle: "On the following events",
  onwards: (t: string) => `${t} onwards`,
  dress: (d: string) => `Dress: ${d}`,
  directions: "Directions",
  saveDate: "Save date",
  countdownKicker: "Counting down",
  countdownTitle: "Until we say “I do”",
  justMarried: "Just married!",
  units: ["Days", "Hours", "Minutes", "Seconds"],
  storyKicker: "Our story",
  storyTitle: "How it began",
  momentsKicker: "Our moments",
  momentsTitle: "Before the big day",
  contactKicker: "For any queries",
  contactTitle: "Get in touch",
  call: (name: string, phone: string) => `Call ${name} on ${phone}`,
  whatsapp: (name: string, phone: string) => `WhatsApp ${name} on ${phone}`,
  photoOf: (i: number, n: number) => `Open photo ${i} of ${n}`,
  tapOutside: "tap outside to close",
  scratchKicker: "A little surprise",
  scratchTitle: "Save the date",
  scratchFoil: "✦  SCRATCH TO REVEAL THE DATE  ✦",
  scratchAria: "Scratch to reveal the wedding date",
  revealInstead: "Tap here to reveal instead",
  rsvpKicker: "RSVP",
  rsvpTitle: "Will you join us?",
  replyBy: (d: string) => `Kindly reply by ${d}`,
  accept: "Joyfully accept",
  decline: "Regretfully decline",
  yourName: "Your name",
  namePlaceholder: "e.g. Sharma family",
  guests: "Number of guests",
  attendingAt: "Celebrating with us at",
  tapToPick: "Tap each function you'll attend",
  pickOne: "Tap the functions you'll attend, then send.",
  stayNeeded: "Accommodation needed?",
  stayDays: "For how many days?",
  yes: "Yes",
  no: "No",
  rsvpStay: (days: number) => `Accommodation: Yes, ${days} ${days === 1 ? "day" : "days"}`,
  rsvpNoStay: "Accommodation: Not needed",
  note: "A note for the couple",
  optional: "Optional",
  sendRsvp: "Send RSVP on WhatsApp",
  rsvpYes: (a: string, b: string, name: string, guests: number, events: string) => [
    `Namaste! RSVP for ${a} & ${b}'s wedding 🌸`,
    `Name: ${name}`,
    `Guests: ${guests}`,
    `Attending: ${events || "—"}`,
  ],
  rsvpNo: (a: string, b: string, name: string) => [`Namaste! RSVP for ${a} & ${b}'s wedding`, `Name: ${name}`, `Sadly we can't make it, but sending all our love 🙏`],
  rsvpNote: (n: string) => `Note: ${n}`,
};

const hi: typeof en = {
  tapToOpen: "खोलने के लिए स्पर्श करें",
  scroll: "आगे देखें",
  scrollToWalkIn: "मंदिर की ओर बढ़ें",
  scrollToSeeMore: "आगे देखने के लिए स्क्रॉल करें",
  tapSeal: "खोलने के लिए मुहर पर टैप करें",
  tapDoors: "द्वार खोलने के लिए मुहर पर टैप करें",
  tapRing: "खोलने के लिए अंगूठी पर टैप करें",
  tapMoon: "खोलने के लिए चाँद पर टैप करें",
  tapKolam: "प्रवेश के लिए कोलम पर टैप करें",
  tapDupatta: "दुपट्टा खोलने के लिए टैप करें",
  tapCircle: "खोलने के लिए टैप करें",
  tapAnywhere: "खोलने के लिए कहीं भी टैप करें",
  weds: "संग",
  and: "एवं",
  togetherWithFamilies: "समस्त परिवार सहित",
  eventsKicker: "शुभ अवसर",
  eventsTitle: "मांगलिक कार्यक्रम",
  onwards: (t: string) => `${t} से`,
  dress: (d: string) => `वेशभूषा: ${d}`,
  directions: "रास्ता देखें",
  saveDate: "तिथि सहेजें",
  countdownKicker: "उलटी गिनती",
  countdownTitle: "शुभ घड़ी तक",
  justMarried: "शुभ विवाह सम्पन्न!",
  units: ["दिन", "घंटे", "मिनट", "सेकंड"],
  storyKicker: "हमारी कहानी",
  storyTitle: "कैसे शुरू हुई",
  momentsKicker: "हमारे पल",
  momentsTitle: "शुभ दिन से पहले",
  contactKicker: "किसी भी जानकारी के लिए",
  contactTitle: "संपर्क करें",
  call: (name: string, phone: string) => `${name} को ${phone} पर कॉल करें`,
  whatsapp: (name: string, phone: string) => `${name} को ${phone} पर WhatsApp करें`,
  photoOf: (i: number, n: number) => `फ़ोटो ${i} / ${n} खोलें`,
  tapOutside: "बंद करने के लिए बाहर स्पर्श करें",
  scratchKicker: "एक छोटा सा उपहार",
  scratchTitle: "शुभ तिथि",
  scratchFoil: "✦  तिथि देखने के लिए खुरचें  ✦",
  scratchAria: "विवाह की तिथि देखने के लिए खुरचें",
  revealInstead: "या तिथि देखने के लिए यहाँ स्पर्श करें",
  rsvpKicker: "आपका उत्तर",
  rsvpTitle: "क्या आप पधारेंगे?",
  replyBy: (d: string) => `कृपया ${d} तक उत्तर दें`,
  accept: "सहर्ष पधारेंगे",
  decline: "क्षमा, नहीं आ पाएंगे",
  yourName: "आपका नाम",
  namePlaceholder: "जैसे शर्मा परिवार",
  guests: "अतिथियों की संख्या",
  attendingAt: "किन कार्यक्रमों में पधारेंगे",
  tapToPick: "जिन कार्यक्रमों में आएँगे, उन्हें चुनें",
  pickOne: "पहले कार्यक्रम चुनें, फिर भेजें।",
  stayNeeded: "ठहरने की व्यवस्था चाहिए?",
  stayDays: "कितने दिनों के लिए?",
  yes: "हाँ",
  no: "नहीं",
  rsvpStay: (days) => `ठहरने की व्यवस्था: हाँ, ${days} दिन`,
  rsvpNoStay: "ठहरने की व्यवस्था: नहीं चाहिए",
  note: "नवयुगल के लिए संदेश",
  optional: "वैकल्पिक",
  sendRsvp: "WhatsApp पर उत्तर भेजें",
  rsvpYes: (a, b, name, guests, events) => [
    `नमस्ते! ${a} और ${b} के शुभ विवाह हेतु उत्तर 🌸`,
    `नाम: ${name}`,
    `अतिथि: ${guests}`,
    `कार्यक्रम: ${events || "—"}`,
  ],
  rsvpNo: (a, b, name) => [`नमस्ते! ${a} और ${b} के शुभ विवाह हेतु उत्तर`, `नाम: ${name}`, `क्षमा करें, हम नहीं आ पाएंगे, पर हमारी शुभकामनाएँ आपके साथ हैं 🙏`],
  rsvpNote: (n) => `संदेश: ${n}`,
};

export const LangContext = createContext<Lang>("en");

/** A couple's own wording for some of the invite's fixed words (e.g. "Their moments"), by key. */
export const WordsContext = createContext<Record<string, string>>({});
const NO_WORDS: Record<string, string> = {};
export const wordsOf = (invite: { words?: Record<string, string> }) => invite.words ?? NO_WORDS;

/** Date words in the invite's language. Numbers stay as 0–9 in both. */
function dates(lang: Lang) {
  const loc = lang === "hi" ? "hi-IN-u-nu-latn" : "en-IN";
  const f = (iso: string, opts: Intl.DateTimeFormatOptions) => fmtDate(iso, opts, loc);
  return {
    weekday: (iso: string) => f(iso, { weekday: "long" }),
    day: (iso: string) => f(iso, { day: "numeric" }),
    month: (iso: string) => f(iso, { month: "long" }),
    shortMonthDate: (iso: string) => f(iso, { day: "numeric", month: lang === "hi" ? "long" : "short", year: "numeric" }),
    year: (iso: string) => f(iso, { year: "numeric" }),
    long: (iso: string) => f(iso, { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
    dayMonthYear: (iso: string) => f(iso, { day: "numeric", month: "long", year: "numeric" }),
    // "5:00 pm" in English; "सायं 5:00 बजे" in Hindi, the way printed cards say it.
    time: (iso: string) => {
      if (lang === "en") return f(iso, { hour: "numeric", minute: "2-digit", hour12: true }).toLowerCase();
      const h = Number(f(iso, { hour: "numeric", hourCycle: "h23" }));
      const m = f(iso, { minute: "2-digit" }).padStart(2, "0");
      const part = h >= 4 && h < 12 ? "प्रातः" : h < 16 && h >= 12 ? "दोपहर" : h >= 16 && h < 20 ? "सायं" : "रात्रि";
      return `${part} ${h % 12 || 12}:${m} बजे`;
    },
  };
}

export function useT() {
  const lang = useContext(LangContext);
  const words = useContext(WordsContext);
  const base = lang === "hi" ? hi : en;
  // Only plain words can be replaced; the RSVP message builders stay as they are.
  const t = words === NO_WORDS ? base : ({ ...base, ...Object.fromEntries(Object.entries(words).filter(([k]) => typeof (base as Record<string, unknown>)[k] === "string")) } as typeof en);
  return { lang, t, d: dates(lang) };
}

export const langOf = (invite: { lang?: string }): Lang => (invite.lang === "hi" ? "hi" : "en");

/**
 * Hindi invites set their type in Devanagari faces: the decorative Latin scripts can't draw it, and
 * letter-spaced capitals break up Devanagari, so labels drop both.
 */
export function langVars(lang: Lang): CSSProperties {
  if (lang !== "hi") return {};
  return {
    "--inv-script": "var(--font-rozha), var(--font-deva), serif",
    "--inv-serif": "var(--font-deva), serif",
    "--inv-label": "var(--font-deva), serif",
  } as CSSProperties;
}
