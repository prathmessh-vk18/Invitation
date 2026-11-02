import {
  Alex_Brush,
  Amiri,
  Baloo_Paaji_2,
  Marcellus,
  Noto_Serif_Tamil,
  Rozha_One,
  Yeseva_One,
  Bodoni_Moda,
  Cinzel,
  Cormorant_Garamond,
  Dancing_Script,
  Fraunces,
  Geist,
  Inter,
  Italiana,
  Parisienne,
  Manrope,
  Pinyon_Script,
  Tiro_Devanagari_Hindi,
} from "next/font/google";

// Site shell. Only these two are preloaded on every page; each invitation face loads when a page
// uses it, so a guest downloads two or three fonts instead of all 28 files.
export const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["SOFT", "WONK", "opsz"],
  style: ["normal", "italic"],
});
export const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
export const inter = Inter({ preload: false, subsets: ["latin"], variable: "--font-inter" });
export const manrope = Manrope({ preload: false, subsets: ["latin"], variable: "--font-manrope" });

// Invitation faces
export const cinzel = Cinzel({ preload: false, subsets: ["latin"], variable: "--font-cinzel", weight: ["400", "600"] });
export const cormorant = Cormorant_Garamond({
  preload: false,
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});
export const parisienne = Parisienne({ preload: false, subsets: ["latin"], variable: "--font-parisienne", weight: "400" });
export const pinyon = Pinyon_Script({ preload: false, subsets: ["latin"], variable: "--font-pinyon", weight: "400" });
export const bodoni = Bodoni_Moda({
  preload: false,
  subsets: ["latin"],
  variable: "--font-bodoni",
  style: ["normal", "italic"],
});
export const devanagari = Tiro_Devanagari_Hindi({
  preload: false,
  subsets: ["devanagari", "latin"],
  variable: "--font-deva",
  weight: "400",
});

// Fonts for the Noor, Phulkari and Kolam templates
export const amiri = Amiri({ preload: false, subsets: ["arabic", "latin"], variable: "--font-amiri", weight: ["400", "700"] });
export const marcellus = Marcellus({ preload: false, subsets: ["latin"], variable: "--font-marcellus", weight: "400" });
export const gurmukhi = Baloo_Paaji_2({ preload: false, subsets: ["gurmukhi", "latin"], variable: "--font-gurmukhi" });
export const rozha = Rozha_One({ preload: false, subsets: ["latin", "devanagari"], variable: "--font-rozha", weight: "400" });
export const tamil = Noto_Serif_Tamil({ preload: false, subsets: ["tamil"], variable: "--font-tamil" });
export const yeseva = Yeseva_One({ preload: false, subsets: ["latin"], variable: "--font-yeseva", weight: "400" });

export const dancing = Dancing_Script({ preload: false, subsets: ["latin"], variable: "--font-dancing", weight: ["500", "700"] });

// Extra faces for the font styles couples can pick (src/config/customise.ts)
export const alexBrush = Alex_Brush({ preload: false, subsets: ["latin"], variable: "--font-alex-brush", weight: "400" });
export const italiana = Italiana({ preload: false, subsets: ["latin"], variable: "--font-italiana", weight: "400" });

export const fontVars = [alexBrush, italiana, dancing, amiri, marcellus, gurmukhi, rozha, tamil, yeseva, fraunces, geist, inter, manrope, cinzel, cormorant, parisienne, pinyon, bodoni, devanagari]
  .map((f) => f.variable)
  .join(" ");
