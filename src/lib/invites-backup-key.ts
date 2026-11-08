import type { SupabaseClient } from "@supabase/supabase-js";
import { presignR2, r2FromEnv } from "@/lib/sigv4";

/** Where the backup of every published invite lives on R2 (private: read with a signed link only). */
export const INVITES_BACKUP_KEY = "backup/invites-published.json";

/**
 * Saves every published invite to R2, so invites still open if the database is ever unreachable.
 * Runs after each publish, edit, unpublish or cancel, and from scripts/backup-invites.mts.
 * A failed read never overwrites the backup with nothing.
 */
export async function saveInvitesBackup(db: SupabaseClient): Promise<number> {
  const r2 = r2FromEnv();
  if (!r2) return 0;
  const { data, error } = await db.from("invites").select("slug, live_until, data").eq("is_published", true);
  if (error || !data?.length) throw new Error(`Invite backup skipped: ${error?.message ?? "no published invites returned"}`);
  const body = Buffer.from(JSON.stringify(data));
  const headers = { "content-type": "application/json", "content-length": String(body.length) };
  const res = await fetch(presignR2(r2, "PUT", INVITES_BACKUP_KEY, { headers }), { method: "PUT", headers, body });
  if (!res.ok) throw new Error(`Invite backup: R2 said ${res.status}`);
  return data.length;
}
