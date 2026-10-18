// Optional extras offered on every design page. Prices are placeholders — set your own.
export type Addon = { id: string; name: string; body: string; price: number; tag?: string };

export const addons: Addon[] = [
  {
    id: "second-family",
    name: "A version for the other family",
    body: "The same design with their names first and only their functions, on its own link.",
    price: 1499,
    tag: "Most added",
  },
  {
    id: "save-the-date",
    name: "Matching save-the-date",
    body: "A one-screen teaser in the same design to send months ahead.",
    price: 999,
  },
  {
    id: "gallery",
    name: "Pre-wedding photo gallery",
    body: "A swipeable gallery of up to 30 photos from your shoot, inside the invite.",
    price: 799,
  },
  {
    id: "translation",
    name: "Full regional translation",
    body: "Every line in Hindi, Urdu, Punjabi, Tamil, Telugu or another language of your choice.",
    price: 699,
  },
  {
    id: "domain",
    name: "Your own web address",
    body: "Your invite at a name like aaravmeera.in for a year, instead of our link.",
    price: 1299,
  },
  {
    id: "express",
    name: "Express delivery",
    body: "Your first draft within 24 hours instead of 3 days.",
    price: 999,
  },
];
