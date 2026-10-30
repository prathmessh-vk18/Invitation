import { makeIllustrated } from "./illustrated";

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
  colors: { ink: "#3d1633", accent: "#b5603a", soft: "#6a4a4a", paper: "#f3eadb", onAccent: "#fff" },
  fonts: { script: "var(--font-dancing), cursive", serif: "var(--font-cormorant), serif", label: "var(--font-cinzel), serif" },
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
