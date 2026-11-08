import "server-only";
import nodemailer from "nodemailer";

/**
 * Sends email from our Gmail account (GMAIL_USER, with a Google "app password" in
 * GMAIL_APP_PASSWORD). Gmail allows about 500 emails a day, far more than reminders need.
 */
export const isMailConfigured = () => Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);

let transport: nodemailer.Transporter | null = null;
function mailer() {
  transport ??= nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
  });
  return transport;
}

export async function sendMail(m: { to: string; subject: string; html: string; text: string }) {
  if (!isMailConfigured()) throw new Error("Email isn't set up: add GMAIL_USER and GMAIL_APP_PASSWORD.");
  await mailer().sendMail({ from: `Aavjoo <${process.env.GMAIL_USER}>`, replyTo: process.env.GMAIL_USER, ...m });
}
