import "server-only";
import type { Invite } from "@/data/invites";
import { getTemplate } from "@/data/templates";
import type { Order } from "@/lib/orders";
import { photoPublicUrl, songPublicUrl } from "@/lib/supabase";

/** The invite an order publishes: the couple's details plus their uploaded song and photos. */
export function inviteFromOrder(order: Pick<Order, "details" | "template" | "song_path" | "photo_paths">, slug: string): Invite {
  return {
    // An engagement design makes an engagement invite, unless the order says otherwise.
    ...(getTemplate(order.template)?.occasion ? { occasion: getTemplate(order.template)!.occasion } : {}),
    ...order.details,
    slug,
    template: order.template,
    ...(order.song_path ? { music: songPublicUrl(order.song_path) } : {}),
    ...(order.photo_paths?.length ? { gallery: order.photo_paths.map(photoPublicUrl) } : {}),
  };
}
