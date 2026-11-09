import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { formatINR, site } from "@/config/site";
import { getTemplate } from "@/data/templates";
import { WaIcon } from "@/invites/shared";
import { longDate } from "@/lib/format";
import { statusLabel, type Order } from "@/lib/orders";
import { changeSummary } from "@/lib/change-requests";
import { inviteFromOrder } from "@/lib/order-invite";
import { db } from "@/lib/supabase";
import { Badge, ButtonLink, Container, Heading, Lead, Panel } from "@/ui";
import { OrderPreview } from "./OrderPreview";
import { PayButton, StickyPay } from "./PayButton";
import { dateLine, daysToWedding, LINK_IN, saving } from "@/lib/urgency";
import { paysOnline } from "@/lib/razorpay";
import { autoPublishOn, freeSlug } from "@/lib/publish";
import { CopyLink } from "@/site/copy-link";
import { RememberOrder } from "@/site/my-orders";
import { AskAboutOrder } from "./AskAboutOrder";
import { EditPackOnPage } from "./EditPackButton";
import { PdfAddon } from "./PdfAddon";

export const metadata: Metadata = { title: "Your order", robots: { index: false } };
export const instant = false;

async function loadOrder(id: string) {
  if (!/^[0-9a-f-]{36}$/.test(id)) return null;
  const { data } = await db().from("orders").select("*").eq("id", id).maybeSingle();
  return (data as Order | null) ?? null;
}

function Step({ n, done, children }: { n: number; done?: boolean; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className={`grid size-6 shrink-0 place-items-center rounded-full text-[12px] font-semibold ${done ? "bg-ink text-white" : "bg-surface text-subtle"}`}>{done ? "✓" : n}</span>
      <span className={`text-body ${done ? "text-ink" : "text-muted"}`}>{children}</span>
    </li>
  );
}

/** Asking for changes, and where the last request stands. */
async function Changes({ order, sent, live, same }: { order: Order; sent: boolean; live: boolean; same: boolean }) {
  if (order.status === "cancelled") return null;
  const editHref = `/order/${order.id}/edit`;
  // Before payment nothing is published yet, so edits save straight away.
  if (order.status === "awaiting_payment" || order.status === "payment_submitted")
    return (
      <Panel className="p-6 sm:p-8">
        <p className="text-title">Need to change something?</p>
        <p className="mt-1 text-body text-muted">Your invite isn&rsquo;t published yet, so you can edit your details yourself. Changes save straight away.</p>
        <ButtonLink href={editHref} variant="secondary" className="mt-5">
          Edit your details
        </ButtonLink>
      </Panel>
    );

  const c = await changeSummary(order.id, order.extra_edits ?? 0);
  const latest = c?.latest;
  const waiting = latest?.status === "pending";
  const out = c ? c.left === 0 : false;
  return (
    <Panel className="p-6 sm:p-8">
      <p className="text-title">{waiting ? "Your changes are with us" : "Need to change something?"}</p>
      {waiting ? (
        <p className="mt-1 text-body text-muted">
          Sent {longDate(latest.created_at)}. These need a quick check from us before they go live, usually within {site.publishWithin}. You can still edit them: saving
          again replaces them.
        </p>
      ) : (
        <p className="mt-1 text-body text-muted">
          Change any detail, function, wording, photo or song in the same form you filled in. Your invite updates straight away, on the same link.
        </p>
      )}
      {live && !waiting && (
        <p className="mt-4 rounded-tile bg-whatsapp-wash p-4 text-body font-medium">Your changes are live ✓ Open your invite to see them. Guests see them too, on the same link.</p>
      )}
      {same && <p className="mt-4 rounded-tile bg-surface p-4 text-body">Nothing had changed, so no edit was used.</p>}
      {!live && latest?.status === "approved" && !waiting && <p className="mt-3 text-body font-medium text-[#1d6b35]">✓ Your last changes are live on your invite.</p>}
      {latest?.status === "declined" && !waiting && (
        <p className="mt-3 text-body text-[#8a1c1c]">We couldn&rsquo;t make your last changes{latest.reply ? `: ${latest.reply}` : "."} Message us if you&rsquo;d like to talk about it.</p>
      )}
      {sent && waiting && (
        <p className="mt-4 rounded-tile bg-whatsapp-wash p-4 text-body font-medium">
          Changes sent ✓ They come straight to us, so there&rsquo;s no need to message. This page shows when they&rsquo;re live.
        </p>
      )}
      {out && !waiting ? (
        <div className="mt-5">
          <p className="text-body text-muted">
            You&rsquo;ve used all {c!.allowed} edits. Get {site.editPack.edits} more for {formatINR(site.editPack.price)}.
          </p>
          <EditPackOnPage orderId={order.id} />
        </div>
      ) : (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <ButtonLink href={editHref} variant={waiting ? "secondary" : "primary"}>
            {waiting ? "Edit your changes" : "Change your invite"}
          </ButtonLink>
          {c && (
            <span className="text-caption text-subtle">
              {c.left} of {c.allowed} edits left
            </span>
          )}
        </div>
      )}
    </Panel>
  );
}

