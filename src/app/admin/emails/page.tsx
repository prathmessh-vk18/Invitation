import Link from "next/link";
import { formatINR } from "@/config/site";
import { requireAdmin } from "@/lib/admin-auth";
import { fmtDate } from "@/lib/format";
import { isMailConfigured } from "@/lib/mail";
import type { Order } from "@/lib/orders";
import { dueReminders } from "@/lib/reminders";
import { db } from "@/lib/supabase";
import { Panel } from "@/ui";
import { AdminHeader } from "../AdminHeader";

export const instant = false;

type LogRow = { id: string; order_id: string | null; to_email: string; reminder: number | null; subject: string; status: "sent" | "failed"; error: string | null; created_at: string };

const DAY = 864e5;
const istDay = (iso: string) => new Date(new Date(iso).getTime() + 5.5 * 36e5).toISOString().slice(0, 10);

function Stat({ label, value, note }: { label: string; value: string | number; note?: string }) {
  return (
    <Panel className="p-5">
      <p className="text-caption text-subtle">{label}</p>
      <p className="mt-1 text-[28px] font-semibold tracking-[-0.02em] tabular-nums">{value}</p>
      {note && <p className="text-caption text-subtle">{note}</p>}
    </Panel>
  );
}

/** Every email the site has sent, how many led to a payment, and who gets one next. */
export default async function AdminEmails() {
  await requireAdmin();
  const [{ data, error }, next] = await Promise.all([
    db().from("email_log").select("*").order("created_at", { ascending: false }).limit(1000),
    dueReminders().catch(() => null),
  ]);
  const log = (data ?? []) as LogRow[];
  const ids = [...new Set(log.map((r) => r.order_id).filter(Boolean))] as string[];
  const { data: o } = ids.length ? await db().from("orders").select("id, code, status, amount, paid_at, details, customer_phone").in("id", ids) : { data: [] };
  const orders = new Map(((o ?? []) as Order[]).map((x) => [x.id, x]));

  const sent = log.filter((r) => r.status === "sent");
  const now = new Date();
  const today = istDay(now.toISOString());
  const weekAgo = new Date(now.getTime() - 7 * DAY).toISOString();
  const firstSent = new Map<string, string>();
  for (const r of [...sent].reverse()) if (r.order_id && !firstSent.has(r.order_id)) firstSent.set(r.order_id, r.created_at);
  // Paid after we emailed them: the order was paid after its first email.
  const converted = [...firstSent.keys()].map((id) => orders.get(id)).filter((x): x is Order => Boolean(x && x.paid_at && x.paid_at > firstSent.get(x.id)!));

  return (
    <>
      <AdminHeader />
      <main className="mx-auto max-w-wide px-5 py-10">
        <h1 className="text-heading">Emails</h1>
        <p className="mt-2 text-lead text-muted">
          Payment reminders go out every morning at 10:00 IST to unpaid orders with an email: up to 3 per person, never to anyone who already paid.
        </p>
        {!isMailConfigured() && <p className="mt-4 text-body text-[#b42318]">Email isn&rsquo;t set up: add GMAIL_USER and GMAIL_APP_PASSWORD in Vercel.</p>}
        {error && <p className="mt-4 text-body text-[#b42318]">Couldn&rsquo;t load the log. Have you run supabase/migrations/0012_email_log.sql?</p>}

        <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-5">
          <Stat label="Sent today" value={sent.filter((r) => istDay(r.created_at) === today).length} />
          <Stat label="Last 7 days" value={sent.filter((r) => r.created_at >= weekAgo).length} />
          <Stat label="All time" value={sent.length} />
          <Stat label="Paid after an email" value={converted.length} note={converted.length ? formatINR(converted.reduce((s, x) => s + x.amount, 0)) : undefined} />
          <Stat label="Failed" value={log.filter((r) => r.status === "failed").length} note="retried the next day" />
        </div>

        {next && (
          <p className="mt-6 rounded-tile bg-surface px-5 py-4 text-body">
            <span className="font-medium">Next run, 10:00 IST:</span> {next.length ? `${next.length} ${next.length === 1 ? "person" : "people"} due a reminder.` : "nobody is due right now."}
          </p>
        )}

        <div className="mt-8 overflow-x-auto rounded-card border border-line">
          <table className="w-full min-w-[760px] text-left text-[14px]">
            <thead className="bg-panel text-caption text-subtle">
              <tr>
                <th className="px-4 py-3 font-medium">When</th>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">To</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Order now</th>
              </tr>
            </thead>
            <tbody>
              {log.slice(0, 300).map((r) => {
                const ord = r.order_id ? orders.get(r.order_id) : undefined;
                return (
                  <tr key={r.id} className="border-t border-line align-top">
                    <td className="px-4 py-3 whitespace-nowrap tabular-nums">{fmtDate(r.created_at, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</td>
                    <td className="px-4 py-3">
                      {ord ? (
                        <Link href={`/admin/orders/${ord.id}`} className="underline underline-offset-4">
                          {ord.code}
                        </Link>
                      ) : (
                        "—"
                      )}
                      {ord && <span className="block text-caption text-subtle">{ord.details.groom.first} &amp; {ord.details.bride.first}</span>}
                    </td>
                    <td className="px-4 py-3 break-all">{r.to_email}</td>
                    <td className="px-4 py-3">{r.reminder ? `Reminder ${r.reminder} of 3` : r.subject}</td>
                    <td className="px-4 py-3">
                      {r.status === "sent" ? <span className="text-[#1d6b35]">Sent</span> : <span className="text-[#b42318]">Failed{r.error ? `: ${r.error}` : ""}</span>}
                    </td>
                    <td className="px-4 py-3">{ord ? (ord.status === "paid" || ord.status === "live" ? <span className="font-medium text-[#1d6b35]">Paid ✓</span> : ord.status === "cancelled" ? "Cancelled" : "Unpaid") : "—"}</td>
                  </tr>
                );
              })}
              {!log.length && (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-muted">
                    No emails sent yet. The first reminders go out at 10:00 IST.
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
