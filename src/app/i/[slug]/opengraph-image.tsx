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

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const invite = await resolve((await params).slug);
  if (!invite) notFound();
  return shareCard(invite);
}
