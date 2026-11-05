import "server-only";
import { presignR2, r2FromEnv } from "@/lib/sigv4";

const YEAR = "public, max-age=31536000, immutable";

/**
 * A one-time link the browser uploads one couple file to, straight into Cloudflare R2. It works for
 * ten minutes, for this one path only, and only for a file of exactly this type and size (both
 * are signed), so it can't be reused to store anything else. Null while R2 isn't switched on.
 */
export function r2UploadUrl(bucket: "songs" | "photos", path: string, contentType: string, size: number) {
  const cfg = r2FromEnv();
  // Uploads move only together with reads, or new files would land where guests can't see them.
  if (!cfg || !process.env.NEXT_PUBLIC_MEDIA_URL) return null;
  const headers = { "content-type": contentType, "cache-control": YEAR };
  const url = presignR2(cfg, "PUT", `${bucket}/${path}`, { headers: { ...headers, "content-length": String(size) } });
  return { url, headers };
}
