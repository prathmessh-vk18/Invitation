import { createHash, createHmac } from "node:crypto";

/**
 * A presigned S3 request for Cloudflare R2 (AWS Signature V4, query-string form).
 *
 * Every header passed in `headers` is signed, so the request must send exactly those values. We
 * sign content-type and content-length on uploads: R2 then rejects a file of another type or size
 * than the one our server checked. Used by the server (upload links) and by scripts (the copy).
 */
export type R2Config = { accountId: string; accessKeyId: string; secretAccessKey: string; bucket: string };

const enc = (s: string) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
const sha256 = (s: string | Buffer) => createHash("sha256").update(s).digest("hex");
const hmac = (key: string | Buffer, s: string) => createHmac("sha256", key).update(s).digest();

type Method = "GET" | "PUT" | "HEAD" | "DELETE";
type Options = { headers?: Record<string, string>; expires?: number; now?: Date };

export function presignR2(cfg: R2Config, method: Method, key: string, opts: Options = {}) {
  const host = `${cfg.accountId}.r2.cloudflarestorage.com`;
  const path = `/${cfg.bucket}/${key.split("/").map(enc).join("/")}`;
  return presignS3({ host, path, region: "auto", accessKeyId: cfg.accessKeyId, secretAccessKey: cfg.secretAccessKey }, method, opts);
}

/** The general form; exported so it can be checked against AWS's published example. */
export function presignS3(
  t: { host: string; path: string; region: string; accessKeyId: string; secretAccessKey: string },
  method: Method,
  { headers = {}, expires = 600, now = new Date() }: Options = {},
) {
  const { host, path, region } = t;
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const day = amzDate.slice(0, 8);
  const scope = `${day}/${region}/s3/aws4_request`;

  const all: Record<string, string> = { host };
  for (const [k, v] of Object.entries(headers)) all[k.toLowerCase()] = String(v).trim();
  const names = Object.keys(all).sort();
  const signedHeaders = names.join(";");

  const query: Record<string, string> = {
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": `${t.accessKeyId}/${scope}`,
    "X-Amz-Date": amzDate,
    "X-Amz-Expires": String(expires),
    "X-Amz-SignedHeaders": signedHeaders,
  };
  const qs = Object.keys(query)
    .sort()
    .map((k) => `${enc(k)}=${enc(query[k])}`)
    .join("&");

  const canonical = [method, path, qs, names.map((n) => `${n}:${all[n]}\n`).join(""), signedHeaders, "UNSIGNED-PAYLOAD"].join("\n");
  const toSign = ["AWS4-HMAC-SHA256", amzDate, scope, sha256(canonical)].join("\n");
  const kDate = hmac(`AWS4${t.secretAccessKey}`, day);
  const signature = hmac(hmac(hmac(hmac(kDate, region), "s3"), "aws4_request"), toSign).toString("hex");

  return `https://${host}${path}?${qs}&X-Amz-Signature=${signature}`;
}

/** R2 settings from the environment, or null when R2 isn't set up (uploads then go to Supabase). */
export function r2FromEnv(env: Record<string, string | undefined> = process.env): R2Config | null {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET } = env;
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) return null;
  return { accountId: R2_ACCOUNT_ID, accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY, bucket: R2_BUCKET };
}
