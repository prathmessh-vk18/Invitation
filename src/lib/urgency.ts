import { formatINR, site } from "@/config/site";
import type { TemplateMeta } from "@/data/templates";
import type { Order } from "@/lib/orders";

/**
 * Honest reasons to pay now, shared by the order page and the admin's WhatsApp nudges:
 * the launch saving on this order, how soon the link arrives, and how close the wedding is.
 */

// How fast links go out once paid, in practice (the formal promise stays site.publishWithin).
export const LINK_IN = "5 minutes";

// Weddings closer than this get a date-led message.
const SOON_DAYS = 40;

export function daysToWedding(dateIso: string, now = Date.now()) {
  return Math.ceil((new Date(dateIso).getTime() - now) / 86_400_000);
}

export function saving(order: Pick<Order, "amount">, t?: Pick<TemplateMeta, "mrp">) {
  const mrp = t?.mrp ?? 0;
  return mrp > order.amount ? { mrp, off: mrp - order.amount, pct: Math.round(((mrp - order.amount) / mrp) * 100) } : null;
}

/** The line about the wedding date, only when it's close enough to matter. */
export function dateLine(days: number) {
  if (days < 0 || days > SOON_DAYS) return null;
  if (days <= 10) return { strong: true, text: `Only ${days} ${days === 1 ? "day" : "days"} to your wedding. Pay now and your guests get the invite today.` };
  return { strong: false, text: `Your wedding is in ${days} days. Families usually send invites 4–6 weeks before, so guests can plan travel.` };
}

/** WhatsApp text for an unpaid order. The second and later nudges are a gentler follow-up. */
export function nudgeMessage(order: Pick<Order, "code" | "amount" | "details">, t: Pick<TemplateMeta, "name" | "mrp"> | undefined, payUrl: string, nudges: number) {
  const d = order.details;
  const [a, b] = d.lead === "bride" ? [d.bride.first, d.groom.first] : [d.groom.first, d.bride.first];
  const s = saving(order, t);
  const days = daysToWedding(d.date);
  const soon = days >= 0 && days <= SOON_DAYS ? `\nThe wedding is just ${days} days away, so the sooner guests get it, the better.` : "";
  const price = s ? `${formatINR(order.amount)} (launch price, you save ${formatINR(s.off)} on the ${formatINR(s.mrp)} MRP)` : formatINR(order.amount);
  if (nudges === 0) {
    return `Hi! Your ${t?.name ?? ""} invite for ${a} & ${b} is ready to go live 🌸\n\nPay ${price} here and you'll have your link within ${LINK_IN}:\n${payUrl}${soon}\n\nUPI, cards or netbanking. Order ${order.code} · ${site.name}`;
  }
  return `Hi! Just checking in on ${a} & ${b}'s invite (order ${order.code}) 🙂\n\nIt's all set and waiting. Pay ${formatINR(order.amount)} here and it goes live within ${LINK_IN}:\n${payUrl}${soon}\n\nThe launch price is held on your order. Any questions, just reply here.`;
}
