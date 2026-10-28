import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { db } from "@/lib/supabase";

/**
 * Razorpay over its REST API (no SDK). Keys live in env: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET and
 * RAZORPAY_WEBHOOK_SECRET. Test keys start with rzp_test_, live keys with rzp_live_.
 */

export const isRazorpayConfigured = () => Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
export const razorpayKeyId = () => process.env.RAZORPAY_KEY_ID ?? "";

function auth() {
  return "Basic " + Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
}

/** A Razorpay order for `amount` rupees. Razorpay works in paise. */
export async function createRazorpayOrder(amount: number, receipt: string, notes: Record<string, string>) {
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { Authorization: auth(), "Content-Type": "application/json" },
    body: JSON.stringify({ amount: Math.round(amount * 100), currency: "INR", receipt, notes }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Razorpay order failed (${res.status})`);
  return (await res.json()) as { id: string; amount: number; currency: string; status: string };
}

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** The signature Checkout returns after a payment: HMAC-SHA256 of "order_id|payment_id" with the key secret. */
export function isValidPaymentSignature(razorpayOrderId: string, paymentId: string, signature: string) {
  const expected = createHmac("sha256", process.env.RAZORPAY_KEY_SECRET ?? "").update(`${razorpayOrderId}|${paymentId}`).digest("hex");
  return safeEqual(expected, signature);
}

/** The X-Razorpay-Signature header on a webhook: HMAC-SHA256 of the raw body with the webhook secret. */
export function isValidWebhookSignature(rawBody: string, signature: string) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  return safeEqual(createHmac("sha256", secret).update(rawBody).digest("hex"), signature);
}

/**
 * Marks the order paid through `razorpayOrderId`. Safe to call twice (Checkout and the webhook
 * both do): only an order still waiting for payment changes. Returns whether this call changed it.
 */
export async function markPaidByRazorpayOrder(razorpayOrderId: string, paymentId: string) {
  const { data } = await db()
    .from("orders")
    .update({ status: "paid", paid_at: new Date().toISOString(), razorpay_payment_id: paymentId })
    .eq("razorpay_order_id", razorpayOrderId)
    .in("status", ["awaiting_payment", "payment_submitted"])
    .select("id")
    .maybeSingle();
  return Boolean(data);
}
