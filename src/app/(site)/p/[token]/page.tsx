import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { formatINR, site } from "@/config/site";
import { getTemplate } from "@/data/templates";
import { fmtDate } from "@/lib/format";
import { earns, tally, type Partner, type PartnerOrder, type Payout } from "@/lib/partners";
import { db, isSupabaseConfigured } from "@/lib/supabase";
import { Badge, Container, Heading, Lead, Panel } from "@/ui";
import { CopyLink } from "./CopyLink";

export const metadata: Metadata = { title: "Your partner earnings", robots: { index: false, follow: false } };
export const instant = false;

/** What the partner sees for each order. No couple details: just enough to follow their earnings. */
function orderState(o: PartnerOrder) {
  if (earns(o.status)) return { label: `Earned ${formatINR(o.partner_commission ?? 0)}`, tone: "bg-[#dff3e4] text-[#1d6b35]" };
  if (o.status === "cancelled") return { label: "Cancelled", tone: "bg-[#fdecec] text-[#8a1c1c]" };
  return { label: "Waiting for payment", tone: "bg-panel text-muted" };
}

function Stat({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div className={`rounded-tile p-5 ${strong ? "bg-ink text-white" : "bg-surface"}`}>
      <p className={`text-caption ${strong ? "text-white/70" : "text-subtle"}`}>{k}</p>
      <p className="mt-1 text-[28px] font-semibold tracking-[-0.03em] tabular-nums">{v}</p>
    </div>
  );
}

async function PartnerView({ params }: { params: PageProps<"/p/[token]">["params"] }) {
  const { token } = await params;
  if (!/^[0-9a-f]{32}$/.test(token) || !isSupabaseConfigured()) notFound();
  const { data } = await db().from("partners").select("*").eq("token", token).maybeSingle();
  if (!data) notFound();
  const p = data as Partner;

  const [{ data: o }, { data: pay }] = await Promise.all([
    db().from("orders").select("id, code, template, status, partner_code, partner_commission, created_at").eq("partner_code", p.code).order("created_at", { ascending: false }),
    db().from("partner_payouts").select("*").eq("partner_code", p.code).order("paid_at", { ascending: false }),
  ]);
  const orders = (o ?? []) as PartnerOrder[];
  const payouts = (pay ?? []) as Payout[];
  const t = tally(orders, payouts);
  const shareLink = `${process.env.NEXT_PUBLIC_SITE_URL ?? site.url}/r/${p.code}`;

  return (
    <div className="space-y-4">
      <div>
        <Badge live={p.is_active} className="bg-panel">
          {site.name} partner · code {p.code}
        </Badge>
        <Heading as="h2" className="mt-5">
          Hi {p.name.split(" ")[0]}.
        </Heading>
        <Lead className="mt-3">
          You earn {formatINR(p.commission)} for every couple who orders through your link and pays. We send what you&rsquo;ve earned to your UPI on GPay.
        </Lead>
      </div>

      {!p.is_active && (
        <Panel className="p-6">
          <p className="text-body text-muted">Your link is paused right now, so new orders won&rsquo;t be credited. Message us on WhatsApp if that&rsquo;s a surprise.</p>
        </Panel>
      )}

      <Panel className="p-6 sm:p-8">
        <p className="text-title">Your link</p>
        <p className="mt-1 text-body text-muted">Couples who open it get your code applied automatically, and see it when they order. They can also type {p.code} at checkout.</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <code className="min-w-0 break-all rounded-field bg-surface px-3.5 py-2.5 text-[15px]">{shareLink}</code>
          <CopyLink text={shareLink} />
        </div>
      </Panel>

      <div className="grid gap-3 sm:grid-cols-4">
        <Stat k="Paid orders" v={String(t.sales)} />
        <Stat k="Earned" v={formatINR(t.earned)} />
        <Stat k="Already sent to you" v={formatINR(t.paid)} />
        <Stat k="Coming to you" v={formatINR(t.due)} strong />
      </div>
      {t.pending > 0 && <p className="text-caption text-subtle">Plus {formatINR(t.pending)} more once couples who&rsquo;ve ordered finish paying.</p>}

      <Panel className="p-6 sm:p-8">
        <p className="text-title">Orders through your link</p>
        {orders.length ? (
          <ul className="mt-4 divide-y divide-line">
            {orders.map((x) => {
              const st = orderState(x);
              return (
                <li key={x.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-body">
                  <span>
                    <span className="font-semibold">{x.code}</span>
                    <span className="text-muted">
                      {" "}
                      · {getTemplate(x.template)?.name ?? x.template} · {fmtDate(x.created_at, { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </span>
                  <span className={`rounded-full px-2.5 py-1 text-[12px] font-medium ${st.tone}`}>{st.label}</span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-2 text-body text-muted">No orders yet. Share your link and they&rsquo;ll show up here.</p>
        )}
      </Panel>

      {payouts.length > 0 && (
        <Panel className="p-6 sm:p-8">
          <p className="text-title">Payments to you</p>
          <ul className="mt-4 divide-y divide-line">
            {payouts.map((x) => (
              <li key={x.id} className="flex justify-between gap-2 py-3 text-body">
                <span className="text-muted">{fmtDate(x.paid_at, { day: "numeric", month: "short", year: "numeric" })}{x.note ? ` · ${x.note}` : ""}</span>
                <span className="font-semibold tabular-nums">{formatINR(x.amount)}</span>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}

export default function PartnerPage({ params }: PageProps<"/p/[token]">) {
  return (
    <section className="pt-12 pb-24">
      <Container>
        <Suspense fallback={<div className="h-[60vh] rounded-card bg-panel" />}>
          <PartnerView params={params} />
        </Suspense>
      </Container>
    </section>
  );
}
