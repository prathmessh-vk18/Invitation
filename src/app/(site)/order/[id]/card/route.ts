import { inviteFromOrder } from "@/lib/order-invite";
import type { Order } from "@/lib/orders";
import { shareCard } from "@/lib/share-card";
import { db } from "@/lib/supabase";

/**
 * The couple's own invite card for an order, paid or not: shown in our emails so they see their
 * names on their design before paying. Only reachable with the order's unguessable id.
 */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) return new Response("Not found", { status: 404 });
  const { data } = await db().from("orders").select("details, template, song_path, photo_paths, status").eq("id", id).maybeSingle();
  if (!data || data.status === "cancelled") return new Response("Not found", { status: 404 });
  const card = await shareCard(inviteFromOrder(data as Order, "preview"));
  return new Response(card.body, { headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800" } });
}
