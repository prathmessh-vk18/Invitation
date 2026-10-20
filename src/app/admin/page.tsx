import Link from "next/link";
import { formatINR } from "@/config/site";
import { getTemplate } from "@/data/templates";
import { requireAdmin } from "@/lib/admin-auth";
import { fmtDate } from "@/lib/format";
import { statusLabel, type Order, type OrderStatus } from "@/lib/orders";
import { db, isSupabaseConfigured } from "@/lib/supabase";
import { AdminHeader, statusTone } from "./AdminHeader";

export const instant = false;

const filters: { id: OrderStatus | "all"; label: string }[] = [
  { id: "awaiting_payment", label: "New orders" },
  { id: "paid", label: "Paid · ready to publish" },
  { id: "live", label: "Live" },
  { id: "cancelled", label: "Cancelled" },
  { id: "all", label: "All" },
];

export default async function AdminOrders({ searchParams }: PageProps<"/admin">) {
  await requireAdmin();
  if (!isSupabaseConfigured()) {
    return (
      <>
        <AdminHeader />
        <p className="mx-auto max-w-wide px-5 py-16 text-lead text-muted">Supabase isn&rsquo;t connected yet. Add the keys to .env.local and restart.</p>
      </>
    );
  }

  const raw = (await searchParams).status;
  const active = (filters.find((f) => f.id === raw)?.id ?? "awaiting_payment") as OrderStatus | "all";

  const { data: counts } = await db().from("orders").select("status");
  const count = (s: string) => (counts ?? []).filter((r) => s === "all" || r.status === s).length;

  let q = db().from("orders").select("*").order("created_at", { ascending: false }).limit(200);
  if (active !== "all") q = q.eq("status", active);
  const { data } = await q;
  const orders = (data ?? []) as Order[];

  return (
    <>
      <AdminHeader />
      <main className="mx-auto max-w-wide px-5 py-10">
        <h1 className="text-heading">Orders</h1>
        <div className="no-scrollbar mt-6 flex gap-1.5 overflow-x-auto">
          {filters.map((f) => (
            <Link
              key={f.id}
              href={`/admin?status=${f.id}`}
              className={`shrink-0 rounded-full px-4 py-2 text-[14px] font-medium transition ${active === f.id ? "bg-ink text-white" : "bg-panel hover:bg-panel-strong"}`}
            >
              {f.label} <span className="opacity-60">{count(f.id)}</span>
            </Link>
          ))}
        </div>

        <div className="mt-6 overflow-x-auto rounded-card border border-line">
          <table className="w-full min-w-[820px] text-left text-[14px]">
            <thead className="bg-panel text-caption text-subtle">
              <tr>
                {["Order", "Couple", "Design", "Wedding", "Amount", "WhatsApp", "Status", "Placed"].map((h) => (
                  <th key={h} className="px-4 py-3 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const d = o.details;
                return (
                  <tr key={o.id} className="border-t border-line hover:bg-panel/60">
                    <td className="px-4 py-3 font-semibold">
                      <Link href={`/admin/orders/${o.id}`} className="underline-offset-4 hover:underline">
                        {o.code}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      {d.groom.first} &amp; {d.bride.first}
                      <span className="block text-caption text-subtle">{o.customer_name}</span>
                    </td>
                    <td className="px-4 py-3">{getTemplate(o.template)?.name ?? o.template}</td>
                    <td className="px-4 py-3 tabular-nums">{fmtDate(d.date, { day: "numeric", month: "short", year: "numeric" })}</td>
                    <td className="px-4 py-3 tabular-nums">{formatINR(o.amount)}</td>
                    <td className="px-4 py-3 text-caption tabular-nums">+{o.customer_phone}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-[12px] font-medium ${statusTone[o.status]}`}>{statusLabel[o.status]}</span>
                    </td>
                    <td className="px-4 py-3 text-caption text-subtle tabular-nums">{fmtDate(o.created_at, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</td>
                  </tr>
                );
              })}
              {!orders.length && (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-muted">
                    Nothing here right now.
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
