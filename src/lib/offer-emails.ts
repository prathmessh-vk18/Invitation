import "server-only";
import { formatINR, site } from "@/config/site";
import { getTemplate } from "@/data/templates";
import { esc } from "@/lib/email-layout";
import type { Order } from "@/lib/orders";
import { unsubscribeUrl } from "@/lib/mail";

/**
 * The one-time offer of the printable PDF to couples who already have a paid invite. Written as a
 * short personal note (no big images, buttons or emoji): marketing-looking emails land in Gmail's
 * Promotions tab, while a plain note from a person reads like the rest of their order emails.
 */
export function pdfOfferEmail(order: Order) {
  const d = order.details;
  const t = getTemplate(order.template);
  const [a, b] = d.lead === "groom" ? [d.groom.first, d.bride.first] : [d.bride.first, d.groom.first];
  const pair = `${a} & ${b}`;
  const hi = order.customer_name?.trim().split(/\s+/)[0] || "there";
  const link = `${site.url}/order/${order.id}?pdf=1`;
  const price = formatINR(site.pdfAddon.price);
  const occ = t?.occasion ?? d.occasion ?? "wedding";
  const design = t?.name ? `the same ${t.name} design` : "the same design";

  const lines = [
    `Hi ${hi},`,
    `Many families tell us their grandparents and older relatives don't open invite links. So we now make a PDF of your invite in ${design}, with large, clear text that's easy for elders to read. It's easy to forward on family WhatsApp groups, and ready to print.`,
    `It costs ${price}, one time, and always matches your latest invite, so any edits you make show up in it too.`,
    `If you'd like one for ${pair}'s ${occ}, you can get it here:`,
  ];
  const html = `<!doctype html><html><body style="margin:0;padding:24px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#222">
<div style="max-width:560px">
${lines.map((l) => `<p style="margin:0 0 14px">${esc(l)}</p>`).join("\n")}
<p style="margin:0 0 18px"><a href="${link}" style="color:#1a5fd0">${esc(link.replace(/^https:\/\//, ""))}</a></p>
<p style="margin:0">Warm wishes,<br>Team ${esc(site.name)}</p>
<p style="margin:28px 0 0;font-size:12px;color:#888">If you'd rather not hear about extras like this, <a href="${unsubscribeUrl(order.id)}" style="color:#888">let us know here</a>.</p>
</div></body></html>`;
  const text = [...lines.flatMap((l) => [l, ""]), link, "", "Warm wishes,", `Team ${site.name}`, "", `Rather not hear about extras like this? ${unsubscribeUrl(order.id)}`].join("\n");
  return { subject: `A PDF of ${pair}'s invite for the elders`, html, text };
}
