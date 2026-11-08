import "server-only";
import { revalidatePath, updateTag } from "next/cache";
import type { InviteDetails, Order } from "@/lib/orders";
import { logOrderEdit, type EditSource } from "@/lib/order-edits";
import { publishOrder, warmShareCard } from "@/lib/publish";
import { db } from "@/lib/supabase";

type After = { details: InviteDetails; song_path: string | null; photo_paths: string[] };

/**
 * Writes new details, song and photos to an order, records what changed and, if its invite is
 * live, updates the invite too. Used by admin saves, approvals and changes applied on their own.
 * Callers have already validated the details and kept our hand-made settings.
 */
export async function applyChanges(id: string, after: After, source: EditSource, requestId?: string): Promise<{ ok: true } | { errors: string[] }> {
  const { data: before } = await db().from("orders").select("*").eq("id", id).maybeSingle();
  if (!before) return { errors: ["Order not found."] };
  const { error } = await db().from("orders").update(after).eq("id", id);
  if (error) return { errors: ["Saving failed. Please try again."] };
  await logOrderEdit(id, before as Order, after, source, requestId);

  const order = { ...(before as Order), ...after };
  if (order.status === "live" && order.invite_slug) {
    const res = await publishOrder(order, order.invite_slug);
    if ("error" in res) return { errors: [`Saved, but updating the live invite failed: ${res.error}`] };
    updateTag(`invite:${res.slug}`);
    warmShareCard(res.slug);
  }
  revalidatePath("/admin");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath(`/order/${id}`);
  return { ok: true };
}
