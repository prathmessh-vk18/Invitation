/**
 * Copies couples' songs and photos from Supabase Storage to Cloudflare R2, making each one smaller
 * on the way (96 kbps songs, 1280 px photos). Supabase keeps its originals untouched, as a backup.
 *
 * Safe to run again and again: files already on R2 are skipped, so a second run only picks up
 * what was uploaded since. Run it once before switching on R2 and once straight after.
 *
 *   npx tsx scripts/copy-media-to-r2.mts            # copy everything not on R2 yet
 *   npx tsx scripts/copy-media-to-r2.mts --check    # list order/invite files missing on R2; copies nothing
 *
 * Needs .env.local loaded (Supabase keys and R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,
 * R2_BUCKET) and ffmpeg (or FFMPEG=<path>).
 */
import { createClient } from "@supabase/supabase-js";
import { presignR2, r2FromEnv } from "../src/lib/sigv4";
import { smallerPhoto, smallerSong } from "./media-shrink.mjs";

type Shrunk = { buf: Buffer; type: string };
type Item = { bucket: "songs" | "photos"; path: string; type: string; size: number };

const cfg = r2FromEnv();
if (!cfg) throw new Error("Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY and R2_BUCKET first.");
const r2 = cfg;
const check = process.argv.includes("--check");
const YEAR = "public, max-age=31536000, immutable";
const KEEP_IF_SAVES = 0.15;
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });

async function onR2(key: string) {
  const res = await fetch(presignR2(r2, "HEAD", key), { method: "HEAD" });
  if (res.status === 404) return false;
  if (!res.ok) throw new Error(`R2 said ${res.status} for ${key}. Check the R2 keys.`);
  return true;
}

async function list(bucket: Item["bucket"], prefix = ""): Promise<Item[]> {
  const out: Item[] = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await db.storage.from(bucket).list(prefix, { limit: 1000, offset });
    if (error) throw error;
    for (const f of data) {
      const path = prefix ? `${prefix}/${f.name}` : f.name;
      if (f.metadata) out.push({ bucket, path, type: f.metadata.mimetype, size: f.metadata.size });
      else out.push(...(await list(bucket, path)));
    }
    if (data.length < 1000) return out;
  }
}

async function copy(item: Item) {
  const key = `${item.bucket}/${item.path}`;
  if (await onR2(key)) return { skipped: true, before: 0, after: 0 };
  const { data, error } = await db.storage.from(item.bucket).download(item.path);
  if (error) throw error;
  const original = Buffer.from(await data.arrayBuffer());
  let next: Shrunk = { buf: original, type: item.type };
  try {
    const small: Shrunk = item.bucket === "songs" ? await smallerSong(original, item.type) : await smallerPhoto(original);
    if (small.buf.length < original.length * (1 - KEEP_IF_SAVES)) next = small;
  } catch (e) {
    console.warn(`  kept original size for ${key}: ${(e as Error).message.split("\n")[0]}`);
  }
  const headers = { "content-type": next.type, "cache-control": YEAR };
  const res = await fetch(presignR2(r2, "PUT", key, { headers }), { method: "PUT", headers, body: new Uint8Array(next.buf) });
  if (!res.ok) throw new Error(`upload failed (${res.status}): ${await res.text()}`);
  return { skipped: false, before: original.length, after: next.buf.length };
}

async function checkReferenced() {
  const { data: orders } = await db.from("orders").select("code, song_path, photo_paths");
  const { data: invites } = await db.from("invites").select("slug, data");
  const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/`;
  const keys = new Map<string, string>();
  for (const o of orders ?? []) {
    if (o.song_path) keys.set(`songs/${o.song_path}`, o.code);
    for (const p of o.photo_paths ?? []) keys.set(`photos/${p}`, o.code);
  }
  for (const i of invites ?? []) {
    for (const u of [i.data?.music, ...(i.data?.gallery ?? [])]) if (typeof u === "string" && u.startsWith(base)) keys.set(u.slice(base.length), i.slug);
  }
  let missing = 0;
  const all = [...keys];
  for (let i = 0; i < all.length; i += 16) {
    await Promise.all(
      all.slice(i, i + 16).map(async ([key, who]) => {
        if (!(await onR2(key))) {
          missing++;
          console.log(`  missing on R2: ${key} (${who})`);
        }
      }),
    );
  }
  console.log(`${all.length} files used by orders and invites, ${missing} missing on R2.`);
  if (missing) process.exitCode = 1;
}

if (check) {
  await checkReferenced();
} else {
  const items = [...(await list("songs")), ...(await list("photos"))];
  const totals = { copied: 0, skipped: 0, failed: 0, before: 0, after: 0 };
  for (let i = 0; i < items.length; i += 4) {
    await Promise.all(
      items.slice(i, i + 4).map(async (item) => {
        try {
          const r = await copy(item);
          if (r.skipped) totals.skipped++;
          else totals.copied++;
          totals.before += r.before;
          totals.after += r.after;
        } catch (e) {
          totals.failed++;
          console.warn(`  failed ${item.bucket}/${item.path}: ${(e as Error).message}`);
        }
      }),
    );
    if (i % 100 === 0) console.log(`  ${Math.min(i + 4, items.length)} / ${items.length}`);
  }
  const mb = (n: number) => (n / 1e6).toFixed(1);
  console.log(`Copied ${totals.copied}, already there ${totals.skipped}, failed ${totals.failed}. ${mb(totals.before)} MB became ${mb(totals.after)} MB.`);
  if (totals.failed) process.exitCode = 1;
}
