// What Aavjoo offers today and promises every couple. Everything here must stay true:
// figures are worked out from the real catalogue and settings, not typed in by hand.
// Swap in real reviews here once couples have shared them.

import { site } from "@/config/site";
import { templates } from "./templates";

const from = Math.min(...templates.map((t) => t.price));

export const stats: { value: string; label: string }[] = [
  { value: `${templates.length}`, label: "Designs to choose from" },
  { value: `₹${from}`, label: "Starting price, everything included" },
  { value: site.publishWithin.replace(" hours", " hrs"), label: "From payment to your live link" },
  { value: `${site.inviteDaysAfterWedding} days`, label: "Your link stays live after the wedding" },
];
