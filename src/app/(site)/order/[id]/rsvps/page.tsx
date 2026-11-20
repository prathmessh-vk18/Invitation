import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getTemplate } from "@/data/templates";
import { fmtDate, longDate } from "@/lib/format";
import type { Order } from "@/lib/orders";
import { repliesFor, tracksRsvps } from "@/lib/rsvp";
import { db } from "@/lib/supabase";
import { connection } from "next/server";
import { RsvpView, type RsvpFunction, type RsvpRow } from "@/site/rsvp-view";

export const metadata: Metadata = { title: "Your RSVPs", robots: { index: false, follow: false } };
export const instant = false;

/** This request's time (read per request, so the page is always fresh). */
async function requestTime() {
  await connection();
  return Date.now();
}

/** "12 min ago", "3 h ago", "Yesterday", "4 days ago", then the date. */
function ago(iso: string, now: number) {
  const m = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000));
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  if (d === 1) return "Yesterday";
  if (d < 7) return `${d} days ago`;
  return fmtDate(iso, { day: "numeric", month: "short" });
}

async function RsvpPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const { data } = await db().from("orders").select("*").eq("id", id).maybeSingle();
  const order = data as Order | null;
  if (!order || order.status === "cancelled" || !tracksRsvps(order)) notFound();

  const d = order.details;
  const [a, b] = d.lead === "groom" ? [d.groom.first, d.bride.first] : [d.bride.first, d.groom.first];
  const occ = getTemplate(order.template)?.occasion ?? d.occasion ?? "wedding";
  const kind = occ === "engagement" ? "Engagement" : occ === "reception" ? "Reception" : "Wedding";
  const subtitle = [kind, d.date && longDate(d.date), d.city].filter(Boolean).join(" · ");

  const replies = await repliesFor(order.id);
  const now = await requestTime();
  const rows: RsvpRow[] = replies.map((r) => ({ name: r.name, coming: r.coming, guests: r.guests, functions: r.functions, note: r.note, ago: ago(r.created_at, now) }));
  // The functions as the invite lists them; on an invite that groups by day, the days guests ticked.
  const functions: RsvpFunction[] = d.eventsByDay
    ? [...new Set(replies.flatMap((r) => r.functions))].map((name) => ({ name, day: "", time: "" }))
    : [...d.events]
        .sort((x, y) => x.start.localeCompare(y.start))
        .map((e) => ({ name: e.name, day: e.start ? fmtDate(e.start, { weekday: "short", day: "numeric", month: "short" }) : "", time: e.start && !e.noTime ? (e.timeText ?? fmtDate(e.start, { hour: "numeric", minute: "2-digit", hour12: true }).toLowerCase()) : "" }));

  return <RsvpView names={`${a} & ${b}`} subtitle={subtitle} functions={functions} replies={rows} />;
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="mx-auto my-16 h-[60vh] max-w-[760px] rounded-card bg-panel" />}>
      <RsvpPage params={params} />
    </Suspense>
  );
}
