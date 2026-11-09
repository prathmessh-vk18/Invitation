import "server-only";
import { formatINR, site } from "@/config/site";
import { getTemplate } from "@/data/templates";
import { button, esc, helpLine, layout, ticks } from "@/lib/email-layout";
import type { Order } from "@/lib/orders";
import { unsubscribeUrl } from "@/lib/mail";

/**
 * The one-time offer of the printable PDF to couples who already have a paid invite. Their own
 * invite card on top, what the PDF is for, and one button to buy it (opens checkout on their
 * order page).
 */
export function pdfOfferEmail(order: Order) {
  const d = order.details;
  const t = getTemplate(order.template);
  const [a, b] = d.lead === "groom" ? [d.groom.first, d.bride.first] : [d.bride.first, d.groom.first];
  const pair = `${a} & ${b}`;
  const hi = order.customer_name?.trim().split(/\s+/)[0] || "there";
  const orderUrl = `${site.url}/order/${order.id}`;
  const buyUrl = `${orderUrl}?pdf=1`;
  const price = formatINR(site.pdfAddon.price);
  const occ = t?.occasion ?? d.occasion ?? "wedding";
  const gets = [
    `The same ${t?.name ?? ""} design as your invite, page by page`,
    "Large, clear text that's easy to read for grandparents and elders",
    "Easy to forward on family WhatsApp groups, or to print",
    "Every function with date, time, venue and a tap-for-directions link",
    "Always matches your latest invite: download it again after any edit",
  ];
  const body = `
<h1 style="margin:0;font-size:25px;line-height:1.2;letter-spacing:-0.02em;font-weight:800">Your invite, for the elders in the family</h1>
<p style="margin:12px 0 0;font-size:16px;line-height:1.55;color:#333">Hi ${esc(hi)}, not everyone opens links. Get ${esc(pair)}'s ${esc(occ)} invite as a beautiful PDF your grandparents and relatives can read easily, forward on family WhatsApp groups, or print.</p>
<div style="margin-top:20px">${ticks(gets)}</div>
<div style="margin-top:22px">${button(buyUrl, `Get the PDF · ${price}`)}</div>
<p style="margin:10px 0 0;text-align:center;font-size:13px;color:#777">One-time ${price} · UPI, cards or netbanking · download instantly</p>
${helpLine}`;
  const html = layout({
    preheader: `${pair}'s invite as a printable PDF with large, clear text. ${price}, one time.`,
    image: { src: `${orderUrl}/card`, href: buyUrl, alt: `${pair}'s ${occ} invitation` },
    body,
    footer: `Order ${esc(order.code)} · You're getting this because you ordered an invite on aavjoo.in. <a href="${unsubscribeUrl(order.id)}" style="color:#8a8178">Don't email me about offers</a>.`,
  });
  const text = [
    "Your invite, for the elders in the family",
    "",
    `Hi ${hi}, not everyone opens links. Get ${pair}'s ${occ} invite as a beautiful PDF your grandparents and relatives can read easily, forward on family WhatsApp groups, or print.`,
    "",
    ...gets.map((g) => `- ${g}`),
    "",
    `Get the PDF (${price}): ${buyUrl}`,
    "",
    `Questions? Reply to this email or WhatsApp us at ${site.whatsappDisplay}.`,
    `Don't want offers? ${unsubscribeUrl(order.id)}`,
  ].join("\n");
  return { subject: `${pair}'s invite as a PDF for the family elders 🙏`, html, text };
}
