import Link from "next/link";
import { db, isSupabaseConfigured } from "@/lib/supabase";
import { Wordmark } from "@/site/chrome";
import { logout } from "./actions";

/** How many change requests are waiting, for the badge. 0 if the table isn't set up yet. */
async function waitingChanges() {
  if (!isSupabaseConfigured()) return 0;
  const { count } = await db().from("change_requests").select("id", { count: "exact", head: true }).eq("status", "pending");
  return count ?? 0;
}

export async function AdminHeader() {
  const waiting = await waitingChanges();
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
            {waiting > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#d64545] px-1.5 text-[12px] font-semibold text-white tabular-nums">{waiting}</span>}
          </Link>
          <Link href="/admin/partners" className="text-[15px] font-medium text-muted hover:text-ink">
            Partners
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
