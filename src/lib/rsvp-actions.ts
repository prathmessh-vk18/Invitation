"use server";

import { overLimit } from "@/lib/rate-limit";
import { tracksRsvps } from "@/lib/rsvp";
import type { Order } from "@/lib/orders";
import { db, isSupabaseConfigured } from "@/lib/supabase";

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.normalize("NFC").replace(/\s+/g, " ").trim().slice(0, max) : "");

/**
 * Saves a guest's RSVP for the couple's RSVP page. Called as the guest taps "Send RSVP on
 * WhatsApp"; it never blocks or fails that, and quietly does nothing for invites that don't track
 * RSVPs (older orders, demos, invites without the RSVP section).
 */
export async function recordRsvp(input: { slug: string; name: string; coming: boolean; guests: number; functions: string[]; note: string }) {
  try {
    if (!isSupabaseConfigured()) return;
    const slug = clean(input?.slug, 80);
    const name = clean(input?.name, 80);
    if (!slug || !name) return;
    // A guest sends one reply; a bot sending hundreds is stopped here.
    if (await overLimit("rsvp", 12, 10)) return;
    const { data: invite } = await db().from("invites").select("order_id").eq("slug", slug).eq("is_published", true).maybeSingle();
    if (!invite?.order_id) return;
    const { data: order } = await db().from("orders").select("id, created_at, details").eq("id", invite.order_id).maybeSingle();
    if (!order || !tracksRsvps(order as Pick<Order, "created_at" | "details">)) return;
    const coming = input.coming === true;
    const guests = coming ? Math.min(12, Math.max(1, Math.round(Number(input.guests) || 1))) : 0;
    const functions = coming && Array.isArray(input.functions) ? input.functions.map((f) => clean(f, 80)).filter(Boolean).slice(0, 20) : [];
    await db().from("rsvp_replies").insert({ invite_slug: slug, order_id: order.id, name, coming, guests, functions, note: clean(input.note, 500) || null });
  } catch (e) {
    console.error("RSVP not saved", e);
  }
}
