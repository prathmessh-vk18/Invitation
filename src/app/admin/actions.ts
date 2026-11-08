"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { endAdminSession, passwordMatches, requireAdmin, startAdminSession } from "@/lib/admin-auth";
import { cleanPhotoPaths, cleanSongPath, validateDetails, type Order, keepInviteSettings } from "@/lib/orders";
import type { ChangesInput } from "@/lib/order-actions";
import { applyChanges } from "@/lib/apply-changes";
import { changeSummary } from "@/lib/change-requests";
import { site } from "@/config/site";
import { logOrderEdit, type EditSource } from "@/lib/order-edits";
import { publishOrder, refreshInvitesBackup, warmShareCard } from "@/lib/publish";
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
    refreshInvitesBackup();
    updateTag(`invite:${order.invite_slug}`);
  }
  await db().from("orders").update({ status: "cancelled", invite_slug: null }).eq("id", id);
  refresh(id);
}

/** Cancels several orders at once, from the ticked rows on the orders list. */
export async function cancelOrders(form: FormData): Promise<{ cancelled: number }> {
  await requireAdmin();
  const ids = [...new Set(form.getAll("ids").map(String))].filter((id) => /^[0-9a-f-]{36}$/.test(id)).slice(0, 200);
  if (!ids.length) return { cancelled: 0 };
  const { data } = await db().from("orders").select("id, invite_slug").in("id", ids).neq("status", "cancelled");
  const orders = (data ?? []) as Pick<Order, "id" | "invite_slug">[];
  const slugs = orders.map((o) => o.invite_slug).filter((s): s is string => Boolean(s));
  if (slugs.length) {
    await db().from("invites").delete().in("slug", slugs);
    refreshInvitesBackup();
    slugs.forEach((s) => updateTag(`invite:${s}`));
  }
  if (orders.length) {
    await db()
      .from("orders")
      .update({ status: "cancelled", invite_slug: null })
      .in(
        "id",
        orders.map((o) => o.id),
      );
  }
  revalidatePath("/admin");
  return { cancelled: orders.length };
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
  const before = await loadOrder(id);
  await db().from("orders").update({ details: checked.details }).eq("id", id);
  await logOrderEdit(id, before, { details: checked.details }, "admin");
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
  warmShareCard(res.slug);
  refresh(id);
  return res;
}

export async function setInvitePublished(id: string, slug: string, published: boolean) {
  await requireAdmin();
  await db().from("invites").update({ is_published: published }).eq("slug", slug);
  refreshInvitesBackup();
  updateTag(`invite:${slug}`);
  refresh(id);
}

/** Validates an admin's or a request's changes, keeps our hand-made settings, and applies them. */
async function applyToOrder(id: string, input: ChangesInput, source: EditSource, requestId?: string): Promise<{ ok: true } | { errors: string[] }> {
  const checked = validateDetails(input.details);
  if (!checked.ok) return { errors: checked.errors };
  const before = await loadOrder(id);
  const after = { details: keepInviteSettings(before.details, checked.details), song_path: cleanSongPath(input.songPath), photo_paths: cleanPhotoPaths(input.photoPaths) };
  return applyChanges(id, after, source, requestId);
}

/** Admin edits an order in the form. A live invite updates straight away. */
export async function adminSaveOrder(id: string, input: ChangesInput) {
  await requireAdmin();
  return applyToOrder(id, input, "admin");
}

/** Approves a couple's change request, optionally after the admin has adjusted it in the form. */
export async function approveChange(requestId: string, edited?: ChangesInput): Promise<{ ok: true; orderId: string } | { errors: string[] }> {
  await requireAdmin();
  const { data: req } = await db().from("change_requests").select("*").eq("id", requestId).maybeSingle();
  if (!req) return { errors: ["That request no longer exists."] };
  if (req.status !== "pending") return { errors: ["This request was already handled."] };
  const res = await applyToOrder(req.order_id, edited ?? { details: req.details, songPath: req.song_path, photoPaths: req.photo_paths }, "approved", req.id);
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

/** Gives a couple more edits for free (goodwill), or puts them back to a fresh set of free edits. */
export async function changeEdits(id: string, how: "plus1" | "plus3" | "reset") {
  await requireAdmin();
  const order = await loadOrder(id);
  const extra = order.extra_edits ?? 0;
  const c = await changeSummary(id, extra);
  if (!c) return;
  // Reset: as many extra as they've used, so exactly the free ones are left again.
  const next = how === "plus1" ? extra + 1 : how === "plus3" ? extra + 3 : Math.max(0, c.used);
  if (next === extra) return;
  await db().from("orders").update({ extra_edits: next }).eq("id", id);
  const left = (n: number) => `${Math.max(0, site.revisionRounds + n - c.used)} left`;
  await db()
    .from("order_edits")
    .insert({ order_id: id, source: "admin", changes: [{ label: how === "reset" ? "Edits (reset)" : "Edits (given free)", before: left(extra), after: left(next) }] });
  refresh(id);
}
