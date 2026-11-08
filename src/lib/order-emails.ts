import "server-only";
import { formatINR, site } from "@/config/site";
import { getTemplate } from "@/data/templates";
import { button, esc, helpLine, layout, link } from "@/lib/email-layout";
import { fmtDate } from "@/lib/format";
import { isMailConfigured, sendMail } from "@/lib/mail";
import type { Order } from "@/lib/orders";
import { db } from "@/lib/supabase";

/**
 * "Your invite is live": sent once, the first time an order's invite is published (straight after
 * an online payment, or when we publish by hand). It carries the invite link to share and the
 * order page, where the couple makes their free edits, so they can always find both again.
 */
export function inviteLiveEmail(order: Order, slug: string) {
  const d = order.details;
  const t = getTemplate(order.template);
  const [a, b] = d.lead === "groom" ? [d.groom.first, d.bride.first] : [d.bride.first, d.groom.first];
  const pair = `${a} & ${b}`;
  const occ = t?.occasion ?? d.occasion ?? "wedding";
  const hi = order.customer_name?.trim().split(/\s+/)[0] || "there";
  const inviteUrl = `${site.url}/i/${slug}`;
  const orderUrl = `${site.url}/order/${order.id}`;
  const share = `https://wa.me/?text=${encodeURIComponent(`You're invited to ${pair}'s ${occ} 💛\n${inviteUrl}`)}`;
  const paid = order.paid_at ? fmtDate(order.paid_at, { day: "numeric", month: "short", year: "numeric" }) : "";

  const body = `
<h1 style="margin:0;font-size:26px;line-height:1.2;letter-spacing:-0.02em;font-weight:800">Your invite is live 🎉</h1>
<p style="margin:12px 0 0;font-size:16px;line-height:1.55;color:#333">Hi ${esc(hi)}, ${esc(pair)}'s invitation is ready to share. Send this link to your guests on WhatsApp: it opens like a card, with every function, map and your music.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px;background:#f7f3ee;border-radius:14px"><tr><td style="padding:14px 16px;font-size:16px;font-weight:700;word-break:break-all"><a href="${inviteUrl}" style="color:#141414;text-decoration:none">${esc(inviteUrl.replace(/^https?:\/\//, ""))}</a></td></tr></table>
<div style="margin-top:18px">${button(share, "Share on WhatsApp")}</div>
<p style="margin:12px 0 0;text-align:center;font-size:15px">${link(inviteUrl, "Open your invite")}</p>
<div style="margin-top:26px;padding-top:20px;border-top:1px solid #eee">
<div style="font-size:16px;font-weight:700">Need to change something?</div>
<p style="margin:6px 0 0;font-size:15px;line-height:1.55;color:#333">A venue moved or a name needs fixing? You have ${site.revisionRounds} free edits. Change it yourself and your invite updates straight away, on the same link, so nobody needs a new one.</p>
<p style="margin:12px 0 0;font-size:15px">${link(`${orderUrl}/edit`, "Edit your invite")} &nbsp;·&nbsp; ${link(orderUrl, "Your order page")}</p>
<p style="margin:10px 0 0;font-size:13px;color:#888">Keep this email: these links are how you get back to your order.</p>
</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:22px;font-size:14px;color:#555">
<tr><td style="padding:3px 0">Order</td><td style="padding:3px 0;text-align:right;color:#141414">${esc(order.code)}</td></tr>
<tr><td style="padding:3px 0">Design</td><td style="padding:3px 0;text-align:right;color:#141414">${esc(t?.name ?? "")}</td></tr>
${order.amount > 1 ? `<tr><td style="padding:3px 0">Paid</td><td style="padding:3px 0;text-align:right;color:#141414">${formatINR(order.amount)}${paid ? ` · ${paid}` : ""}</td></tr>` : ""}
</table>
${helpLine}`;

  const html = layout({
    preheader: `Here's ${pair}'s invite link, ready to share on WhatsApp.`,
    image: { src: `${orderUrl}/card`, href: inviteUrl, alt: `${pair}'s ${occ} invitation` },
    body,
    footer: `Order ${esc(order.code)} · ${esc(site.name)}, wedding invitations that open like a celebration.`,
  });
  const text = [
    `Your invite is live 🎉`,
    "",
    `Hi ${hi}, ${pair}'s invitation is ready to share. Send this link to your guests on WhatsApp:`,
    inviteUrl,
    "",
    `Need to change something? You have ${site.revisionRounds} free edits, and your invite updates on the same link:`,
    `Edit your invite: ${orderUrl}/edit`,
    `Your order page: ${orderUrl}`,
    "",
    `Order ${order.code} · ${t?.name ?? ""}${order.amount > 1 ? ` · paid ${formatINR(order.amount)}` : ""}`,
    `Questions? Reply to this email or WhatsApp us at ${site.whatsappDisplay}.`,
  ].join("\n");
  return { subject: `🎉 ${pair}'s ${occ} invite is live`, html, text };
}

/** Sends the "invite is live" email if the order has an email address. Never throws. */
export async function sendInviteLiveEmail(order: Order, slug: string) {
  const to = order.customer_email?.trim();
  if (!to?.includes("@") || !isMailConfigured()) return;
  const mail = { to, ...inviteLiveEmail(order, slug), idempotencyKey: `invite-live-${order.id}` };
  const log = { order_id: order.id, to_email: to, kind: "invite_live", subject: mail.subject };
  try {
    await sendMail(mail);
    await db().from("email_log").insert({ ...log, status: "sent" });
  } catch (e) {
    console.error("Invite-live email failed", order.code, e);
    await db().from("email_log").insert({ ...log, status: "failed", error: String((e as Error).message ?? e).slice(0, 300) });
  }
}
