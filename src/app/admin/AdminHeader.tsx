import Link from "next/link";
import { db, isSupabaseConfigured } from "@/lib/supabase";
import { Wordmark } from "@/site/chrome";
import { logout } from "./actions";

/** How many change requests and questions are waiting, for the badges. 0 if a table isn't set up yet. */
async function waiting() {
  if (!isSupabaseConfigured()) return [0, 0];
  const [{ count: changes }, { count: questions }] = await Promise.all([
    db().from("change_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
    db().from("leads").select("id", { count: "exact", head: true }).eq("status", "new").not("question", "is", null),
  ]);
  return [changes ?? 0, questions ?? 0];
}

const Badge = ({ n }: { n: number }) =>
  n > 0 ? <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#d64545] px-1.5 text-[12px] font-semibold text-white tabular-nums">{n}</span> : null;

export async function AdminHeader() {
  const [changes, questions] = await waiting();
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex h-16 max-w-wide items-center justify-between px-5">
        <div className="flex items-center gap-6">
          <Link href="/admin">
            <Wordmark />
          </Link>
          <Link href="/admin" className="text-[15px] font-medium text-muted hover:text-ink">
            Orders
          </Link>
          <Link href="/admin/changes" className="flex items-center gap-1.5 text-[15px] font-medium text-muted hover:text-ink">
            Changes
            <Badge n={changes} />
          </Link>
          <Link href="/admin/leads" className="flex items-center gap-1.5 text-[15px] font-medium text-muted hover:text-ink">
            Leads
            <Badge n={questions} />
          </Link>
          <Link href="/admin/partners" className="text-[15px] font-medium text-muted hover:text-ink">
            Partners
          </Link>
          <Link href="/admin/emails" className="text-[15px] font-medium text-muted hover:text-ink">
            Emails
          </Link>
        </div>
        <div className="flex items-center gap-4 text-[15px]">
          <Link href="/" target="_blank" className="text-muted hover:text-ink">
            View site ↗
          </Link>
          <form action={logout}>
            <button className="rounded-full bg-panel px-4 py-2 font-medium hover:bg-panel-strong">Sign out</button>
          </form>
        </div>
      </div>
    </header>
  );
}

export const statusTone: Record<string, string> = {
  awaiting_payment: "bg-panel text-muted",
  payment_submitted: "bg-[#fff3c4] text-[#7a5b00]",
  paid: "bg-[#e3eefc] text-[#1f4f8a]",
  live: "bg-[#dff3e4] text-[#1d6b35]",
  cancelled: "bg-[#fdecec] text-[#8a1c1c]",
};
