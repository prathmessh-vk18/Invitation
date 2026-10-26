"use client";

import { AnimatePresence, motion, type HTMLMotionProps } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Invite, InviteEvent } from "@/data/invites";
import { calendarLink, directionsLink, longDate, placeOf } from "@/lib/format";
import { invites as demoInvites } from "@/data/invites";
import { couple, initials } from "./people";

const demoSlugs = new Set(demoInvites.map((d) => d.slug));
import type { InviteTheme } from "./types";

export function Reveal({ children, delay = 0, y = 28, ...rest }: { children: ReactNode; delay?: number; y?: number } & HTMLMotionProps<"div">) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export { couple, initials };

/* ───────── Countdown ───────── */

function useCountdown(target: string) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = window.setTimeout(tick, 0);
    const t = window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(t);
    };
  }, []);
  if (now === null) return null;
  const diff = Math.max(0, new Date(target).getTime() - now);
  return {
    done: diff === 0,
    parts: [
      { label: "Days", value: Math.floor(diff / 86_400_000) },
      { label: "Hours", value: Math.floor((diff / 3_600_000) % 24) },
      { label: "Minutes", value: Math.floor((diff / 60_000) % 60) },
      { label: "Seconds", value: Math.floor((diff / 1000) % 60) },
    ],
  };
}

export function Countdown({ invite, theme }: { invite: Invite; theme: InviteTheme }) {
  const c = useCountdown(invite.date);
  return (
    <section className={theme.ui.section}>
      <Reveal>
        <theme.Title kicker="Counting down">Until we say “I do”</theme.Title>
        {c?.done ? (
          <p className="inv-script mt-6 text-center text-[11cqw]">Just married!</p>
        ) : (
          <div className="mt-8 grid grid-cols-4 gap-[2.5cqw]">
            {(c?.parts ?? [{ label: "Days" }, { label: "Hours" }, { label: "Minutes" }, { label: "Seconds" }]).map((p) => (
              <div key={p.label} className={`${theme.ui.tile} flex aspect-[4/5] flex-col items-center justify-center`}>
                <span className="inv-serif text-[9cqw] leading-none tabular-nums">
                  {"value" in p ? String(p.value).padStart(2, "0") : "--"}
                </span>
                <span className="inv-label mt-[2cqw] text-[2.2cqw] opacity-70">{p.label}</span>
              </div>
            ))}
          </div>
        )}
        <p className={`mt-6 text-center text-[3.6cqw] ${theme.ui.muted}`}>{longDate(invite.date)} · {invite.city}</p>
      </Reveal>
    </section>
  );
}

/* ───────── Event actions ───────── */

export function EventActions({ event, invite, theme }: { event: InviteEvent; invite: Invite; theme: InviteTheme }) {
  const [a, b] = couple(invite);
  return (
    <div data-event-actions className="mt-[5cqw] flex flex-wrap justify-center gap-[2.5cqw]">
      <a href={directionsLink(event, invite.city)} target="_blank" rel="noreferrer" className={theme.ui.button}>
        <PinIcon /> Directions
      </a>
      <a
        href={calendarLink(`${event.name} · ${a.first} & ${b.first}`, event.start, event.end, placeOf(event, invite.city))}
        target="_blank"
        rel="noreferrer"
        className={theme.ui.ghost}
      >
        <CalIcon /> Save date
      </a>
    </div>
  );
}

/* ───────── Story ───────── */

