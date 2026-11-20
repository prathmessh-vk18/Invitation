"use client";

import { RsvpView, type RsvpRow } from "@/site/rsvp-view";

/**
 * The couple's RSVP page, as a preview with sample replies. The real page reads the invite's RSVPs
 * from the database at a private link (sent by email after the order confirmation, and shown on the
 * order page). Guests' replies still go to the couple's WhatsApp; this page counts and lists them.
 */

// Exactly what the invite's RSVP form sends: coming or not, a name, guests (1–12, only when coming),
// the functions picked (only when there's more than one) and an optional note. We add when it came.
type Reply = RsvpRow;

const FUNCTIONS = [
  { name: "Mehndi", day: "Thu, 10 Dec", time: "4:00 pm" },
  { name: "Sangeet", day: "Fri, 11 Dec", time: "7:00 pm" },
  { name: "Wedding", day: "Sat, 12 Dec", time: "7:30 pm" },
  { name: "Reception", day: "Sun, 13 Dec", time: "8:00 pm" },
];

const REPLIES: Reply[] = [
  { name: "Sharma family", coming: true, guests: 4, functions: ["Sangeet", "Wedding", "Reception"], note: "So happy for you both! Can't wait to dance 💃", ago: "12 min ago" },
  { name: "Priya & Rohan", coming: true, guests: 2, functions: ["Mehndi", "Sangeet", "Wedding"], ago: "40 min ago" },
  { name: "Verma Uncle", coming: true, guests: 3, functions: ["Wedding", "Reception"], ago: "1 h ago" },
  { name: "Ananya Iyer", coming: false, guests: 1, functions: [], note: "I'm abroad that week, sending all my love 🙏", ago: "2 h ago" },
  { name: "Kapoor family", coming: true, guests: 5, functions: ["Mehndi", "Sangeet", "Wedding", "Reception"], ago: "3 h ago" },
  { name: "Neha Gupta", coming: true, guests: 1, functions: ["Sangeet"], note: "Saving my best moves for the sangeet!", ago: "5 h ago" },
  { name: "Mehta family", coming: true, guests: 4, functions: ["Wedding"], ago: "Yesterday" },
  { name: "Arjun Nair", coming: false, guests: 1, functions: [], ago: "Yesterday" },
  { name: "Joshi Aunty", coming: true, guests: 2, functions: ["Mehndi", "Wedding"], ago: "Yesterday" },
  { name: "Riya & Kabir", coming: true, guests: 2, functions: ["Sangeet", "Wedding", "Reception"], note: "Count us in for everything ✨", ago: "2 days ago" },
  { name: "Banerjee family", coming: true, guests: 3, functions: ["Reception"], ago: "2 days ago" },
  { name: "Simran Kaur", coming: true, guests: 1, functions: ["Mehndi", "Sangeet"], ago: "3 days ago" },
];

export function RsvpDashboard() {
  return <RsvpView names="Aarav & Meera" subtitle="Wedding · Saturday, 12 December 2026 · Udaipur" functions={FUNCTIONS} replies={REPLIES} banner="Preview with sample guests. Couples will see their own replies here." />;
}
