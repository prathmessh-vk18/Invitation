import Link from "next/link";
import { notFound } from "next/navigation";
import { getFontStyle, sections } from "@/config/customise";
import { formatINR, site } from "@/config/site";
import { getTemplate } from "@/data/templates";
import { requireAdmin } from "@/lib/admin-auth";
import { fmtDate, longDate, time } from "@/lib/format";
import { statusLabel, suggestSlug, type Order } from "@/lib/orders";
import { db, photoPublicUrl, songPublicUrl } from "@/lib/supabase";
import { Panel } from "@/ui";
import { paysOnline } from "@/lib/razorpay";
import { nudgeMessage } from "@/lib/urgency";
import { AdminHeader, statusTone } from "../../AdminHeader";
import { DetailsEditor, NotesAndCancel, PaymentActions, PublishActions } from "./OrderActions";

export const instant = false;

function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3 border-t border-line py-2.5 text-body first:border-t-0">
      <span className="text-subtle">{k}</span>
      <span className="min-w-0 break-words">{children}</span>
    </div>
  );
}

export default async function AdminOrder({ params }: PageProps<"/admin/orders/[id]">) {
  await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const { data } = await db().from("orders").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const o = data as Order;
  const d = o.details;
  const t = getTemplate(o.template);
  // Both lookups only need the order, so run them together rather than one after the other.
  const [{ data: inv }, { data: waiting }] = await Promise.all([
    o.invite_slug ? db().from("invites").select("is_published, live_until").eq("slug", o.invite_slug).maybeSingle() : Promise.resolve({ data: null }),
    db().from("change_requests").select("id").eq("order_id", o.id).eq("status", "pending").maybeSingle(),
  ]);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const couple = `${d.groom.first} & ${d.bride.first}`;

  return (
    <>
      <AdminHeader />
      <main className="mx-auto max-w-wide px-5 py-10">
        <Link href="/admin" className="text-caption text-subtle hover:text-ink">
          ← All orders
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="text-heading">{o.code}</h1>
          <span className={`rounded-full px-3 py-1 text-[13px] font-medium ${statusTone[o.status]}`}>{statusLabel[o.status]}</span>
        </div>
        <p className="mt-2 text-lead text-muted">
          {couple} · {t?.name} · {formatINR(o.amount)}
        </p>
        {waiting && (
          <Link href={`/admin/changes/${waiting.id}`} className="mt-4 flex items-center justify-between gap-3 rounded-tile bg-[#fff3c4] px-5 py-4 text-body font-medium text-[#7a5b00]">
            The couple asked for changes. Review them →
          </Link>
        )}

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-4">
            <Panel className="p-6">
              <p className="text-title">1 · Payment</p>
              <div className="mt-4">
                <PaymentActions
                  id={o.id}
                  status={o.status}
                  code={o.code}
                  customerPhone={o.customer_phone}
                  amount={formatINR(o.amount)}
                  nudge={
                    paysOnline(o)
                      ? {
                          message: nudgeMessage(o, t, `${site.url}/order/${o.id}?pay=1`, o.nudge_count ?? 0),
                          count: o.nudge_count ?? 0,
                          last: o.nudged_at ? fmtDate(o.nudged_at, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : null,
                        }
                      : undefined
                  }
                />
              </div>
            </Panel>
            <Panel className="p-6">
              <p className="text-title">2 · Invite</p>
              <div className="mt-4">
                <PublishActions
                  id={o.id}
                  code={o.code}
                  status={o.status}
                  utr={o.utr}
                  slug={o.invite_slug}
                  suggestedSlug={suggestSlug(d)}
                  published={inv?.is_published ?? null}
                  customerPhone={o.customer_phone}
                  coupleNames={couple}
                  detailsJson=""
                  notes=""
                  siteUrl={siteUrl}
                />
                {inv?.live_until && <p className="mt-3 text-caption text-subtle">Live until {longDate(`${inv.live_until}T12:00:00+05:30`)}</p>}
              </div>
            </Panel>
            <Panel className="p-6">
              <p className="text-title">Details</p>
              <p className="mt-1 text-body text-muted">Fix typos or missing info in the same form the couple used. A live invite updates when you save.</p>
              <Link href={`/admin/orders/${o.id}/edit`} className="mt-4 inline-flex rounded-full bg-ink px-5 py-2.5 text-[15px] font-medium text-white">
                Edit details
              </Link>
              <details className="mt-5">
                <summary className="cursor-pointer text-caption text-subtle">Advanced: edit as JSON</summary>
                <div className="mt-3">
                  <DetailsEditor id={o.id} detailsJson={JSON.stringify(d, null, 2)} />
                </div>
              </details>
            </Panel>
          </div>

          <div className="space-y-4">
            <Panel className="p-6">
              <p className="text-title">Customer</p>
              <div className="mt-3">
                <Row k="Name">{o.customer_name}</Row>
                <Row k="WhatsApp">
                  <a href={`https://wa.me/${o.customer_phone}`} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                    +{o.customer_phone}
                  </a>
                </Row>
                <Row k="Email">{o.customer_email ?? "—"}</Row>
                <Row k="Partner">
                  {o.partner_code ? (
                    <Link href="/admin/partners" className="underline underline-offset-4">
                      {o.partner_code} · {formatINR(o.partner_commission ?? 0)} once paid
                    </Link>
                  ) : (
                    "—"
                  )}
                </Row>
                <Row k="Placed">{fmtDate(o.created_at, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })}</Row>
                <Row k="Payment">
                  {o.razorpay_payment_id ? (
                    <a href={`https://dashboard.razorpay.com/app/payments/${o.razorpay_payment_id}`} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                      Razorpay {o.razorpay_payment_id}
                    </a>
                  ) : o.paid_at ? (
                    "Marked paid by hand"
                  ) : o.razorpay_order_id ? (
                    "Checkout opened, not paid yet"
                  ) : (
                    "Not started"
                  )}
                </Row>
                <Row k="Order page">
                  <Link href={`/order/${o.id}`} target="_blank" className="underline underline-offset-4">
                    Open ↗
                  </Link>
                </Row>
              </div>
            </Panel>
            <Panel className="p-6">
              <p className="text-title">At a glance</p>
              <div className="mt-3">
                <Row k="Design">{t?.name}</Row>
                <Row k="Wedding">
                  {longDate(d.date)}, {time(d.date)} · {d.city}
                </Row>
                <Row k="Bride">
                  {d.bride.full || d.bride.first}
                  {d.bride.parents && <span className="block text-caption text-subtle">{d.bride.parents}</span>}
                </Row>
                <Row k="Groom">
                  {d.groom.full || d.groom.first}
                  {d.groom.parents && <span className="block text-caption text-subtle">{d.groom.parents}</span>}
                </Row>
                <Row k="Functions">
                  {d.events.map((e) => (
                    <span key={e.name + e.start} className="block">
                      {e.name} · {fmtDate(e.start, { day: "numeric", month: "short" })} {time(e.start)} · {e.venue}
                    </span>
                  ))}
                </Row>
                <Row k="RSVP to">{d.hide?.includes("rsvp") ? "Turned off" : `+${d.rsvp.phone}`}</Row>
                <Row k="Fonts">{getFontStyle(d.font)?.name ?? "Design's own"}</Row>
                <Row k="Hidden">{sections.filter((x) => d.hide?.includes(x.id)).map((x) => x.name).join(", ") || "Nothing"}</Row>
                <Row k="Photos">
                  {d.hide?.includes("gallery") ? (
                    "Turned off"
                  ) : o.photo_paths?.length ? (
                    <span className="grid grid-cols-4 gap-1.5">
                      {o.photo_paths.map((p) => (
                        <a key={p} href={photoPublicUrl(p)} target="_blank" rel="noreferrer">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={photoPublicUrl(p)} alt="" className="aspect-square w-full rounded-md object-cover" />
                        </a>
                      ))}
                    </span>
                  ) : (
                    "None"
                  )}
                </Row>
                <Row k="Song">{o.song_path ? <audio controls src={songPublicUrl(o.song_path)} className="h-9 w-full" /> : "Design's own music"}</Row>
              </div>
            </Panel>
            <Panel className="p-6">
              <p className="text-title">Notes</p>
              <div className="mt-4">
                <NotesAndCancel id={o.id} notes={o.admin_notes ?? ""} status={o.status} slug={o.invite_slug} />
              </div>
            </Panel>
          </div>
        </div>
      </main>
    </>
  );
}