async function OrderView({ params, searchParams }: { params: PageProps<"/order/[id]">["params"]; searchParams: PageProps<"/order/[id]">["searchParams"] }) {
  const { id } = await params;
  const query = await searchParams;
  const sent = query.sent === "1";
  const payNow = query.pay === "1";
  const order = await loadOrder(id);
  if (!order) notFound();
  const t = getTemplate(order.template)!;
  const d = order.details;
  const [a, b] = d.lead === "groom" ? [d.groom, d.bride] : [d.bride, d.groom];
  const orderUrl = `${site.url}/order/${order.id}`;
  const inviteUrl = order.invite_slug ? `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/i/${order.invite_slug}` : null;
  const stage = { awaiting_payment: 1, payment_submitted: 1, paid: 3, live: 4, cancelled: 0 }[order.status];
  const s = saving(order, t);
  const soon = dateLine(daysToWedding(d.date));
  // Paid online, the invite goes live as the payment clears, at the address shown before paying.
  const goesLiveNow = paysOnline(order) && autoPublishOn();
  const unpaid = order.status === "awaiting_payment" || order.status === "payment_submitted";
  const yourLink = goesLiveNow && unpaid ? await freeSlug(order) : null;

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
      <RememberOrder id={order.id} code={order.code} names={`${a.first} & ${b.first}`} cancelled={order.status === "cancelled"} />
      <div className="min-w-0 space-y-4">
        <div>
          <Badge live={order.status !== "live" && order.status !== "cancelled"} className="bg-panel">
            Order {order.code} · {statusLabel[order.status]}
          </Badge>
          <Heading as="h2" className="mt-5">
            {a.first} &amp; {b.first}
          </Heading>
          <Lead className="mt-3">
            {t.name} · {longDate(d.date)} · {d.city}
          </Lead>
          {order.status !== "cancelled" && (
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-3">
              <a
                href={`https://wa.me/${order.customer_phone}?text=${encodeURIComponent(`My ${site.name} order ${order.code}: ${a.first} & ${b.first}\n${orderUrl}`)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-whatsapp px-4 py-2.5 text-[15px] font-medium text-white"
              >
                <WaIcon /> Send this page to my WhatsApp
              </a>
              <AskAboutOrder code={order.code} phone={order.customer_phone} className="text-body font-medium underline underline-offset-4">
                Ask about your order
              </AskAboutOrder>
            </div>
          )}
        </div>

        {(order.status === "awaiting_payment" || order.status === "payment_submitted") && (
          <Panel className="p-6 sm:p-8">
            {paysOnline(order) ? (
              <>
                <p className="inline-flex items-center gap-1.5 rounded-full bg-[#fff1e6] px-3 py-1 text-[13px] font-medium text-[#b4410f]">✨ Your invite is ready to publish</p>
                <p className="mt-3 text-title">One step left: {goesLiveNow ? "your invite goes live right after you pay" : `pay and it goes live within ${LINK_IN}`}</p>
                {yourLink && (
                  <p className="mt-3 rounded-tile bg-surface px-4 py-3 text-body">
                    <span className="text-muted">Your link is ready</span>
                    <span className="block font-semibold [overflow-wrap:anywhere] text-ink">
                      {site.url.replace(/^https?:\/\//, "")}/i/<wbr />
                      {yourLink}
                    </span>
                    <span className="mt-1 block text-caption text-muted">It opens for your guests the moment you pay.</span>
                  </p>
                )}
                {s && (
                  <p className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className="text-[30px] font-semibold tracking-[-0.03em]">{formatINR(order.amount)}</span>
                    <span className="text-lead text-faint line-through decoration-[1.5px]">{formatINR(s.mrp)}</span>
                    <span className="self-center rounded-full bg-[#e8582a] px-2 py-0.5 text-[12px] font-semibold text-white">You save {formatINR(s.off)}</span>
                  </p>
                )}
                <p className="mt-1 text-body text-muted">Launch price, held on your order.</p>
                {soon && (
                  <p className={`mt-4 rounded-tile px-4 py-3 text-body ${soon.strong ? "bg-[#fdecec] font-medium text-[#8a1c1c]" : "bg-[#fff8e6] text-[#7a5b00]"}`}>
                    ⏳ {soon.text}
                  </p>
                )}
                <div id="pay-now" className="mt-6">
                  <PayButton orderId={order.id} amount={order.amount} autoOpen={payNow} />
                </div>
                <ul className="mt-5 grid gap-2 text-body text-ink sm:grid-cols-2">
                  {[
                    `${site.revisionRounds} free edits included`,
                    "UPI, cards or netbanking, secured by Razorpay",
                    "Ask for changes anytime from this page",
                  ].map((x) => (
                    <li key={x} className="flex gap-2">
                      <span className="text-[#1f8a4c]">✓</span>
                      {x}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-caption text-subtle">
                  Your link goes to <span className="font-medium text-ink">+{order.customer_phone}</span> on WhatsApp.
                </p>
                <StickyPay amount={order.amount} label={s ? `save ${formatINR(s.off)}` : goesLiveNow ? "live right after you pay" : "goes live in minutes"} />
              </>
            ) : (
              <>
                <p className="text-title">Order received. Thank you!</p>
                {!t.payDirect ? (
                  <p className="mt-2 text-body text-muted">
                    We&rsquo;ll message you on WhatsApp at <span className="font-semibold text-ink">+{order.customer_phone}</span> with the payment details for{" "}
                    {formatINR(order.amount)}. As soon as payment is done, we&rsquo;ll publish your invite and send you the link.
                  </p>
                ) : (
                  <p className="mt-2 text-body text-muted">
                    We&rsquo;ll confirm the payment with you directly, as agreed. As soon as it&rsquo;s done, we&rsquo;ll publish your invite and send the link to{" "}
                    <span className="font-semibold text-ink">+{order.customer_phone}</span> on WhatsApp.
                  </p>
                )}
              </>
            )}
            <p className="mt-5 text-caption text-subtle">
              Wrong number?{" "}
              <AskAboutOrder code={order.code} className="underline underline-offset-4">
                Tell us
              </AskAboutOrder>
            </p>
          </Panel>
        )}

        {order.status === "paid" && (
          <Panel className="p-6 sm:p-8">
            <p className="text-title">Payment confirmed.</p>
            <p className="mt-1 text-body text-muted">Thank you! We&rsquo;re preparing your invite. You&rsquo;ll get the link on WhatsApp within {site.publishWithin}.</p>
          </Panel>
        )}

        {order.status === "live" && inviteUrl && (
          <Panel className="p-6 sm:p-8">
            <p className="text-title">Your invite is live 🎉</p>
            <p className="mt-2 break-all text-lead font-medium">{inviteUrl}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <ButtonLink href={`/i/${order.invite_slug}`} newTab>Open invite</ButtonLink>
              <CopyLink text={inviteUrl} />
              <ButtonLink href={`https://wa.me/?text=${encodeURIComponent(`You're invited! ${inviteUrl}`)}`} variant="inverse">
                <WaIcon /> Share on WhatsApp
              </ButtonLink>
            </div>
          </Panel>
        )}

        {order.status === "cancelled" && (
          <Panel className="p-6 sm:p-8">
            <p className="text-title">This order was cancelled.</p>
            <p className="mt-1 text-body text-muted">
              If that&rsquo;s a mistake,{" "}
              <AskAboutOrder code={order.code} phone={order.customer_phone} className="font-medium text-ink underline underline-offset-4">
                let us know
              </AskAboutOrder>
              .
            </p>
          </Panel>
        )}

        <Changes order={order} sent={sent} live={query.live === "1"} same={query.same === "1"} />
        {(order.status === "paid" || order.status === "live") && (
          <Panel className="p-6 sm:p-8">
            <p className="text-title">Printable PDF for elders</p>
            <p className="mt-1 text-body text-muted">
              Your invite as a PDF in the same design, with large, clear text for grandparents and relatives who don&rsquo;t open links. Easy to forward on family
              WhatsApp groups or to print. {(order.addons ?? []).includes("pdf") ? "" : `${formatINR(site.pdfAddon.price)}, one time.`}
            </p>
            <PdfAddon orderId={order.id} owned={(order.addons ?? []).includes("pdf")} autoOpen={query.pdf === "1"} />
          </Panel>
        )}

        <Panel className="p-6 sm:p-8">
          <p className="text-title">What happens next</p>
          <ol className="mt-4 space-y-3">
            <Step n={1} done={stage >= 1}>
              Your details are saved
            </Step>
            <Step n={2} done={stage >= 3}>
              {paysOnline(order) ? "You pay securely online" : "We send payment details on WhatsApp and confirm your payment"}
            </Step>
            <Step n={3} done={stage >= 4}>
              {goesLiveNow ? "Your invite goes live right after you pay, with your link right here" : "Your invite goes live and the link arrives on WhatsApp"}
            </Step>
          </ol>
        </Panel>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <OrderPreview invite={inviteFromOrder(order, order.invite_slug ?? "preview")} tint={t.tint} />
        <Panel className="p-6">
          <p className="text-caption font-medium text-subtle">Order summary</p>
          <div className="mt-4 space-y-2 text-body">
            <p className="flex justify-between">
              <span>{t.name} design</span>
              <span>{formatINR(order.amount)}</span>
            </p>
          </div>
          <p className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
            <span className="text-title">Total</span>
            <span className="text-[28px] font-semibold tracking-[-0.03em]">{formatINR(order.amount)}</span>
          </p>
          <div className="mt-6 space-y-1 border-t border-line pt-4 text-caption text-muted">
            <p>{d.events.length} functions · {d.hide?.includes("rsvp") ? "No RSVP section" : `RSVPs to +${d.rsvp.phone}`}</p>
            <p>{order.song_path ? "Your song is uploaded" : "Design's own music"}</p>
            <p>
              Live until {site.inviteDaysAfterWedding} days after the wedding
            </p>
          </div>
          <Link href={`/templates/${t.id}`} target="_blank" rel="noopener" className="mt-4 block text-caption text-subtle underline underline-offset-4">
            View the {t.name} design
          </Link>
        </Panel>
      </aside>
    </div>
  );
}

export default function OrderPage({ params, searchParams }: PageProps<"/order/[id]">) {
  return (
    <section className="pt-12 pb-24">
      <Container wide>
        <Suspense fallback={<div className="h-[60vh] rounded-card bg-panel" />}>
          <OrderView params={params} searchParams={searchParams} />
        </Suspense>
      </Container>
    </section>
  );
}
