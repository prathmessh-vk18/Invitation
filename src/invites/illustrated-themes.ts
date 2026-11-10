import { makeIllustrated } from "./illustrated";
import { rajwada } from "./rajwada";

const base = "/art/illus";

export const mahal = makeIllustrated({
  id: "mahal",
  images: { opening: `${base}/mahal-doors.jpg`, hero: `${base}/mahal-hero.jpg`, card: `${base}/mahal-card.jpg` },
  opening: "doors",
  heroTextTop: 10,
  frame: { top: 9, bottom: 9, side: 5 },
  colors: { ink: "#4a1426", accent: "#a8462c", soft: "#6e4a3a", paper: "#f7ecd9", onAccent: "#fff" },
  fonts: { script: "var(--font-parisienne), cursive", serif: "var(--font-cormorant), serif", label: "var(--font-cinzel), serif" },
});

export const khat = makeIllustrated({
  id: "khat",
  images: { opening: `${base}/khat-envelope.jpg`, hero: `${base}/khat-hero.jpg`, card: `${base}/khat-card.jpg` },
  opening: "envelope",
  sealAt: { x: 50.5, y: 49.5 },
  heroTextTop: 12,
  frame: { top: 15, bottom: 15, side: 3 },
  colors: { ink: "#5b2a3a", accent: "#b2566c", soft: "#7e5a62", paper: "#fbf3ea", onAccent: "#fff" },
  fonts: { script: "var(--font-pinyon), cursive", serif: "var(--font-cormorant), serif", label: "var(--font-manrope), sans-serif" },
});

/** Mudrika: Khat's envelope and meadow, worded for an engagement and counting down to the ring ceremony. */
export const mudrika = {
  ...makeIllustrated({
    id: "mudrika",
    images: { opening: `${base}/khat-envelope.jpg`, hero: `${base}/khat-hero.jpg`, card: `${base}/khat-card.jpg` },
    opening: "envelope",
    sealAt: { x: 50.5, y: 49.5 },
    heroTextTop: 12,
    frame: { top: 15, bottom: 15, side: 3 },
    colors: { ink: "#5b2a3a", accent: "#b2566c", soft: "#7e5a62", paper: "#fbf3ea", onAccent: "#fff" },
    fonts: { script: "var(--font-pinyon), cursive", serif: "var(--font-cormorant), serif", label: "var(--font-manrope), sans-serif" },
  }),
  countdownTitle: "Until the ring ceremony",
};

/**
 * Khat in ivory red, for a bride in a crimson-and-gold saree: the same envelope opening, the
 * couple repainted with her in deep red, crimson type and the floral paper warmed with red.
 */
export const khatred = makeIllustrated({
  id: "khatred",
  images: { opening: `${base}/khat-envelope.jpg`, hero: `${base}/khat-red-hero.jpg`, card: `${base}/khat-red-card.jpg` },
  opening: "envelope",
  sealAt: { x: 50.5, y: 49.5 },
  heroTextTop: 8,
  frame: { top: 15, bottom: 15, side: 3 },
  colors: { ink: "#6e1320", accent: "#a3192b", soft: "#7a4741", paper: "#fbf1ec", onAccent: "#fff" },
  fonts: { script: "var(--font-pinyon), cursive", serif: "var(--font-cormorant), serif", label: "var(--font-manrope), sans-serif" },
});

export const gopuram = makeIllustrated({
  id: "gopuram",
  images: { opening: `${base}/gopuram-doors.jpg`, hero: `${base}/gopuram-hero.jpg`, card: `${base}/gopuram-card.jpg` },
  opening: "doors",
  heroTextTop: 4,
  frame: { top: 13, bottom: 12, side: 8 },
  heroGlow: true,
  scriptScale: 0.68,
  colors: { ink: "#5a0d2b", accent: "#a6175a", soft: "#6b4a3a", paper: "#fbf5e8", onAccent: "#fff" },
  fonts: { script: "var(--font-yeseva), serif", serif: "var(--font-cormorant), serif", label: "var(--font-marcellus), serif" },
});

export const bagh = makeIllustrated({
  id: "bagh",
  images: { opening: `${base}/bagh-gate.jpg`, hero: `${base}/bagh-hero.jpg`, card: `${base}/bagh-card.jpg` },
  opening: "doors",
  heroTextTop: 7,
  frame: { top: 14, bottom: 21, side: 3 },
  colors: { ink: "#2e0f27", accent: "#a14f2c", soft: "#4f3434", paper: "#f3eadb", onAccent: "#fff" },
  fonts: { script: "var(--font-dancing), cursive", serif: "var(--font-cormorant), serif", label: "var(--font-cinzel), serif" },
  // Couples asked for easier reading: large, bold, full-ink text on every Bagh invite.
  largeText: true,
});

