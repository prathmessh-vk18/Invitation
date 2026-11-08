/**
 * Saves every published invite to R2 (private, signed reads only). The invite page falls back to
 * this copy when the database can't be reached, so guests never see a 404 during a database outage.
 * Run after publishing or editing invites:  npx tsx scripts/backup-invites.mts
 */
import { createClient } from "@supabase/supabase-js";
import { INVITES_BACKUP_KEY } from "../src/lib/invites-backup-key";
import { presignR2, r2FromEnv } from "../src/lib/sigv4";

const r2 = r2FromEnv();
if (!r2) throw new Error("Set the R2_* keys first.");
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
const { data, error } = await db.from("invites").select("slug, live_until, data").eq("is_published", true);
if (error) throw error;
const body = Buffer.from(JSON.stringify(data));
const headers = { "content-type": "application/json", "content-length": String(body.length) };
const res = await fetch(presignR2(r2, "PUT", INVITES_BACKUP_KEY, { headers }), { method: "PUT", headers, body });
if (!res.ok) throw new Error(`R2 said ${res.status}: ${await res.text()}`);
console.log(`Backed up ${data.length} published invites (${(body.length / 1024).toFixed(0)} KB) to R2 ${INVITES_BACKUP_KEY}.`);
