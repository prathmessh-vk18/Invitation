import Link from "next/link";
import { notFound } from "next/navigation";
import { site } from "@/config/site";
import { requireAdmin } from "@/lib/admin-auth";
import { diffDetails, type ChangeRequest } from "@/lib/change-requests";
import { fmtDate } from "@/lib/format";
import { orderHistory } from "@/lib/order-edits";
import type { Order } from "@/lib/orders";
import { db, photoPublicUrl, songPublicUrl } from "@/lib/supabase";
import { Panel } from "@/ui";
import { AdminHeader } from "../../AdminHeader";
import { ChangeActions } from "./ChangeActions";

export const instant = false;

export default async function AdminChange({ params }: PageProps<"/admin/changes/[id]">) {
  await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const { data } = await db().from("change_requests").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const r = data as ChangeRequest;
  const { data: o } = await db().from("orders").select("*").eq("id", r.order_id).maybeSingle();
  if (!o) notFound();
  const order = o as Order;

  const changes = diffDetails(order.details, r.details);
  // Edits made to the order after the couple sent this request. Approving puts back the couple's
  // older version of anything those edits touched, so those lines need a second look.
  const later = r.status === "pending" ? (await orderHistory(order.id, r.created_at)).filter((e) => e.request_id !== r.id) : [];
  const touched = new Set(later.flatMap((e) => e.changes.map((c) => c.label)));
  const undo = changes.filter((c) => touched.has(c.label));
  const songChanged = r.song_path !== order.song_path;
  const before = order.photo_paths ?? [];
  const after = r.photo_paths ?? [];
  const photosChanged = before.join() !== after.join();
  const inviteUrl = order.invite_slug ? `${process.env.NEXT_PUBLIC_SITE_URL ?? site.url}/i/${order.invite_slug}` : "";

  return (
    <>
      <AdminHeader />
      <main className="mx-auto max-w-wide px-5 py-10">
        <Link href="/admin/changes" className="text-caption text-subtle hover:text-ink">
          ← All change requests
        </Link>
        <h1 className="mt-3 text-heading">
          {order.code} · {order.details.groom.first} &amp; {order.details.bride.first}
        </h1>
        <p className="mt-2 text-lead text-muted">
          Sent {fmtDate(r.created_at, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })} ·{" "}
          <Link href={`/admin/orders/${order.id}`} className="underline underline-offset-4">
            Open order
          </Link>
          {order.invite_slug && (
            <>
              {" "}·{" "}
              <a href={`/i/${order.invite_slug}`} target="_blank" rel="noreferrer" className="underline underline-offset-4">
                Current invite ↗
              </a>
            </>
          )}
        </p>

        {later.length > 0 && (
          <div className="mt-6 rounded-card border border-[#e7b4b4] bg-[#fdecec] p-5 text-[#8a1c1c]">
            <p className="text-title">This invite was edited after the couple sent this request</p>
            <p className="mt-1 text-body">
              {later.length} edit{later.length === 1 ? "" : "s"} since, last on {fmtDate(later[0].created_at, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}.{" "}
              {undo.length
                ? "Approving as it is would put back the couple's older version of:"
                : "None of those edits is undone by this request, so approving is safe."}
            </p>
            {undo.length > 0 && (
              <ul className="mt-3 space-y-2">
                {undo.map((c) => (
                  <li key={c.label} className="rounded-tile bg-surface/70 p-3 text-body text-ink">
                    <span className="text-caption font-medium text-subtle">{c.label}</span>
                    <span className="block">Now: {c.before}</span>
                    <span className="block text-[#8a1c1c]">Would become: {c.after}</span>
                  </li>
                ))}
              </ul>
            )}
            {undo.length > 0 && <p className="mt-3 text-body">Use “Edit, then approve” to keep the newer text, or approve anyway if the couple meant it.</p>}
          </div>
        )}

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <Panel className="p-6">
            <p className="text-title">What they changed</p>
            {r.note && <p className="mt-3 rounded-tile bg-surface p-4 text-body">“{r.note}”</p>}
            <div className="mt-4 divide-y divide-line">
              {changes.map((c) => (
                <div key={c.label} className="py-3">
                  <p className="text-caption font-medium text-subtle">{c.label}</p>
                  <p className="mt-1 text-body break-words text-muted line-through decoration-[#8a1c1c]/40">{c.before}</p>
                  <p className="text-body font-medium break-words">{c.after}</p>
                </div>
              ))}
              {songChanged && (
                <div className="py-3">
                  <p className="text-caption font-medium text-subtle">Song</p>
                  <p className="mt-1 text-body">{r.song_path ? "New upload:" : "Removed their upload, now using our track."}</p>
                  {r.song_path && <audio controls src={songPublicUrl(r.song_path)} className="mt-2 h-9 w-full" />}
                </div>
              )}
              {photosChanged && (
                <div className="py-3">
                  <p className="text-caption font-medium text-subtle">
                    Photos: {before.length} → {after.length}
                  </p>
                  <span className="mt-2 grid grid-cols-4 gap-1.5 sm:grid-cols-6">
                    {after.map((p) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={p} src={photoPublicUrl(p)} alt="" className={`aspect-square w-full rounded-md object-cover ${before.includes(p) ? "opacity-50" : "ring-2 ring-ink"}`} />
                    ))}
                  </span>
                  <p className="mt-1 text-caption text-subtle">New photos have a dark outline.</p>
                </div>
              )}
              {!changes.length && !songChanged && !photosChanged && <p className="py-3 text-body text-muted">Nothing is different from the order as it is now.</p>}
            </div>
          </Panel>

          <Panel className="p-6 lg:sticky lg:top-24 lg:self-start">
            <ChangeActions
              id={r.id}
              status={r.status}
              reply={r.reply}
              code={order.code}
              phone={order.customer_phone}
              inviteUrl={inviteUrl}
              undoCount={undo.length}
            />
          </Panel>
        </div>
      </main>
    </>
  );
}
