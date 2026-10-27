import Link from "next/link";
import { getTemplate } from "@/data/templates";
import { requireAdmin } from "@/lib/admin-auth";
import { diffDetails, type ChangeRequest } from "@/lib/change-requests";
import { fmtDate } from "@/lib/format";
import type { Order } from "@/lib/orders";
import { db, isSupabaseConfigured } from "@/lib/supabase";
import { AdminHeader } from "../AdminHeader";

export const instant = false;

const tabs = [
  { id: "pending", label: "Waiting" },
  { id: "approved", label: "Approved" },
  { id: "declined", label: "Declined" },
] as const;

export default async function AdminChanges({ searchParams }: PageProps<"/admin/changes">) {
  await requireAdmin();
  if (!isSupabaseConfigured()) return <AdminHeader />;
  const raw = (await searchParams).status;
  const active = tabs.find((x) => x.id === raw)?.id ?? "pending";

  const { data, error } = await db().from("change_requests").select("*").eq("status", active).order("created_at", { ascending: active === "pending" }).limit(100);
  const requests = (data ?? []) as ChangeRequest[];
  const ids = [...new Set(requests.map((r) => r.order_id))];
  const { data: o } = ids.length ? await db().from("orders").select("*").in("id", ids) : { data: [] };
  const orders = new Map(((o ?? []) as Order[]).map((x) => [x.id, x]));

  return (
    <>
      <AdminHeader />
      <main className="mx-auto max-w-wide px-5 py-10">
        <h1 className="text-heading">Changes requested</h1>
        <p className="mt-2 text-lead text-muted">Couples&rsquo; edits to paid and live orders. Nothing changes on their invite until you approve.</p>
        {error && <p className="mt-4 text-body text-[#b42318]">Couldn&rsquo;t load requests. Have you run supabase/migrations/0005_change_requests.sql?</p>}
        <div className="no-scrollbar mt-6 flex gap-1.5 overflow-x-auto">
          {tabs.map((x) => (
            <Link
              key={x.id}
              href={`/admin/changes?status=${x.id}`}
              className={`shrink-0 rounded-full px-4 py-2 text-[14px] font-medium transition ${active === x.id ? "bg-ink text-white" : "bg-panel hover:bg-panel-strong"}`}
            >
              {x.label}
            </Link>
          ))}
        </div>
        <ul className="mt-6 space-y-3">
          {requests.map((r) => {
            const order = orders.get(r.order_id);
            if (!order) return null;
            const n = diffDetails(order.details, r.details).length + (r.song_path !== order.song_path ? 1 : 0) + ((r.photo_paths ?? []).join() !== (order.photo_paths ?? []).join() ? 1 : 0);
            return (
              <li key={r.id}>
                <Link href={`/admin/changes/${r.id}`} className="block rounded-card border border-line p-5 transition hover:bg-panel/60">
                  <p className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-title">
                      {order.code} · {order.details.groom.first} &amp; {order.details.bride.first}
                    </span>
                    <span className="text-caption text-subtle tabular-nums">{fmtDate(r.created_at, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</span>
                  </p>
                  <p className="mt-1 text-body text-muted">
                    {getTemplate(order.template)?.name} · {order.status === "live" ? "Live" : "Paid"} · {n} change{n === 1 ? "" : "s"}
                    {r.note && <span className="block truncate text-caption">“{r.note}”</span>}
                  </p>
                </Link>
              </li>
            );
          })}
          {!requests.length && <li className="rounded-card border border-line px-5 py-16 text-center text-muted">Nothing here right now.</li>}
        </ul>
      </main>
    </>
  );
}
