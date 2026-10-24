// All brand details live here. Swap these placeholders for the real values.
export const site = {
  name: "Aavjoo",
  // The public address. Canonical links, the sitemap and share previews all use it.
  url: "https://aavjoo.in",
  tagline: "Wedding invitations that open like a celebration",
  description:
    "Designer invitation websites for Indian weddings — one beautiful link with your events, venues, music and RSVP, shared on WhatsApp.",
  // International format without "+" or spaces, used for wa.me links.
  whatsapp: "919699711809",
  whatsappDisplay: "+91 96997 11809",
  email: "vishwakarmaprathmesh1818@gmail.com",
  hours: "9 am – 10 pm IST",
  deliveryDays: 3,
  revisionRounds: 2,

  // UPI payments. Use a business UPI ID (current account or a business app), not a personal one.
  upiId: "vishwakarmaprathmesh18-1@okicici",
  upiPayee: "Aavjoo",
  // When an order is paid we aim to publish within this time.
  publishWithin: "24 hours",
  // A published invite stays live until this many days after the wedding date.
  inviteDaysAfterWedding: 15,
};

/** UPI deep link with the amount and order code filled in. Opens GPay, PhonePe, Paytm etc. on phones. */
export function upiLink(amount: number, note: string) {
  // The UPI ID goes in raw: some apps reject an encoded "@".
  return `upi://pay?pa=${site.upiId}&pn=${encodeURIComponent(site.upiPayee)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(note)}`;
}

export function whatsappLink(message: string, phone: string = site.whatsapp) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function formatINR(amount: number) {
  return "₹" + amount.toLocaleString("en-IN");
}
