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
  { id: "pending", label: "Held for you", status: "pending", auto: null },
  { id: "auto", label: "Applied automatically", status: "approved", auto: true },
  { id: "approved", label: "Approved by you", status: "approved", auto: false },
  { id: "declined", label: "Declined", status: "declined", auto: null },
] as const;

export default async function AdminChanges({ searchParams }: PageProps<"/admin/changes">) {
  await requireAdmin();
  if (!isSupabaseConfigured()) return <AdminHeader />;
  const raw = (await searchParams).status;
  const tab = tabs.find((x) => x.id === raw) ?? tabs[0];
  const active = tab.id;

  let q = db().from("change_requests").select("*").eq("status", tab.status);
  if (tab.auto !== null) q = q.eq("auto", tab.auto);
  const { data, error } = await q.order("created_at", { ascending: active === "pending" }).limit(100);
  const requests = (data ?? []) as ChangeRequest[];
  const ids = [...new Set(requests.map((r) => r.order_id))];
  const { data: o } = ids.length ? await db().from("orders").select("*").in("id", ids) : { data: [] };
  const orders = new Map(((o ?? []) as Order[]).map((x) => [x.id, x]));

  return (
    <>
      <AdminHeader />
      <main className="mx-auto max-w-wide px-5 py-10">
        <h1 className="text-heading">Couples&rsquo; changes</h1>
        <p className="mt-2 text-lead text-muted">
          Edits to paid and live orders go live on their own. Only ones that look like an invite being reused for another couple wait here for you.
        </p>
        {error && <p className="mt-4 text-body text-[#b42318]">Couldn&rsquo;t load requests. Have you run supabase/migrations/0010_edit_allowance.sql?</p>}
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
                    {getTemplate(order.template)?.name} · {order.status === "live" ? "Live" : "Paid"}
                    {r.status === "pending" && ` · ${n} change${n === 1 ? "" : "s"}`}
                    {r.hold_reason && <span className="mt-1 block text-caption font-medium text-[#7a5b00]">Held: {r.hold_reason}</span>}
                    {r.note && <span className="block truncate text-caption">Note from the couple: “{r.note}”</span>}
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
