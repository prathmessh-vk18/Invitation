import "server-only";
import { formatINR, site } from "@/config/site";
import { getTemplate } from "@/data/templates";
import { button, esc, helpLine, layout, link, ticks } from "@/lib/email-layout";
import { isMailConfigured, sendMail } from "@/lib/mail";
import type { Order } from "@/lib/orders";
import { paysOnline } from "@/lib/razorpay";
import { db } from "@/lib/supabase";
import { dateLine, daysToWedding, LINK_IN, saving } from "@/lib/urgency";

/**
 * Payment reminder emails for orders that were filled in but never paid. At most three per order:
 * the first the day after ordering, then two and four days later. Never after the wedding, never
 * to a couple who asked us to stop, and only for orders that pay online.
 */
export const REMINDER_GAPS_DAYS = [0.5, 2, 4];
const DAY = 864e5;
export const MAX_PER_RUN = 80;

type Reminder = { subject: string; html: string; text: string };

/**
 * The email for an order's next reminder (0 = first). Built to convert: their own invite card on
 * top, one big pay button, an easy way to fix details first, what they get, and how many couples
 * already sent theirs with us. Every claim in it is true for this order.
 */
export function reminderEmail(order: Order, n: number, couples = 0): Reminder {
  const d = order.details;
  const t = getTemplate(order.template);
  const [a, b] = d.lead === "groom" ? [d.groom.first, d.bride.first] : [d.bride.first, d.groom.first];
  const pair = `${a} & ${b}`;
  const hi = order.customer_name?.trim().split(/\s+/)[0] || "there";
  const orderUrl = `${site.url}/order/${order.id}`;
  const payUrl = `${orderUrl}?pay=1`;
  const editUrl = `${orderUrl}/edit`;
  const s = saving(order, t);
  const price = formatINR(order.amount);
  const days = daysToWedding(d.date);
  const soon = dateLine(days)?.text;
  const proof = couples >= 50 ? `${Math.floor(couples / 10) * 10}+ couples have already sent their invites with ${site.name}.` : "";

  const copy = [
    {
      subject: `${pair}, your wedding invite is ready 🌸`,
      preheader: `Your ${t?.name ?? ""} invite is made. Pay once and share it on WhatsApp in ${LINK_IN}.`,
      title: `${pair}, your invite is ready`,
      lead: `Hi ${hi}, your ${t?.name ?? ""} invitation is made: every function, venue and your music, on one beautiful link. It's one step from your guests' phones.`,
    },
    {
      subject: `Your guests haven't seen ${pair}'s invite yet`,
      preheader: `It's ready and waiting. Pay once and it goes live in ${LINK_IN}.`,
      title: `Your invite is waiting for you`,
      lead: `Hi ${hi}, ${pair}'s invite is ready, but it isn't live yet, so your guests can't open it. Pay once and you'll have the link to share in ${LINK_IN}.`,
    },
    {
      subject: `Last reminder: ${pair}'s wedding invite`,
      preheader: `Everything you filled in is saved. One payment and it's live.`,
      title: `One step left`,
      lead: `Hi ${hi}, this is our last reminder. Everything you filled in for ${pair} is saved, so your invite is one payment away from going live.`,
    },
  ][Math.min(n, 2)];

  const gets = [
    `Every function with venue, time and Google Maps directions`,
    `A live countdown, and RSVPs straight to your WhatsApp`,
    `Your music and photos, on one link that opens like a card`,
    `${site.revisionRounds} free edits after it's live, on the same link`,
  ];

  const body = `
<h1 style="margin:0;font-size:26px;line-height:1.2;letter-spacing:-0.02em;font-weight:800">${esc(copy.title)}</h1>
<p style="margin:12px 0 0;font-size:16px;line-height:1.55;color:#333">${esc(copy.lead)}</p>
${soon ? `<p style="margin:14px 0 0;padding:12px 14px;background:#fff4e5;border-radius:12px;font-size:15px;line-height:1.5;color:#7a3e00;font-weight:600">⏳ ${esc(soon)}</p>` : ""}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;background:#f7f3ee;border-radius:14px"><tr><td style="padding:16px 18px">
<div style="font-size:14px;color:#666">${esc(t?.name ?? "Invitation")} design · order ${esc(order.code)}</div>
<div style="margin-top:4px;font-size:24px;font-weight:800;letter-spacing:-0.02em">${price}${s ? ` <span style="font-size:16px;font-weight:500;color:#999;text-decoration:line-through">${formatINR(s.mrp)}</span>` : ""}</div>
${s ? `<div style="margin-top:2px;font-size:14px;font-weight:600;color:#1d6b35">Launch price · you save ${formatINR(s.off)}</div>` : ""}
</td></tr></table>
<div style="margin-top:20px">${button(payUrl, `Pay ${price} and go live`)}</div>
<p style="margin:10px 0 0;text-align:center;font-size:13px;color:#777">UPI, cards or netbanking · secure checkout by Razorpay</p>
<p style="margin:18px 0 0;text-align:center;font-size:15px;color:#333">Want to change something first? ${link(editUrl, "Edit your details")}. It's free and saves instantly.</p>
<div style="margin-top:24px;padding-top:20px;border-top:1px solid #eee">
<div style="font-size:15px;font-weight:700;margin-bottom:6px">What your guests get</div>
${ticks(gets)}
</div>
${proof ? `<p style="margin:18px 0 0;font-size:15px;line-height:1.5;color:#333">💛 ${esc(proof)}</p>` : ""}
${helpLine}`;

  const html = layout({
    preheader: copy.preheader,
    image: { src: `${orderUrl}/card`, href: payUrl, alt: `${pair}'s wedding invitation` },
    body,
    footer: `Order ${esc(order.code)}. You're getting this because you started this order on aavjoo.in. Reply "stop" and we won't email you again.`,
  });

  const text = [
    copy.title,
    "",
    copy.lead,
    soon ?? "",
    "",
    `${t?.name ?? "Invitation"} design · ${s ? `${price} (launch price, you save ${formatINR(s.off)} on ${formatINR(s.mrp)})` : price}`,
    `Pay and go live: ${payUrl}`,
    `Change something first (free): ${editUrl}`,
    "",
    "What your guests get:",
    ...gets.map((g) => `- ${g}`),
    proof,
    "",
    `Questions? Reply to this email or WhatsApp us at ${site.whatsappDisplay}.`,
    `Order ${order.code}. Reply "stop" and we won't email you again.`,
  ]
    .filter((l, i, all) => !(l === "" && all[i - 1] === ""))
    .join("\n");

  return { subject: copy.subject, html, text };
}