// A Rajput palace gatefold (first made for Akshay & Vidhi). The couple arriving on elephants
// opens like two flaps onto them enthroned, framed by a jaali arch with musicians.
export const haveli = makeIllustrated({
  id: "haveli",
  images: { opening: `${base}/haveli-arrival.jpg`, hero: `${base}/haveli-gate.jpg`, card: `${base}/haveli-card.jpg`, frame: `${base}/haveli-frame.png` },
  opening: "doors",
  openingTitle: true,
  openingTitleTop: 15,
  frameOverHero: true,
  doorShade: false,
  sealImage: `${base}/haveli-monogram.jpg`,
  // The A&V monogram belongs to Akshay & Vidhi alone (their full invite and the reception-only one).
  sealImageFor: ["akshay-weds-vidhi", "akshay-weds-vidhi-reception"],
  heroTextTop: 18,
  heroLead: 25,
  frame: { top: 12, bottom: 11, side: 6 },
  colors: { ink: "#5a1f2b", accent: "#9c4a3c", soft: "#6e564a", paper: "#f8f3e8", onAccent: "#fff" },
  fonts: { script: "var(--font-pinyon), cursive", serif: "var(--font-cormorant), serif", label: "var(--font-cinzel), serif" },
});

/* ───────── Engagement designs with their own paintings ───────── */

const ring = (theme: ReturnType<typeof makeIllustrated>) => ({ ...theme, countdownTitle: "Until the ring ceremony" });

/** Angoothi: a sealed ring box on a brass thali opens onto two hands exchanging rings. */
export const angoothi = ring(
  makeIllustrated({
    id: "angoothi",
    images: { opening: `${base}/angoothi-box.jpg`, hero: `${base}/angoothi-hero.jpg`, card: `${base}/angoothi-card.jpg` },
    opening: "envelope",
    sealAt: { x: 50, y: 47 },
    heroTextTop: 9,
    heroGlow: true,
    frame: { top: 14, bottom: 14, side: 3 },
    colors: { ink: "#5a2414", accent: "#b5482a", soft: "#7a4b36", paper: "#fbf3e6", onAccent: "#fff" },
    fonts: { script: "var(--font-pinyon), cursive", serif: "var(--font-cormorant), serif", label: "var(--font-cinzel), serif" },
  }),
);

/** Chandni: carved marble doors at twilight open onto the couple under a floral arch on a palace terrace. */
export const chandni = ring(
  makeIllustrated({
    id: "chandni",
    images: { opening: `${base}/chandni-doors.jpg`, hero: `${base}/chandni-hero.jpg`, card: `${base}/chandni-card.jpg` },
    opening: "doors",
    heroTextTop: 10,
    heroGlow: true,
    frame: { top: 14, bottom: 14, side: 3 },
    colors: { ink: "#3d2b4f", accent: "#9a4f7c", soft: "#6d5a73", paper: "#f8f1f4", onAccent: "#fff" },
    fonts: { script: "var(--font-parisienne), cursive", serif: "var(--font-cormorant), serif", label: "var(--font-manrope), sans-serif" },
  }),
);

/** Roka: a sealed red shagun envelope opens onto the Roka thali, chunri and mithai. */
export const roka = ring(
  makeIllustrated({
    id: "roka",
    images: { opening: `${base}/roka-envelope.jpg`, hero: `${base}/roka-hero.jpg`, card: `${base}/roka-card.jpg` },
    opening: "envelope",
    sealAt: { x: 49.5, y: 48 },
    openingInk: "#fff1d0",
    heroTextTop: 10,
    heroGlow: true,
    frame: { top: 14, bottom: 14, side: 3 },
    colors: { ink: "#6e1320", accent: "#b3261e", soft: "#7a4741", paper: "#fbf3e6", onAccent: "#fff" },
    fonts: { script: "var(--font-yeseva), serif", serif: "var(--font-cormorant), serif", label: "var(--font-marcellus), serif" },
    scriptScale: 0.8,
  }),
);

/**
 * Rajwada Sagai, made for one couple: Khat's sealed-envelope opening, repainted on maroon velvet,
 * then the whole Rajwada palace invite, worded for an engagement with gold rings in place of diyas.
 */
const rajwadaEnvelope = makeIllustrated({
  id: "rajwadasagai",
  images: { opening: `${base}/rajwada-envelope.jpg`, hero: `${base}/khat-hero.jpg`, card: `${base}/khat-card.jpg` },
  opening: "envelope",
  sealAt: { x: 51.4, y: 49.9 },
  openingInk: "#f6d987",
  heroTextTop: 12,
  frame: { top: 15, bottom: 15, side: 3 },
  colors: { ink: "#4a0b1b", accent: "#e9bf62", soft: "#7a4741", paper: "#fbf1dc", onAccent: "#4a0b1b" },
  fonts: { script: "var(--font-parisienne), cursive", serif: "var(--font-cormorant), serif", label: "var(--font-cinzel), serif" },
});
export const rajwadasagai = { ...rajwada, id: "rajwadasagai" as const, Opening: rajwadaEnvelope.Opening, tapHint: "tapSeal" as const, countdownTitle: "Until the ring ceremony" };
