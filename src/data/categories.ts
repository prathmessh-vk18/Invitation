import type { CategoryId } from "./templates";

export type Category = {
  id: CategoryId;
  slug: string;
  label: string;
  title: string;
  intro: string;
  ceremonies: string[];
  faqs: { q: string; a: string }[];
};

export const categories: Category[] = [
  {
    id: "hindu",
    slug: "hindu-wedding-invitations",
    label: "Hindu",
    title: "Hindu wedding invitations",
    intro: "From Haldi to Pheras, every function on one link, with your invocation in Devanagari and the muhurat front and centre.",
    ceremonies: ["Roka", "Haldi", "Mehndi", "Sangeet", "Baraat", "Pheras", "Vidaai", "Reception"],
    faqs: [
      { q: "Can we include the shubh muhurat?", a: "Yes. The muhurat time appears on the ceremony card and the countdown runs to it." },
      { q: "Can the invocation be in Hindi or Sanskrit?", a: "Yes. Lines like ॥ श्री गणेशाय नमः ॥ are set in Devanagari, and you can choose a different invocation for your family." },
      { q: "We have functions on both sides. Can each family send their own?", a: "Yes, with the second-family add-on: the same design with their names first and only their events." },
    ],
  },
  {
    id: "muslim",
    slug: "muslim-nikah-invitations",
    label: "Muslim",
    title: "Muslim & Nikah invitations",
    intro: "Nikah, Mehndi and Walima on one link, opening with Bismillah in Arabic calligraphy and lanterns that glow.",
    ceremonies: ["Mangni", "Mehndi", "Nikah", "Rukhsati", "Walima"],
    faqs: [
      { q: "Can we add Arabic or Urdu text?", a: "Yes. Bismillah and duas are set in proper Arabic script. Send us the exact wording and we'll match it." },
      { q: "Can the Walima be hosted by a different family?", a: "Yes. Each event card can name its own hosts." },
      { q: "Can we keep separate timings for men and women?", a: "Yes. Any event can show more than one time or venue." },
    ],
  },
  {
    id: "sikh",
    slug: "sikh-anand-karaj-invitations",
    label: "Sikh",
    title: "Sikh & Anand Karaj invitations",
    intro: "Jaggo to Anand Karaj in bold Punjabi colour, with ੴ in Gurmukhi and the gurdwara details clear for every guest.",
    ceremonies: ["Roka", "Chunni", "Jaggo", "Maiyan", "Anand Karaj", "Reception"],
    faqs: [
      { q: "Can the invite include Gurmukhi?", a: "Yes. ੴ and lines in Gurmukhi are set in a proper Gurmukhi typeface." },
      { q: "Can we note the four laavan?", a: "Yes. The Anand Karaj card can describe the ceremony order for guests who are new to it." },
      { q: "Can we share gurdwara etiquette, like covering heads?", a: "Yes. Any event card can carry a short note for guests." },
    ],
  },
  {
    id: "south-indian",
    slug: "south-indian-wedding-invitations",
    label: "South Indian",
    title: "South Indian wedding invitations",
    intro: "Tamil, Telugu, Kannada and Malayali weddings, with the muhurtham front and centre and temple details for family travelling in.",
    ceremonies: ["Nichayathartham", "Mehendi", "Nalangu", "Muhurtham", "Reception"],
    faqs: [
      { q: "Our muhurtham is at 6 am. Is that a problem?", a: "Not at all. The countdown and calendar link use the exact muhurtham time." },
      { q: "Can we add Tamil or Telugu text?", a: "Yes. We set regional lines in the right script for your family." },
      { q: "Can we add travel and stay details for outstation guests?", a: "Yes. Any event card can carry notes, and we can add a travel card." },
    ],
  },
];

export const getCategory = (slug: string) => categories.find((c) => c.slug === slug);
export const categoryOf = (id: CategoryId) => categories.find((c) => c.id === id)!;
