// All brand details live here. Swap these placeholders for the real values.
export const site = {
  name: "Nimantran",
  tagline: "Wedding invitations that open like a celebration",
  description:
    "Designer invitation websites for Indian weddings — one beautiful link with your events, venues, music and RSVP, shared on WhatsApp.",
  // International format without "+" or spaces, used for wa.me links.
  whatsapp: "919999999999",
  whatsappDisplay: "+91 99999 99999",
  email: "hello@nimantran.example",
  hours: "9 am – 10 pm IST",
  deliveryDays: 3,
  revisionRounds: 2,
  customFrom: 6999,
};

export function whatsappLink(message: string, phone: string = site.whatsapp) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function formatINR(amount: number) {
  return "₹" + amount.toLocaleString("en-IN");
}
