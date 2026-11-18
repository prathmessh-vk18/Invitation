import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { hasEditor } from "@/config/editor";
import { getInvite } from "@/data/invites";
import { getTemplate, type TemplateId } from "@/data/templates";
import { formatINR } from "@/config/site";
import { changeSummary } from "@/lib/change-requests";
import { inviteFromOrder } from "@/lib/order-invite";
import type { InviteDetails, Order } from "@/lib/orders";
import { db } from "@/lib/supabase";
import { InviteEditor } from "./InviteEditor";

export const metadata: Metadata = { title: "Edit your invite", robots: { index: false, follow: false } };
// The editor fills the phone's screen; pinch-zoom would fight the bottom sheet.
export const viewport: Viewport = { width: "device-width", initialScale: 1, maximumScale: 1, viewportFit: "cover" };
export const instant = false;

/** The order (or, for /customise/demo-<design>, that design's demo invite) in the editor. */
async function Editor({ params }: { params: PageProps<"/customise/[id]">["params"] }) {
  const { id } = await params;

  // A new invite: the design's sample, changed on the invite itself before the order is made.
  const fresh = /^new-([a-z]+)$/.exec(id)?.[1];
  if (fresh) {
    const t = getTemplate(fresh as TemplateId);
    const invite = t && hasEditor(fresh) ? getInvite(t.demoSlug) : null;
    if (!t || !invite) notFound();
    // The sample's photos stay out: the couple adds their own.
    const { slug, template, ...details } = invite;
    delete details.gallery;
    return (
      <InviteEditor
        orderId={null}
        design={fresh}
        extra={{ slug, template }}
        details={details as InviteDetails}
        songPath={null}
        photoPaths={[]}
        backHref={`/templates/${t.id}`}
        draft={{ price: formatINR(t.price) }}
      />
    );
  }

  const demo = /^demo-([a-z]+)$/.exec(id)?.[1];
  if (demo) {
    const t = getTemplate(demo as TemplateId);
    const invite = t && hasEditor(demo) ? getInvite(t.demoSlug) : null;
    if (!invite) notFound();
    const { slug, template, gallery, ...details } = invite;
    return <InviteEditor orderId={null} design={demo} extra={{ slug, template, gallery }} details={details as InviteDetails} songPath={null} photoPaths={[]} backHref={`/start/${demo}`} />;
  }

  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const { data } = await db().from("orders").select("*").eq("id", id).maybeSingle();
  const order = data as Order | null;
  if (!order || order.status === "cancelled" || !hasEditor(order.template)) notFound();
  const full = inviteFromOrder(order, order.invite_slug ?? "preview");
  // The song and photos are the order's own (song_path, photo_paths); the editor shows them from there.
  const extra = { slug: full.slug, template: full.template, ...(full.occasion && !order.details.occasion ? { occasion: full.occasion } : {}) };
  // Before payment, saving is free and the next step is paying; after it, each Save is one edit.
  const unpaid = order.status === "awaiting_payment" || order.status === "payment_submitted";
  const c = unpaid ? null : await changeSummary(order.id, order.extra_edits ?? 0);
  const account = unpaid
    ? { kind: "unpaid" as const, pay: order.status === "awaiting_payment" ? `Pay ${formatINR(order.amount)}` : null }
    : { kind: "paid" as const, editsLeft: c?.left ?? null, allowed: c?.allowed ?? null };
  return (
    <InviteEditor
      orderId={order.id}
      design={order.template}
      extra={extra}
      details={order.details}
      songPath={order.song_path}
      photoPaths={order.photo_paths ?? []}
      backHref={`/order/${order.id}`}
      account={account}
    />
  );
}

export default function CustomisePage({ params }: PageProps<"/customise/[id]">) {
  return (
    <Suspense fallback={<div className="fixed inset-0 bg-[#2a2622]" />}>
      <Editor params={params} />
    </Suspense>
  );
}
