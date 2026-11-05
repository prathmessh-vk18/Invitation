/**
 * Makes couples' songs and photos smaller in Supabase Storage, so guests download less.
 *
 * Every file stays at the same address, so live invites keep working. A file is only replaced
 * when the new one is clearly smaller. Each file it handles is re-saved with a one-year browser
 * cache, which also marks it as done, so the next run skips it.
 *
 *   node scripts/compress-media.mjs --dry                 # report only, changes nothing
 *   node scripts/compress-media.mjs --backup ../backups   # keep each original before replacing
 *   node scripts/compress-media.mjs --only <path>         # one file, e.g. uploads/abc.mp3
 *
 * Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, and ffmpeg (or FFMPEG=<path>).
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { smallerPhoto, smallerSong } from "./media-shrink.mjs";

const args = process.argv.slice(2);
const dry = args.includes("--dry");
const backup = args.includes("--backup") ? args[args.indexOf("--backup") + 1] : null;
const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : null;

const YEAR = "31536000";
const KEEP_IF_SAVES = 0.15; // replace only when the new file is at least 15% smaller

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

async function list(bucket, prefix) {
  const out = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await db.storage.from(bucket).list(prefix, { limit: 1000, offset });
    if (error) throw error;
    out.push(...data.filter((f) => f.metadata).map((f) => ({ path: `${prefix}/${f.name}`, size: f.metadata.size, type: f.metadata.mimetype, cache: f.metadata.cacheControl ?? "" })));
    if (data.length < 1000) return out;
  }
}

async function handle(bucket, file, shrink) {
  const { data, error } = await db.storage.from(bucket).download(file.path);
  if (error) throw error;
  const original = Buffer.from(await data.arrayBuffer());
  let next = { buf: original, type: file.type };
  try {
    const small = await shrink(original, file.type);
    if (small.buf.length < original.length * (1 - KEEP_IF_SAVES)) next = small;
  } catch (e) {
    console.warn(`  could not shrink ${bucket}/${file.path}: ${e.message.split("\n")[0]}`);
  }
  if (dry) return { before: original.length, after: next.buf.length };
  if (backup && next.buf !== original) {
    const to = join(backup, bucket, file.path);
    await mkdir(dirname(to), { recursive: true });
    await writeFile(to, original);
  }
  const { error: up } = await db.storage.from(bucket).upload(file.path, next.buf, { upsert: true, contentType: next.type, cacheControl: YEAR });
  if (up) throw up;
  return { before: original.length, after: next.buf.length };
}

async function pass(bucket, prefix, shrink) {
  const files = (await list(bucket, prefix)).filter((f) => (only ? f.path === only : !f.cache.includes(YEAR)));
  let before = 0;
  let after = 0;
  let failed = 0;
  for (let i = 0; i < files.length; i += 4) {
    await Promise.all(
      files.slice(i, i + 4).map(async (f) => {
        try {
          const r = await handle(bucket, f, shrink);
          before += r.before;
          after += r.after;
        } catch (e) {
          failed++;
          console.warn(`  failed ${bucket}/${f.path}: ${e.message}`);
        }
      }),
    );
  }
  const mb = (n) => (n / 1e6).toFixed(1);
  console.log(`${bucket}: ${files.length} files, ${mb(before)} MB -> ${mb(after)} MB${failed ? `, ${failed} failed` : ""}${dry ? " (dry run)" : ""}`);
}

await pass("songs", "uploads", smallerSong);
await pass("photos", "moments", smallerPhoto);
