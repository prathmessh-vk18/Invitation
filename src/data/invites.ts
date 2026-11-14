import type { SectionId } from "@/config/customise";
import { songs } from "@/config/music";
import type { TemplateId } from "./templates";

export type EventKind = "engagement" | "haldi" | "mehndi" | "sangeet" | "baraat" | "phere" | "reception" | "nikah" | "walima" | "jaggo" | "anandkaraj" | "muhurtham" | "other";

export type InviteEvent = {
  kind: EventKind;
  name: string;
  devanagari?: string;
  // ISO strings with the +05:30 offset so times render the same everywhere.
  start: string;
  end?: string;
  venue: string;
  address: string;
  dress?: string;
  note?: string;
  // The couple's own Google Maps link; Directions opens it instead of searching the address.
  mapUrl?: string;
  // Several functions on one card, as a timed list (Sehra Bandi, Baraat leaves, Anand Karaj).
  schedule?: { at: string; text: string }[];
};

export type Person = {
  first: string;
  full: string;
  parents: string;
  // An elder's line printed above the name, e.g. a grandmother who invites on the family's behalf.
  elders?: string;
  // Print the elder's line under the parents instead of above the name.
  eldersBelow?: boolean;
  // Set the elders line like the parents line (italic serif) instead of small capitals.
  eldersPlain?: boolean;
  // A shorter name for the couple's card only (e.g. "Priya"); everywhere else uses `first`.
  cardName?: string;
  // A longer name for the cover only (e.g. "Dr. Simran"); everywhere else uses `first`.
  coverName?: string;
  // A small line under the name, e.g. "IRS Officer" (Mandir cover and names).
  title?: string;
  // Print the title on the same line as the name, after it, instead of underneath.
  titleInline?: boolean;
  // With titleInline: set the title in the name's script at a smaller size, and leave it off the cover.
  titleScript?: boolean;
};

export type Invite = {
  slug: string;
  template: TemplateId;
  bride: Person;
  groom: Person;
  // Order the names appear in ("groom" first is common in North Indian cards).
  lead: "bride" | "groom";
  invocation: string;
  invocationMeaning: string;
  hosts: string;
  message: string;
  date: string;
  city: string;
  hashtag?: string;
  events: InviteEvent[];
  story?: { year: string; title: string; text: string }[];
  gallery?: string[];
  music?: string;
  rsvp: { phone: string; by: string; contact: string };
  closing: string;
  // Optional sections the couple turned off, and their font style (none = the design's own).
  hide?: SectionId[];
  font?: string;
  // The couple's own monogram for the opening seal, a file in public/art/seals.
  seal?: string;
  // Tapping anywhere on the opening screen opens the invite, not only the seal.
  tapAnywhere?: boolean;
  // Directions only on functions with the couple's own map link, not a search for the venue (e.g.
  // "At our residence", which a search can't find).
  noMapSearch?: boolean;
  // Bigger, darker text throughout, for families whose guests are mostly older.
  largeText?: boolean;
  // Stack the couple's names vertically on the hero cover (first name, &, second name). On Rajwada,
  // the couple's cards sit one below the other. On Gauri Shankar, the opening, families and closing
  // stack them while the cover keeps one line.
  stackNames?: boolean;
  // Hide the "With love · hosts" line at the end.
  noSignoff?: boolean;
  // Let the parents' lines use more of the page's width, so a long line stays on one line.
  parentsWide?: boolean;
  // The small heading over the names on the cover, in place of "The wedding of" (e.g. "The wedding reception of").
  heroKicker?: string;
  // A family's own sign-off just above the Aavjoo line (e.g. "With love,\nAlwani Family"; Bagh-style designs).
  signoff?: string;
  // Hide "Crafted with love by Aavjoo" at the end.
  noBranding?: boolean;
  // A family's own last line in its place (e.g. "Made with love for the Multani Family"; Sarovar).
  brandLine?: string;
  // Show the big date on the save-the-date card as two digits ("01"), since this serif's 1 reads as "I".
  padDay?: boolean;
  // An engagement rather than a wedding: the link title, share card and hidden labels say so.
  occasion?: "engagement" | "reception";
  // Each name above its family lines (Mandir), instead of the lines above the name.
  namesFirst?: boolean;
  // Venue and function notes a weight heavier (Mandir).
  boldEvents?: boolean;
  // Shrinks the couple's names on the cover and names section (Mandir), e.g. 0.85.
  nameScale?: number;
  // A couple's own RSVP title (e.g. "Please join us" instead of "Will you join us?").
  rsvpTitle?: string;
  // A couple's own countdown title (e.g. "Our big day countdown" instead of "Until we say “I do”").
  countdownTitle?: string;
  // A couple's own RSVP heading in place of the design's.
  rsvpHeading?: { kicker: string; title: string; lead?: string };
  // Letters on the opening seal instead of the names' first letters.
  monogram?: string;
  // The opening screen's "Tap to open", in a couple's own words.
  openHint?: string;
  // A late parent's photo and name, on the opening screen and again at the end, in their memory.
  // `large` makes the closing tribute bigger and darker, for families sharing with older guests.
  // `last`: show it at the very end, after the hashtag (Bagh-style illustrated designs).
  memorial?: { photo: string; name?: string; large?: boolean; last?: boolean };
  // `seal` is a whole seal of its own (shape, colour and all), shown in place of the gold one.
  sealFull?: boolean;
  // Open on Mandir's carved temple doors re-coloured in Rajwada's maroon, whatever the design (first for Srinita & Smruti).
  doors?: "maroon";
  // A small image above the invocation on the cover (e.g. a gold Ganesha or the couple's monogram), transparent PNG in /art/seals. Rajwada and Phulkari.
  invocationArt?: string;
  // Leave the date line off the cover (the dates still show on every function card). Rajwada and Gauri Shankar.
  hideHeroDate?: boolean;
  // Leave the hosts' line ("The … family") off the cover; it still opens the blessing (Phulkari).
  hideHeroHosts?: boolean;
  // Leave the city off the cover too (Rajwada). Venues still show on every function card.
  hideHeroCity?: boolean;
  // Just the date under the countdown, without the place (any design).
  hideCountdownCity?: boolean;
  // A line shown at the end in place of the couple's names, after a divider, e.g. "RSVP: Vandana & Sartaj Mathur" (painted designs).
  closingNote?: string;
  // The opening's two-line blessing in a couple's own words, e.g. "United by destiny,\nblessed by Mahadev" (Gauri Shankar).
  openingLine?: string;
  // The invitation paragraph set justified, its last line centred (Gauri Shankar).
  justifyMessage?: boolean;
  // The closing line shown one sentence per line (Gauri Shankar). Kept as a setting so the couple's own edits keep it.
  closingLines?: boolean;
  // A function's venue shown one comma-separated part per line, all in the venue's style (Gauri Shankar).
  venueLines?: boolean;
  // The invocation broken after each half-verse (after "।" or "|"), one line each (Gauri Shankar).
  invocationLines?: boolean;
  // Words shown at the very end in place of the couple's names, e.g. "Agarwal Family" (Mandir).
  closingNames?: string;
  // A couple's own wording for the invite's fixed words, by key in src/invites/i18n.ts (e.g.
  // { momentsKicker: "Their moments", scratchTitle: "Date and Place" }). Any design.
  words?: Record<string, string>;
  // The hosts' line split at " & " onto separate lines, "&" on its own (Mandir).
  hostsLines?: boolean;
  // Functions grouped into one card per day, instead of a card each.
  eventsByDay?: boolean;
  // With eventsByDay: a name for each day, in order ("Sagai", "Shaadi"…), shown beside its date in the RSVP.
  dayNames?: string[];
  // Cover shows only the names and wording, with no date or city (when functions are in different places).
  plainCover?: boolean;
  // The word between the two names on the cover, when "weds" doesn't fit (an engagement uses "&").
  joiner?: string;
  // Dress codes gathered into their own "Wardrobe" section instead of on each function card.
  wardrobe?: boolean;
  // Extra name lists printed near the end, as on a printed card (family, contacts, firms…).
  extras?: { title: string; lines: string[] }[];
  // A welcome line from the family, under those lists.
  welcome?: string;
  // People guests can call, in their own section after the photos. Phones with the country code.
  // `whatsapp` opens a WhatsApp chat instead of a call (a number abroad, say).
  contacts?: { name: string; phones: string[]; whatsapp?: boolean }[];
  // "hi" prints the invite's own words (headings, buttons, dates) in Hindi. Set by an admin for now.
  lang?: "hi";
};

