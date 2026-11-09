import Link from "next/link";
import { formatINR, site } from "@/config/site";
import { requireAdmin } from "@/lib/admin-auth";
import { fmtDate } from "@/lib/format";
import { EMAILS_PAUSED, FROM, isMailConfigured } from "@/lib/mail";
import type { Order } from "@/lib/orders";
import { dueReminders } from "@/lib/reminders";
import { db } from "@/lib/supabase";
import { Panel } from "@/ui";
import { AdminHeader } from "../AdminHeader";

export const instant = false;

type Kind = "payment_reminder" | "invite_live" | "pdf_offer";
type LogRow = { id: string; order_id: string | null; to_email: string; kind: Kind; reminder: number | null; subject: string; status: "sent" | "failed"; error: string | null; created_at: string };

const tabs = [
  { id: "all", label: "All emails" },
  { id: "payment_reminder", label: "Payment reminders" },
  { id: "invite_live", label: "Invite is live" },
  { id: "pdf_offer", label: "PDF offer" },
] as const;
type TabId = (typeof tabs)[number]["id"];

const kindLabel = (r: LogRow) => (r.kind === "payment_reminder" ? `Reminder ${r.reminder ?? ""} of 3` : r.kind === "invite_live" ? "Invite is live" : r.kind === "pdf_offer" ? "PDF offer" : r.subject);

const DAY = 864e5;
const istDay = (iso: string) => new Date(new Date(iso).getTime() + 5.5 * 36e5).toISOString().slice(0, 10);
const pct = (a: number, b: number) => (b ? `${Math.round((100 * a) / b)}% of those emailed` : undefined);

function Stat({ label, value, note }: { label: string; value: string | number; note?: string }) {
  return (
    <Panel className="p-5">
      <p className="text-caption text-subtle">{label}</p>
      <p className="mt-1 text-[28px] font-semibold tracking-[-0.02em] tabular-nums">{value}</p>
      {note && <p className="text-caption text-subtle">{note}</p>}
    </Panel>
  );
}

/**
 * Every email the site sends, by kind, and what each kind led to: payments after a reminder, and
 * PDFs bought after the offer. Reads the email log, the orders it names and the add-on purchases.
 */
