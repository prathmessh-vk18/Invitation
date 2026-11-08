import { EMAILS_PAUSED, isMailConfigured } from "@/lib/mail";
import { sendDueReminders } from "@/lib/reminders";

/**
 * Vercel Cron calls this once a day (see vercel.json) to send payment reminder emails.
 * Vercel signs the call with CRON_SECRET; anyone else gets a 401. With ?dry=1 it only reports
 * whether email is set up and how many are due, sending nothing (a safe check after deploys).
 */
// Sending ~30 emails takes well under a minute; this is the most Vercel lets it run.
export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return new Response("Unauthorized", { status: 401 });
  if (new URL(request.url).searchParams.get("dry") === "1") return Response.json({ mailConfigured: isMailConfigured(), paused: EMAILS_PAUSED, ...(await sendDueReminders({ dryRun: true })) });
  return Response.json(await sendDueReminders());
}
