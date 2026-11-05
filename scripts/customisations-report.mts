/**
 * Lists every customised invite: settings we added on the order, and edits made straight to a
 * published invite that its order doesn't have (the next approval or "Update invite from
 * details" would overwrite those). Read-only.
 * Run: set -a && . ./.env.local && set +a && npx tsx scripts/customisations-report.mts
 */
import type { Order } from "../src/lib/orders";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!, KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
// What publishing builds from an order (src/lib/order-invite.ts, which is server-only).
const inviteFromOrder = (o: Order, slug: string) => ({
  ...o.details,
  slug,
  template: o.template,
  ...(o.song_path ? { music: `${URL}/storage/v1/object/public/songs/${o.song_path}` } : {}),
  ...(o.photo_paths?.length ? { gallery: o.photo_paths.map((p) => `${URL}/storage/v1/object/public/photos/${p}`) } : {}),
});
const get = async (q: string) => (await fetch(`${URL}/rest/v1/${q}`, { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } })).json();
const orders = (await get("orders?select=id,code,template,status,invite_slug,details,song_path,photo_paths&status=in.(live,paid)&order=code")) as Order[];
const invites = (await get("invites?select=slug,order_id,template,data,is_published")) as { slug: string; order_id: string | null; template: string; data: Record<string, unknown>; is_published: boolean }[];

const FORM_TOP = new Set(["bride", "groom", "lead", "invocation", "invocationMeaning", "hosts", "message", "date", "city", "hashtag", "events", "rsvp", "closing", "music", "hide", "font", "lang"]);
const FORM_PERSON = new Set(["first", "full", "parents"]);
const short = (v: unknown) => (v === undefined ? "∅" : JSON.stringify(v).replace(/\s+/g, " ").slice(0, 90));
function diff(a: unknown, b: unknown, path = ""): string[] {
  if (JSON.stringify(a) === JSON.stringify(b)) return [];
  if (a && b && typeof a === "object" && typeof b === "object" && !Array.isArray(a) && !Array.isArray(b)) {
    const keys = new Set([...Object.keys(a as object), ...Object.keys(b as object)]);
    return [...keys].flatMap((k) => diff((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k], path ? `${path}.${k}` : k));
  }
  if (Array.isArray(a) && Array.isArray(b) && a.length === b.length) return a.flatMap((x, i) => diff(x, b[i], `${path}[${i}]`));
  return [`${path}: order says ${short(a)} · invite shows ${short(b)}`];
}

const rows: { code: string; slug: string; settings: string[]; drift: string[] }[] = [];
for (const o of orders) {
  const d = o.details as unknown as Record<string, unknown>;
  const settings = [
    ...Object.keys(d).filter((k) => !FORM_TOP.has(k)),
    ...(["bride", "groom"] as const).flatMap((w) => Object.keys((d[w] as object | undefined) ?? {}).filter((k) => !FORM_PERSON.has(k)).map((k) => `${w}.${k}`)),
  ];
  const inv = o.invite_slug ? invites.find((i) => i.slug === o.invite_slug) : undefined;
  const drift = inv ? diff(inviteFromOrder(o, o.invite_slug!), inv.data) : [];
  if (settings.length || drift.length) rows.push({ code: o.code, slug: o.invite_slug ?? "(not published)", settings, drift });
}
const orphans = invites.filter((i) => !i.order_id && i.is_published);
console.log(JSON.stringify({ checked: orders.length, rows, orphans: orphans.map((i) => `${i.slug} (${i.template})`) }));
