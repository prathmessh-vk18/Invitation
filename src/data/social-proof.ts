// SAMPLE CONTENT — not real customers or real numbers.
// Replace every entry with genuine reviews and figures before launch. Publishing invented reviews or
// stats as real is treated as a misleading claim under India's consumer-protection rules.

import type { TemplateId } from "./templates";

export const stats: { value: string; label: string }[] = [
  { value: "2,400+", label: "Invites sent" },
  { value: "4.9★", label: "Couple rating" },
  { value: "1.2 lakh+", label: "Guests reached" },
  { value: "24 hrs", label: "To your link" },
];

export const testimonials: { quote: string; couple: string; city: string; design: TemplateId; tint: string }[] = [
  {
    quote: "Our nani opened it on her own and called us crying happy tears. Three relatives asked who made it before the Haldi was even over.",
    couple: "Ananya & Rohit",
    city: "Jaipur",
    design: "rajwada",
    tint: "#5b0f22",
  },
  {
    quote: "We changed the Sangeet venue two days before the function. One message and the same link was updated. Nobody missed it.",
    couple: "Sana & Imran",
    city: "Hyderabad",
    design: "noor",
    tint: "#0c3b33",
  },
  {
    quote: "The dupatta opening had the whole family group sending the link around. Best ₹299 we spent on the wedding, honestly.",
    couple: "Harleen & Karan",
    city: "Ludhiana",
    design: "phulkari",
    tint: "#d6246e",
  },
  {
    quote: "Filled the form on my phone in about ten minutes. The preview updated as I typed, so there were no surprises.",
    couple: "Divya & Arjun",
    city: "Bengaluru",
    design: "kolam",
    tint: "#9c1650",
  },
  {
    quote: "RSVPs came straight to my WhatsApp with the guest count. I didn't have to chase anyone for numbers for the caterer.",
    couple: "Neha & Siddharth",
    city: "Pune",
    design: "gulmohar",
    tint: "#a2405f",
  },
  {
    quote: "Clean, modern and still traditional. Our friends abroad loved that the timings showed up properly for them.",
    couple: "Ishita & Kabir",
    city: "Delhi",
    design: "agni",
    tint: "#c0502a",
  },
];
