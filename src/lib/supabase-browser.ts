"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/** Browser client with the public (anon) key. Only used to upload to a signed URL the server issued. */
export function browserSupabase() {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Uploads aren't set up yet.");
  client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}
