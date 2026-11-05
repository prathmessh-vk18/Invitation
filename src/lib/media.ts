import type { Invite } from "@/data/invites";

/**
 * Where couples' songs and photos are served from.
 *
 * With NEXT_PUBLIC_MEDIA_URL set (e.g. https://media.aavjoo.in, our Cloudflare R2 bucket) every
 * song and photo comes from there; without it they come from Supabase Storage as before. The
 * stored paths are the same in both places (`songs/uploads/…`, `photos/moments/…`), so switching
 * is one setting and switching back is removing it.
 */
export type MediaBucket = "songs" | "photos";

const SUPABASE_PUBLIC = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/`;
const MEDIA = process.env.NEXT_PUBLIC_MEDIA_URL?.replace(/\/+$/, "") || "";

export function mediaUrl(bucket: MediaBucket, path: string) {
  return MEDIA ? `${MEDIA}/${bucket}/${path}` : `${SUPABASE_PUBLIC}${bucket}/${path}`;
}

/** Published invites saved before the move still hold Supabase addresses; point them at the new home. */
export function movedMediaUrl<T extends string | undefined>(url: T): T {
  if (!MEDIA || !url || !url.startsWith(SUPABASE_PUBLIC)) return url;
  return `${MEDIA}/${url.slice(SUPABASE_PUBLIC.length)}` as T;
}

export function withMovedMedia(invite: Invite): Invite {
  if (!MEDIA) return invite;
  // Every stored file link, wherever it sits (song, gallery, memorial photo, anything added later).
  const move = (v: unknown): unknown =>
    typeof v === "string" ? movedMediaUrl(v) : Array.isArray(v) ? v.map(move) : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, move(x)])) : v;
  return move(invite) as Invite;
}
