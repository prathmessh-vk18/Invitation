import {
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
  Parisienne,
  Manrope,
  Pinyon_Script,
  Tiro_Devanagari_Hindi,
} from "next/font/google";

// Site shell
export const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["SOFT", "WONK", "opsz"],
  style: ["normal", "italic"],
});
export const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
export const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
export const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

// Invitation faces
export const cinzel = Cinzel({ subsets: ["latin"], variable: "--font-cinzel", weight: ["400", "600"] });
export const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});
export const parisienne = Parisienne({ subsets: ["latin"], variable: "--font-parisienne", weight: "400" });
export const pinyon = Pinyon_Script({ subsets: ["latin"], variable: "--font-pinyon", weight: "400" });
export const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-bodoni",
  style: ["normal", "italic"],
});
export const devanagari = Tiro_Devanagari_Hindi({
  subsets: ["devanagari", "latin"],
  variable: "--font-deva",
  weight: "400",
});

// Fonts for the Noor, Phulkari and Kolam templates
export const amiri = Amiri({ subsets: ["arabic", "latin"], variable: "--font-amiri", weight: ["400", "700"] });
export const marcellus = Marcellus({ subsets: ["latin"], variable: "--font-marcellus", weight: "400" });
export const gurmukhi = Baloo_Paaji_2({ subsets: ["gurmukhi", "latin"], variable: "--font-gurmukhi" });
export const rozha = Rozha_One({ subsets: ["latin"], variable: "--font-rozha", weight: "400" });
export const tamil = Noto_Serif_Tamil({ subsets: ["tamil"], variable: "--font-tamil" });
export const yeseva = Yeseva_One({ subsets: ["latin"], variable: "--font-yeseva", weight: "400" });

export const dancing = Dancing_Script({ subsets: ["latin"], variable: "--font-dancing", weight: ["500", "700"] });

export const fontVars = [dancing, amiri, marcellus, gurmukhi, rozha, tamil, yeseva, fraunces, geist, inter, manrope, cinzel, cormorant, parisienne, pinyon, bodoni, devanagari]
  .map((f) => f.variable)
  .join(" ");
