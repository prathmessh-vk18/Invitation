import "server-only";
import { gzipSync } from "node:zlib";
import { db } from "@/lib/supabase";
import { presignR2, r2FromEnv } from "@/lib/sigv4";
import { saveInvitesBackup } from "@/lib/invites-backup-key";

/**
 * A nightly copy of every business table (orders, payments, edits, invites, partners, leads,
 * emails) to private R2, on top of Supabase's own backups. Kept as one file per weekday (the last
 * 7 nights) plus one per month, so nothing needs deleting. The /backup/ folder is blocked from the
 * public media address by a Cloudflare rule; files are read only with a signed link.
 */
const TABLES = ["orders", "invites", "change_requests", "order_edits", "edit_packs", "addon_purchases", "partners", "partner_payouts", "leads", "email_log"];
const PAGE = 1000;

async function allRows(table: string) {
  const rows: unknown[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await db().from(table).select("*").range(from, from + PAGE - 1);
    if (error) throw new Error(`${table}: ${error.message}`);
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE) return rows;
  }
}

export async function backupDatabase(now = new Date()) {
  const r2 = r2FromEnv();
  if (!r2) throw new Error("R2 isn't configured");
  const tables: Record<string, unknown[]> = {};
  const counts: Record<string, number> = {};
  for (const t of TABLES) {
    tables[t] = await allRows(t);
    counts[t] = tables[t].length;
  }
  // Never overwrite a good copy with an empty one (a database outage returns nothing).
  if (!counts.orders) throw new Error("No orders returned; backup skipped");
  const body = gzipSync(JSON.stringify({ at: now.toISOString(), tables }));
  const headers = { "content-type": "application/gzip", "content-length": String(body.length) };
  const day = now.toLocaleDateString("en-GB", { weekday: "short", timeZone: "Asia/Kolkata" }).toLowerCase();
  const month = now.toLocaleDateString("en-CA", { year: "numeric", month: "2-digit", timeZone: "Asia/Kolkata" }).slice(0, 7);
  for (const key of [`backup/db/day-${day}.json.gz`, `backup/db/month-${month}.json.gz`]) {
    const res = await fetch(presignR2(r2, "PUT", key, { headers }), { method: "PUT", headers, body });
    if (!res.ok) throw new Error(`R2 said ${res.status} for ${key}`);
  }
  // The invites fallback refreshes after every publish; this is a nightly safety net for it too.
  const invites = await saveInvitesBackup(db()).catch(() => 0);
  return { counts, bytes: body.length, day, month, invites };
}
