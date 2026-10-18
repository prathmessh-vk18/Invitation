import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { getInvite, invites } from "@/data/invites";
import { couple } from "@/invites/people";
import { InviteRenderer } from "@/invites/InviteRenderer";
import { longDate } from "@/lib/format";

// Every slug is prerendered from generateStaticParams, so navigating here never waits on request data.
export const instant = false;

export function generateStaticParams() {
  return invites.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: PageProps<"/i/[slug]">): Promise<Metadata> {
  const invite = getInvite((await params).slug);
  if (!invite) return {};
  const [a, b] = couple(invite);
  return {
    title: { absolute: `${a.first} & ${b.first} · Wedding Invitation` },
    description: `You're invited to celebrate ${a.first} & ${b.first}, ${longDate(invite.date)}, ${invite.city}.`,
  };
}

export const viewport: Viewport = { themeColor: "#000000" };

export default async function InvitePage({ params }: PageProps<"/i/[slug]">) {
  const { slug } = await params;
  if (!getInvite(slug)) notFound();
  return <InviteRenderer slug={slug} />;
}
