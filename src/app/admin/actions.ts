"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { site } from "@/config/site";
import { endAdminSession, passwordMatches, requireAdmin, startAdminSession } from "@/lib/admin-auth";
import { isValidSlug, liveUntil, validateDetails, type Order } from "@/lib/orders";
import { db, photoPublicUrl, songPublicUrl } from "@/lib/supabase";
import { getInvite as getDemoInvite } from "@/data/invites";

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
  const order = await loadOrder(id);
  if (order.status === "awaiting_payment" || order.status === "payment_submitted") return { error: "Mark the order as paid before publishing." };
  if (order.status === "cancelled") return { error: "This order is cancelled." };

  const slug = (order.invite_slug ?? slugInput).trim().toLowerCase();
  if (!isValidSlug(slug)) return { error: "Use lowercase letters, numbers and single hyphens, e.g. aarav-weds-meera." };
  if (getDemoInvite(slug)) return { error: "That address is used by a demo. Pick another." };

  const { data: taken } = await db().from("invites").select("order_id").eq("slug", slug).maybeSingle();
  if (taken && taken.order_id !== order.id) return { error: "That address is already taken. Try adding a year or city." };

  const invite = {
    ...order.details,
    slug,
    template: order.template,
    ...(order.song_path ? { music: songPublicUrl(order.song_path) } : {}),
    ...(order.photo_paths?.length ? { gallery: order.photo_paths.map(photoPublicUrl) } : {}),
  };
  const { error } = await db()
    .from("invites")
    .upsert({
      slug,
      order_id: order.id,
      template: order.template,
      data: invite,
      music_url: invite.music ?? null,
      live_until: liveUntil(order.details.date, site.inviteDaysAfterWedding),
      is_published: true,
    });
  if (error) return { error: "Saving the invite failed. Please try again." };

  await db()
    .from("orders")
    .update({ status: "live", invite_slug: slug, published_at: order.published_at ?? new Date().toISOString() })
    .eq("id", id);
  updateTag(`invite:${slug}`);
  refresh(id);
  return { ok: true, slug };
}

export async function setInvitePublished(id: string, slug: string, published: boolean) {
  await requireAdmin();
  await db().from("invites").update({ is_published: published }).eq("slug", slug);
  updateTag(`invite:${slug}`);
  refresh(id);
}
