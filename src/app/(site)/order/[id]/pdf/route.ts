import { createHash } from "node:crypto";
import { site } from "@/config/site";
import type { Invite } from "@/data/invites";
import { withMovedMedia } from "@/lib/media";
import { inviteFromOrder } from "@/lib/order-invite";
import type { Order } from "@/lib/orders";
import { renderInvitePdf } from "@/lib/pdf/render";
import { presignR2, r2FromEnv } from "@/lib/sigv4";
import { db } from "@/lib/supabase";

// Printing takes a few seconds the first time; after that the copy on R2 is served.
export const maxDuration = 60;

// Bump when the PDF layout changes, so every couple's copy is printed again.
const LAYOUT = "v4";

/**
 * The couple's printable PDF (the ₹99 add-on). Built from the live invite, so it carries every
 * edit and hand-made setting, and cached on R2 under a hash of that invite: after an edit the
 * next download prints a fresh copy. Only for orders that have the add-on.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) return new Response("Not found", { status: 404 });
  const { data } = await db().from("orders").select("*").eq("id", id).maybeSingle();
  const order = data as Order | null;
  if (!order || order.status === "cancelled") return new Response("Not found", { status: 404 });
  if (!(order.addons ?? []).includes("pdf")) return Response.redirect(`${site.url}/order/${id}?pdf=1`, 303);

  let invite: Invite = inviteFromOrder(order, order.invite_slug ?? "preview");
  if (order.invite_slug) {
    const { data: live } = await db().from("invites").select("data").eq("slug", order.invite_slug).maybeSingle();
    if (live?.data) invite = live.data as Invite;
  }
  // Photos saved before the move to R2 still hold Supabase addresses (the memorial photo).
  invite = withMovedMedia(invite);
  const inviteUrl = order.invite_slug ? `${site.url}/i/${order.invite_slug}` : `${site.url}/order/${id}`;
  const [a, b] = invite.lead === "groom" ? [invite.groom, invite.bride] : [invite.bride, invite.groom];
  const filename = `${a.first}-${b.first}-invitation.pdf`.replace(/[^\w.-]+/g, "-");
  const headers = { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${filename}"`, "Cache-Control": "private, no-store" };

  const hash = createHash("sha256").update(LAYOUT + JSON.stringify(invite)).digest("hex").slice(0, 20);
  const r2 = r2FromEnv();
  const key = `pdf/${id}/${hash}.pdf`;
  if (r2) {
    const cached = await fetch(presignR2(r2, "GET", key), { cache: "no-store" });
    if (cached.ok) return new Response(cached.body, { headers });
  }
  const pdf = await renderInvitePdf(invite, { siteUrl: site.url, inviteUrl });
  if (r2) {
    const put = { "content-type": "application/pdf", "content-length": String(pdf.byteLength) };
    await fetch(presignR2(r2, "PUT", key, { headers: put }), { method: "PUT", headers: put, body: Buffer.from(pdf) }).catch((e) => console.error("Caching the PDF failed", e));
  }
  return new Response(Buffer.from(pdf), { headers });
}