export const invites: Invite[] = [
  {
    slug: "jasmeet-weds-harleen",
    template: "sarovar",
    groom: { first: "Jasmeet", full: "Jasmeet Singh", parents: "son of Sdn. Manpreet Kaur & S. Gurbir Singh" },
    bride: { first: "Harleen", full: "Harleen Kaur", parents: "daughter of Sdn. Rajinder Kaur & S. Amarjit Singh, Ludhiana" },
    lead: "groom",
    invocation: "॥ ਸਤਿਨਾਮ ਵਾਹਿਗੁਰੂ ॥",
    invocationMeaning: "",
    hosts: "Sdn. Manpreet Kaur & S. Gurbir Singh",
    message: "seek the pleasure of your gracious presence at the wedding celebrations of their beloved son",
    date: "2027-02-14T11:00:00+05:30",
    city: "Gurudwara Sri Dukh Niwaran Sahib, Patiala",
    hashtag: "#JasmeetWedsHarleen",
    events: [
      { kind: "other", name: "Arambh Sri Akhand Path Sahib", start: "2027-02-11T10:00:00+05:30", venue: "At our residence", address: "Leela Bhawan, Patiala" },
      { kind: "other", name: "Bhog Sri Akhand Path Sahib", start: "2027-02-13T10:00:00+05:30", venue: "At our residence", address: "Leela Bhawan, Patiala", note: "Kirtan, followed by Guru Ka Langar" },
      { kind: "other", name: "Jaggo", start: "2027-02-13T19:00:00+05:30", venue: "At our residence", address: "Leela Bhawan, Patiala", dress: "Bright and festive" },
      { kind: "phere", name: "Anand Karaj", start: "2027-02-14T08:30:00+05:30", venue: "Gurudwara Sri Dukh Niwaran Sahib", address: "Patiala", note: "Kindly avoid red and white, the colours are reserved for the couple" },
      { kind: "reception", name: "Reception", start: "2027-02-14T19:30:00+05:30", venue: "The Royal Orchard", address: "Sirhind Road, Patiala" },
    ],
    rsvp: { phone: "919699711809", by: "2027-02-01T00:00:00+05:30", contact: "Gurbir Singh" },
    closing: "Your presence and blessings mean the world to us. Please join us!",
  },
  {
    slug: "aarav-weds-meera",
    template: "rajwada",
    groom: { first: "Aarav", full: "Aarav Singh Rathore", parents: "Son of Mrs. Kavita & Mr. Vikram Singh Rathore" },
    bride: { first: "Meera", full: "Meera Shekhawat", parents: "Daughter of Mrs. Sunita & Mr. Rajendra Singh Shekhawat" },
    lead: "groom",
    invocation: "॥ श्री गणेशाय नमः ॥",
    invocationMeaning: "With the blessings of Lord Ganesha",
    hosts: "The Rathore & Shekhawat families",
    message:
      "request the honour of your presence as we celebrate the union of our children, and seek your blessings as they begin their journey together.",
    date: "2026-12-12T19:30:00+05:30",
    city: "Udaipur, Rajasthan",
    hashtag: "#AaravKiMeera",
    events: [
      {
        kind: "haldi",
        name: "Haldi",
        devanagari: "हल्दी",
        start: "2026-12-11T10:00:00+05:30",
        end: "2026-12-11T13:00:00+05:30",
        venue: "The Courtyard, Jagmandir Palace",
        address: "Jag Mandir, Lake Pichola, Udaipur, Rajasthan 313001",
        dress: "Shades of yellow",
      },
      {
        kind: "mehndi",
        name: "Mehndi & Sangeet",
        devanagari: "मेहंदी व संगीत",
        start: "2026-12-11T18:30:00+05:30",
        venue: "Zenana Mahal Lawns",
        address: "City Palace Complex, Udaipur, Rajasthan 313001",
        dress: "Festive greens & pinks",
        note: "Dinner and folk performances to follow",
      },
      {
        kind: "baraat",
        name: "Baraat",
        devanagari: "बारात",
        start: "2026-12-12T17:00:00+05:30",
        venue: "Gangaur Ghat",
        address: "Gangaur Ghat, Udaipur, Rajasthan 313001",
        dress: "Safas will be provided",
      },
      {
        kind: "phere",
        name: "Pheras",
        devanagari: "फेरे",
        start: "2026-12-12T19:30:00+05:30",
        venue: "Manek Chowk, City Palace",
        address: "City Palace Complex, Udaipur, Rajasthan 313001",
        note: "Shubh muhurat at 8:14 pm",
      },
      {
        kind: "reception",
        name: "Reception",
        devanagari: "स्वागत समारोह",
        start: "2026-12-13T20:00:00+05:30",
        venue: "Durbar Hall, Fateh Prakash",
        address: "City Palace Complex, Udaipur, Rajasthan 313001",
        dress: "Black tie / Indian formal",
      },
    ],
    rsvp: { phone: "919699711809", by: "2026-11-20T00:00:00+05:30", contact: "Rathore family" },
    closing: "Your presence is the greatest blessing we could ask for.",
  },
  {
    slug: "ishaan-weds-tara",
    template: "gulmohar",
    groom: { first: "Ishaan", full: "Ishaan Mehta", parents: "Son of Mrs. Neha & Mr. Rohan Mehta" },
    bride: { first: "Tara", full: "Tara Kulkarni", parents: "Daughter of Mrs. Aparna & Mr. Sudhir Kulkarni" },
    lead: "bride",
    invocation: "॥ श्री गणेशाय नमः ॥",
    invocationMeaning: "With the blessings of Lord Ganesha",
    hosts: "Together with their families",
    message: "invite you to a weekend of flowers, music and love as they tie the knot.",
    date: "2027-01-24T11:30:00+05:30",
    city: "Pune, Maharashtra",
    hashtag: "#TaraFoundHerIshaan",
    events: [
      {
        kind: "mehndi",
        name: "Mehndi",
        devanagari: "मेहंदी",
        start: "2027-01-22T15:00:00+05:30",
        end: "2027-01-22T19:00:00+05:30",
        venue: "The Orchid Garden",
        address: "Koregaon Park, Pune, Maharashtra 411001",
        dress: "Pastels & florals",
      },
      {
        kind: "haldi",
        name: "Haldi",
        devanagari: "हळद",
        start: "2027-01-23T10:30:00+05:30",
        venue: "Kulkarni Wada",
        address: "Prabhat Road, Erandwane, Pune, Maharashtra 411004",
        dress: "Yellow, of course",
      },
      {
        kind: "sangeet",
        name: "Sangeet",
        devanagari: "संगीत",
        start: "2027-01-23T19:30:00+05:30",
        venue: "Sunset Lawns, Hyatt Regency",
        address: "Viman Nagar, Pune, Maharashtra 411014",
        note: "Bring your dancing shoes",
      },
      {
        kind: "phere",
        name: "Wedding",
        devanagari: "शुभ विवाह",
        start: "2027-01-24T11:30:00+05:30",
        venue: "The Glasshouse, Hyatt Regency",
        address: "Viman Nagar, Pune, Maharashtra 411014",
        note: "Lunch to follow",
      },
    ],
    rsvp: { phone: "919699711809", by: "2027-01-05T00:00:00+05:30", contact: "Tara & Ishaan" },
    closing: "We can't wait to celebrate with you.",
  },
  {
    slug: "kabir-weds-anaya",
    template: "agni",
    groom: { first: "Kabir", full: "Kabir Malhotra", parents: "Son of Mrs. Ritu & Mr. Arjun Malhotra" },
    bride: { first: "Anaya", full: "Anaya Iyer", parents: "Daughter of Mrs. Lakshmi & Mr. Venkat Iyer" },
    lead: "groom",
    invocation: "॥ ॐ ॥",
    invocationMeaning: "Seven steps, seven promises",
    hosts: "With joy, the Malhotra & Iyer families",
    message: "invite you to witness seven vows taken around the sacred fire.",
    date: "2026-11-28T18:00:00+05:30",
    city: "New Delhi",
    events: [
      {
        kind: "haldi",
        name: "Haldi",
        devanagari: "हल्दी",
        start: "2026-11-27T11:00:00+05:30",
        venue: "Malhotra Residence",
        address: "Golf Links, New Delhi 110003",
        dress: "Yellow",
      },
      {
        kind: "sangeet",
        name: "Sangeet",
        devanagari: "संगीत",
        start: "2026-11-27T19:30:00+05:30",
        venue: "The Lodhi",
        address: "Lodhi Road, New Delhi 110003",
        dress: "Cocktail",
      },
      {
        kind: "phere",
        name: "Pheras",
        devanagari: "फेरे",
        start: "2026-11-28T18:00:00+05:30",
        venue: "Sunder Nursery",
        address: "Mathura Road, Nizamuddin, New Delhi 110013",
        note: "Muhurat at 6:42 pm",
      },
      {
        kind: "reception",
        name: "Reception",
        devanagari: "स्वागत",
        start: "2026-11-29T20:00:00+05:30",
        venue: "The Imperial",
        address: "Janpath, Connaught Place, New Delhi 110001",
        dress: "Formal",
      },
    ],
    rsvp: { phone: "919699711809", by: "2026-11-10T00:00:00+05:30", contact: "Malhotra family" },
    closing: "Come for the vows, stay for the dancing.",
  },
  {
    slug: "zaid-weds-inaya",
    template: "noor",
    groom: { first: "Zaid", full: "Zaid Qureshi", parents: "Son of Mrs. Farah & Mr. Imran Qureshi" },
    bride: { first: "Inaya", full: "Inaya Siddiqui", parents: "Daughter of Mrs. Rukhsar & Mr. Salman Siddiqui" },
    lead: "groom",
    invocation: "بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
    invocationMeaning: "In the name of Allah, the Most Gracious, the Most Merciful",
    hosts: "The Qureshi & Siddiqui families",
    message: "joyfully invite you to celebrate the Nikah of their children, and to share in their happiness.",
    date: "2026-12-19T19:00:00+05:30",
    city: "Lucknow, Uttar Pradesh",
    hashtag: "#ZaidKiInaya",
    events: [
      {
        kind: "mehndi",
        name: "Mehndi",
        start: "2026-12-17T18:00:00+05:30",
        venue: "Siddiqui Residence",
        address: "Hazratganj, Lucknow, Uttar Pradesh 226001",
        dress: "Greens & yellows",
      },
      {
        kind: "nikah",
        name: "Nikah",
        start: "2026-12-19T19:00:00+05:30",
        venue: "Taj Mahal Lucknow, Durbar Hall",
        address: "Vipin Khand, Gomti Nagar, Lucknow, Uttar Pradesh 226010",
        note: "Dinner to follow",
      },
      {
        kind: "walima",
        name: "Walima",
        start: "2026-12-21T20:00:00+05:30",
        venue: "The Qureshi Lawns",
        address: "Indira Nagar, Lucknow, Uttar Pradesh 226016",
        dress: "Formal",
        note: "Hosted by the Qureshi family",
      },
    ],
    rsvp: { phone: "919699711809", by: "2026-12-05T00:00:00+05:30", contact: "Qureshi family" },
    closing: "Your duas and presence mean the world to us.",
  },
  {
    slug: "jasraj-weds-simran",
    template: "phulkari",
    groom: { first: "Jasraj", full: "Jasraj Singh Gill", parents: "Son of S. Harpreet Singh & Sdn. Manjeet Kaur Gill" },
    bride: { first: "Simran", full: "Simran Kaur Sandhu", parents: "Daughter of S. Gurdeep Singh & Sdn. Navneet Kaur Sandhu" },
    lead: "groom",
    invocation: "ੴ",
    invocationMeaning: "Ik Onkar",
    hosts: "The Gill & Sandhu families",
    message: "invite you to bless Jasraj and Simran as they are joined in Anand Karaj, and to dance with us all weekend.",
    date: "2027-02-14T10:00:00+05:30",
    city: "Amritsar, Punjab",
    hashtag: "#JasSimDiJodi",
    events: [
      {
        kind: "jaggo",
        name: "Jaggo",
        start: "2027-02-12T20:00:00+05:30",
        venue: "Sandhu Farmhouse",
        address: "Ajnala Road, Amritsar, Punjab 143001",
        dress: "Bright & comfortable shoes",
        note: "Bring your loudest voice",
      },
      {
        kind: "haldi",
        name: "Maiyan",
        start: "2027-02-13T11:00:00+05:30",
        venue: "Gill Haveli",
        address: "Ranjit Avenue, Amritsar, Punjab 143001",
        dress: "Yellow",
      },
      {
        kind: "anandkaraj",
        name: "Anand Karaj",
        start: "2027-02-14T10:00:00+05:30",
        venue: "Gurdwara Sahib, Ranjit Avenue",
        address: "Ranjit Avenue, Amritsar, Punjab 143001",
        note: "Please cover your head. Langar follows the laavan",
      },
      {
        kind: "reception",
        name: "Reception",
        start: "2027-02-14T20:00:00+05:30",
        venue: "Hyatt Regency Amritsar",
        address: "MBM Farms, GT Road, Amritsar, Punjab 143001",
        dress: "Party glam",
      },
    ],
    rsvp: { phone: "919699711809", by: "2027-01-31T00:00:00+05:30", contact: "Gill family" },
    closing: "Aao ji, nachiye! We can't wait to see you on the dance floor.",
  },
  {
    slug: "karthik-weds-meenakshi",
    template: "kolam",
    groom: { first: "Karthik", full: "Karthik Raghavan", parents: "Son of Smt. Lalitha & Shri. Raghavan Srinivasan" },
    bride: { first: "Meenakshi", full: "Meenakshi Sundaram", parents: "Daughter of Smt. Kamala & Shri. Sundaram Venkatesan" },
    lead: "bride",
    invocation: "சுப முகூர்த்தம்",
    invocationMeaning: "Subha Muhurtham",
    hosts: "With the blessings of elders, the Sundaram & Raghavan families",
    message: "request the pleasure of your company at the marriage of their children, and seek your blessings.",
    date: "2027-01-28T06:30:00+05:30",
    city: "Madurai, Tamil Nadu",
    events: [
      {
        kind: "mehndi",
        name: "Nichayathartham",
        start: "2027-01-27T17:00:00+05:30",
        venue: "Sri Meenakshi Kalyana Mandapam",
        address: "Bypass Road, Madurai, Tamil Nadu 625010",
        dress: "Silk",
      },
      {
        kind: "muhurtham",
        name: "Muhurtham",
        start: "2027-01-28T06:30:00+05:30",
        end: "2027-01-28T07:30:00+05:30",
        venue: "Sri Meenakshi Kalyana Mandapam",
        address: "Bypass Road, Madurai, Tamil Nadu 625010",
        note: "Muhurtham between 6:30 and 7:30 am. Breakfast follows",
      },
      {
        kind: "reception",
        name: "Reception",
        start: "2027-01-28T18:30:00+05:30",
        venue: "Heritage Madurai",
        address: "11 Melakkal Main Road, Kochadai, Madurai, Tamil Nadu 625016",
        dress: "Festive",
      },
    ],
    rsvp: { phone: "919699711809", by: "2027-01-15T00:00:00+05:30", contact: "Sundaram family" },
    closing: "Your blessings will make our day complete.",
  },
  {
    slug: "rudra-weds-gauri",
    template: "gaurishankar",
    groom: { first: "Rudra", full: "Rudra Mishra", parents: "Son of Mrs. Kavita & Mr. Alok Mishra" },
    bride: { first: "Gauri", full: "Gauri Pandey", parents: "Daughter of Mrs. Rekha & Mr. Sanjay Pandey" },
    lead: "groom",
    invocation: "॥ वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा ॥",
    invocationMeaning: "With the divine grace of Lord Ganesha",
    hosts: "The Mishra & Pandey families",
    message: "request the honour of your presence at the wedding of their children, and your blessings as they begin their journey together.",
    date: "2027-02-18T11:00:00+05:30",
    city: "Varanasi, Uttar Pradesh",
    hashtag: "#RudraKiGauri",
    events: [
      { kind: "haldi", name: "Haldi", start: "2027-02-16T10:00:00+05:30", venue: "Mishra Niwas", address: "Lanka, Varanasi, Uttar Pradesh 221005", note: "A morning of turmeric, marigolds and laughter", dress: "Yellows" },
      { kind: "sangeet", name: "Sangeet", start: "2027-02-17T19:00:00+05:30", venue: "Ganga Darshan Lawns", address: "Assi Ghat Road, Varanasi, Uttar Pradesh 221005", note: "An evening of music and dance" },
      { kind: "phere", name: "Wedding", start: "2027-02-18T11:00:00+05:30", venue: "Kashi Vivah Mandap", address: "Dashashwamedh Road, Varanasi, Uttar Pradesh 221001", note: "Seven vows before the sacred fire" },
      { kind: "reception", name: "Reception", start: "2027-02-18T19:30:00+05:30", venue: "The Ramada Plaza", address: "The Mall, Cantonment, Varanasi, Uttar Pradesh 221002", dress: "Evening formal" },
    ],
    rsvp: { phone: "919699711809", by: "2027-02-05T00:00:00+05:30", contact: "Mishra family" },
    closing: "Har Har Mahadev. Your blessings will make our day complete.",
    music: "file:/music/piya-ghar-aavenge.mp3",
  },
  {
    slug: "advait-weds-naina",
    template: "mandir",
    groom: { first: "Advait", full: "Advait Joshi", parents: "Son of Mrs. Shubhangi & Mr. Milind Joshi" },
    bride: { first: "Naina", full: "Naina Kulkarni", parents: "Daughter of Mrs. Asha & Mr. Rajesh Kulkarni" },
    lead: "groom",
    invocation: "॥ श्री गणेशाय नमः ॥",
    invocationMeaning: "With the blessings of Lord Ganesha",
    hosts: "The Joshi & Kulkarni families",
    message: "cordially request the honour of your presence at the wedding of their children, and your blessings as they walk into a new life together.",
    date: "2027-02-07T11:30:00+05:30",
    city: "Nashik, Maharashtra",
    hashtag: "#AdvaitKiNaina",
    events: [
      {
        kind: "mehndi",
        name: "Mehendi",
        start: "2027-02-05T16:00:00+05:30",
        venue: "The Courtyard, Godavari Heritage",
        address: "Gangapur Road, Nashik, Maharashtra 422013",
        dress: "Greens & pinks",
      },
      {
        kind: "haldi",
        name: "Haldi",
        start: "2027-02-06T10:00:00+05:30",
        venue: "Joshi Wada",
        address: "Panchavati, Nashik, Maharashtra 422003",
        dress: "Shades of yellow",
      },
      {
        kind: "sangeet",
        name: "Sangeet",
        start: "2027-02-06T19:00:00+05:30",
        venue: "Riverside Lawns, Godavari Heritage",
        address: "Gangapur Road, Nashik, Maharashtra 422013",
        note: "Dinner to follow",
      },
      {
        kind: "phere",
        name: "Wedding",
        start: "2027-02-07T11:30:00+05:30",
        venue: "Temple Lawns, Godavari Heritage",
        address: "Gangapur Road, Nashik, Maharashtra 422013",
        dress: "Traditional",
      },
    ],
    rsvp: { phone: "919699711809", by: "2027-01-25T00:00:00+05:30", contact: "Joshi family" },
    closing: "Come with your blessings, leave with a full heart.",
  },
  {
    slug: "riya-weds-aditya",
    template: "bagh",
    groom: { first: "Aditya", full: "Aditya Desai", parents: "Son of Mrs. Hema & Mr. Nilesh Desai" },
    bride: { first: "Riya", full: "Riya Mehta", parents: "Daughter of Mrs. Kinjal & Mr. Paresh Mehta" },
    lead: "bride",
    invocation: "॥ श्री गणेशाय नमः ॥",
    invocationMeaning: "With the blessings of Lord Ganesha",
    hosts: "The Mehta & Desai families",
    message: "request the pleasure of your company as our children begin their life together.",
    date: "2027-01-26T19:30:00+05:30",
    city: "Udaipur, Rajasthan",
    hashtag: "#RiyaKaAditya",
    events: [
      {
        kind: "mehndi",
        name: "Mandap Muhurat & Mehendi",
        start: "2027-01-24T16:00:00+05:30",
        venue: "Lakeside Lawns, Fateh Garh",
        address: "Fateh Garh, Udaipur, Rajasthan 313001",
        dress: "Greens & pinks",
      },
      {
        kind: "haldi",
        name: "Pithi, Mameru & Haldi",
        start: "2027-01-25T10:30:00+05:30",
        venue: "The Courtyard, Fateh Garh",
        address: "Fateh Garh, Udaipur, Rajasthan 313001",
        dress: "Shades of yellow",
      },
      {
        kind: "phere",
        name: "Wedding",
        start: "2027-01-26T19:30:00+05:30",
        venue: "Durbar Lawns, Fateh Garh",
        address: "Fateh Garh, Udaipur, Rajasthan 313001",
        note: "Dinner to follow",
      },
    ],
    rsvp: { phone: "919699711809", by: "2027-01-10T00:00:00+05:30", contact: "Mehta family" },
    closing: "Come for the vows, stay for the garba.",
  },
  {
    slug: "vihaan-weds-kavya",
    template: "mahal",
    groom: { first: "Vihaan", full: "Vihaan Singh Chauhan", parents: "Son of Mrs. Anita & Mr. Devendra Singh Chauhan" },
    bride: { first: "Kavya", full: "Kavya Rathore", parents: "Daughter of Mrs. Meenal & Mr. Harsh Rathore" },
    lead: "groom",
    invocation: "॥ श्री गणेशाय नमः ॥",
    invocationMeaning: "With the blessings of Lord Ganesha",
    hosts: "The Chauhan & Rathore families",
    message: "request the honour of your presence as we celebrate the union of our children by the lake.",
    date: "2027-02-06T19:00:00+05:30",
    city: "Udaipur, Rajasthan",
    hashtag: "#VihaanWedsKavya",
    events: [
      { kind: "mehndi", name: "Mehndi", start: "2027-02-04T16:00:00+05:30", venue: "The Garden Terrace", address: "Lake Pichola, Udaipur, Rajasthan 313001", dress: "Greens & pinks" },
      { kind: "sangeet", name: "Sangeet", start: "2027-02-05T19:30:00+05:30", venue: "Durbar Hall", address: "City Palace, Udaipur, Rajasthan 313001", dress: "Festive glam" },
      { kind: "phere", name: "Pheras", start: "2027-02-06T19:00:00+05:30", venue: "Lakeside Mandap", address: "Lake Pichola, Udaipur, Rajasthan 313001", note: "Dinner to follow" },
    ],
    rsvp: { phone: "919699711809", by: "2027-01-20T00:00:00+05:30", contact: "Chauhan family" },
    closing: "Your blessings will make our day complete.",
  },
  {
    slug: "rhea-weds-arjun",
    template: "khat",
    groom: { first: "Arjun", full: "Arjun Malhotra", parents: "Son of Mrs. Ritu & Mr. Sanjay Malhotra" },
    bride: { first: "Rhea", full: "Rhea Kapoor", parents: "Daughter of Mrs. Neelam & Mr. Vikas Kapoor" },
    lead: "bride",
    invocation: "॥ श्री गणेशाय नमः ॥",
    invocationMeaning: "With the blessings of Lord Ganesha",
    hosts: "Together with their families",
    message: "invite you to a weekend of flowers, music and love as they say yes to forever.",
    date: "2027-03-13T17:30:00+05:30",
    city: "Jaipur, Rajasthan",
    hashtag: "#RheaArjunForever",
    events: [
      { kind: "haldi", name: "Haldi", start: "2027-03-12T11:00:00+05:30", venue: "The Orchard", address: "Amer Road, Jaipur, Rajasthan 302002", dress: "Yellow & white" },
      { kind: "sangeet", name: "Sangeet", start: "2027-03-12T19:30:00+05:30", venue: "Sunset Lawns", address: "Amer Road, Jaipur, Rajasthan 302002", note: "Bring your dancing shoes" },
      { kind: "phere", name: "Wedding", start: "2027-03-13T17:30:00+05:30", venue: "The Meadow", address: "Amer Road, Jaipur, Rajasthan 302002", note: "Ceremony at golden hour" },
    ],
    rsvp: { phone: "919699711809", by: "2027-02-25T00:00:00+05:30", contact: "Rhea & Arjun" },
    closing: "We can't wait to celebrate with you.",
  },
  {
    slug: "nila-weds-surya",
    template: "gopuram",
    groom: { first: "Surya", full: "Surya Narayanan", parents: "Son of Smt. Padma & Shri. Narayanan Iyer" },
    bride: { first: "Nila", full: "Nila Krishnan", parents: "Daughter of Smt. Vasanthi & Shri. Krishnan Raman" },
    lead: "bride",
    invocation: "சுப முகூர்த்தம்",
    invocationMeaning: "Subha Muhurtham",
    hosts: "With the blessings of elders, the Krishnan & Narayanan families",
    message: "request the pleasure of your company at the marriage of their children, and seek your blessings.",
    date: "2027-02-11T07:00:00+05:30",
    city: "Madurai, Tamil Nadu",
    events: [
      { kind: "mehndi", name: "Nichayathartham", start: "2027-02-10T17:00:00+05:30", venue: "Sri Lakshmi Kalyana Mandapam", address: "Bypass Road, Madurai, Tamil Nadu 625010", dress: "Silk" },
      { kind: "muhurtham", name: "Muhurtham", start: "2027-02-11T07:00:00+05:30", venue: "Sri Lakshmi Kalyana Mandapam", address: "Bypass Road, Madurai, Tamil Nadu 625010", note: "Breakfast follows" },
      { kind: "reception", name: "Reception", start: "2027-02-11T18:30:00+05:30", venue: "Heritage Madurai", address: "Kochadai, Madurai, Tamil Nadu 625016", dress: "Festive" },
    ],
    rsvp: { phone: "919699711809", by: "2027-01-28T00:00:00+05:30", contact: "Krishnan family" },
    closing: "Your blessings will make our day complete.",
  },
  {
    slug: "haveli-preview",
    template: "haveli",
    groom: { first: "Arjun", full: "Arjun Singh Mertiya", parents: "Son of Mrs. Sunita & Mr. Rajendra Mertiya" },
    bride: { first: "Vani", full: "Vani Kothari", parents: "Daughter of Mrs. Rekha & Mr. Pankaj Kothari" },
    lead: "groom",
    invocation: "॥ श्री गणेशाय नमः ॥",
    invocationMeaning: "With the blessings of Lord Ganesha",
    hosts: "The Mertiya & Kothari families",
    message: "cordially invite you to the wedding of their children and seek your blessings as they begin a new life together.",
    date: "2027-02-18T16:15:00+05:30",
    city: "Jaipur, Rajasthan",
    hashtag: "#ArjunWedsVani",
    events: [
      { kind: "other", name: "Ganesh Nimantran", start: "2027-02-14T08:00:00+05:30", venue: "Family residence, Lalkothi", address: "" },
      { kind: "mehndi", name: "Sagai", start: "2027-02-17T18:00:00+05:30", venue: "Palace lawns, Vaishali Nagar", address: "", note: "Dinner before sunset" },
      { kind: "sangeet", name: "Sangeet Sandhya", start: "2027-02-17T19:30:00+05:30", venue: "Palace lawns, Vaishali Nagar", address: "" },
      { kind: "baraat", name: "Nikasi", start: "2027-02-18T11:00:00+05:30", venue: "Palace lawns, Vaishali Nagar", address: "" },
      { kind: "phere", name: "Panigrahan Sanskar", start: "2027-02-18T16:15:00+05:30", venue: "Palace lawns, Vaishali Nagar", address: "" },
      { kind: "reception", name: "Ashirwad Samaroh", start: "2027-02-18T19:30:00+05:30", venue: "Palace lawns, Vaishali Nagar", address: "", note: "Dinner before sunset" },
    ],
    rsvp: { phone: "919699711809", by: "2027-02-05T00:00:00+05:30", contact: "Mertiya family" },
    closing: "Your presence and blessings will make our celebration complete.",
    music: "file:/music/krishna-flute.m4a",
  },
  {
    slug: "rohan-and-ishita",
    template: "vachan",
    occasion: "engagement",
    groom: { first: "Rohan", full: "Rohan Sharma", parents: "Son of Mrs. Neelam & Mr. Rakesh Sharma" },
    bride: { first: "Ishita", full: "Ishita Verma", parents: "Daughter of Mrs. Sunita & Mr. Anil Verma" },
    lead: "groom",
    invocation: "॥ श्री गणेशाय नमः ॥",
    invocationMeaning: "With the blessings of Lord Ganesha",
    hosts: "The Sharma & Verma families",
    message: "cordially request the honour of your presence at the engagement ceremony of their children, and your blessings as they begin a new journey together.",
    date: "2027-01-17T11:00:00+05:30",
    city: "Jaipur, Rajasthan",
    hashtag: "#RohanKiIshita",
    events: [
      {
        kind: "engagement",
        name: "Ring Ceremony",
        start: "2027-01-17T11:00:00+05:30",
        venue: "Shiv Vilas Lawns",
        address: "Jaipur–Delhi Highway, Jaipur, Rajasthan 302028",
        dress: "Traditional",
      },
      {
        kind: "other",
        name: "Lunch",
        start: "2027-01-17T13:30:00+05:30",
        venue: "Shiv Vilas Lawns",
        address: "Jaipur–Delhi Highway, Jaipur, Rajasthan 302028",
      },
    ],
    rsvp: { phone: "919699711809", by: "2027-01-10T00:00:00+05:30", contact: "Sharma family" },
    closing: "Your blessings mean the world to us.",
  },
  {
    slug: "dev-and-anika",
    template: "mudrika",
    occasion: "engagement",
    groom: { first: "Dev", full: "Dev Malhotra", parents: "Son of Mrs. Ritu & Mr. Sanjay Malhotra" },
    bride: { first: "Anika", full: "Anika Kapoor", parents: "Daughter of Mrs. Meera & Mr. Vikram Kapoor" },
    lead: "bride",
    invocation: "॥ श्री गणेशाय नमः ॥",
    invocationMeaning: "With the blessings of Lord Ganesha",
    hosts: "The Kapoor & Malhotra families",
    message: "invite you to celebrate with us as our children exchange rings and say yes to forever.",
    date: "2027-02-14T19:00:00+05:30",
    city: "Pune, Maharashtra",
    hashtag: "#DevKiAnika",
    events: [
      {
        kind: "engagement",
        name: "Ring Ceremony",
        start: "2027-02-14T19:00:00+05:30",
        venue: "The Garden Terrace, Westin Pune",
        address: "Koregaon Park Annexe, Pune, Maharashtra 411036",
        dress: "Pastels",
      },
      {
        kind: "other",
        name: "Dinner",
        start: "2027-02-14T21:00:00+05:30",
        venue: "The Garden Terrace, Westin Pune",
        address: "Koregaon Park Annexe, Pune, Maharashtra 411036",
      },
    ],
    rsvp: { phone: "919699711809", by: "2027-02-07T00:00:00+05:30", contact: "Kapoor family" },
    closing: "Come celebrate the beginning of our forever.",
  },
  {
    slug: "kunal-and-sanya",
    template: "angoothi",
    occasion: "engagement",
    groom: { first: "Kunal", full: "Kunal Agarwal", parents: "Son of Mrs. Rekha & Mr. Manoj Agarwal" },
    bride: { first: "Sanya", full: "Sanya Gupta", parents: "Daughter of Mrs. Pooja & Mr. Alok Gupta" },
    lead: "bride",
    invocation: "॥ श्री गणेशाय नमः ॥",
    invocationMeaning: "With the blessings of Lord Ganesha",
    hosts: "The Gupta & Agarwal families",
    message: "joyfully invite you to the ring ceremony of their children, and seek your blessings as they begin a new chapter together.",
    date: "2027-01-24T12:00:00+05:30",
    city: "Lucknow, Uttar Pradesh",
    hashtag: "#KunalKiSanya",
    events: [
      {
        kind: "engagement",
        name: "Ring Ceremony",
        start: "2027-01-24T12:00:00+05:30",
        venue: "The Centrum",
        address: "Sushant Golf City, Lucknow, Uttar Pradesh 226030",
        dress: "Pastels and ethnic wear",
      },
      {
        kind: "other",
        name: "Lunch",
        start: "2027-01-24T13:30:00+05:30",
        venue: "The Centrum",
        address: "Sushant Golf City, Lucknow, Uttar Pradesh 226030",
      },
    ],
    rsvp: { phone: "919699711809", by: "2027-01-17T00:00:00+05:30", contact: "Gupta family" },
    closing: "Your blessings will make our day complete.",
  },
  {
    slug: "arjun-and-meher",
    template: "chandni",
    occasion: "engagement",
    groom: { first: "Arjun", full: "Arjun Mehta", parents: "Son of Mrs. Kavita & Mr. Rajiv Mehta" },
    bride: { first: "Meher", full: "Meher Chopra", parents: "Daughter of Mrs. Anjali & Mr. Sunil Chopra" },
    lead: "bride",
    invocation: "॥ श्री गणेशाय नमः ॥",
    invocationMeaning: "With the blessings of Lord Ganesha",
    hosts: "The Chopra & Mehta families",
    message: "invite you to an evening of rings, music and moonlight as their children get engaged.",
    date: "2027-02-06T19:30:00+05:30",
    city: "Udaipur, Rajasthan",
    hashtag: "#MeherMeetsArjun",
    events: [
      {
        kind: "engagement",
        name: "Ring Ceremony",
        start: "2027-02-06T19:30:00+05:30",
        venue: "The Terrace, Lake Pichola Palace",
        address: "Lake Pichola, Udaipur, Rajasthan 313001",
        dress: "Evening glam",
      },
      {
        kind: "other",
        name: "Cocktails & Dinner",
        start: "2027-02-06T21:00:00+05:30",
        venue: "The Terrace, Lake Pichola Palace",
        address: "Lake Pichola, Udaipur, Rajasthan 313001",
      },
    ],
    rsvp: { phone: "919699711809", by: "2027-01-30T00:00:00+05:30", contact: "Chopra family" },
    closing: "Come dance with us under the stars.",
  },
  {
    slug: "karan-and-simran",
    template: "roka",
    occasion: "engagement",
    groom: { first: "Karan", full: "Karan Bedi", parents: "Son of Mrs. Harleen & Mr. Gurpreet Bedi" },
    bride: { first: "Simran", full: "Simran Khanna", parents: "Daughter of Mrs. Neetu & Mr. Ashok Khanna" },
    lead: "groom",
    invocation: "॥ श्री गणेशाय नमः ॥",
    invocationMeaning: "With the blessings of Lord Ganesha",
    hosts: "The Bedi & Khanna families",
    message: "request the pleasure of your company at the Roka of their children. Come, bless the couple and celebrate with us.",
    date: "2027-01-10T11:00:00+05:30",
    city: "Amritsar, Punjab",
    hashtag: "#KaranDiSimran",
    events: [
      {
        kind: "engagement",
        name: "Roka",
        start: "2027-01-10T11:00:00+05:30",
        venue: "Khanna Residence",
        address: "Ranjit Avenue, Amritsar, Punjab 143001",
        dress: "Bright and festive",
      },
      {
        kind: "other",
        name: "Lunch",
        start: "2027-01-10T13:00:00+05:30",
        venue: "Khanna Residence",
        address: "Ranjit Avenue, Amritsar, Punjab 143001",
      },
    ],
    rsvp: { phone: "919699711809", by: "2027-01-05T00:00:00+05:30", contact: "Khanna family" },
    closing: "Rab rakha. We can't wait to celebrate with you.",
  },
  {
    slug: "vivaan-weds-ira",
    template: "chameli",
    groom: { first: "Vivaan", full: "Vivaan Malhotra", parents: "Son of Mrs. Shalini & Mr. Rohit Malhotra" },
    bride: { first: "Ira", full: "Ira Bhandari", parents: "Daughter of Mrs. Meenakshi & Mr. Alok Bhandari" },
    lead: "groom",
    invocation: "॥ श्री गणेशाय नमः ॥",
    invocationMeaning: "With the blessings of Lord Ganesha",
    hosts: "The Malhotra & Bhandari families",
    message: "request the pleasure of your company as their children\nexchange vows in the company of those they hold dear.",
    date: "2027-02-20T19:30:00+05:30",
    city: "Dehradun, Uttarakhand",
    hashtag: "#VivaanFoundHisIra",
    events: [
      { kind: "haldi", name: "Haldi", start: "2027-02-19T11:00:00+05:30", venue: "The Courtyard, Ira's family home", address: "Rajpur Road, Dehradun, Uttarakhand 248001", dress: "Shades of yellow" },
      { kind: "mehndi", name: "Mehndi & Sangeet", start: "2027-02-19T18:30:00+05:30", venue: "The Lawns, JW Marriott Mussoorie", address: "Kempty Fall Road, Mussoorie, Uttarakhand 248179", dress: "Festive pastels" },
      { kind: "phere", name: "Wedding", start: "2027-02-20T19:30:00+05:30", venue: "The Grand Terrace, JW Marriott Mussoorie", address: "Kempty Fall Road, Mussoorie, Uttarakhand 248179", dress: "Traditional" },
      { kind: "reception", name: "Reception", start: "2027-02-21T20:00:00+05:30", venue: "The Ballroom, Hyatt Regency Dehradun", address: "Rajpur Road, Dehradun, Uttarakhand 248001" },
    ],
    // The form always saves "Hosted by" as the RSVP contact.
    rsvp: { phone: "919699711809", by: "2027-02-05T00:00:00+05:30", contact: "The Malhotra & Bhandari families" },
    closing: "Your blessings will make our day complete.",
  },
  {
    slug: "arnav-and-kiara",
    template: "chamelisagai",
    occasion: "engagement",
    groom: { first: "Arnav", full: "Arnav Rawat", parents: "Son of Mrs. Anjali & Mr. Deepak Rawat" },
    bride: { first: "Kiara", full: "Kiara Negi", parents: "Daughter of Mrs. Sunita & Mr. Harish Negi" },
    lead: "bride",
    invocation: "॥ श्री गणेशाय नमः ॥",
    invocationMeaning: "With the blessings of Lord Ganesha",
    hosts: "The Negi & Rawat families",
    message: "request the pleasure of your company at the engagement ceremony of their children,\nand your blessings as they begin a new journey together.",
    date: "2027-01-23T18:30:00+05:30",
    city: "Mussoorie, Uttarakhand",
    hashtag: "#KiaraSaysYes",
    events: [
      { kind: "engagement", name: "Ring Ceremony", start: "2027-01-23T18:30:00+05:30", venue: "The Terrace, JW Marriott Mussoorie", address: "Kempty Fall Road, Mussoorie, Uttarakhand 248179", dress: "Pastels and ivory" },
      { kind: "other", name: "Dinner", start: "2027-01-23T20:30:00+05:30", venue: "The Terrace, JW Marriott Mussoorie", address: "Kempty Fall Road, Mussoorie, Uttarakhand 248179" },
    ],
    // The form always saves "Hosted by" as the RSVP contact.
    rsvp: { phone: "919699711809", by: "2027-01-16T00:00:00+05:30", contact: "The Negi & Rawat families" },
    closing: "Your blessings will make our day complete.",
  },
];

