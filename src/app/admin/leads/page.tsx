import Link from "next/link";
import { site, whatsappLink } from "@/config/site";
import { getTemplate } from "@/data/templates";
import { requireAdmin } from "@/lib/admin-auth";
import { fmtDate } from "@/lib/format";
import { db, isSupabaseConfigured } from "@/lib/supabase";
import { AdminHeader } from "../AdminHeader";
import { setLeadStatus } from "./actions";

export const instant = false;

type Lead = {
  id: string;
  created_at: string;
  planner: string | null;
  wedding_month: string | null;
  tradition: string | null;
  design: string | null;
  price_ok: string | null;
  need: string | null;
  outcome: string | null;
  question: string | null;
  contact: string | null;
  status: string;
  page: string | null;
};

const tabs = [
  { id: "questions", label: "Questions" },
  { id: "chats", label: "All chats" },
  { id: "done", label: "Answered" },
] as const;

const outcomeTone: Record<string, string> = {
  order: "bg-[#dff3e4] text-[#1d6b35]",
  whatsapp: "bg-[#e3eefc] text-[#1f4f8a]",
};
const outcomeLabel: Record<string, string> = { order: "Started an order", whatsapp: "Opened WhatsApp" };

const monthLabel = (v: string | null) => (!v ? null : v === "Later" ? "Later" : fmtDate(`${v}-01T12:00:00`, { month: "short", year: "numeric" }));

/** The cut-off for the 7-day counts. */
const weekAgo = () => new Date(Date.now() - 7 * 864e5).toISOString();

/** A reply link for whatever they left: an email, or a phone number for WhatsApp. */
function replyHref(contact: string, question: string) {
  if (contact.includes("@")) return `mailto:${contact}?subject=${encodeURIComponent(`Your question to ${site.name}`)}`;
  const digits = contact.replace(/\D/g, "");
  const phone = digits.length === 10 ? `91${digits}` : digits;
  return whatsappLink(`Hi! This is ${site.name}, replying to your question: "${question}"`, phone);
}

export default async function AdminLeads({ searchParams }: PageProps<"/admin/leads">) {
  await requireAdmin();
  if (!isSupabaseConfigured()) return <AdminHeader />;
  const raw = (await searchParams).tab;
  const active = tabs.find((x) => x.id === raw)?.id ?? "questions";

  let q = db().from("leads").select("*").order("created_at", { ascending: false }).limit(200);
  if (active === "questions") q = q.not("question", "is", null).eq("status", "new");
  if (active === "done") q = q.eq("status", "done");
  const [{ data, error }, { count: chats }, { count: started }] = await Promise.all([
    q,
    db().from("leads").select("id", { count: "exact", head: true }).gte("created_at", weekAgo()),
    db().from("leads").select("id", { count: "exact", head: true }).eq("outcome", "order").gte("created_at", weekAgo()),
  ]);
  const leads = (data ?? []) as Lead[];

  return (
    <>
      <AdminHeader />
      <main className="mx-auto max-w-wide px-5 py-10">
        <h1 className="text-heading">Leads</h1>
        <p className="mt-2 text-lead text-muted">
          Everyone who finished the &ldquo;Let&rsquo;s talk&rdquo; chat. Last 7 days: {chats ?? 0} chats, {started ?? 0} went on to start an order.
        </p>
        {error && <p className="mt-4 text-body text-[#b42318]">Couldn&rsquo;t load leads. Have you run supabase/migrations/0008_leads.sql?</p>}
        <div className="no-scrollbar mt-6 flex gap-1.5 overflow-x-auto">
          {tabs.map((x) => (
            <Link
              key={x.id}
              href={`/admin/leads?tab=${x.id}`}
              className={`shrink-0 rounded-full px-4 py-2 text-[14px] font-medium transition ${active === x.id ? "bg-ink text-white" : "bg-panel hover:bg-panel-strong"}`}
            >
              {x.label}
            </Link>
          ))}
        </div>

        {!leads.length && !error && <p className="mt-10 text-body text-muted">{active === "questions" ? "No questions waiting." : "Nothing here yet."}</p>}

        <ul className="mt-6 space-y-3">
          {leads.map((l) => {
            const design = l.design ? getTemplate(l.design) : undefined;
            const facts = [l.planner, monthLabel(l.wedding_month) && `Wedding ${monthLabel(l.wedding_month)}`, l.tradition, design && `Liked ${design.name}`, l.price_ok && `Price: ${l.price_ok}`, l.need && `Needs: ${l.need}`].filter(Boolean);
            return (
              <li key={l.id} className="rounded-card border border-line p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-caption text-subtle tabular-nums">{fmtDate(l.created_at, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</span>
                  {l.outcome && <span className={`rounded-full px-2.5 py-0.5 text-[12px] font-medium ${outcomeTone[l.outcome] ?? "bg-panel"}`}>{outcomeLabel[l.outcome] ?? l.outcome}</span>}
                  {l.page && <span className="text-caption text-subtle">from {l.page}</span>}
                </div>
                {facts.length > 0 && <p className="mt-2 text-body">{facts.join(" · ")}</p>}
                {l.question && (
                  <div className="mt-3 rounded-tile bg-panel p-4">
                    <p className="text-body whitespace-pre-wrap">&ldquo;{l.question}&rdquo;</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {l.contact && (
                        <a href={replyHref(l.contact, l.question)} target="_blank" rel="noreferrer" className="rounded-full bg-ink px-4 py-2 text-[14px] font-medium text-white">
                          Reply to {l.contact}
                        </a>
                      )}
                      <form action={setLeadStatus}>
                        <input type="hidden" name="id" value={l.id} />
                        <input type="hidden" name="status" value={l.status === "done" ? "new" : "done"} />
                        <button className="rounded-full bg-surface px-4 py-2 text-[14px] font-medium hover:bg-panel-strong">{l.status === "done" ? "Reopen" : "Mark answered"}</button>
                      </form>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </main>
    </>
  );
}
