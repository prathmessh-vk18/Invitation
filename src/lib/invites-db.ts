import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { Invite } from "@/data/invites";
import { db, isSupabaseConfigured } from "@/lib/supabase";

export type PublishedInvite = { invite: Invite; liveUntil: string };

/** A published invite by its address. Cached; publishing or unpublishing clears it via `invite:<slug>`. */
export async function getPublishedInvite(slug: string): Promise<PublishedInvite | null> {
  "use cache";
  cacheTag(`invite:${slug}`);
  cacheLife("hours");
  if (!isSupabaseConfigured()) return null;
  const { data } = await db().from("invites").select("data, live_until").eq("slug", slug).eq("is_published", true).maybeSingle();
  if (!data) return null;
  return { invite: data.data as Invite, liveUntil: data.live_until as string };
}
