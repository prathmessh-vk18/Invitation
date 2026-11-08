import "server-only";
import { formatINR, site } from "@/config/site";
import { getTemplate } from "@/data/templates";
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

type Reminder = { subject: string; html: string; text: string };

const esc = (s: string) => s.replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]!);

/** The email for an order's next reminder (0 = first). */
export function reminderEmail(order: Order, n: number): Reminder {
  const d = order.details;
  const t = getTemplate(order.template);
  const [a, b] = d.lead === "groom" ? [d.groom.first, d.bride.first] : [d.bride.first, d.groom.first];
  const couple = `${a} & ${b}`;
  const hi = order.customer_name?.trim().split(/\s+/)[0] || "there";
  const payUrl = `${site.url}/order/${order.id}?pay=1`;
  const s = saving(order, t);
  const price = formatINR(order.amount);
  const soon = dateLine(daysToWedding(d.date))?.text;

  const copy = [
    {
      subject: `Your ${t?.name ?? ""} invite for ${couple} is ready 🌸`,
      lead: `Your ${t?.name ?? ""} invitation for ${couple} is all set up, with your functions, venues and music. It goes live the moment you pay.`,
    },
    {
      subject: `${couple}'s invite is still waiting`,
      lead: `Just checking in: ${couple}'s invite is ready and waiting. Pay once and you'll have your link to share on WhatsApp within ${LINK_IN}.`,
    },
    {
      subject: `Last reminder: ${couple}'s wedding invite`,
      lead: `This is our last reminder about ${couple}'s invite. Everything you filled in is saved, so it's one payment away from going live.`,
    },
  ][Math.min(n, 2)];

  const priceLine = s ? `${price} (launch price, you save ${formatINR(s.off)} on ${formatINR(s.mrp)})` : price;
  const text = [
    `Hi ${hi},`,
    "",
    copy.lead,
    soon ?? "",
    "",
    `Pay ${priceLine} here: ${payUrl}`,
    "UPI, cards or netbanking.",
    "",
    `Questions? Reply to this email or WhatsApp us at ${site.whatsappDisplay}.`,
    "",
    `Order ${order.code} · ${site.name}`,
    `You're getting this because you started this order on aavjoo.in. Reply "stop" and we won't email you again.`,
  ]
    .filter((l, i, all) => !(l === "" && all[i - 1] === ""))
    .join("\n");

  const html = `<!doctype html><html><body style="margin:0;background:#f4f1ec;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#141414">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1ec;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:20px;padding:32px 28px">
<tr><td style="font-size:22px;font-weight:700;letter-spacing:-0.02em;color:#7a2a3a">Aavjoo</td></tr>
<tr><td style="padding-top:24px;font-size:16px;line-height:1.55">Hi ${esc(hi)},</td></tr>
<tr><td style="padding-top:12px;font-size:16px;line-height:1.55">${esc(copy.lead)}</td></tr>
${soon ? `<tr><td style="padding-top:12px;font-size:15px;line-height:1.55;color:#7a2a3a;font-weight:600">${esc(soon)}</td></tr>` : ""}
<tr><td style="padding-top:24px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f4ef;border-radius:14px"><tr><td style="padding:16px 18px;font-size:15px;line-height:1.5">
<div style="font-weight:600">${esc(couple)} · ${esc(t?.name ?? "Invitation")}</div>
<div style="color:#555">${s ? `<span style="text-decoration:line-through;color:#999">${formatINR(s.mrp)}</span>&nbsp; ` : ""}<b style="color:#141414">${price}</b>${s ? ` · launch price` : ""}</div>
</td></tr></table></td></tr>
<tr><td align="center" style="padding-top:24px"><a href="${payUrl}" style="display:inline-block;background:#141414;color:#ffffff;text-decoration:none;font-weight:600;font-size:16px;padding:15px 30px;border-radius:999px">Pay ${price} and go live</a></td></tr>
<tr><td align="center" style="padding-top:10px;font-size:13px;color:#777">UPI, cards or netbanking · secure checkout by Razorpay</td></tr>
<tr><td style="padding-top:28px;font-size:14px;line-height:1.55;color:#555">Questions? Just reply to this email, or WhatsApp us at <a href="https://wa.me/${site.whatsapp}" style="color:#141414">${site.whatsappDisplay}</a>.</td></tr>
</table>
<p style="max-width:520px;margin:16px auto 0;font-size:12px;line-height:1.5;color:#888">Order ${esc(order.code)}. You're getting this because you started this order on aavjoo.in. Reply "stop" and we won't email you again.</p>
</td></tr></table></body></html>`;

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

/** Sends every reminder that's due. Run once a day by the cron. */
export async function sendDueReminders({ dryRun = false } = {}) {
  if (!dryRun && !isMailConfigured()) return { sent: 0, failed: 0, due: 0, error: "Email isn't set up." };
  const { data, error } = await db().from("orders").select("*").eq("status", "awaiting_payment").not("customer_email", "is", null).eq("email_opt_out", false);
  if (error) return { sent: 0, failed: 0, due: 0, error: error.message };
  const due = (data as Order[]).filter((o) => reminderDue(o));
  let sent = 0;
  let failed = 0;
  for (const o of due) {
    if (dryRun) continue;
    try {
      const n = o.email_reminders ?? 0;
      await sendMail({ to: o.customer_email!, ...reminderEmail(o, n) });
      // Only counts once Gmail accepted it, so a failure is retried tomorrow.
      await db().from("orders").update({ email_reminders: n + 1, email_reminded_at: new Date().toISOString() }).eq("id", o.id).eq("status", "awaiting_payment");
      sent++;
    } catch (e) {
      console.error("Reminder email failed", o.code, e);
      failed++;
    }
  }
  return { sent, failed, due: due.length, codes: due.map((o) => o.code) };
}