// Sample "Our moments" photos for the demos (illustrations of a fictional couple, see public/art/moments).
const demoMoments = ["/art/moments/m1.jpg", "/art/moments/m2.jpg", "/art/moments/m3.jpg", "/art/moments/m4.jpg"];
for (const i of invites) i.gallery ??= demoMoments;

// Each demo plays one of the songs, shuffled across the designs (fixed per demo so server and browser agree).
const demoTracks = songs.map((s) => s.id);
invites.forEach((i, n) => (i.music ??= demoTracks[(n * 5 + 2) % demoTracks.length]));

// Demos for private designs: they preview the design in its order form, but aren't listed or prerendered.
export const privateInvites: Invite[] = [
  // Khat in ivory red, to show a client before she orders: the Khat demo couple in the new colours.
  { ...invites.find((i) => i.slug === "rhea-weds-arjun")!, slug: "rhea-weds-arjun-red", template: "khatred" },
  // Rajwada Sagai (Khat's opening + Rajwada, rings for diyas): the Rajwada demo couple, engaged.
  {
    ...invites.find((i) => i.slug === "aarav-weds-meera")!,
    slug: "aarav-and-meera-engagement",
    template: "rajwadasagai",
    occasion: "engagement",
    message: "joyfully invite you to the engagement ceremony of their children, and seek your blessings as they begin a new journey together.",
    events: [
      { kind: "engagement", name: "Ring Ceremony", start: "2026-12-12T19:00:00+05:30", venue: "The Durbar Hall, Jagmandir Palace", address: "Lake Pichola, Udaipur, Rajasthan 313001", dress: "Royal & regal" },
      { kind: "other", name: "Dinner", start: "2026-12-12T21:00:00+05:30", venue: "The Durbar Hall, Jagmandir Palace", address: "Lake Pichola, Udaipur, Rajasthan 313001" },
    ],
    closing: "Your blessings will make our day complete.",
  },
];

export function getInvite(slug: string) {
  return invites.find((i) => i.slug === slug) ?? privateInvites.find((i) => i.slug === slug);
}

/** True for the demos shown on the site, which search engines may index. */
export const isListedDemo = (slug: string) => invites.some((i) => i.slug === slug);