export function Story({ invite, theme }: { invite: Invite; theme: InviteTheme }) {
  if (!invite.story?.length) return null;
  return (
    <section className={theme.ui.section}>
      <Reveal>
        <theme.Title kicker="Our story">How it began</theme.Title>
      </Reveal>
      <ol className="relative mx-auto mt-10 max-w-[80cqw]">
        <span className="absolute top-2 bottom-2 left-[6cqw] w-px bg-current opacity-25" />
        {invite.story.map((s, i) => (
          <Reveal key={s.year} delay={i * 0.1}>
            <li className="relative mb-[7cqw] pl-[15cqw]">
              <span
                className="absolute top-[0.4cqw] left-[6cqw] grid size-[4cqw] -translate-x-1/2 place-items-center rounded-full"
                style={{ background: theme.accent }}
              />
              <p className="inv-label text-[2.6cqw] opacity-70">{s.year}</p>
              <p className="inv-serif mt-1 text-[5.4cqw] leading-tight">{s.title}</p>
              <p className={`mt-1 text-[3.6cqw] leading-relaxed ${theme.ui.muted}`}>{s.text}</p>
            </li>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}

/* ───────── Gallery ───────── */

const tilts = [-3, 2.5, -1.5, 3, -2.5, 1.5, -3, 2];

/** "Our moments": the couple's photos as a swipeable row of polaroids, tap to view full screen. */
export function Gallery({ invite, theme }: { invite: Invite; theme: InviteTheme }) {
  const photos = invite.gallery ?? [];
  const [open, setOpen] = useState<number | null>(null);
  const [active, setActive] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  if (!photos.length) return null;

  const onScroll = () => {
    const el = track.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    if (!card) return;
    setActive(Math.round(el.scrollLeft / (card.offsetWidth + 16)));
  };
  const step = (d: number) => setOpen((i) => (i === null ? i : (i + d + photos.length) % photos.length));

  return (
    <section className={`${theme.ui.section} !px-0`}>
      <Reveal className="px-[12cqw]">
        <theme.Title kicker="Our moments">Before the big day</theme.Title>
      </Reveal>
      <Reveal delay={0.1}>
        <div
          ref={track}
          onScroll={onScroll}
          className="no-scrollbar mt-[8cqw] flex snap-x snap-mandatory gap-4 overflow-x-auto px-[19cqw] pt-[3cqw] pb-[6cqw]"
        >
          {photos.map((src, i) => (
            <motion.button
              key={src}
              type="button"
              onClick={() => setOpen(i)}
              className="w-[62cqw] shrink-0 snap-center rounded-[1.5cqw] bg-white p-[2.4cqw] pb-[9cqw] text-left shadow-[0_3cqw_8cqw_-3cqw_rgba(40,20,10,.45)]"
              style={{ rotate: `${tilts[i % tilts.length]}deg` }}
              whileTap={{ scale: 0.97 }}
              aria-label={`Open photo ${i + 1} of ${photos.length}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" loading="lazy" className="aspect-[4/5] w-full rounded-[0.6cqw] object-cover" />
            </motion.button>
          ))}
        </div>
        <div className="flex justify-center gap-[1.5cqw]" aria-hidden>
          {photos.map((_, i) => (
            <span key={i} className={`h-[1.4cqw] rounded-full bg-current transition-all ${i === active ? "w-[5cqw] opacity-80" : "w-[1.4cqw] opacity-25"}`} />
          ))}
        </div>
      </Reveal>

      <AnimatePresence>
        {open !== null && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Photo viewer"
          >
            <motion.img
              key={photos[open]}
              src={photos[open]}
              alt=""
              className="max-h-[82vh] max-w-full rounded-lg object-contain shadow-2xl"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(_, info) => Math.abs(info.offset.x) > 60 && step(info.offset.x < 0 ? 1 : -1)}
              onClick={(e) => e.stopPropagation()}
            />
            {photos.length > 1 &&
              ([-1, 1] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  aria-label={d < 0 ? "Previous photo" : "Next photo"}
                  onClick={(e) => {
                    e.stopPropagation();
                    step(d);
                  }}
                  className={`absolute top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-xl text-white ${d < 0 ? "left-3" : "right-3"}`}
                >
                  {d < 0 ? "‹" : "›"}
                </button>
              ))}
            <p className="absolute bottom-6 text-sm text-white/70">
              {open + 1} / {photos.length} · tap outside to close
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ───────── RSVP ───────── */

export function Rsvp({ invite, theme }: { invite: Invite; theme: InviteTheme }) {
  const [name, setName] = useState("");
  const [guests, setGuests] = useState(2);
  const [attending, setAttending] = useState<"yes" | "no">("yes");
  const [events, setEvents] = useState<string[]>(() => invite.events.map((e) => e.name));
  const [note, setNote] = useState("");
  const [demoSent, setDemoSent] = useState(false);
  const [a, b] = couple(invite);
  // Sample invites on the website don't belong to a real couple, so nothing is sent from them.
  const isDemo = demoSlugs.has(invite.slug);

  const toggle = (e: string) => setEvents((cur) => (cur.includes(e) ? cur.filter((x) => x !== e) : [...cur, e]));

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (isDemo) {
      setDemoSent(true);
      return;
    }
    const lines =
      attending === "yes"
        ? [
            `Namaste! RSVP for ${a.first} & ${b.first}'s wedding 🌸`,
            `Name: ${name}`,
            `Guests: ${guests}`,
            `Attending: ${events.join(", ") || "—"}`,
          ]
        : [`Namaste! RSVP for ${a.first} & ${b.first}'s wedding`, `Name: ${name}`, `Sadly we can't make it, but sending all our love 🙏`];
    if (note.trim()) lines.push(`Note: ${note.trim()}`);
    window.open(`https://wa.me/${invite.rsvp.phone}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank");
  };

  return (
    <section className={theme.ui.section} id="rsvp">
      <Reveal>
        <theme.Title kicker="RSVP">Will you join us?</theme.Title>
        <p className={`mt-3 text-center text-[3.6cqw] ${theme.ui.muted}`}>
          Kindly reply by {longDate(invite.rsvp.by).replace(/^\w+, /, "")}
        </p>
      </Reveal>
      <Reveal delay={0.1}>
        <form onSubmit={submit} className={`${theme.ui.card} mt-8 space-y-[5cqw] p-[6cqw]`}>
          <div className="grid grid-cols-2 gap-[2.5cqw]">
            {(["yes", "no"] as const).map((v) => (
              <button
                type="button"
                key={v}
                onClick={() => setAttending(v)}
                className={`${attending === v ? theme.ui.chipOn : theme.ui.chip} py-[3cqw] text-[3.6cqw]`}
              >
                {v === "yes" ? "Joyfully accept" : "Regretfully decline"}
              </button>
            ))}
          </div>
          <label className="block">
            <span className="inv-label text-[2.5cqw] opacity-70">Your name</span>
            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sharma family" className={`${theme.ui.input} mt-2`} />
          </label>
          {attending === "yes" && (
            <>
              <div className="flex items-center justify-between">
                <span className="inv-label text-[2.5cqw] opacity-70">Number of guests</span>
                <div className="flex items-center gap-[3cqw]">
                  <button type="button" aria-label="Fewer guests" onClick={() => setGuests((g) => Math.max(1, g - 1))} className={`${theme.ui.chip} size-[9cqw] text-[5cqw] leading-none`}>
                    −
                  </button>
                  <span className="inv-serif w-[6cqw] text-center text-[6cqw] tabular-nums">{guests}</span>
                  <button type="button" aria-label="More guests" onClick={() => setGuests((g) => Math.min(12, g + 1))} className={`${theme.ui.chip} size-[9cqw] text-[5cqw] leading-none`}>
                    +
                  </button>
                </div>
              </div>
              <div>
                <span className="inv-label text-[2.5cqw] opacity-70">Celebrating with us at</span>
                <div className="mt-2 flex flex-wrap gap-[2cqw]">
                  {invite.events.map((e) => (
                    <button
                      type="button"
                      key={e.name}
                      onClick={() => toggle(e.name)}
                      className={`${events.includes(e.name) ? theme.ui.chipOn : theme.ui.chip} px-[3.5cqw] py-[1.8cqw] text-[3.2cqw]`}
                    >
                      {e.name}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
          <label className="block">
            <span className="inv-label text-[2.5cqw] opacity-70">A note for the couple</span>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Optional" className={`${theme.ui.input} mt-2 resize-none`} />
          </label>
          <button type="submit" className={`${theme.ui.button} w-full justify-center py-[3.6cqw] text-[3.8cqw]`}>
            <WaIcon /> Send RSVP on WhatsApp
          </button>
          <AnimatePresence>
            {demoSent && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                role="status"
                className="rounded-[3cqw] bg-black/5 px-[4cqw] py-[3cqw] text-center text-[3.4cqw] leading-snug"
              >
                This is a demo invitation, so nothing was sent. On your own invite, guests&rsquo; replies arrive straight on your WhatsApp. 💌
              </motion.p>
            )}
          </AnimatePresence>
        </form>
      </Reveal>
    </section>
  );
}

/* ───────── Music toggle ───────── */

export function MusicToggle({ playing, onToggle, className }: { playing: boolean; onToggle: () => void; className: string }) {
  return (
    <button onClick={onToggle} aria-label={playing ? "Pause music" : "Play music"} className={className}>
      {playing ? (
        <span className="flex h-4 items-end gap-[2px]">
          {[0, 1, 2, 3].map((i) => (
            <motion.span
              key={i}
              className="w-[3px] rounded-full bg-current"
              animate={{ height: ["30%", "100%", "45%", "80%", "30%"] }}
              transition={{ duration: 1.1 + i * 0.15, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </span>
      ) : (
        <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
          <path d="M9 18V6l11-2v12" stroke="currentColor" strokeWidth="2" fill="none" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="17" cy="16" r="3" />
        </svg>
      )}
    </button>
  );
}

/* ───────── Icons ───────── */

export const PinIcon = () => (
  <svg viewBox="0 0 24 24" className="size-[1.1em]" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
    <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </svg>
);
export const CalIcon = () => (
  <svg viewBox="0 0 24 24" className="size-[1.1em]" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </svg>
);
export const WaIcon = () => (
  <svg viewBox="0 0 24 24" className="size-[1.2em]" fill="currentColor" aria-hidden>
    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.1 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.4-.3Z" />
  </svg>
);
