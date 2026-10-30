import "server-only";
import { site } from "@/config/site";
import { getInvite as getDemoInvite } from "@/data/invites";
import { inviteFromOrder } from "@/lib/order-invite";
import { isValidSlug, liveUntil, slugPart, suggestSlug, type Order } from "@/lib/orders";
import { paysOnline } from "@/lib/razorpay";
import { db } from "@/lib/supabase";

/**
 * Orders paid online go live on their own the moment the payment is confirmed. Set
 * AUTO_PUBLISH=off to go back to publishing every order by hand from admin.
 */
export const autoPublishOn = () => process.env.AUTO_PUBLISH !== "off";

/**
 * Creates (or refreshes) the invite from the order's details and makes it live. Used by the
 * admin Publish button and by auto-publish; callers clear the `invite:<slug>` cache.
 */
export async function publishOrder(order: Order, slugInput: string): Promise<{ ok: true; slug: string } | { error: string }> {
  if (order.status === "awaiting_payment" || order.status === "payment_submitted") return { error: "Mark the order as paid before publishing." };
  if (order.status === "cancelled") return { error: "This order is cancelled." };

  const slug = (order.invite_slug ?? slugInput).trim().toLowerCase();
  if (!isValidSlug(slug)) return { error: "Use lowercase letters, numbers and single hyphens, e.g. aarav-weds-meera." };
  if (getDemoInvite(slug)) return { error: "That address is used by a demo. Pick another." };

  const { data: taken } = await db().from("invites").select("order_id").eq("slug", slug).maybeSingle();
  if (taken && taken.order_id !== order.id) return { error: "That address is already taken. Try adding a year or city." };

  const invite = inviteFromOrder(order, slug);
  const row = {
    slug,
    order_id: order.id,
    template: order.template,
    data: invite,
    music_url: invite.music ?? null,
    live_until: liveUntil(order.details.date, site.inviteDaysAfterWedding),
    is_published: true,
  };
  // A new address is inserted, so two orders racing for the same one can't overwrite each other.
  const { error } = taken ? await db().from("invites").upsert(row) : await db().from("invites").insert(row);
  if (error) return { error: "Saving the invite failed. Please try again." };

  await db()
    .from("orders")
    .update({ status: "live", invite_slug: slug, published_at: order.published_at ?? new Date().toISOString() })
    .eq("id", order.id);
  return { ok: true, slug };
}

/** "aarav-weds-meera", then with the wedding year, the city, a number, and finally the order code. */
function slugCandidates(order: Pick<Order, "code" | "details">) {
  const base = suggestSlug(order.details);
  const city = slugPart(order.details.city).replace(/-+/g, "-");
  const year = order.details.date.slice(0, 4);
  const named = base.includes("-weds-") ? [base, `${base}-${year}`, city && `${base}-${city}`, `${base}-2`, `${base}-3`] : [];
  return [...named, `invite-${order.code.toLowerCase()}`].filter((s): s is string => Boolean(s) && isValidSlug(s));
}

/** The first address this order could go live at: not a demo, and not another couple's invite. */
export async function freeSlug(order: Pick<Order, "id" | "code" | "details">) {
  const candidates = slugCandidates(order).filter((s) => !getDemoInvite(s));
  if (!candidates.length) return null;
  const { data } = await db().from("invites").select("slug, order_id").in("slug", candidates);
  const takenByOthers = new Set((data ?? []).filter((r) => r.order_id !== order.id).map((r) => r.slug as string));
  return candidates.find((s) => !takenByOthers.has(s)) ?? null;
}

/**
 * Publishes an order that was just paid online, at its first free address. Call it only from the
 * call that moved the order to paid, so it runs once. Anything unusual (already live, paid by hand,
 * auto-publish off, an error) leaves the order as paid for us to publish from admin.
 */
export async function autoPublish(orderId: string): Promise<string | null> {
  if (!autoPublishOn()) return null;
  // The payment is already recorded; a problem here must never surface as a failed payment.
  try {
    return await publishPaid(orderId);
  } catch (e) {
    console.error(`Auto-publish failed for order ${orderId}`, e);
    return null;
  }
}

async function publishPaid(orderId: string) {
  const { data } = await db().from("orders").select("*").eq("id", orderId).maybeSingle();
  const order = data as Order | null;
  if (!order || order.status !== "paid" || order.invite_slug || !paysOnline(order)) return null;
  // Another order may take the first free address between the check and the insert; then try once more.
  for (let attempt = 0; attempt < 2; attempt++) {
    const slug = await freeSlug(order);
    if (!slug) return null;
    const res = await publishOrder(order, slug);
    if ("ok" in res) return res.slug;
  }
  return null;
}
