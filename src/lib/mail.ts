import "server-only";
import { createHmac } from "node:crypto";
import { Resend } from "resend";
import { site } from "@/config/site";

/**
 * Sends email through Resend from our own domain, mail.aavjoo.in (verified with DKIM and SPF in
 * Cloudflare). Replaced a Gmail account in Nov 2026, whose emails Gmail started flagging as
 * suspicious. Replies go to our Gmail inbox.
 */
export const FROM = "Aavjoo <hello@mail.aavjoo.in>";
export const REPLY_TO = "aavjoo.in@gmail.com";

// While true nothing is sent and nothing is counted (paused 8 Nov 2026 after Gmail rejections).
export const EMAILS_PAUSED = true;

export const isMailConfigured = () => !EMAILS_PAUSED && Boolean(process.env.RESEND_API_KEY);

let client: Resend | null = null;

type Mail = {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** Same key, same email: Resend sends it once even if we retry (one per order and email). */
  idempotencyKey?: string;
  /** For reminders: Gmail's one-click unsubscribe. */
  unsubscribeUrl?: string;
};

/** Sends one email and returns Resend's id. Retries once on a rate limit or a Resend outage. */
export async function sendMail(m: Mail, { force = false } = {}): Promise<string> {
  if (!force && !isMailConfigured()) throw new Error("Email is paused or not set up.");
  if (!process.env.RESEND_API_KEY) throw new Error("Add RESEND_API_KEY.");
  client ??= new Resend(process.env.RESEND_API_KEY);
  const headers = m.unsubscribeUrl
    ? { "List-Unsubscribe": `<${m.unsubscribeUrl}>, <mailto:${REPLY_TO}?subject=stop>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" }
    : undefined;
  const payload = { from: FROM, to: m.to, replyTo: REPLY_TO, subject: m.subject, html: m.html, text: m.text, headers };
  for (let attempt = 0; ; attempt++) {
    const { data, error } = await client.emails.send(payload, m.idempotencyKey ? { idempotencyKey: m.idempotencyKey } : undefined);
    if (data?.id) return data.id;
    const retry = error && (error.name === "rate_limit_exceeded" || error.name === "application_error" || error.name === "internal_server_error");
    if (!retry || attempt >= 1) throw new Error(`${error?.name ?? "error"}: ${error?.message ?? "no id returned"}`);
    await new Promise((r) => setTimeout(r, 1500));
  }
}

/** The signed link that stops reminder emails for one order (and Gmail's one-click unsubscribe). */
export function unsubscribeToken(orderId: string) {
  return createHmac("sha256", process.env.CRON_SECRET ?? "unset").update(`unsubscribe:${orderId}`).digest("hex").slice(0, 24);
}
export const unsubscribeUrl = (orderId: string) => `${site.url}/api/unsubscribe?o=${orderId}&t=${unsubscribeToken(orderId)}`;
