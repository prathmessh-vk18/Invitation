import "server-only";
import { diffDetails, type Change } from "@/lib/change-requests";
import type { InviteDetails, Order } from "@/lib/orders";
import { db } from "@/lib/supabase";

export type EditSource = "couple" | "admin" | "approved" | "by hand";
export type OrderEdit = { id: string; order_id: string; created_at: string; source: EditSource; request_id: string | null; changes: Change[] };

const FORM_PERSON = new Set(["first", "full", "parents"]);
const show = (v: unknown) => (v === undefined || v === null || v === "" ? "—" : typeof v === "string" ? v : JSON.stringify(v)).slice(0, 300);

/**
 * Everything that differs between two versions of an order: the form's fields in plain words,
 * plus the settings we add by hand (a seal, "Dr." on the cover…), song and photos.
 */
export function orderChanges(
  a: Pick<Order, "details" | "song_path" | "photo_paths">,
  b: Pick<Order, "details" | "song_path" | "photo_paths">,
): Change[] {
  const out = diffDetails(a.details, b.details);
  const known = new Set(["bride", "groom", "lead", "invocation", "invocationMeaning", "hosts", "message", "date", "city", "hashtag", "events", "rsvp", "closing", "music", "hide", "font"]);
  const x = a.details as unknown as Record<string, unknown>;
  const y = b.details as unknown as Record<string, unknown>;
  for (const k of new Set([...Object.keys(x), ...Object.keys(y)])) {
    if (known.has(k) || JSON.stringify(x[k]) === JSON.stringify(y[k])) continue;
    out.push({ label: `Custom setting: ${k}`, before: show(x[k]), after: show(y[k]) });
  }
  for (const who of ["bride", "groom"] as const) {
    const p = (a.details[who] ?? {}) as unknown as Record<string, unknown>;
    const q = (b.details[who] ?? {}) as unknown as Record<string, unknown>;
    for (const k of new Set([...Object.keys(p), ...Object.keys(q)])) {
      if (FORM_PERSON.has(k) || JSON.stringify(p[k]) === JSON.stringify(q[k])) continue;
      out.push({ label: `${who === "bride" ? "Bride" : "Groom"}: ${k}`, before: show(p[k]), after: show(q[k]) });
    }
  }
  if ((a.song_path ?? null) !== (b.song_path ?? null)) out.push({ label: "Song", before: a.song_path ? "Their upload" : "Our track", after: b.song_path ? "New upload" : "Our track" });
  if ((a.photo_paths ?? []).join() !== (b.photo_paths ?? []).join()) out.push({ label: "Photos", before: `${(a.photo_paths ?? []).length} photos`, after: `${(b.photo_paths ?? []).length} photos` });
  return out;
}

/** Records a change to an order. Never fails the save it belongs to (e.g. before the table exists). */
export async function logOrderEdit(
  orderId: string,
  before: Pick<Order, "details" | "song_path" | "photo_paths">,
  after: { details: InviteDetails; song_path?: string | null; photo_paths?: string[] | null },
  source: EditSource,
  requestId?: string,
) {
  const changes = orderChanges(before, { song_path: before.song_path, photo_paths: before.photo_paths, ...after });
  if (!changes.length) return;
  try {
    await db().from("order_edits").insert({ order_id: orderId, source, request_id: requestId ?? null, changes });
  } catch (e) {
    console.error("Logging an order edit failed", e);
  }
}

/** An order's history, newest first. Empty if the table isn't set up yet. */
export async function orderHistory(orderId: string, since?: string): Promise<OrderEdit[]> {
  let q = db().from("order_edits").select("*").eq("order_id", orderId).order("created_at", { ascending: false }).limit(100);
  if (since) q = q.gt("created_at", since);
  const { data, error } = await q;
  return error ? [] : ((data ?? []) as OrderEdit[]);
}
