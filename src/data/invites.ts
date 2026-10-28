import type { SectionId } from "@/config/customise";
import { songs } from "@/config/music";
import type { TemplateId } from "./templates";

export type EventKind = "haldi" | "mehndi" | "sangeet" | "baraat" | "phere" | "reception" | "nikah" | "walima" | "jaggo" | "anandkaraj" | "muhurtham" | "other";

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
};

export type Person = {
  first: string;
  full: string;
  parents: string;
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
  // "hi" prints the invite's own words (headings, buttons, dates) in Hindi. Set by an admin for now.
  lang?: "hi";
};

export const invites: Invite[] = [
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
    story: [
      { year: "2019", title: "First hello", text: "A borrowed umbrella outside a Pune bookshop, returned three coffees later." },
      { year: "2023", title: "The question", text: "Asked at sunrise on Sinhagad fort, answered before he finished." },
      { year: "2027", title: "Forever", text: "And now, with everyone we love, we make it official." },
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
];

// Sample "Our moments" photos for the demos (illustrations of a fictional couple, see public/art/moments).
const demoMoments = ["/art/moments/m1.jpg", "/art/moments/m2.jpg", "/art/moments/m3.jpg", "/art/moments/m4.jpg"];
for (const i of invites) i.gallery ??= demoMoments;

// Each demo plays one of the songs, shuffled across the designs (fixed per demo so server and browser agree).
const demoTracks = songs.map((s) => s.id);
invites.forEach((i, n) => (i.music ??= demoTracks[(n * 5 + 2) % demoTracks.length]));

// Demos for private designs: they preview the design in its order form, but aren't listed or prerendered.
export const privateInvites: Invite[] = [
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
    gallery: ["/art/moments/haveli-1.jpg", "/art/moments/haveli-2.jpg", "/art/moments/haveli-3.jpg", "/art/moments/haveli-4.jpg"],
    music: "file:/music/krishna-flute.m4a",
  },
];

export function getInvite(slug: string) {
  return invites.find((i) => i.slug === slug) ?? privateInvites.find((i) => i.slug === slug);
}

/** True for the demos shown on the site, which search engines may index. */
export const isListedDemo = (slug: string) => invites.some((i) => i.slug === slug);
