import { browserSupabase } from "@/lib/supabase-browser";
import type { MediaBucket } from "@/lib/media";

// Uploading a couple's photos and song from the browser, shared by the order form and the editor.

// Every upload gets a new random name, and is only ever swapped for a smaller copy of itself
// (scripts/compress-media.mjs), so guests can keep it for a year.
const UPLOAD_CACHE = "31536000";

export type UploadTicket = { path: string; url?: string; headers?: Record<string, string>; token?: string };

/** Sends one file to the link our server issued: Cloudflare R2 when it's on, otherwise Supabase. */
export async function uploadTo(bucket: MediaBucket, ticket: UploadTicket, body: Blob, type: string, onProgress?: (pct: number) => void) {
  if (ticket.url) {
    const url = ticket.url;
    // XHR rather than fetch: it reports progress, so a slow upload on mobile data shows it's moving.
    return new Promise<boolean>((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", url);
      for (const [k, v] of Object.entries(ticket.headers ?? {})) xhr.setRequestHeader(k, v);
      if (onProgress) xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
      xhr.onload = () => resolve(xhr.status >= 200 && xhr.status < 300);
      xhr.onerror = xhr.onabort = xhr.ontimeout = () => resolve(false);
      xhr.send(body);
    });
  }
  const { error } = await browserSupabase().storage.from(bucket).uploadToSignedUrl(ticket.path, ticket.token ?? "", body, { contentType: type, cacheControl: UPLOAD_CACHE });
  return !error;
}

/** Shrinks a phone photo to at most 1600px on its long side, as a JPEG. Falls back to the original. */
export async function shrink(file: File): Promise<Blob> {
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 1280 / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", 0.8));
    return blob ?? file;
  } catch {
    return file;
  }
}

