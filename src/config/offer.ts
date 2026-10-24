// The running offer. Change the name, dates or wording here and it updates everywhere.
// When `endsAt` passes, the struck-out prices and countdown disappear on their own.
export const offer = {
  name: "Launch offer",
  emoji: "✨",
  // The headline shown in the bar at the top of every page.
  headline: "Launch offer: every design from ₹249",
  // End of the offer, in IST. Keep this honest: the offer should really end then.
  endsAt: "2026-11-10T23:59:59+05:30",
};

export const offerEnds = new Date(offer.endsAt).getTime();

export function percentOff(price: number, mrp: number) {
  return Math.round(((mrp - price) / mrp) * 100);
}
