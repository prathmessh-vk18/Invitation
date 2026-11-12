import { mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { Invite } from "../src/data/invites";
import { getInvite } from "../src/data/invites";
import { templates } from "../src/data/templates";
import type { Order } from "../src/lib/orders";
import { inviteFromOrder } from "../src/lib/order-invite";
import { withMovedMedia } from "../src/lib/media";
import { renderInvitePdf } from "../src/lib/pdf/render";
import { db } from "../src/lib/supabase";

// Every design's demo PDF and every purchased PDF, printed with the current layout, into Downloads.
// Run: npx tsx --conditions=react-server --env-file=.env.local scripts/pdf-samples.mts
const site = "https://aavjoo.in";
const dl = join(homedir(), "Downloads");
const samples = join(dl, "Aavjoo PDF samples v2");
const customers = join(dl, "Aavjoo PDF customers v2");
mkdirSync(samples, { recursive: true });
mkdirSync(customers, { recursive: true });
let ok = 0;
let failed = 0;

async function save(file: string, invite: Invite, inviteUrl: string) {
  try {
    writeFileSync(file, await renderInvitePdf(invite, { siteUrl: site, inviteUrl }));
    ok++;
  } catch (e) {
    failed++;
    console.log(`FAILED ${file}: ${e instanceof Error ? e.message : e}`);
  }
}

for (const t of templates) {
  const invite = t.demoSlug ? getInvite(t.demoSlug) : undefined;
  if (invite) await save(join(samples, `${t.name.replace(/\s+/g, "-")}-sample.pdf`), invite, `${site}/i/${invite.slug}`);
}

const { data: orders } = await db().from("orders").select("*").contains("addons", ["pdf"]).eq("status", "live").order("code");
for (const order of (orders ?? []) as Order[]) {
  let invite: Invite = inviteFromOrder(order, order.invite_slug ?? "preview");
  if (order.invite_slug) {
    const { data: live } = await db().from("invites").select("data").eq("slug", order.invite_slug).maybeSingle();
    if (live?.data) invite = live.data as Invite;
  }
  invite = withMovedMedia(invite);
  const [a, b] = invite.lead === "groom" ? [invite.groom, invite.bride] : [invite.bride, invite.groom];
  await save(join(customers, `${order.code}-${order.template}-${a.first}-${b.first}.pdf`.replace(/[^\w.-]+/g, "-")), invite, `${site}/i/${order.invite_slug}`);
}
console.log(`done: ${ok} printed, ${failed} failed`);