export default async function AdminEmails({ searchParams }: PageProps<"/admin/emails">) {
  await requireAdmin();
  const raw = (await searchParams).kind;
  const tab: TabId = tabs.find((t) => t.id === raw)?.id ?? "all";

  const [{ data, error }, next, { data: buys }, { data: pdfOrders }] = await Promise.all([
    db().from("email_log").select("*").order("created_at", { ascending: false }).limit(2000),
    dueReminders().catch(() => null),
    db().from("addon_purchases").select("order_id, amount, paid_at").eq("status", "paid"),
    db().from("orders").select("id, amount, addons, created_at").contains("addons", ["pdf"]),
  ]);
  const all = (data ?? []) as LogRow[];
  const ids = [...new Set(all.map((r) => r.order_id).filter(Boolean))] as string[];
  const { data: o } = ids.length ? await db().from("orders").select("id, code, status, amount, paid_at, addons, details").in("id", ids) : { data: [] };
  const orders = new Map(((o ?? []) as Order[]).map((x) => [x.id, x]));

  const now = new Date();
  const today = istDay(now.toISOString());
  const weekAgo = new Date(now.getTime() - 7 * DAY).toISOString();
  const sentOf = (k?: Kind) => all.filter((r) => r.status === "sent" && (!k || r.kind === k));
  const firstSentTo = (rows: LogRow[]) => {
    const first = new Map<string, string>();
    for (const r of [...rows].reverse()) if (r.order_id && !first.has(r.order_id)) first.set(r.order_id, r.created_at);
    return first;
  };

  // Payment reminders → paid after the first reminder.
  const reminderFirst = firstSentTo(sentOf("payment_reminder"));
  const paidAfterReminder = [...reminderFirst.keys()].map((id) => orders.get(id)).filter((x): x is Order => Boolean(x?.paid_at && x.paid_at > reminderFirst.get(x.id)!));

  // PDF offer → bought the PDF online after the offer.
  const offerFirst = firstSentTo(sentOf("pdf_offer"));
  const boughtAfterOffer = (buys ?? []).filter((b) => b.paid_at && offerFirst.has(b.order_id) && b.paid_at > offerFirst.get(b.order_id)!);
  // All PDF sales, wherever they came from.
  const pdfAtCheckout = (pdfOrders ?? []).filter((x) => !(buys ?? []).some((b) => b.order_id === x.id)).length;
  const pdfOnline = (buys ?? []).length;
  const pdfTotal = (pdfOrders ?? []).length;

  const log = tab === "all" ? all : all.filter((r) => r.kind === tab);
  const sent = log.filter((r) => r.status === "sent");
  const failed = log.filter((r) => r.status === "failed").length;
  const count = (k: Kind) => sentOf(k).length;

  return (
    <>
      <AdminHeader />
      <main className="mx-auto max-w-wide px-5 py-10">
        <h1 className="text-heading">Emails</h1>
        <p className="mt-2 text-caption text-subtle">Sent from {FROM} through Resend; replies go to aavjoo.in@gmail.com.</p>
        {EMAILS_PAUSED ? (
          <p className="mt-4 rounded-tile bg-[#fff3c4] px-5 py-4 text-body font-medium text-[#7a5b00]">Emails are paused: nothing is being sent.</p>
        ) : (
          !isMailConfigured() && <p className="mt-4 text-body text-[#b42318]">Email isn&rsquo;t set up: add RESEND_API_KEY in Vercel.</p>
        )}
        {error && <p className="mt-4 text-body text-[#b42318]">Couldn&rsquo;t load the log. Have you run supabase/migrations/0012_email_log.sql?</p>}

        <div className="no-scrollbar mt-6 flex gap-1.5 overflow-x-auto">
          {tabs.map((t) => (
            <Link
              key={t.id}
              href={t.id === "all" ? "/admin/emails" : `/admin/emails?kind=${t.id}`}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-[14px] font-medium transition ${tab === t.id ? "bg-ink text-white" : "bg-panel hover:bg-panel-strong"}`}
            >
              {t.label}
              <span className={`tabular-nums ${tab === t.id ? "text-white/60" : "text-subtle"}`}>{t.id === "all" ? sentOf().length : count(t.id)}</span>
            </Link>
          ))}
        </div>

        {/* What this kind of email is for, and how it's doing. */}
        {tab === "all" && (
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <Panel className="p-5">
              <p className="text-title">Payment reminders</p>
              <p className="mt-1 text-body text-muted">{count("payment_reminder")} sent · {paidAfterReminder.length} paid after one</p>
              <p className="text-caption text-subtle">{formatINR(paidAfterReminder.reduce((s, x) => s + x.amount, 0))} collected</p>
            </Panel>
            <Panel className="p-5">
              <p className="text-title">Invite is live</p>
              <p className="mt-1 text-body text-muted">{count("invite_live")} sent to newly published couples</p>
              <p className="text-caption text-subtle">Their link, WhatsApp share and edit links</p>
            </Panel>
            <Panel className="p-5">
              <p className="text-title">PDF offer</p>
              <p className="mt-1 text-body text-muted">{count("pdf_offer")} sent · {boughtAfterOffer.length} bought the PDF</p>
              <p className="text-caption text-subtle">{formatINR(boughtAfterOffer.reduce((s, b) => s + b.amount, 0))} from the email</p>
            </Panel>
          </div>
        )}

        {tab === "payment_reminder" && (
          <>
            <p className="mt-6 text-body text-muted">Every morning at 10:00 IST to unpaid orders with an email: up to 3 per person, never to anyone who already paid.</p>
            <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
              <Stat label="Sent today" value={sent.filter((r) => istDay(r.created_at) === today).length} />
              <Stat label="Last 7 days" value={sent.filter((r) => r.created_at >= weekAgo).length} />
              <Stat label="Couples reminded" value={reminderFirst.size} />
              <Stat label="Paid after a reminder" value={paidAfterReminder.length} note={[formatINR(paidAfterReminder.reduce((s, x) => s + x.amount, 0)), pct(paidAfterReminder.length, reminderFirst.size)].filter(Boolean).join(" · ")} />
              <Stat label="Failed" value={failed} note="retried the next day" />
            </div>
            {next && (
              <p className="mt-4 rounded-tile bg-surface px-5 py-4 text-body">
                <span className="font-medium">Next run, 10:00 IST:</span> {next.length ? `${next.length} ${next.length === 1 ? "person" : "people"} due a reminder.` : "nobody is due right now."}
              </p>
            )}
          </>
        )}

        {tab === "invite_live" && (
          <>
            <p className="mt-6 text-body text-muted">Sent once, the first time a couple&rsquo;s invite goes live: their link, a WhatsApp share button, and their edit and order-page links.</p>
            <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Stat label="Sent today" value={sent.filter((r) => istDay(r.created_at) === today).length} />
              <Stat label="Last 7 days" value={sent.filter((r) => r.created_at >= weekAgo).length} />
              <Stat label="All time" value={sent.length} />
              <Stat label="Failed" value={failed} />
            </div>
          </>
        )}

        {tab === "pdf_offer" && (
          <>
            <p className="mt-6 text-body text-muted">
              The {formatINR(site.pdfAddon.price)} printable PDF, offered once to couples with a paid invite. A sale counts here when they buy online after the email.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
              <Stat label="Sent today" value={sent.filter((r) => istDay(r.created_at) === today).length} />
              <Stat label="Couples emailed" value={offerFirst.size} />
              <Stat label="Bought after the email" value={boughtAfterOffer.length} note={pct(boughtAfterOffer.length, offerFirst.size)} />
              <Stat label="Revenue from the email" value={formatINR(boughtAfterOffer.reduce((s, b) => s + b.amount, 0))} />
              <Stat label="Failed" value={failed} />
            </div>
            <Panel className="mt-4 p-5">
              <p className="text-title">All PDF sales</p>
              <p className="mt-1 text-body text-muted">
                {pdfTotal} couples have the PDF: {pdfAtCheckout} ticked it at checkout (or were given it), {pdfOnline} bought it from their order page or the email.
              </p>
            </Panel>
          </>
        )}

        <div className="mt-8 overflow-x-auto rounded-card border border-line">
          <table className="w-full min-w-[820px] text-left text-[14px]">
            <thead className="bg-panel text-caption text-subtle">
              <tr>
                <th className="px-4 py-3 font-medium">When</th>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">To</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Result</th>
              </tr>
            </thead>
            <tbody>
              {log.slice(0, 400).map((r) => {
                const ord = r.order_id ? orders.get(r.order_id) : undefined;
                const paid = ord && (ord.status === "paid" || ord.status === "live");
                const hasPdf = ord && (ord.addons ?? []).includes("pdf");
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
                      {ord && (
                        <span className="block text-caption text-subtle">
                          {ord.details.groom.first} &amp; {ord.details.bride.first}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 break-all">{r.to_email}</td>
                    <td className="px-4 py-3">{kindLabel(r)}</td>
                    <td className="px-4 py-3">
                      {r.status === "sent" ? <span className="text-[#1d6b35]">Sent</span> : <span className="text-[#b42318]">Failed{r.error ? `: ${r.error}` : ""}</span>}
                    </td>
                    <td className="px-4 py-3">
                      {!ord
                        ? "—"
                        : r.kind === "pdf_offer"
                          ? hasPdf
                            ? <span className="font-medium text-[#1d6b35]">Bought the PDF ✓</span>
                            : "Not yet"
                          : r.kind === "payment_reminder"
                            ? paid
                              ? <span className="font-medium text-[#1d6b35]">Paid ✓</span>
                              : ord.status === "cancelled"
                                ? "Cancelled"
                                : "Unpaid"
                            : hasPdf
                              ? "Live · has PDF"
                              : "Live"}
                    </td>
                  </tr>
                );
              })}
              {!log.length && (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-muted">
                    Nothing sent in this category yet.
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
