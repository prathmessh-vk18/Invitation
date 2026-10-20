import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { site } from "@/config/site";
import { getInvite, invites, type Invite } from "@/data/invites";
import { couple } from "@/invites/people";
import { InviteRenderer } from "@/invites/InviteRenderer";
import { getPublishedInvite } from "@/lib/invites-db";
import { longDate } from "@/lib/format";

// Demo invites are prerendered; customers' invites load from the database on first visit.
export const instant = false;

export function generateStaticParams() {
  return invites.map((i) => ({ slug: i.slug }));
}

async function resolve(slug: string): Promise<{ invite: Invite; liveUntil?: string } | null> {
  const demo = getInvite(slug);
  if (demo) return { invite: demo };
  return getPublishedInvite(slug);
}

export async function generateMetadata({ params }: PageProps<"/i/[slug]">): Promise<Metadata> {
  const found = await resolve((await params).slug);
  if (!found) return { title: { absolute: `Invitation · ${site.name}` } };
  const [a, b] = couple(found.invite);
  return {
    title: { absolute: `${a.first} & ${b.first} · Wedding Invitation` },
    description: `You're invited to celebrate ${a.first} & ${b.first}, ${longDate(found.invite.date)}, ${found.invite.city}.`,
    robots: getInvite(found.invite.slug) ? undefined : { index: false },
  };
}

export const viewport: Viewport = { themeColor: "#000000" };

function Ended({ invite }: { invite: Invite }) {
  const [a, b] = couple(invite);
  return (
    <main className="grid min-h-svh place-items-center bg-panel px-5 text-center">
      <div className="max-w-sm">
        <p className="text-heading">
          {a.first} &amp; {b.first}
        </p>
        <p className="mt-4 text-lead text-muted">This invitation has ended. Thank you for celebrating with us.</p>
        <Link href="/" className="mt-8 inline-block text-caption text-subtle underline underline-offset-4">
          Made with {site.name}
        </Link>
      </div>
    </main>
  );
}

/** True once the last live day (in IST) has passed. Read after connection(), so it runs per request. */
function hasEnded(liveUntil: string) {
  return Date.now() > new Date(`${liveUntil}T23:59:59+05:30`).getTime();
}

async function InviteForSlug({ params }: { params: PageProps<"/i/[slug]">["params"] }) {
  const { slug } = await params;
  const found = await resolve(slug);
  if (!found) notFound();
  if (found.liveUntil) {
    await connection();
    if (hasEnded(found.liveUntil)) return <Ended invite={found.invite} />;
  }
  return <InviteRenderer invite={found.invite} />;
}

export default function InvitePage({ params }: PageProps<"/i/[slug]">) {
  return (
    <Suspense fallback={<div className="min-h-svh bg-black" />}>
      <InviteForSlug params={params} />
    </Suspense>
  );
}
