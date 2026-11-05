/**
 * Checks that approving a couple's change keeps every setting we customised by hand.
 * Run: set -a && . ./.env.local && set +a && npx tsx scripts/check-approvals.mts
 * It sends each live and paid order through the order form and an approval without editing
 * anything, then lists whatever came out different. It only reads; nothing is saved.
 */
import { fromDetails, toDetails } from "../src/app/(site)/start/[template]/form-model";
import { validateDetails, keepInviteSettings, type InviteDetails } from "../src/lib/orders";
import { getInvite } from "../src/data/invites";
import { getTemplate } from "../src/data/templates";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!, KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const res = await fetch(`${URL}/rest/v1/orders?select=code,template,status,invite_slug,details,customer_name,customer_phone,customer_email&status=in.(live,paid)`, { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } });
const orders = (await res.json()) as { code: string; template: string; status: string; invite_slug: string; details: InviteDetails; customer_name: string; customer_phone: string; customer_email: string | null }[];

// Walks two values and lists every path where they differ.
function diff(a: unknown, b: unknown, path = ""): string[] {
  if (JSON.stringify(a) === JSON.stringify(b)) return [];
  if (a && b && typeof a === "object" && typeof b === "object" && !Array.isArray(a) && !Array.isArray(b)) {
    const keys = new Set([...Object.keys(a as object), ...Object.keys(b as object)]);
    return [...keys].flatMap((k) => diff((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k], path ? `${path}.${k}` : k));
  }
  if (Array.isArray(a) && Array.isArray(b) && a.length === b.length) return a.flatMap((x, i) => diff(x, b[i], `${path}[${i}]`));
  const show = (v: unknown) => (v === undefined ? "∅" : JSON.stringify(v).slice(0, 70));
  return [`${path}: ${show(a)} → ${show(b)}`];
}

const lost: Record<string, string[]> = {};
for (const o of orders) {
  const demo = getInvite(getTemplate(o.template as never)!.demoSlug)!;
  const d0 = o.details;
  // 1. The couple opens their form and sends it back without touching anything.
  const sent = toDetails(fromDetails(d0, demo, { name: o.customer_name, phone: o.customer_phone, email: o.customer_email ?? "" }));
  const v1 = validateDetails(sent);
  if (!v1.ok) { lost[o.code] = [`form would not save: ${v1.errors.join("; ")}`]; continue; }
  const request = keepInviteSettings(d0, v1.details);      // saved as the change request
  // 2. Admin approves it.
  const v2 = validateDetails(request);
  if (!v2.ok) { lost[o.code] = [`approval would fail: ${v2.errors.join("; ")}`]; continue; }
  const after = keepInviteSettings(d0, v2.details);
  const d = diff(d0, after);
  if (d.length) lost[`${o.code} ${o.invite_slug ?? ""}`] = d;
}
console.log(`orders checked: ${orders.length}, with differences: ${Object.keys(lost).length}`);

// A setting nobody has listed anywhere, on the invite and on a person, must survive an approval,
// and the couple's own edit must still win.
{
  const o = orders.find((x) => x.status === "live")!;
  const demo = getInvite(getTemplate(o.template as never)!.demoSlug)!;
  const d0 = { ...o.details, someFutureSetting: { on: true }, bride: { ...o.details.bride, someFutureBadge: "Dr." } } as InviteDetails;
  const state = fromDetails(d0, demo, { name: o.customer_name, phone: o.customer_phone, email: o.customer_email ?? "" });
  state.bride.parents = "Edited by the couple";
  const v1 = validateDetails(toDetails(state));
  const v2 = v1.ok ? validateDetails(keepInviteSettings(d0, v1.details)) : v1;
  const after = v2.ok ? (keepInviteSettings(d0, v2.details) as unknown as Record<string, any>) : null;
  console.log("\nunlisted invite setting kept:", JSON.stringify(after?.someFutureSetting) === '{"on":true}');
  console.log("unlisted person setting kept:", after?.bride?.someFutureBadge === "Dr.");
  console.log("couple's edit applied:", after?.bride?.parents === "Edited by the couple");
}
for (const [k, v] of Object.entries(lost)) { console.log(`\n== ${k}`); v.slice(0, 12).forEach((x) => console.log("   " + x)); if (v.length > 12) console.log(`   … ${v.length - 12} more`); }
