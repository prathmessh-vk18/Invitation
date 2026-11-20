import "server-only";
import { site } from "@/config/site";
import type { Order } from "@/lib/orders";
import { db } from "@/lib/supabase";

/**
 * Guests' RSVPs for the couple's RSVP page. A reply is saved when a guest sends their RSVP (the
 * WhatsApp message still goes to the couple as before), only for orders placed from
 * site.rsvpTrackingFrom whose invite shows the RSVP section.
 */
export const tracksRsvps = (order: Pick<Order, "created_at" | "details">) =>
  new Date(order.created_at).getTime() >= new Date(site.rsvpTrackingFrom).getTime() && !order.details.hide?.includes("rsvp");

export type RsvpReply = { name: string; coming: boolean; guests: number; functions: string[]; note: string | null; created_at: string };

/** An order's replies, newest first, with a guest who replied twice counted once (their latest). */
export async function repliesFor(orderId: string): Promise<RsvpReply[]> {
  const { data } = await db().from("rsvp_replies").select("name, coming, guests, functions, note, created_at").eq("order_id", orderId).order("created_at", { ascending: false }).limit(2000);
  const seen = new Set<string>();
  return ((data ?? []) as RsvpReply[]).filter((r) => {
    const k = r.name.trim().toLowerCase().replace(/\s+/g, " ");
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
