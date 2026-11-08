import { site } from "@/config/site";

/**
 * The look shared by every email we send: a white card on warm paper, the couple's own invite card
 * at the top, one big button. Inline styles and tables only, because that is what Gmail, Outlook
 * and phone mail apps all render the same way.
 */
export const esc = (s: string) => s.replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]!);

const BRAND = "#7a2a3a";

export function button(href: string, label: string) {
  return `<a href="${href}" style="display:block;background:#141414;color:#ffffff;text-decoration:none;font-weight:700;font-size:17px;line-height:1.2;padding:17px 24px;border-radius:999px;text-align:center">${esc(label)}</a>`;
}

export function link(href: string, label: string) {
  return `<a href="${href}" style="color:#141414;font-weight:600;text-decoration:underline">${esc(label)}</a>`;
}

/** A list with green ticks. */
export function ticks(items: string[]) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%">${items
    .map(
      (i) =>
        `<tr><td style="width:26px;vertical-align:top;padding:5px 0;color:#1d6b35;font-weight:700;font-size:16px">✓</td><td style="padding:5px 0;font-size:15px;line-height:1.45;color:#333">${esc(i)}</td></tr>`,
    )
    .join("")}</table>`;
}

export function layout(o: { preheader: string; image?: { src: string; href: string; alt: string }; body: string; footer: string }) {
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"></head>
<body style="margin:0;background:#f4efe8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#141414">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(o.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4efe8;padding:20px 10px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:22px;overflow:hidden">
<tr><td style="padding:22px 26px 14px;font-size:21px;font-weight:800;letter-spacing:-0.02em;color:${BRAND}">${esc(site.name)}</td></tr>
${o.image ? `<tr><td style="padding:0 14px"><a href="${o.image.href}"><img src="${o.image.src}" width="532" alt="${esc(o.image.alt)}" style="display:block;width:100%;max-width:532px;height:auto;border-radius:14px;border:0"></a></td></tr>` : ""}
<tr><td style="padding:22px 26px 28px">${o.body}</td></tr>
</table>
<p style="max-width:560px;margin:16px auto 0;font-size:12px;line-height:1.55;color:#8a8178;text-align:center">${o.footer}</p>
</td></tr></table></body></html>`;
}

/** "Questions? Reply or WhatsApp us" line. */
export const helpLine = `<p style="margin:22px 0 0;font-size:14px;line-height:1.55;color:#666">Questions? Just reply to this email, or WhatsApp us at <a href="https://wa.me/${site.whatsapp}" style="color:#141414">${site.whatsappDisplay}</a>.</p>`;
