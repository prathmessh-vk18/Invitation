import { formatINR } from "@/config/site";
import { requireAdmin } from "@/lib/admin-auth";
import { tally, type Partner, type PartnerOrder, type Payout } from "@/lib/partners";
import { db, isSupabaseConfigured } from "@/lib/supabase";
import { Panel } from "@/ui";
import { AdminHeader } from "../AdminHeader";
import { AddPartner, PartnerActions } from "./PartnerForms";

export const instant = false;

export default async function AdminPartners() {
  await requireAdmin();
  if (!isSupabaseConfigured()) {
    return (
      <>
        <AdminHeader />
        <p className="mx-auto max-w-wide px-5 py-16 text-lead text-muted">Supabase isn&rsquo;t connected yet. Add the keys to .env.local and restart.</p>
      </>
    );
  }

  const [{ data: p, error }, { data: o }, { data: pay }] = await Promise.all([
    db().from("partners").select("*").order("created_at", { ascending: false }),
    db().from("orders").select("id, code, template, status, partner_code, partner_commission, created_at").not("partner_code", "is", null),
    db().from("partner_payouts").select("*").order("paid_at", { ascending: false }),
  ]);
  const list = (p ?? []) as Partner[];
  const orders = (o ?? []) as PartnerOrder[];
  const payouts = (pay ?? []) as Payout[];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  const rows = list.map((x) => ({
    partner: x,
    t: tally(
      orders.filter((y) => y.partner_code === x.code),
      payouts.filter((y) => y.partner_code === x.code),
    ),
  }));
  const totalDue = rows.reduce((n, r) => n + r.t.due, 0);

  return (
    <>
      <AdminHeader />
      <main className="mx-auto max-w-wide px-5 py-10">
        <h1 className="text-heading">Partners</h1>
        <p className="mt-2 text-lead text-muted">
          Friends and creators who share their link. They earn on every paid order. You owe {formatINR(totalDue)} in total.
        </p>
        {error && <p className="mt-4 text-body text-[#b42318]">Couldn&rsquo;t load partners. Have you run supabase/migrations/0004_partners.sql?</p>}

        <Panel className="mt-8 p-6">
          <p className="text-title">Add a partner</p>
          <div className="mt-4">
            <AddPartner />
          </div>
        </Panel>

        <div className="mt-6 overflow-x-auto rounded-card border border-line">
          <table className="w-full min-w-[900px] text-left text-[14px]">
            <thead className="bg-panel text-caption text-subtle">
              <tr>
                {["Partner", "Code", "Sales", "Earned", "Pending", "Paid out", "Owed", ""].map((h) => (
                  <th key={h} className="px-4 py-3 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(({ partner: x, t }) => (
                <tr key={x.code} className={`border-t border-line align-top ${x.is_active ? "" : "opacity-50"}`}>
                  <td className="px-4 py-3">
                    <span className="font-semibold">{x.name}</span>
                    <span className="block text-caption text-subtle tabular-nums">
                      +{x.phone} · {x.upi_id ?? "no UPI ID"} · {formatINR(x.commission)}/sale
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold">{x.code}</td>
                  <td className="px-4 py-3 tabular-nums">{t.sales}</td>
                  <td className="px-4 py-3 tabular-nums">{formatINR(t.earned)}</td>
                  <td className="px-4 py-3 tabular-nums text-subtle">{formatINR(t.pending)}</td>
                  <td className="px-4 py-3 tabular-nums">{formatINR(t.paid)}</td>
                  <td className="px-4 py-3 font-semibold tabular-nums">{formatINR(t.due)}</td>
                  <td className="px-4 py-3">
                    <PartnerActions code={x.code} name={x.name} phone={x.phone} upi={x.upi_id} token={x.token} active={x.is_active} due={t.due} siteUrl={siteUrl} />
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-muted">
                    No partners yet. Add your first one above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
