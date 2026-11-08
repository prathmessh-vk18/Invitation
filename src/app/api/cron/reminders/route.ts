import { sendDueReminders } from "@/lib/reminders";

/**
 * Vercel Cron calls this once a day (see vercel.json) to send payment reminder emails.
 * Vercel signs the call with CRON_SECRET; anyone else gets a 401.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return new Response("Unauthorized", { status: 401 });
  return Response.json(await sendDueReminders());
}
