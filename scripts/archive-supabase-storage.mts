/**
 * Archives every file in Supabase Storage to R2 (backup/supabase-originals/<bucket>/<path>), checks
 * each copy's size, and only then (with --delete) removes the originals from Supabase, so the project
 * stays within the Free plan's 1 GB. Invites never read these: since 2026-11-05 songs and photos
 * are served from R2 (scripts/copy-media-to-r2.mts --check must report 0 missing first).
 *
 *   npx tsx --env-file=.env.local scripts/archive-supabase-storage.mts            # list only
 *   npx tsx --env-file=.env.local scripts/archive-supabase-storage.mts --copy     # copy + verify
 *   npx tsx --env-file=.env.local scripts/archive-supabase-storage.mts --delete   # copy + verify + delete verified
 */
import { createClient } from "@supabase/supabase-js";
import { presignR2, r2FromEnv } from "../src/lib/sigv4";

const r2 = r2FromEnv();
if (!r2) throw new Error("Set the R2 keys first.");
const copy = process.argv.includes("--copy") || process.argv.includes("--delete");
const del = process.argv.includes("--delete");
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });

type F = { bucket: string; path: string; size: number; type: string };
async function walk(bucket: string, prefix = ""): Promise<F[]> {
  const out: F[] = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await db.storage.from(bucket).list(prefix, { limit: 1000, offset });
    if (error) throw error;
    for (const f of data) {
      const path = prefix ? `${prefix}/${f.name}` : f.name;
      if (f.metadata) out.push({ bucket, path, size: f.metadata.size, type: f.metadata.mimetype ?? "application/octet-stream" });
      else out.push(...(await walk(bucket, path)));
    }
    if (data.length < 1000) return out;
  }
}

const key = (f: F) => `backup/supabase-originals/${f.bucket}/${f.path}`;
async function sizeOnR2(k: string) {
  const res = await fetch(presignR2(r2!, "HEAD", k), { method: "HEAD" });
  return res.ok ? Number(res.headers.get("content-length")) : -1;
}

const { data: buckets, error } = await db.storage.listBuckets();
if (error) throw error;
const files: F[] = [];
for (const b of buckets ?? []) files.push(...(await walk(b.name)));
const total = files.reduce((n, f) => n + f.size, 0);
for (const b of buckets ?? []) {
  const fs = files.filter((f) => f.bucket === b.name);
  console.log(`${b.name}: ${fs.length} files, ${(fs.reduce((n, f) => n + f.size, 0) / 1e6).toFixed(1)} MB`);
}
console.log(`total: ${files.length} files, ${(total / 1e6).toFixed(1)} MB`);
if (!copy) process.exit(0);

let copied = 0, already = 0, failed = 0;
const verified: F[] = [];
for (const [i, f] of files.entries()) {
  try {
    if ((await sizeOnR2(key(f))) === f.size) {
      already++;
      verified.push(f);
      continue;
    }
    const { data, error: e } = await db.storage.from(f.bucket).download(f.path);
    if (e) throw e;
    const body = new Uint8Array(await data.arrayBuffer());
    const headers = { "content-type": f.type };
    const put = await fetch(presignR2(r2, "PUT", key(f), { headers }), { method: "PUT", headers, body });
    if (!put.ok) throw new Error(`R2 ${put.status}`);
    if ((await sizeOnR2(key(f))) !== body.length || body.length !== f.size) throw new Error("size mismatch after copy");
    copied++;
    verified.push(f);
  } catch (err) {
    failed++;
    console.log(`FAILED ${f.bucket}/${f.path}: ${(err as Error).message}`);
  }
  if ((i + 1) % 100 === 0) console.log(`  ${i + 1}/${files.length}…`);
}
console.log(`copied ${copied}, already on R2 ${already}, failed ${failed}; verified ${verified.length}/${files.length}`);

if (!del) process.exit(0);
if (failed) {
  console.log("Not deleting anything: some copies failed. Fix those and run again.");
  process.exit(1);
}
let removed = 0;
for (const b of buckets ?? []) {
  const paths = verified.filter((f) => f.bucket === b.name).map((f) => f.path);
  for (let i = 0; i < paths.length; i += 100) {
    const { error: e } = await db.storage.from(b.name).remove(paths.slice(i, i + 100));
    if (e) throw e;
    removed += Math.min(100, paths.length - i);
  }
}
console.log(`removed ${removed} verified originals from Supabase Storage`);
