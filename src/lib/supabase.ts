import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const SONGS_BUCKET = "songs";

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

export function songPublicUrl(path: string) {
  return db().storage.from(SONGS_BUCKET).getPublicUrl(path).data.publicUrl;
}
