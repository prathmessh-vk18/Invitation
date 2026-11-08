/**
 * Saves every published invite to R2 (private, signed reads only). The invite page falls back to
 * this copy when the database can't be reached. The site refreshes it on its own after every
 * publish or edit; run this by hand only to check it or after editing invites in the database.
 *   npx tsx scripts/backup-invites.mts
 */
import { createClient } from "@supabase/supabase-js";
import { INVITES_BACKUP_KEY, saveInvitesBackup } from "../src/lib/invites-backup-key";

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
const n = await saveInvitesBackup(db);
console.log(n ? `Backed up ${n} published invites to R2 ${INVITES_BACKUP_KEY}.` : "R2 isn't set up; nothing saved.");
