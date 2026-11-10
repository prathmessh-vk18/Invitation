import { cacheLife, cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { getInvite, invites, type Invite } from "@/data/invites";
import { getPublishedInvite } from "@/lib/invites-db";
import { shareCard } from "@/lib/share-card";

// The couple's own share preview: their names, date and city over their design's painting, with
// no Aavjoo branding or price. WhatsApp builds the preview on the sender's phone, so this is
// fetched when a link is shared, not when guests open it. Demo cards are built at deploy time; a
// couple's card is built on its first share and kept until their invite changes (`invite:<slug>`).
export const alt = "Wedding invitation";
export const size = { width: 1200, height: 630 };
// Sent as a JPEG: the painted designs come out at 1–1.8 MB as PNG, and WhatsApp skips a preview
// image that large. As JPEG they are a few hundred KB.
export const contentType = "image/jpeg";

export function generateStaticParams() {
  return invites.map((i) => ({ slug: i.slug }));
}

async function resolve(slug: string): Promise<Invite | null> {
  return getInvite(slug) ?? (await getPublishedInvite(slug))?.invite ?? null;
}

/**
 * The finished JPEG, kept until the invite changes (publishing or editing clears `invite:<slug>`).
 * Without this every WhatsApp fetch rebuilt the card from scratch, about 0.65 s of work each time.
 */
async function cardBytes(slug: string): Promise<Uint8Array | null> {
  "use cache";
  cacheTag(`invite:${slug}`);
  cacheLife("days");
  const invite = await resolve(slug);
  if (!invite) return null;
  return new Uint8Array(await (await shareCard(invite)).arrayBuffer());
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const bytes = await cardBytes((await params).slug);
  if (!bytes) notFound();
  // Vercel's CDN also holds it for 10 minutes, so a burst of shares never reaches the function.
  // Kept short so a couple's edit shows on new shares soon after.
  return new Response(bytes as BodyInit, {
    headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=0, s-maxage=600, stale-while-revalidate=3600" },
  });
}
