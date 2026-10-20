import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { addons } from "@/config/addons";
import { formatINR, site, whatsappLink } from "@/config/site";
import { getTemplate } from "@/data/templates";
import { WaIcon } from "@/invites/shared";
import { longDate } from "@/lib/format";
import { statusLabel, type Order } from "@/lib/orders";
import { db } from "@/lib/supabase";
import { Badge, ButtonLink, Container, Heading, Lead, Panel } from "@/ui";

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

async function OrderView({ params }: { params: PageProps<"/order/[id]">["params"] }) {
  const { id } = await params;
  const order = await loadOrder(id);
  if (!order) notFound();
  const t = getTemplate(order.template)!;
  const d = order.details;
  const [a, b] = d.lead === "groom" ? [d.groom, d.bride] : [d.bride, d.groom];
  const chosen = addons.filter((x) => order.addons.includes(x.id));
  const inviteUrl = order.invite_slug ? `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/i/${order.invite_slug}` : null;
  const stage = { awaiting_payment: 1, payment_submitted: 1, paid: 3, live: 4, cancelled: 0 }[order.status];

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
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
        </div>

        {(order.status === "awaiting_payment" || order.status === "payment_submitted") && (
          <Panel className="p-6 sm:p-8">
            <p className="text-title">Order received. Thank you!</p>
            <p className="mt-2 text-body text-muted">
              We&rsquo;ll message you on WhatsApp at <span className="font-semibold text-ink">+{order.customer_phone}</span> with the payment details for{" "}
              {formatINR(order.amount)}. As soon as payment is done, we&rsquo;ll publish your invite and send you the link.
            </p>
            <p className="mt-4 text-caption text-subtle">Wrong number? Message us with your order code {order.code}.</p>
          </Panel>
        )}

        {order.status === "paid" && (
          <Panel className="p-6 sm:p-8">
            <p className="text-title">Payment confirmed.</p>
            <p className="mt-1 text-body text-muted">We&rsquo;re preparing your invite. You&rsquo;ll get the link on WhatsApp within {site.publishWithin}.</p>
          </Panel>
        )}

        {order.status === "live" && inviteUrl && (
          <Panel className="p-6 sm:p-8">
            <p className="text-title">Your invite is live 🎉</p>
            <p className="mt-2 break-all text-lead font-medium">{inviteUrl}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <ButtonLink href={`/i/${order.invite_slug}`}>Open invite</ButtonLink>
              <ButtonLink href={`https://wa.me/?text=${encodeURIComponent(`You're invited! ${inviteUrl}`)}`} variant="inverse">
                <WaIcon /> Share on WhatsApp
              </ButtonLink>
            </div>
          </Panel>
        )}

        {order.status === "cancelled" && (
          <Panel className="p-6 sm:p-8">
            <p className="text-title">This order was cancelled.</p>
            <p className="mt-1 text-body text-muted">If that&rsquo;s a mistake, message us on WhatsApp with order {order.code}.</p>
          </Panel>
        )}

        <Panel className="p-6 sm:p-8">
          <p className="text-title">What happens next</p>
          <ol className="mt-4 space-y-3">
            <Step n={1} done={stage >= 1}>
              Your details are saved
            </Step>
            <Step n={2} done={stage >= 3}>
              We send payment details on WhatsApp and confirm your payment
            </Step>
            <Step n={3} done={stage >= 4}>
              Your invite goes live and the link arrives on WhatsApp
            </Step>
          </ol>
          <p className="mt-6 text-caption text-subtle">Bookmark this page to check your order. Questions? Message us with your order code.</p>
          <a
            href={whatsappLink(`Hi ${site.name}! A question about order ${order.code}.`)}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 text-body font-medium underline underline-offset-4"
          >
            <WaIcon /> WhatsApp us
          </a>
        </Panel>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <Panel className="p-6">
          <p className="text-caption font-medium text-subtle">Order summary</p>
          <div className="mt-4 space-y-2 text-body">
            <p className="flex justify-between">
              <span>{t.name} design</span>
              <span>{formatINR(t.price)}</span>
            </p>
            {chosen.map((x) => (
              <p key={x.id} className="flex justify-between text-muted">
                <span className="truncate pr-3">{x.name}</span>
                <span>{formatINR(x.price)}</span>
              </p>
            ))}
          </div>
          <p className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
            <span className="text-title">Total</span>
            <span className="text-[28px] font-semibold tracking-[-0.03em]">{formatINR(order.amount)}</span>
          </p>
          <div className="mt-6 space-y-1 border-t border-line pt-4 text-caption text-muted">
            <p>{d.events.length} functions · RSVPs to +{d.rsvp.phone}</p>
            <p>{order.song_path ? "Your song is uploaded" : "Design's own music"}</p>
            <p>
              Live until {site.inviteDaysAfterWedding} days after the wedding
            </p>
          </div>
          <Link href={`/templates/${t.id}`} className="mt-4 block text-caption text-subtle underline underline-offset-4">
            View the {t.name} design
          </Link>
        </Panel>
      </aside>
    </div>
  );
}

export default function OrderPage({ params }: PageProps<"/order/[id]">) {
  return (
    <section className="pt-12 pb-24">
      <Container wide>
        <Suspense fallback={<div className="h-[60vh] rounded-card bg-panel" />}>
          <OrderView params={params} />
        </Suspense>
      </Container>
    </section>
  );
}
