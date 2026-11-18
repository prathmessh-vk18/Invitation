"use server";

import { revalidatePath } from "next/cache";
import { hasEditor } from "@/config/editor";
import { applyChanges } from "@/lib/apply-changes";
import { holdReason } from "@/lib/edit-hold";
import { cleanEdits, editsChanged } from "@/lib/editor-clean";
import { logOrderEdit } from "@/lib/order-edits";
import { cleanPhotoPaths, cleanSongPath, keepInviteSettings, validateDetails, type InviteDetails, type Order } from "@/lib/orders";
import { overLimit, TOO_MANY } from "@/lib/rate-limit";
import { db } from "@/lib/supabase";

export type EditorInput = { details: InviteDetails; songPath: string | null; photoPaths: string[] };
export type SaveEditsResult = { saved: true; live: boolean } | { pending: true } | { unchanged: true } | { dryRun: true } | { errors: string[] };

/**
 * Saves a couple's changes from the invite editor and puts them live straight away.
 *
 * The couple's own details (names, dates, functions, RSVP, song, photos) go through the same checks
 * as the order form; the editor's own settings are then taken only as offered (cleanEdits), each
 * within its limits. A change that looks like a different couple's invite (both names, or the date
 * moved by months) waits for us, as it does from the form.
 *
 * On a computer that isn't the live site (no VERCEL), nothing is written unless ALLOW_LOCAL_SAVES=1:
 * a local copy shares the live database, and testing there mustn't change a couple's invite.
 */
export async function saveEdits(orderId: string, input: EditorInput): Promise<SaveEditsResult> {
  if (!/^[0-9a-f-]{36}$/.test(orderId)) return { errors: ["We couldn't find this order."] };
  if (await overLimit("invite-editor", 60, 10)) return { errors: [TOO_MANY] };

  const { data } = await db().from("orders").select("*").eq("id", orderId).maybeSingle();
  const order = data as Order | null;
  if (!order) return { errors: ["We couldn't find this order."] };
  if (order.status === "cancelled") return { errors: ["This order is cancelled. Message us on WhatsApp if that's a mistake."] };
  if (!hasEditor(order.template)) return { errors: ["This design can't be edited here yet."] };

  const checked = validateDetails(input.details);
  if (!checked.ok) return { errors: checked.errors };
  // "Hide branding" is paid for, so it only ever carries over from the order, never from the browser.
  const fromForm = { ...checked.details } as InviteDetails;
  delete fromForm.noBranding;
  // The RSVP contact line isn't in the editor: it stays as saved (some were written by us, longer
  // than the form allows).
  if (order.details.rsvp) fromForm.rsvp = { ...fromForm.rsvp, contact: order.details.rsvp.contact };
  const details = cleanEdits(keepInviteSettings(order.details, fromForm), input.details, order.template);
  const songPath = cleanSongPath(input.songPath);
  const photoPaths = cleanPhotoPaths(input.photoPaths);
  const after = { details, song_path: songPath, photo_paths: photoPaths };

  const same = !editsChanged(order.details, details) && songPath === order.song_path && JSON.stringify(photoPaths) === JSON.stringify(order.photo_paths ?? []);
  if (same) return { unchanged: true };
  if (!process.env.VERCEL && process.env.ALLOW_LOCAL_SAVES !== "1") return { dryRun: true };

  // Before payment there's no invite yet: the order is all there is.
  if (order.status === "awaiting_payment" || order.status === "payment_submitted") {
    const { error } = await db().from("orders").update(after).eq("id", orderId);
    if (error) return { errors: ["We couldn't save your changes. Please try again."] };
    await logOrderEdit(orderId, order, after, "couple");
    revalidatePath(`/order/${orderId}`);
    return { saved: true, live: false };
  }

  const hold = holdReason(order.details, details);
  if (hold) {
    await db().from("change_requests").delete().eq("order_id", orderId).eq("status", "pending");
    const { error } = await db().from("change_requests").insert({ order_id: orderId, ...after, note: null, hold_reason: hold });
    if (error) return { errors: ["We couldn't send your changes. Please try again in a moment."] };
    revalidatePath("/admin/changes");
    return { pending: true };
  }

  const res = await applyChanges(orderId, after, "couple");
  if ("errors" in res) return { errors: res.errors };
  return { saved: true, live: order.status === "live" };
}
