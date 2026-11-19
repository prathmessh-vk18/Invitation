"use client";

import { useState } from "react";
import { Button, Container, FilterPills, Panel } from "@/ui";

/**
 * The couple's RSVP page, as a preview with sample replies. The real page reads the invite's RSVPs
 * from the database at a private link (sent by email after the order confirmation, and shown on the
 * order page). Guests' replies still go to the couple's WhatsApp; this page counts and lists them.
 */

// Exactly what the invite's RSVP form sends: coming or not, a name, guests (1–12, only when coming),
// the functions picked (only when there's more than one) and an optional note. We add when it came.
type Reply = { name: string; coming: boolean; guests: number; functions: string[]; note?: string; ago: string };

const FUNCTIONS = [
  { name: "Mehndi", day: "Thu, 10 Dec", time: "4:00 pm" },
  { name: "Sangeet", day: "Fri, 11 Dec", time: "7:00 pm" },
  { name: "Wedding", day: "Sat, 12 Dec", time: "7:30 pm" },
  { name: "Reception", day: "Sun, 13 Dec", time: "8:00 pm" },
];

const REPLIES: Reply[] = [
  { name: "Sharma family", coming: true, guests: 4, functions: ["Sangeet", "Wedding", "Reception"], note: "So happy for you both! Can't wait to dance 💃", ago: "12 min ago" },
  { name: "Priya & Rohan", coming: true, guests: 2, functions: ["Mehndi", "Sangeet", "Wedding"], ago: "40 min ago" },
  { name: "Verma Uncle", coming: true, guests: 3, functions: ["Wedding", "Reception"], ago: "1 h ago" },
  { name: "Ananya Iyer", coming: false, guests: 1, functions: [], note: "I'm abroad that week, sending all my love 🙏", ago: "2 h ago" },
  { name: "Kapoor family", coming: true, guests: 5, functions: ["Mehndi", "Sangeet", "Wedding", "Reception"], ago: "3 h ago" },
  { name: "Neha Gupta", coming: true, guests: 1, functions: ["Sangeet"], note: "Saving my best moves for the sangeet!", ago: "5 h ago" },
  { name: "Mehta family", coming: true, guests: 4, functions: ["Wedding"], ago: "Yesterday" },
  { name: "Arjun Nair", coming: false, guests: 1, functions: [], ago: "Yesterday" },
  { name: "Joshi Aunty", coming: true, guests: 2, functions: ["Mehndi", "Wedding"], ago: "Yesterday" },
  { name: "Riya & Kabir", coming: true, guests: 2, functions: ["Sangeet", "Wedding", "Reception"], note: "Count us in for everything ✨", ago: "2 days ago" },
  { name: "Banerjee family", coming: true, guests: 3, functions: ["Reception"], ago: "2 days ago" },
  { name: "Simran Kaur", coming: true, guests: 1, functions: ["Mehndi", "Sangeet"], ago: "3 days ago" },
];

const FILTERS = ["All", "Coming", "Can't come"] as const;

export function RsvpDashboard() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [q, setQ] = useState("");

  const coming = REPLIES.filter((r) => r.coming);
  const guests = coming.reduce((n, r) => n + r.guests, 0);
  const perFunction = FUNCTIONS.map((f) => ({ ...f, guests: coming.filter((r) => r.functions.includes(f.name)).reduce((n, r) => n + r.guests, 0) }));

  const list = REPLIES.filter((r) => (filter === "Coming" ? r.coming : filter === "Can't come" ? !r.coming : true)).filter((r) => r.name.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <section className="pt-10 pb-24 sm:pt-16">
      <Container className="max-w-[760px]">
        <p className="rounded-tile bg-placeholder px-4 py-3 text-caption text-placeholder-ink">Preview with sample guests. Couples will see their own replies here.</p>

        {/* Header */}
        <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-caption font-medium text-subtle">Your RSVPs</p>
            <h1 className="mt-1 text-[clamp(34px,6vw,48px)] leading-[1.05] font-semibold tracking-[-0.03em]">Aarav &amp; Meera</h1>
            <p className="mt-2 text-body text-muted">Wedding · Saturday, 12 December 2026 · Udaipur</p>
          </div>
          <p className="text-caption text-subtle">Last reply {REPLIES[0].ago}</p>
        </div>

        {/* Totals */}
        <div className="mt-8 grid grid-cols-3 gap-3">
          <Stat label="Guests coming" value={guests} strong />
          <Stat label="Replies" value={REPLIES.length} />
          <Stat label="Can't come" value={REPLIES.length - coming.length} />
        </div>

        {/* By function */}
        <Panel className="mt-6 p-5 sm:p-7">
          <p className="text-title">Guests at each function</p>
          <p className="mt-1 text-caption text-subtle">For catering and seating: guests who said they&rsquo;ll come to each.</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {perFunction.map((f) => (
              <div key={f.name} className="rounded-[16px] bg-surface p-4">
                <p className="text-body font-semibold">{f.name}</p>
                <p className="text-caption text-subtle">{f.day}</p>
                <p className="text-caption text-subtle">{f.time}</p>
                <p className="mt-3 text-[30px] leading-none font-semibold tracking-[-0.03em] tabular-nums">
                  {f.guests}
                  <span className="ml-1.5 text-caption font-medium tracking-normal text-subtle">guests</span>
                </p>
              </div>
            ))}
          </div>
        </Panel>

        {/* Guests */}
        <Panel className="mt-6 p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-title">Who replied</p>
            <Button variant="secondary" size="md" type="button">
              Download list
            </Button>
          </div>
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
            {list.map((r) => (
              <li key={r.name} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-body font-semibold">{r.name}</p>
                    <p className="mt-0.5 text-caption text-subtle">
                      {r.coming ? `${r.guests} ${r.guests === 1 ? "guest" : "guests"}` : "Can't come"} · {r.ago}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[12px] font-semibold ${r.coming ? "bg-whatsapp-wash text-[#1d6b35]" : "bg-panel text-muted"}`}>{r.coming ? "Coming" : "Not coming"}</span>
                </div>
                {r.functions.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {r.functions.map((f) => (
                      <span key={f} className="rounded-full bg-panel px-2.5 py-1 text-[12px] font-medium">
                        {f}
                      </span>
                    ))}
                  </div>
                )}
                {r.note && <p className="mt-2.5 rounded-[12px] bg-panel px-3 py-2 text-body text-ink-soft">“{r.note}”</p>}
              </li>
            ))}
            {!list.length && <li className="p-6 text-center text-body text-muted">No replies match.</li>}
          </ul>
        </Panel>

        <p className="mt-6 text-center text-caption text-subtle">
          Private to you: only people with this link can see it. Replies also reach you on WhatsApp, as before.
        </p>
      </Container>
    </section>
  );
}

function Stat({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  return (
    <div className={`rounded-[20px] p-4 sm:p-5 ${strong ? "bg-ink text-white" : "bg-panel"}`}>
      <p className={`text-caption font-medium ${strong ? "text-white/70" : "text-subtle"}`}>{label}</p>
      <p className="mt-1 text-[34px] leading-none font-semibold tracking-[-0.03em] tabular-nums">
        {value}
      </p>
    </div>
  );
}
