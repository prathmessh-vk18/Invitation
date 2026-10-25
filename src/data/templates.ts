export type TemplateId = "mandir" | "rajwada" | "gulmohar" | "agni" | "noor" | "phulkari" | "kolam" | "bagh" | "mahal" | "khat" | "gopuram";
export type CategoryId = "hindu" | "muslim" | "sikh" | "south-indian";

export type TemplateMeta = {
  id: TemplateId;
  category: CategoryId;
  name: string;
  // The design's name in its own script, and the font variable that sets it.
  native: string;
  nativeFont: string;
  mood: string;
  tagline: string;
  description: string[];
  price: number;
  mrp: number;
  demoSlug: string;
  palette: { name: string; hex: string }[];
  suits: string[];
  signature: string[];
  // Site-side tint behind this design's previews (a tint-* token from the design system).
  tint: string;
  // App-icon colours for captions: background and a single accent.
  icon: { bg: string; fg: string };
  addedOn: string;
  // Shown with a "Top seller" badge on tiles and its design page.
  topSeller?: boolean;
};

const DEVA = "var(--font-deva)";

export const templates: TemplateMeta[] = [
  {
    id: "mandir",
    category: "hindu",
    name: "Mandir",
    native: "मंदिर",
    nativeFont: DEVA,
    mood: "Illustrated · Temple sunrise",
    tagline: "Carved temple doors open onto a temple at sunrise, with your names in the sky under hanging bells.",
    description: [
      "Mandir opens behind carved temple doors with brass bells. Tap the seal and they swing apart onto a temple at sunrise, the two of you walking a lamp-lined carpet towards it, and your names in the sky under a floral arch.",
      "The rest of the invite scrolls inside a painted temple-arch frame, with both families named above your names, every function on its own arch-shaped card, and your photos as polaroids guests can swipe through.",
      "Scratch-to-reveal date, countdown, RSVP and music are all included.",
    ],
    price: 299,
    mrp: 999,
    demoSlug: "advait-weds-naina",
    palette: [
      { name: "Sunrise peach", hex: "#f9ceab" },
      { name: "Terracotta", hex: "#a8573a" },
      { name: "Sandstone", hex: "#d8b48a" },
      { name: "Bridal red", hex: "#b3261e" },
    ],
    suits: ["Hindu weddings across North & West India", "Temple and heritage venues", "Couples who want a painted, traditional look"],
    signature: ["Carved temple doors", "Temple at sunrise", "Temple-arch frame", "Walk-in zoom to your names"],
    tint: "#fbeada",
    icon: { bg: "#a8573a", fg: "#fbeada" },
    addedOn: "2026-10-27",
  },
  {
    id: "khat",
    category: "hindu",
    name: "Khat",
    native: "ख़त",
    nativeFont: DEVA,
    mood: "Illustrated · Love letter in a meadow",
    tagline: "A wax-sealed letter in a golden-hour meadow opens onto the two of you walking into the sunset.",
    description: [
      "Khat means a letter. It begins with a sealed envelope lying in a field of wildflowers, glowing in late-afternoon light.",
      "Tap the seal and the camera drifts into it, opening onto a painted scene of the couple walking hand in hand towards a floral arch.",
      "Soft watercolour florals frame every section, so it reads like a handwritten note from the two of you.",
    ],
    price: 299,
    mrp: 999,
    demoSlug: "rhea-weds-arjun",
    palette: [
      { name: "Blush", hex: "#f3c9c4" },
      { name: "Golden hour", hex: "#f6d4a8" },
      { name: "Wax red", hex: "#8e1f2c" },
      { name: "Sage", hex: "#9aae8c" },
    ],
    suits: ["Day & destination weddings", "Intimate ceremonies", "Romantic, modern couples"],
    signature: ["Wax-seal envelope", "Cinematic zoom-in", "Couple in a meadow", "Watercolour florals"],
    tint: "#fbe6dd",
    icon: { bg: "#b2566c", fg: "#fbe6dd" },
    addedOn: "2026-10-26",
    topSeller: true,
  },
  {
    id: "bagh",
    category: "hindu",
    name: "Bagh",
    native: "बाग़",
    nativeFont: DEVA,
    mood: "Illustrated · Palace garden",
    tagline: "A glass garden gate swings open onto the two of you beside a lotus pool, chhatris and peacocks.",
    description: [
      "Bagh is a fully painted invitation set in a palace garden: a long lotus pool, white marble chhatris, banana plants, peacocks and the couple in soft pastel wedding clothes.",
      "It opens at a glass-and-lattice garden gate inside a floral arch. Tap the seal and the gates swing open onto the painted scene, with your names written in the morning sky.",
      "The rest of the invite sits on a painted palace-wall card, with banana leaves above and a little elephant procession along the bottom.",
    ],
    price: 299,
    mrp: 999,
    demoSlug: "riya-weds-aditya",
    palette: [
      { name: "Palace cream", hex: "#ebe0cc" },
      { name: "Terracotta", hex: "#c4622d" },
      { name: "Lotus pool", hex: "#4fbfcf" },
      { name: "Plum ink", hex: "#3d1633" },
    ],
    suits: ["Gujarati & Rajasthani weddings", "Lake & garden venues", "Couples who love a story-like reveal"],
    signature: ["Glass garden gate", "Couple in a palace garden", "Lotus pool & chhatris", "Elephant-procession card"],
    tint: "#f3e6d3",
    icon: { bg: "#c4622d", fg: "#fbe8cf" },
    addedOn: "2026-10-24",
    topSeller: true,
  },
  {
    id: "gulmohar",
    category: "hindu",
    name: "Gulmohar",
    native: "गुलमोहर",
    nativeFont: DEVA,
    mood: "Floral · Blush & sage",
    tagline: "A sealed envelope, a shower of petals, a garden in full bloom.",
    description: [
      "Gulmohar is soft, romantic and full of flowers. It suits day weddings, garden venues and couples who want pastel over pomp.",
      "It arrives as an envelope closed with a wax seal carrying your initials. Break the seal and the card lifts out while petals drift down the screen.",
      "Hand-drawn blossoms frame each section and the palette stays light, so photographs and mehndi greens sit beautifully beside it.",
    ],
    price: 249,
    mrp: 999,
    demoSlug: "ishaan-weds-tara",
    palette: [
      { name: "Blush", hex: "#f6dfdc" },
      { name: "Rose", hex: "#a2405f" },
      { name: "Sage", hex: "#869d7a" },
      { name: "Cream", hex: "#fdf8f3" },
    ],
    suits: ["Day & garden weddings", "Intimate ceremonies", "Mehndi-first celebrations"],
    signature: ["Wax-seal envelope", "Falling petals", "Hand-drawn florals", "Soft colour washes"],
    tint: "#fbe6ea",
    icon: { bg: "#f7d6dc", fg: "#a2405f" },
    addedOn: "2026-09-08",
  },
  {
    id: "rajwada",
    category: "hindu",
    name: "Rajwada",
    native: "राजवाड़ा",
    nativeFont: DEVA,
    mood: "Royal · Maroon & gold",
    tagline: "Palace doors swing open onto a night of marigolds and lamplight.",
    description: [
      "Rajwada is built for the big, grand wedding: the kind with a baraat that takes over the street and a mandap lit like a palace courtyard.",
      "It opens behind carved palace doors. One tap and they swing apart, a toran of marigolds sways overhead, and your names appear beneath a jharokha arch in gold.",
      "Every function gets its own card in the same maroon and gold, so Haldi to Reception feels like one continuous celebration.",
    ],
    price: 299,
    mrp: 999,
    demoSlug: "aarav-weds-meera",
    palette: [
      { name: "Sindoor maroon", hex: "#5b0f22" },
      { name: "Temple gold", hex: "#d9a441" },
      { name: "Marigold", hex: "#f39a1e" },
      { name: "Ivory", hex: "#fbf1dc" },
    ],
    suits: ["Rajasthani & Marwari", "Palace & destination", "Large multi-day weddings"],
    signature: ["Opening palace doors", "Swaying marigold toran", "Rotating gold mandala", "Hanging diyas"],
    tint: "#f6ecd6",
    icon: { bg: "#5b0f22", fg: "#e9bf62" },
    addedOn: "2026-09-01",
  },
  {
    id: "mahal",
    category: "hindu",
    name: "Mahal",
    native: "महल",
    nativeFont: DEVA,
    mood: "Illustrated · Royal lake palace",
    tagline: "Painted palace doors swing open onto the two of you beside a lake palace at golden hour.",
    description: [
      "Mahal is a fully painted invitation in the spirit of Rajasthani miniature art: a floral arch, a white lake palace, peacocks on a marble balustrade and the couple in wedding finery.",
      "It opens behind carved maroon-and-gold palace doors. Tap the seal and they swing apart to reveal the painted scene, with your names written in the sky.",
      "The rest of the invite sits on a painted floral card, with each function, the scratch-to-reveal date, RSVP and music.",
    ],
    price: 299,
    mrp: 999,
    demoSlug: "vihaan-weds-kavya",
    palette: [
      { name: "Lehenga maroon", hex: "#7a1d2e" },
      { name: "Sunset peach", hex: "#f2c08f" },
      { name: "Marble ivory", hex: "#f7ecd9" },
      { name: "Peacock teal", hex: "#1f6f78" },
    ],
    suits: ["Rajasthani & North Indian weddings", "Palace & lake venues", "Couples who want a painted look"],
    signature: ["Painted palace doors", "Couple illustration", "Lake-palace scene", "Floral painted card"],
    tint: "#f6e4cf",
    icon: { bg: "#7a1d2e", fg: "#f3d18a" },
    addedOn: "2026-10-26",
  },
  {
    id: "gopuram",
    category: "south-indian",
    name: "Gopuram",
    native: "கோபுரம்",
    nativeFont: "var(--font-tamil)",
    mood: "Illustrated · Temple dawn",
    tagline: "Carved temple doors open at dawn onto a painted gopuram, jasmine strings and the two of you in silk.",
    description: [
      "Gopuram is a painted South Indian invitation set in a temple courtyard at sunrise: a towering gopuram, banana plants, brass lamps and a kolam at your feet.",
      "Guests tap the brass seal and the teak temple doors open onto the couple, the bride in Kanjeevaram silk and the groom in a veshti.",
      "Every function sits on a silk-bordered card with jasmine across the top, with the muhurtham front and centre.",
    ],
    price: 299,
    mrp: 999,
    demoSlug: "nila-weds-surya",
    palette: [
      { name: "Kanjeevaram magenta", hex: "#a6175a" },
      { name: "Temple gold", hex: "#d9a53c" },
      { name: "Banana leaf", hex: "#4f8f3a" },
      { name: "Jasmine", hex: "#fbf5e8" },
    ],
    suits: ["Tamil, Telugu & Kannada weddings", "Temple & early-morning muhurthams", "Traditional families"],
    signature: ["Carved temple doors", "Painted gopuram scene", "Couple in silk", "Jasmine-strung card"],
    tint: "#f8ecd6",
    icon: { bg: "#a6175a", fg: "#f6d98a" },
    addedOn: "2026-10-26",
  },
  {
    id: "agni",
    category: "hindu",
    name: "Agni",
    native: "अग्नि",
    nativeFont: DEVA,
    mood: "Modern · Ivory & terracotta",
    tagline: "Seven circles for seven vows. A quiet, modern invitation around the sacred fire.",
    description: [
      "Agni is for couples who like their tradition with clean lines. Bold type, generous space and a single warm colour do the work.",
      "It opens with a seal that expands into the page. The sacred fire draws itself in fine line-art and seven rings, one for each phera, trace around your names.",
      "Events read like an editorial programme, numbered and timed, so guests know exactly where to be.",
    ],
    price: 249,
    mrp: 999,
    demoSlug: "kabir-weds-anaya",
    palette: [
      { name: "Ivory", hex: "#f5ede1" },
      { name: "Terracotta", hex: "#c0502a" },
      { name: "Saffron", hex: "#e8973a" },
      { name: "Kohl", hex: "#2a1c15" },
    ],
    suits: ["Modern & minimal couples", "City weddings", "Court + reception combos"],
    signature: ["Circle-reveal opening", "Line-art sacred fire", "Seven-ring phera motif", "Editorial schedule"],
    tint: "#f4ebe1",
    icon: { bg: "#c0502a", fg: "#f5ede1" },
    addedOn: "2026-09-15",
  },
  {
    id: "noor",
    category: "muslim",
    name: "Noor",
    native: "نور",
    nativeFont: "var(--font-amiri)",
    mood: "Nikah · Emerald & gold",
    tagline: "A carved jaali slides open under a crescent moon, and the lanterns begin to glow.",
    description: [
      "Noor means light, and this design is built around it: lanterns, moonlight and gold traced across deep emerald.",
      "It opens behind a carved geometric screen. Tap the crescent and the two halves of the jaali glide apart, the lanterns swing into view and Bismillah appears in gold.",
      "Nikah, Mehndi and Walima each get their own arched card, with the Mehr ceremony time and venue clear for every guest.",
    ],
    price: 299,
    mrp: 999,
    demoSlug: "zaid-weds-inaya",
    palette: [
      { name: "Emerald night", hex: "#0c3b33" },
      { name: "Lantern gold", hex: "#e3b964" },
      { name: "Moonlight", hex: "#f4efe2" },
      { name: "Rose dusk", hex: "#c98b8b" },
    ],
    suits: ["Nikah & Walima", "Evening ceremonies", "Families who love calligraphy"],
    signature: ["Sliding jaali screen", "Swinging lanterns", "Geometric star patterns", "Arabic calligraphy"],
    tint: "#e3efe9",
    icon: { bg: "#0c3b33", fg: "#e3b964" },
    addedOn: "2026-10-01",
  },
  {
    id: "phulkari",
    category: "sikh",
    name: "Phulkari",
    native: "ਫੁਲਕਾਰੀ",
    nativeFont: "var(--font-gurmukhi)",
    mood: "Anand Karaj · Embroidered brights",
    tagline: "Hot pink, saffron and gold embroidery that stitches itself open. Loud, proud and full of bhangra.",
    description: [
      "Phulkari takes its look from the embroidered shawls of Punjab: dense, bright and joyful. It is the loudest design in the collection, on purpose.",
      "The invite arrives folded in an embroidered dupatta. Tap it and the stitches run open from the centre, revealing ੴ and your names in bold folk letters.",
      "Every function has its own colour block, from Jaggo to Anand Karaj to Reception, with the four laavan noted in the ceremony card.",
    ],
    price: 299,
    mrp: 999,
    demoSlug: "jasraj-weds-simran",
    palette: [
      { name: "Rani pink", hex: "#d6246e" },
      { name: "Saffron", hex: "#f28a1a" },
      { name: "Mustard", hex: "#f6c445" },
      { name: "Deep madder", hex: "#5a0f2a" },
    ],
    suits: ["Anand Karaj", "Big Punjabi families", "Jaggo & sangeet-heavy weddings"],
    signature: ["Stitch-open dupatta", "Animated embroidery", "Jaggo lamp pot", "Folk lettering"],
    tint: "#fbeadb",
    icon: { bg: "#d6246e", fg: "#f6c445" },
    addedOn: "2026-10-06",
  },
  {
    id: "kolam",
    category: "south-indian",
    name: "Kolam",
    native: "கோலம்",
    nativeFont: "var(--font-tamil)",
    mood: "Temple · Silk & brass",
    tagline: "A kolam drawn dot by dot at the doorstep, framed in Kanjeevaram silk and jasmine.",
    description: [
      "Kolam is made for South Indian weddings, where the day starts before sunrise and every doorstep wears a fresh rice-flour pattern.",
      "The invitation opens with a kolam drawing itself, line by line, around a grid of dots. Then the silk border unrolls in magenta, gold and parrot green.",
      "The muhurtham is front and centre, with each ceremony, from Nichayathartham to Reception, set out clearly for family travelling in.",
    ],
    price: 299,
    mrp: 999,
    demoSlug: "karthik-weds-meenakshi",
    palette: [
      { name: "Temple magenta", hex: "#9c1650" },
      { name: "Zari gold", hex: "#d9a53c" },
      { name: "Parrot green", hex: "#3f8f3a" },
      { name: "Rice white", hex: "#fbf6ea" },
    ],
    suits: ["Tamil, Telugu & Kannada weddings", "Early-morning muhurthams", "Temple venues"],
    signature: ["Self-drawing kolam", "Kanjeevaram silk border", "Brass lamp", "Jasmine strings"],
    tint: "#f8f0d8",
    icon: { bg: "#9c1650", fg: "#d9a53c" },
    addedOn: "2026-10-12",
  },
];

export function getTemplate(id: string) {
  return templates.find((t) => t.id === id);
}

export const templatesIn = (c: CategoryId) => templates.filter((t) => t.category === c);
