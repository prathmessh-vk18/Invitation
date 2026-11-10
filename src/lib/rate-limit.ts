import "server-only";
import { createHmac } from "node:crypto";
import { headers } from "next/headers";
import { db, isSupabaseConfigured } from "@/lib/supabase";

/**
 * Limits how often one visitor can use a public form (orders, uploads, order lookup, chat) or try
 * the admin password, so a bot can't flood the database or storage. Visitors are told apart by a
 * keyed hash of their IP address. If the limits table is missing or the database errors, the limit
 * is skipped rather than turning real couples away.
 */
export const TOO_MANY = "Too many tries in a short time. Please wait a few minutes and try again, or message us on WhatsApp.";

async function visitor() {
  const h = await headers();
  const ip = h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  return createHmac("sha256", process.env.ADMIN_SESSION_SECRET ?? "aavjoo-rate").update(ip).digest("hex").slice(0, 32);
}

const since = (windowMin: number) => new Date(Date.now() - windowMin * 60_000).toISOString();

/** How many times this visitor hit `bucket` in the last `windowMin` minutes (0 when unknown). */
export async function recentHits(bucket: string, windowMin: number): Promise<number> {
  if (!isSupabaseConfigured()) return 0;
  const { count, error } = await db().from("rate_hits").select("id", { count: "exact", head: true }).eq("bucket", bucket).eq("key", await visitor()).gte("at", since(windowMin));
  return error ? 0 : (count ?? 0);
}

/** Notes one hit for this visitor, and now and then clears hits older than two days. */
export async function recordHit(bucket: string) {
  if (!isSupabaseConfigured()) return;
  await db().from("rate_hits").insert({ bucket, key: await visitor() });
  if (Math.random() < 0.02) await db().from("rate_hits").delete().lt("at", since(2 * 24 * 60));
}

/** True when this visitor already used `bucket` `max` times in `windowMin` minutes; otherwise counts this use. */
export async function overLimit(bucket: string, max: number, windowMin: number): Promise<boolean> {
  if ((await recentHits(bucket, windowMin)) >= max) return true;
  await recordHit(bucket);
  return false;
}
