/**
 * Emails the printable-PDF offer to couples with a paid invite, once each.
 *   npx tsx --conditions=react-server scripts/send-pdf-offer.mts            # list who'd get it (sends nothing)
 *   npx tsx --conditions=react-server scripts/send-pdf-offer.mts --test me@x # one test copy to that address
 *   npx tsx --conditions=react-server scripts/send-pdf-offer.mts --send     # send the next batch (up to 80)
 * Skips: anyone who already has the PDF, asked us to stop, already got this offer, or whose
 * wedding has passed; one email per address. Resend's free plan allows 100 emails a day, so a
 * batch of 80 leaves room for the day's reminders: run --send once a day until nobody's left.
 */
import { db } from "../src/lib/supabase";
import { sendMail } from "../src/lib/mail";
import { pdfOfferEmail } from "../src/lib/offer-emails";
import type { Order } from "../src/lib/orders";

const BATCH = 80;
const mode = process.argv.includes("--send") ? "send" : process.argv.includes("--test") ? "test" : "list";

const { data } = await db().from("orders").select("*").in("status", ["paid", "live"]).not("customer_email", "is", null);
const { data: sentRows } = await db().from("email_log").select("order_id, to_email").eq("kind", "pdf_offer").eq("status", "sent");
const sentOrders = new Set((sentRows ?? []).map((r) => r.order_id));
const sentTo = new Set((sentRows ?? []).map((r) => r.to_email.toLowerCase()));
const seen = new Set<string>();
const due = (data as Order[])
  .sort((x, y) => y.created_at.localeCompare(x.created_at))
  .filter((o) => {
    const email = o.customer_email!.trim().toLowerCase();
    const ok =
      email.includes("@") && !o.email_opt_out && !(o.addons ?? []).includes("pdf") && !sentOrders.has(o.id) && !sentTo.has(email) &&
      new Date(o.details.date).getTime() > Date.now() && !/test/i.test(o.customer_name ?? "") && !seen.has(email);
    if (ok) seen.add(email);
    return ok;
  });
console.log(`${due.length} couples to email in total.`);

if (mode === "list") {
  for (const o of due.slice(0, BATCH)) console.log(" ", o.code, "·", o.details.groom.first, "&", o.details.bride.first, "·", o.template, "· wedding", String(o.details.date).slice(0, 10));
  console.log(`First batch: ${Math.min(BATCH, due.length)}. Nothing sent.`);
} else if (mode === "test") {
  const to = process.argv[process.argv.indexOf("--test") + 1];
  const m = pdfOfferEmail(due[0]);
  const id = await sendMail({ to, ...m, subject: `[TEST] ${m.subject}`, idempotencyKey: `pdf-offer-test-${Date.now()}` }, { force: true });
  console.log("test sent to", to, "for", due[0].code, id);
} else {
  let sent = 0, failed = 0;
  for (const o of due.slice(0, BATCH)) {
    const to = o.customer_email!.trim();
    const m = pdfOfferEmail(o);
    const log = { order_id: o.id, to_email: to, kind: "pdf_offer", subject: m.subject };
    try {
      await sendMail({ to, ...m, idempotencyKey: `pdf-offer-${o.id}`, unsubscribeUrl: undefined });
      await db().from("email_log").insert({ ...log, status: "sent" });
      sent++;
      await new Promise((r) => setTimeout(r, 700));
    } catch (e) {
      await db().from("email_log").insert({ ...log, status: "failed", error: String((e as Error).message).slice(0, 300) });
      failed++;
    }
  }
  console.log(`Sent ${sent}, failed ${failed}. ${Math.max(0, due.length - sent)} left for the next batch.`);
}
