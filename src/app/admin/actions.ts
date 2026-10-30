"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { endAdminSession, passwordMatches, requireAdmin, startAdminSession } from "@/lib/admin-auth";
import { cleanPhotoPaths, cleanSongPath, validateDetails, type Order, keepInviteSettings } from "@/lib/orders";
import type { ChangesInput } from "@/lib/order-actions";
import { publishOrder } from "@/lib/publish";
import { db } from "@/lib/supabase";

export async function login(_: unknown, form: FormData) {
  if (!passwordMatches(String(form.get("password") ?? ""))) return { error: "That password isn't right." };
  await startAdminSession();
  redirect("/admin");
}

export async function logout() {
  await endAdminSession();
  redirect("/admin/login");
}

async function loadOrder(id: string) {
  const { data, error } = await db().from("orders").select("*").eq("id", id).single();
  if (error || !data) throw new Error("Order not found");
  return data as Order;
}

const refresh = (id: string) => {
  revalidatePath("/admin");
  revalidatePath(`/admin/orders/${id}`);
};

/** Notes a WhatsApp payment reminder, so admin shows who was nudged and when. */
export async function recordNudge(id: string) {
  await requireAdmin();
  const { data } = await db().from("orders").select("nudge_count").eq("id", id).maybeSingle();
  await db()
    .from("orders")
    .update({ nudge_count: (data?.nudge_count ?? 0) + 1, nudged_at: new Date().toISOString() })
    .eq("id", id);
  refresh(id);
}

export async function setPaymentVerified(id: string, verified: boolean) {
  await requireAdmin();
  const patch = verified
    ? { status: "paid", paid_at: new Date().toISOString() }
    : { status: "awaiting_payment", utr: null, paid_at: null, payment_submitted_at: null };
  await db().from("orders").update(patch).eq("id", id);
  refresh(id);
}

/**
 * Cancels an order. A live one also loses its invite: the row is deleted, so the address stops
 * working at once and is free to use again. The order itself stays, marked cancelled, for the records.
 */
export async function cancelOrder(id: string) {
  await requireAdmin();
  const order = await loadOrder(id);
  if (order.invite_slug) {
    await db().from("invites").delete().eq("slug", order.invite_slug);
    updateTag(`invite:${order.invite_slug}`);
  }
  await db().from("orders").update({ status: "cancelled", invite_slug: null }).eq("id", id);
  refresh(id);
}

export async function saveNotes(id: string, notes: string) {
  await requireAdmin();
  await db().from("orders").update({ admin_notes: notes.slice(0, 4000) }).eq("id", id);
  refresh(id);
}

/** Replace the couple's details after fixing a typo or missing info. Re-sync the invite separately. */
export async function saveDetails(id: string, json: string): Promise<{ ok: true } | { errors: string[] }> {
  await requireAdmin();
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { errors: ["That isn't valid JSON. Check for a missing comma or quote."] };
  }
  const checked = validateDetails(parsed);
  if (!checked.ok) return { errors: checked.errors };
  await db().from("orders").update({ details: checked.details }).eq("id", id);
  refresh(id);
  return { ok: true };
}

/**
 * Creates (or refreshes) the invite from the order's details and makes it live.
 * The same button re-syncs an already-live invite after its details were edited.
 */
export async function publishInvite(id: string, slugInput: string): Promise<{ ok: true; slug: string } | { error: string }> {
  await requireAdmin();
  const res = await publishOrder(await loadOrder(id), slugInput);
  if ("error" in res) return res;
  updateTag(`invite:${res.slug}`);
  refresh(id);
  return res;
}

export async function setInvitePublished(id: string, slug: string, published: boolean) {
  await requireAdmin();
  await db().from("invites").update({ is_published: published }).eq("slug", slug);
  updateTag(`invite:${slug}`);
  refresh(id);
}

/** Writes new details, song and photos to an order and, if its invite is live, updates the invite too. */
async function applyToOrder(id: string, input: ChangesInput): Promise<{ ok: true } | { errors: string[] }> {
  const checked = validateDetails(input.details);
  if (!checked.ok) return { errors: checked.errors };
  const before = await loadOrder(id);
  const { error } = await db()
    .from("orders")
    .update({ details: keepInviteSettings(before.details, checked.details), song_path: cleanSongPath(input.songPath), photo_paths: cleanPhotoPaths(input.photoPaths) })
    .eq("id", id);
  if (error) return { errors: ["Saving failed. Please try again."] };
  const order = await loadOrder(id);
  if (order.status === "live" && order.invite_slug) {
    const res = await publishInvite(id, order.invite_slug);
    if ("error" in res) return { errors: [`Saved, but updating the live invite failed: ${res.error}`] };
  }
  refresh(id);
  return { ok: true };
}

/** Admin edits an order in the form. A live invite updates straight away. */
export async function adminSaveOrder(id: string, input: ChangesInput) {
  await requireAdmin();
  return applyToOrder(id, input);
}

/** Approves a couple's change request, optionally after the admin has adjusted it in the form. */
export async function approveChange(requestId: string, edited?: ChangesInput): Promise<{ ok: true; orderId: string } | { errors: string[] }> {
  await requireAdmin();
  const { data: req } = await db().from("change_requests").select("*").eq("id", requestId).maybeSingle();
  if (!req) return { errors: ["That request no longer exists."] };
  if (req.status !== "pending") return { errors: ["This request was already handled."] };
  const res = await applyToOrder(req.order_id, edited ?? { details: req.details, songPath: req.song_path, photoPaths: req.photo_paths });
  if ("errors" in res) return res;
  await db().from("change_requests").update({ status: "approved", decided_at: new Date().toISOString() }).eq("id", requestId);
  revalidatePath("/admin/changes");
  return { ok: true, orderId: req.order_id };
}

export async function declineChange(requestId: string, reply: string) {
  await requireAdmin();
  await db()
    .from("change_requests")
    .update({ status: "declined", reply: reply.trim().slice(0, 300) || null, decided_at: new Date().toISOString() })
    .eq("id", requestId)
    .eq("status", "pending");
  revalidatePath("/admin/changes");
}
