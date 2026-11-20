"use client";

import { useState } from "react";
import { Container, FilterPills, Panel } from "@/ui";

/**
 * The couple's RSVP page: totals, guests at each function, and who replied. Shared by the real page
 * (/order/<id>/rsvps) and the preview with sample guests (/lab/rsvps).
 *
 * A reply is exactly what the invite's RSVP form sends: coming or not, a name, guests (1–12, only
 * when coming), the functions picked and an optional note. `ago` is when it came.
 */
export type RsvpRow = { name: string; coming: boolean; guests: number; functions: string[]; note?: string | null; ago: string };
export type RsvpFunction = { name: string; day: string; time: string };

const FILTERS = ["All", "Coming", "Can't come"] as const;

export function RsvpView({ names, subtitle, functions, replies, banner }: { names: string; subtitle: string; functions: RsvpFunction[]; replies: RsvpRow[]; banner?: string }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [q, setQ] = useState("");

  const coming = replies.filter((r) => r.coming);
  const guests = coming.reduce((n, r) => n + r.guests, 0);
  const perFunction = functions.map((f) => ({ ...f, guests: coming.filter((r) => r.functions.includes(f.name)).reduce((n, r) => n + r.guests, 0) }));
  const list = replies.filter((r) => (filter === "Coming" ? r.coming : filter === "Can't come" ? !r.coming : true)).filter((r) => r.name.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <section className="pt-10 pb-24 sm:pt-16">
      <Container className="max-w-[760px]">
        {banner && <p className="mb-8 rounded-tile bg-placeholder px-4 py-3 text-caption text-placeholder-ink">{banner}</p>}

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-caption font-medium text-subtle">Your RSVPs</p>
            <h1 className="mt-1 text-[clamp(34px,6vw,48px)] leading-[1.05] font-semibold tracking-[-0.03em]">{names}</h1>
            <p className="mt-2 text-body text-muted">{subtitle}</p>
          </div>
          {replies[0] && <p className="text-caption text-subtle">Last reply {replies[0].ago}</p>}
        </div>

        <div className="mt-8 grid grid-cols-3 gap-3">
          <Stat label="Guests coming" value={guests} strong />
          <Stat label="Replies" value={replies.length} />
          <Stat label="Can't come" value={replies.length - coming.length} />
        </div>

        {!replies.length && (
          <Panel className="mt-6 p-6 text-center sm:p-8">
            <p className="text-title">No replies yet</p>
            <p className="mt-1 text-body text-muted">Share your invite: when guests send their RSVP, it reaches you on WhatsApp and is counted here.</p>
          </Panel>
        )}

        {perFunction.length > 1 && replies.length > 0 && (
          <Panel className="mt-6 p-5 sm:p-7">
            <p className="text-title">Guests at each function</p>
            <p className="mt-1 text-caption text-subtle">For catering and seating: guests who said they&rsquo;ll come to each.</p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {perFunction.map((f) => (
                <div key={f.name} className="rounded-[16px] bg-surface p-4">
                  <p className="text-body font-semibold">{f.name}</p>
                  {f.day && <p className="text-caption text-subtle">{f.day}</p>}
                  {f.time && <p className="text-caption text-subtle">{f.time}</p>}
                  <p className="mt-3 text-[30px] leading-none font-semibold tracking-[-0.03em] tabular-nums">
                    {f.guests}
                    <span className="ml-1.5 text-caption font-medium tracking-normal text-subtle">guests</span>
                  </p>
                </div>
              ))}
            </div>
          </Panel>
        )}

        {replies.length > 0 && (
          <Panel className="mt-6 p-5 sm:p-7">
            <p className="text-title">Who replied</p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <FilterPills options={FILTERS} value={filter} onChange={setFilter} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search a name"
                aria-label="Search a name"
                className="h-11 w-full min-w-0 rounded-full border border-line bg-surface px-4 text-body outline-none focus:border-ink sm:ml-auto sm:w-56"
              />
            </div>
            <ul className="mt-4 divide-y divide-line overflow-hidden rounded-[16px] bg-surface">
              {list.map((r, i) => (
                <li key={r.name + i} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-body font-semibold [overflow-wrap:anywhere]">{r.name}</p>
                      <p className="mt-0.5 text-caption text-subtle">
                        {r.coming ? `${r.guests} ${r.guests === 1 ? "guest" : "guests"}` : "Can't come"} · {r.ago}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[12px] font-semibold ${r.coming ? "bg-whatsapp-wash text-[#1d6b35]" : "bg-panel text-muted"}`}>{r.coming ? "Coming" : "Not coming"}</span>
                  </div>
                  {r.functions.length > 0 && functions.length > 1 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {r.functions.map((f) => (
                        <span key={f} className="rounded-full bg-panel px-2.5 py-1 text-[12px] font-medium">
                          {f}
                        </span>
                      ))}
                    </div>
                  )}
                  {r.note && <p className="mt-2.5 rounded-[12px] bg-panel px-3 py-2 text-body text-ink-soft [overflow-wrap:anywhere]">“{r.note}”</p>}
                </li>
              ))}
              {!list.length && <li className="p-6 text-center text-body text-muted">No replies match.</li>}
            </ul>
          </Panel>
        )}

        <p className="mt-6 text-center text-caption text-subtle">Private to you: only people with this link can see it. Replies also reach you on WhatsApp, as before.</p>
      </Container>
    </section>
  );
}

function Stat({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  return (
    <div className={`rounded-[20px] p-4 sm:p-5 ${strong ? "bg-ink text-white" : "bg-panel"}`}>
      <p className={`text-caption font-medium ${strong ? "text-white/70" : "text-subtle"}`}>{label}</p>
      <p className="mt-1 text-[34px] leading-none font-semibold tracking-[-0.03em] tabular-nums">{value}</p>
    </div>
  );
}
