import { revalidatePath, revalidateTag } from "next/cache";
import { timingSafeEqual } from "node:crypto";

/**
 * Refreshes published invites straight away after a change made by hand (data edited in the
 * database), instead of a whole new deploy. POST { slugs: ["aarav-weds-meera"] } with
 * "Authorization: Bearer <CRON_SECRET>". Run it with scripts/refresh-invite.mts.
 */
const authorised = (req: Request) => {
  const secret = process.env.CRON_SECRET;
  const got = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  return !!secret && got.length === secret.length && timingSafeEqual(Buffer.from(got), Buffer.from(secret));
};

export async function POST(req: Request) {
  if (!authorised(req)) return Response.json({ error: "Not allowed" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { slugs?: unknown };
  const slugs = (Array.isArray(body.slugs) ? body.slugs : []).filter((s): s is string => typeof s === "string" && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(s)).slice(0, 50);
  for (const s of slugs) {
    // The invite's data, its page and its share card all hang off this tag.
    revalidateTag(`invite:${s}`, { expire: 0 });
    revalidatePath(`/i/${s}`);
  }
  return Response.json({ ok: true, refreshed: slugs });
}
