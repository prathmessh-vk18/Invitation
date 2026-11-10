import "server-only";
import { revalidatePath, revalidateTag } from "next/cache";
import type { InviteDetails, Order } from "@/lib/orders";
import { logOrderEdit, type EditSource } from "@/lib/order-edits";
import { refreshInvitesBackup } from "@/lib/publish";
import { db } from "@/lib/supabase";

/**
 * Turns "Crafted with love by Aavjoo" off (or back on) for one order: on the order's details, so
 * every later edit keeps it, and on its published invite, which updates straight away.
 * Used by the ₹99 add-on (checkout tick or bought later) and admin's "Give free".
 */
export async function setNoBranding(orderId: string, on: boolean, source: EditSource) {
  const { data: order } = await db().from("orders").select("id, details, song_path, photo_paths, invite_slug").eq("id", orderId).maybeSingle();
  if (!order) return;
  const before = order.details as InviteDetails;
  if (Boolean(before.noBranding) === on) return;
  const details = { ...before } as InviteDetails;
  if (on) details.noBranding = true;
  else delete details.noBranding;
  await db().from("orders").update({ details }).eq("id", orderId);
  await logOrderEdit(orderId, order as unknown as Order, { details }, source);
  const slug = order.invite_slug as string | null;
  if (slug) {
    const { data: inv } = await db().from("invites").select("data").eq("slug", slug).maybeSingle();
    if (inv) {
      const data = { ...(inv.data as Record<string, unknown>) };
      if (on) data.noBranding = true;
      else delete data.noBranding;
      await db().from("invites").update({ data }).eq("slug", slug);
      revalidateTag(`invite:${slug}`, { expire: 0 });
      refreshInvitesBackup();
    }
  }
  revalidatePath(`/order/${orderId}`);
  revalidatePath(`/admin/orders/${orderId}`);
}

/** After an add-on payment: switches on whatever was bought that isn't on yet. */
export async function applyPaidAddons(orderId: string) {
  const { data } = await db().from("orders").select("addons, details").eq("id", orderId).maybeSingle();
  if (data && (data.addons ?? []).includes("nobrand") && !(data.details as InviteDetails).noBranding) await setNoBranding(orderId, true, "couple");
}
