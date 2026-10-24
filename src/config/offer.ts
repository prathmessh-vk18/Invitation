// The running offer. Change the name, dates or wording here and it updates everywhere.
// Leave `endsAt` empty for an open-ended offer (no countdown). Set a real IST date to end it:
// the struck-out prices and countdown then show, and disappear on their own when it passes.
export const offer = {
  name: "Launch offer",
  emoji: "✨",
  // The headline shown in the bar at the top of every page.
  headline: "Launch offer: every design from ₹249",
  // e.g. "2026-12-31T23:59:59+05:30". Never set a date that resets: fake deadlines mislead customers.
  endsAt: null as string | null,
};

export const offerEnds = offer.endsAt ? new Date(offer.endsAt).getTime() : Number.POSITIVE_INFINITY;

export function percentOff(price: number, mrp: number) {
  return Math.round(((mrp - price) / mrp) * 100);
}
