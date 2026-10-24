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
