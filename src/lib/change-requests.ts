import "server-only";
import { site } from "@/config/site";
import { fontStyles, sections } from "@/config/customise";
import { tracks } from "@/config/music";
import { fmtDate, time } from "@/lib/format";
import type { InviteDetails } from "@/lib/orders";
import { db } from "@/lib/supabase";

export type ChangeStatus = "pending" | "approved" | "declined";

export type ChangeRequest = {
  id: string;
  order_id: string;
  status: ChangeStatus;
  details: InviteDetails;
  song_path: string | null;
  photo_paths: string[];
  note: string | null;
  reply: string | null;
  created_at: string;
  decided_at: string | null;
};

/** The order's latest request and how many free change rounds it has used. Null when the table isn't set up yet. */
export async function changeSummary(orderId: string) {
  const { data, error } = await db().from("change_requests").select("*").eq("order_id", orderId).order("created_at", { ascending: false });
  if (error) return null;
  const all = (data ?? []) as ChangeRequest[];
  const used = all.filter((r) => r.status === "approved").length;
  return { latest: all[0] ?? null, used, free: site.revisionRounds, left: Math.max(0, site.revisionRounds - used) };
}

/* ───────── What changed, in words ───────── */

export type Change = { label: string; before: string; after: string };

const when = (iso?: string) => (iso ? `${fmtDate(iso, { day: "numeric", month: "short", year: "numeric" })}, ${time(iso)}` : "");
const day = (iso?: string) => (iso ? fmtDate(iso, { day: "numeric", month: "short", year: "numeric" }) : "");
const track = (id?: string) => tracks.find((t) => t.id === id)?.name ?? id ?? "";
const font = (id?: string) => fontStyles.find((f) => f.id === id)?.name ?? "Design's own";
const hidden = (ids?: string[]) => sections.filter((x) => ids?.includes(x.id)).map((x) => x.name).join(", ") || "Nothing";

/**
 * Every difference between two versions of an invite, as label / before / after, in form order.
 * Songs and photos are compared by the caller, since they live outside `details`.
 */
export function diffDetails(a: InviteDetails, b: InviteDetails): Change[] {
  const out: Change[] = [];
  const add = (label: string, x: string | undefined, y: string | undefined) => {
    if ((x ?? "") !== (y ?? "")) out.push({ label, before: x || "—", after: y || "—" });
  };

  for (const who of ["bride", "groom"] as const) {
    const W = who === "bride" ? "Bride" : "Groom";
    add(`${W}'s first name`, a[who].first, b[who].first);
    add(`${W}'s full name`, a[who].full, b[who].full);
    add(`${W}'s parents`, a[who].parents, b[who].parents);
  }
  add("Name shown first", a.lead, b.lead);
  add("Opening line", a.invocation, b.invocation);
  add("Meaning of the opening line", a.invocationMeaning, b.invocationMeaning);
  add("Wedding date and time", when(a.date), when(b.date));
  add("Wedding city", a.city, b.city);

  const n = Math.max(a.events.length, b.events.length);
  for (let i = 0; i < n; i++) {
    const x = a.events[i];
    const y = b.events[i];
    if (!x) {
      out.push({ label: `Function ${i + 1}`, before: "—", after: `Added: ${y.name}, ${when(y.start)}, ${y.venue}` });
      continue;
    }
    if (!y) {
      out.push({ label: `Function ${i + 1}`, before: `${x.name}, ${when(x.start)}, ${x.venue}`, after: "Removed" });
      continue;
    }
    const F = `Function ${i + 1} (${y.name || x.name})`;
    add(`${F}: name`, x.name, y.name);
    add(`${F}: date and time`, when(x.start), when(y.start));
    add(`${F}: venue`, x.venue, y.venue);
    add(`${F}: address`, x.address, y.address);
    add(`${F}: Maps link`, x.mapUrl, y.mapUrl);
    add(`${F}: dress code`, x.dress, y.dress);
    add(`${F}: note`, x.note, y.note);
  }

  add("Hosted by", a.hosts, b.hosts);
  add("Invitation message", a.message, b.message);
  add("Closing line", a.closing, b.closing);
  add("Hashtag", a.hashtag, b.hashtag);
  add("RSVP number", a.rsvp.phone && `+${a.rsvp.phone}`, b.rsvp.phone && `+${b.rsvp.phone}`);
  add("RSVP by", day(a.rsvp.by), day(b.rsvp.by));
  add("Our track", track(a.music), track(b.music));
  add("Fonts", font(a.font), font(b.font));
  add("Sections turned off", hidden(a.hide), hidden(b.hide));
  return out;
}
