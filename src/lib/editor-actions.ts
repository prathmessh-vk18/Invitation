"use server";

import { revalidatePath } from "next/cache";
import { hasEditor } from "@/config/editor";
import { applyChanges } from "@/lib/apply-changes";
import { cleanEdits, editsChanged } from "@/lib/editor-clean";
import { logOrderEdit } from "@/lib/order-edits";
import type { InviteDetails, Order } from "@/lib/orders";
import { overLimit, TOO_MANY } from "@/lib/rate-limit";
import { db } from "@/lib/supabase";

export type SaveEditsResult = { saved: true; live: boolean } | { unchanged: true } | { dryRun: true } | { error: string };

/**
 * Saves a couple's changes from the invite editor. Only what the editor offers is taken (cleanEdits),
 * so it can't touch names, dates or functions; it goes live straight away, with no check from us.
 *
 * On a computer that isn't the live site (no VERCEL), nothing is written unless ALLOW_LOCAL_SAVES=1:
 * a local copy shares the live database, and testing there mustn't change a couple's invite.
 */
export async function saveEdits(orderId: string, input: InviteDetails): Promise<SaveEditsResult> {
  if (!/^[0-9a-f-]{36}$/.test(orderId)) return { error: "We couldn't find this order." };
  if (await overLimit("invite-editor", 60, 10)) return { error: TOO_MANY };

  const { data } = await db().from("orders").select("*").eq("id", orderId).maybeSingle();
  const order = data as Order | null;
  if (!order) return { error: "We couldn't find this order." };
  if (order.status === "cancelled") return { error: "This order is cancelled. Message us on WhatsApp if that's a mistake." };
  if (!hasEditor(order.template)) return { error: "This design can't be edited here yet." };

  const details = cleanEdits(order.details, input, order.template);
  if (!editsChanged(order.details, details)) return { unchanged: true };
  if (!process.env.VERCEL && process.env.ALLOW_LOCAL_SAVES !== "1") return { dryRun: true };

  const after = { details, song_path: order.song_path, photo_paths: order.photo_paths ?? [] };
  // Before payment there's no invite yet: the order is all there is.
  if (order.status === "awaiting_payment" || order.status === "payment_submitted") {
    const { error } = await db().from("orders").update({ details }).eq("id", orderId);
    if (error) return { error: "We couldn't save your changes. Please try again." };
    await logOrderEdit(orderId, order, after, "couple");
    revalidatePath(`/order/${orderId}`);
    return { saved: true, live: false };
  }
  const res = await applyChanges(orderId, after, "couple");
  if ("errors" in res) return { error: res.errors[0] };
  return { saved: true, live: order.status === "live" };
}
