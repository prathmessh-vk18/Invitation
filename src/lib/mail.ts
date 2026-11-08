import "server-only";
import nodemailer from "nodemailer";

/**
 * Sends email from our Gmail account (GMAIL_USER, with a Google "app password" in
 * GMAIL_APP_PASSWORD). Gmail allows about 500 emails a day, far more than reminders need.
 */
// Paused 8 Nov 2026: Gmail started rejecting our emails as "suspicious" (a new Gmail account sending
// many emails full of links to another site looks like phishing). Off until we send from our own
// domain (aavjoo.in) with proper sender records. Nothing is sent and nothing is counted while off.
export const EMAILS_PAUSED = true;

export const isMailConfigured = () => !EMAILS_PAUSED && Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);

type Port = 465 | 587;
const PORT: Port = process.env.GMAIL_SMTP_PORT === "587" ? 587 : 465;

function transportFor(port: Port) {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port,
    // 465 is TLS from the start; 587 upgrades to TLS after connecting.
    secure: port === 465,
    // One login reused for a whole batch (and at most 2 at once), instead of reconnecting per email.
    pool: true,
    maxConnections: 2,
    // Fail in seconds rather than hanging until the server's time limit.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
    // Google shows app passwords in groups of four; the spaces are not part of it.
    auth: { user: process.env.GMAIL_USER?.trim(), pass: process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, "") },
  });
}

let transport: nodemailer.Transporter | null = null;

export async function sendMail(m: { to: string; subject: string; html: string; text: string }) {
  if (!isMailConfigured()) throw new Error("Email isn't set up: add GMAIL_USER and GMAIL_APP_PASSWORD.");
  transport ??= transportFor(PORT);
  await transport.sendMail({ from: `Aavjoo <${process.env.GMAIL_USER}>`, replyTo: process.env.GMAIL_USER, ...m });
}

/** Closes the pooled connection, so a serverless function can finish as soon as its batch is sent. */
export function closeMail() {
  transport?.close();
  transport = null;
}

/** Can this server log in to Gmail on each port? For diagnosing from the live server. */
export async function checkMail() {
  const out: Record<string, string> = {};
  for (const port of [465, 587] as Port[]) {
    const t = transportFor(port);
    const start = Date.now();
    try {
      await t.verify();
      out[port] = `ok in ${Date.now() - start} ms`;
    } catch (e) {
      out[port] = `failed in ${Date.now() - start} ms: ${(e as Error).message}`;
    } finally {
      t.close();
    }
  }
  return out;
}
