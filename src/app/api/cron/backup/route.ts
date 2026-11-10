import { backupDatabase } from "@/lib/db-backup";

/** Vercel Cron calls this nightly (see vercel.json). Signed with CRON_SECRET; anyone else gets a 401. */
export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return new Response("Unauthorized", { status: 401 });
  try {
    return Response.json(await backupDatabase());
  } catch (e) {
    console.error("Database backup failed", e);
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