/** Whether an unpaid order is due its next reminder now. */
export function reminderDue(order: Order, now = Date.now()) {
  const sent = order.email_reminders ?? 0;
  if (order.status !== "awaiting_payment" || !order.customer_email?.includes("@") || order.email_opt_out) return false;
  if (sent >= REMINDER_GAPS_DAYS.length || !paysOnline(order)) return false;
  if (new Date(order.details.date).getTime() < now) return false;
  const since = new Date(sent === 0 ? order.created_at : order.email_reminded_at ?? order.created_at).getTime();
  return now - since >= REMINDER_GAPS_DAYS[sent] * DAY;
}

/**
 * The reminders to send now: due orders, minus anyone who already paid on another order (people
 * often try a few designs), and one per person (by phone), about their most recent order. `also` lists that
 * person's other unpaid orders, which move along with it so they never get a second copy.
 */
export async function dueReminders() {
  const { data, error } = await db().from("orders").select("*").neq("status", "cancelled");
  if (error) throw new Error(error.message);
  const orders = data as Order[];
  const email = (o: Order) => (o.customer_email ?? "").trim().toLowerCase();
  const paid = new Set(orders.filter((o) => o.status === "paid" || o.status === "live").flatMap((o) => [o.customer_phone, email(o)]).filter(Boolean));
  const people = new Map<string, Order[]>();
  for (const o of orders) {
    if (o.status !== "awaiting_payment" || !email(o) || paid.has(o.customer_phone) || paid.has(email(o))) continue;
    // By phone: everyone gives one, while emails get typed differently from order to order.
    people.set(o.customer_phone, [...(people.get(o.customer_phone) ?? []), o]);
  }
  const out: { order: Order; also: string[] }[] = [];
  for (const os of people.values()) {
    const latest = os.sort((x, y) => y.created_at.localeCompare(x.created_at))[0];
    if (reminderDue(latest)) out.push({ order: latest, also: os.slice(1).map((o) => o.id) });
  }
  return out;
}

/** Sends every reminder that's due. Run once a day by the cron. */
export async function sendDueReminders({ dryRun = false } = {}) {
  if (!dryRun && !isMailConfigured()) return { sent: 0, failed: 0, due: 0, error: "Email isn't set up." };
  let due: Awaited<ReturnType<typeof dueReminders>>;
  try {
    due = await dueReminders();
  } catch (e) {
    return { sent: 0, failed: 0, due: 0, error: (e as Error).message };
  }
  const { count: couples } = await db().from("orders").select("id", { count: "exact", head: true }).eq("status", "live");
  let sent = 0;
  let failed = 0;
  // At most this many a day: a new Gmail account sending hundreds at once can be flagged as spam.
  // Anyone over the cap is simply first in line tomorrow.
  for (const { order: o, also } of due.slice(0, MAX_PER_RUN)) {
    if (dryRun) continue;
    const n = o.email_reminders ?? 0;
    const mail = { to: o.customer_email!.trim(), ...reminderEmail(o, n, couples ?? 0) };
    const log = { order_id: o.id, to_email: mail.to, kind: "payment_reminder", reminder: n + 1, subject: mail.subject };
    try {
      await sendMail(mail);
      // Only counts once Gmail accepted it, so a failure is retried tomorrow.
      await db()
        .from("orders")
        .update({ email_reminders: n + 1, email_reminded_at: new Date().toISOString() })
        .in("id", [o.id, ...also])
        .eq("status", "awaiting_payment");
      await db().from("email_log").insert({ ...log, status: "sent" });
      sent++;
    } catch (e) {
      console.error("Reminder email failed", o.code, e);
      await db().from("email_log").insert({ ...log, status: "failed", error: String((e as Error).message ?? e).slice(0, 300) });
      failed++;
    }
  }
  return { sent, failed, due: due.length, codes: due.map((d) => d.order.code) };
}
