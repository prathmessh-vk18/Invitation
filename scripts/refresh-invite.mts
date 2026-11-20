/**
 * Refreshes live invites after a change made by hand, without a deploy (no build minutes).
 * Run: npx tsx --env-file=.env.local scripts/refresh-invite.mts <slug> [<slug>…]
 */
const slugs = process.argv.slice(2);
if (!slugs.length) throw new Error("Give at least one invite slug, e.g. aarav-weds-meera");
const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? "https://aavjoo.in"}/api/admin/refresh-invite`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.CRON_SECRET}` },
  body: JSON.stringify({ slugs }),
});
console.log(res.status, await res.text());
if (!res.ok) process.exit(1);
