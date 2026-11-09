import { timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { site } from "@/config/site";
import { unsubscribeToken } from "@/lib/mail";
import { db } from "@/lib/supabase";

/**
 * Stops payment reminder emails for one order. Gmail's "Unsubscribe" button POSTs here (one
 * click); the link in the email footer opens it with GET. Signed per order, so nobody can stop
 * someone else's emails.
 */
async function stop(url: URL) {
  const id = url.searchParams.get("o") ?? "";
  const token = url.searchParams.get("t") ?? "";
  const want = unsubscribeToken(id);
  if (!/^[0-9a-f-]{36}$/.test(id) || token.length !== want.length || !timingSafeEqual(Buffer.from(token), Buffer.from(want))) return false;
  await db().from("orders").update({ email_opt_out: true }).eq("id", id);
  revalidatePath(`/admin/orders/${id}`);
  return true;
}

export async function POST(request: Request) {
  return (await stop(new URL(request.url))) ? new Response("Unsubscribed") : new Response("Invalid link", { status: 400 });
}

export async function GET(request: Request) {
  const ok = await stop(new URL(request.url));
  const msg = ok ? "You won't get any more reminder emails about this order." : "This link isn't valid.";
  const html = `<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><title>${site.name}</title><body style="margin:0;display:grid;place-items:center;min-height:100vh;background:#f4efe8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#141414"><div style="max-width:420px;padding:32px;background:#fff;border-radius:20px;text-align:center"><p style="margin:0;font-size:20px;font-weight:700;color:#7a2a3a">${site.name}</p><p style="margin:16px 0 0;font-size:17px;line-height:1.5">${msg}</p><p style="margin:16px 0 0;font-size:14px;color:#666">Changed your mind or have a question? Reply to any of our emails.</p></div></body>`;
  return new Response(html, { status: ok ? 200 : 400, headers: { "Content-Type": "text/html; charset=utf-8" } });
}
