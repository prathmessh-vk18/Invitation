import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { mediaUrl } from "@/lib/media";

export const SONGS_BUCKET = "songs";
export const PHOTOS_BUCKET = "photos";
export const MAX_PHOTOS = 8;

export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

let client: SupabaseClient | null = null;

/**
 * Server-only Supabase client using the service-role key. The tables have RLS on with no
 * policies, so this is the only way in. Never import this from a client component.
 */
export function db() {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.");
  }
  client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return client;
}

/** Public addresses of couples' files: Cloudflare R2 once it's switched on, Supabase until then. */
export function photoPublicUrl(path: string) {
  return mediaUrl(PHOTOS_BUCKET, path);
}

export function songPublicUrl(path: string) {
  return mediaUrl(SONGS_BUCKET, path);
}
