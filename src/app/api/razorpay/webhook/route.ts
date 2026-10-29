import { isValidWebhookSignature, markPaidByRazorpayOrder } from "@/lib/razorpay";

/**
 * Razorpay calls this when a payment is captured, so an order is marked paid even if the couple
 * closed the page before Checkout reported back. Point the webhook at /api/razorpay/webhook with
 * the "payment.captured" and "order.paid" events and RAZORPAY_WEBHOOK_SECRET as its secret.
 */
export async function POST(request: Request) {
  const raw = await request.text();
  if (!isValidWebhookSignature(raw, request.headers.get("x-razorpay-signature") ?? "")) {
    return new Response("Invalid signature", { status: 400 });
  }
  const event = JSON.parse(raw) as { event?: string; payload?: { payment?: { entity?: { id?: string; order_id?: string; status?: string } } } };
  const payment = event.payload?.payment?.entity;
  if ((event.event === "payment.captured" || event.event === "order.paid") && payment?.order_id && payment.id) {
    await markPaidByRazorpayOrder(payment.order_id, payment.id);
  }
  // Always 200 for a signed request, so Razorpay doesn't keep retrying events we don't act on.
  return Response.json({ ok: true });
}
