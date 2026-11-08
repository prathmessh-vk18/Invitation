import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { Invite } from "@/data/invites";
import { withMovedMedia } from "@/lib/media";
import { INVITES_BACKUP_KEY } from "@/lib/invites-backup-key";
import { presignR2, r2FromEnv } from "@/lib/sigv4";
import { db, isSupabaseConfigured } from "@/lib/supabase";

export type PublishedInvite = { invite: Invite; liveUntil: string };

type BackupRow = { slug: string; live_until: string; data: Invite };

/**
 * The backup copy of one invite, used only when the database can't be reached, so guests still see
 * the invite instead of a 404 (Supabase blocked the project in Nov 2026 and invites went missing).
 */
async function fromBackup(slug: string): Promise<PublishedInvite | null> {
  const r2 = r2FromEnv();
  if (!r2) return null;
  try {
    const res = await fetch(presignR2(r2, "GET", INVITES_BACKUP_KEY), { cache: "no-store" });
    if (!res.ok) return null;
    const row = ((await res.json()) as BackupRow[]).find((r) => r.slug === slug);
    return row ? { invite: withMovedMedia(row.data), liveUntil: row.live_until } : null;
  } catch {
    return null;
  }
}

/** A published invite by its address. Cached; publishing or unpublishing clears it via `invite:<slug>`. */
export async function getPublishedInvite(slug: string): Promise<PublishedInvite | null> {
  "use cache";
  cacheTag(`invite:${slug}`);
  cacheLife("hours");
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await db().from("invites").select("data, live_until").eq("slug", slug).eq("is_published", true).maybeSingle();
  if (error) {
    // Never cache a 404 because of an outage: no backup copy means throw, so the next visit retries.
    const backup = await fromBackup(slug);
    if (backup) return backup;
    throw new Error(`Invite ${slug}: database unavailable (${error.message})`);
  }
  if (!data) return null;
  return { invite: withMovedMedia(data.data as Invite), liveUntil: data.live_until as string };
}
