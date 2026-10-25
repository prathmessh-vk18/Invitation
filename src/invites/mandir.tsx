"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { site } from "@/config/site";
import type { Invite } from "@/data/invites";
import { directionsLink, fmtDate, monthName, time, weekday, yearNum } from "@/lib/format";
import { makeIllustrated } from "./illustrated";
import { useOpened, usePreview } from "./opened";
import { couple, EventActions, Reveal } from "./shared";
import type { InviteTheme } from "./types";

/**
 * Mandir: one long painted journey. Guests open the temple doors, then scroll down a carpet towards
 * the temple while the camera moves in and a paper arch rises to become the invitation card.
 * Scenes (garden, mandap, lotus pond) carry the sections that follow. Art: public/art/illus/mandir-*.
 */

const art = "/art/illus";
const c = {
  paper: "#fbeada",
  card: "#fff6ee",
  ink: "#5b2615",
  name: "#a8573a",
  gold: "#b9853f",
  soft: "#86553f",
};
const HAND = "var(--font-alex-brush), cursive";
const ease = [0.22, 1, 0.36, 1] as const;

// The temple doors and seal come from the shared illustrated engine.
const base = makeIllustrated({
  id: "mandir",
  images: { opening: `${art}/mandir-doors.jpg`, hero: `${art}/mandir-hero.jpg`, card: `${art}/mandir-garden.jpg` },
  opening: "doors",
  heroTextTop: 7,
  frame: { top: 0, bottom: 0, side: 0 },
  colors: { ink: c.ink, accent: c.name, soft: c.soft, paper: c.paper, onAccent: "#fff" },
  fonts: { script: "var(--font-bodoni), serif", serif: "var(--font-cormorant), serif", label: "var(--font-marcellus), serif" },
});

function Art({ src, alt = "", pos, priority }: { src: string; alt?: string; pos?: string; priority?: boolean }) {
  return <Image src={src} alt={alt} fill priority={priority} sizes="(max-width: 480px) 100vw, 480px" className="object-cover" style={{ objectPosition: pos ?? "50% 50%" }} />;
}

/* ───────── Ornaments ───────── */

/** A fine gold line with a half sun of rays below it, the design's divider. */
function Sunburst({ className, style }: { className?: string; style?: CSSProperties }) {
  const rays = Array.from({ length: 11 }, (_, i) => {
    const a = (Math.PI * (i + 1)) / 12;
    const len = i % 2 ? 9 : 15;
    return <line key={i} x1={60} y1={3} x2={60 + Math.cos(a) * len} y2={3 + Math.sin(a) * len} />;
  });
  return (
    <svg viewBox="0 0 120 20" className={className} style={style} fill="none" stroke={c.gold} strokeWidth={0.7} strokeLinecap="round" aria-hidden>
      <line x1={4} y1={3} x2={116} y2={3} strokeOpacity={0.7} />
      {rays}
    </svg>
  );
}

function Divider({ className }: { className?: string }) {
  return <Sunburst className={`mx-auto block w-[30cqw] ${className ?? ""}`} />;
}

function Title({ kicker, children }: { kicker?: string; children: ReactNode }) {
  return (
    <div className="text-center">
      {kicker && (
        <p className="inv-label text-[2.6cqw]" style={{ color: c.gold }}>
          {kicker}
        </p>
      )}
      <h2 className="inv-script mt-[1.5cqw] text-[8.5cqw] leading-[1.05]" style={{ color: c.ink }}>
        {children}
      </h2>
      <Divider className="mt-[2.5cqw]" />
    </div>
  );
}

// A cusped (scalloped) temple arch across the top of a 100-wide box, 30 high.
const CUSP = "Q0.5,14 6,13 Q9,8 15,8 Q18,3.5 25,4 Q30,1 37,2 Q42,0 50,0.5 Q58,0 63,2 Q70,1 75,4 Q82,3.5 85,8 Q91,8 94,13 Q99.5,14 99.5,20";

/** A card whose top is a scalloped temple arch, with a gold outline. */
function ArchCard({ children, className, inset }: { children: ReactNode; className?: string; inset?: boolean }) {
  return (
    <div className={`relative ${className ?? ""}`}>
      <svg viewBox="0 -1 100 31" className="block w-full" preserveAspectRatio="none" aria-hidden>
        <path d={`M0.5,30 L0.5,20 ${CUSP} L99.5,30 Z`} fill={c.card} />
        <path d={`M0.5,30 L0.5,20 ${CUSP} L99.5,30`} fill="none" stroke={c.gold} strokeWidth={1} vectorEffect="non-scaling-stroke" />
        {inset && <path d={`M3,30 L3,21 ${CUSP.replace(/Q0\.5,14 6,13/, "Q3,16 8,15")}`} fill="none" stroke={c.gold} strokeOpacity={0.45} strokeWidth={0.6} vectorEffect="non-scaling-stroke" transform="translate(2.5 3) scale(0.95 0.9)" />}
      </svg>
      <div className="-mt-px rounded-b-[3cqw] border-x border-b" style={{ background: c.card, borderColor: c.gold }}>
        {children}
      </div>
    </div>
  );
}

/* ───────── Hero: the journey to the temple ───────── */

function Names({ invite, show }: { invite: Invite; show: (d: number) => object }) {
  const [a, b] = couple(invite);
  return (
    <div className="flex flex-col items-center text-center [text-shadow:0_0_18px_rgba(255,240,225,.85)]">
      <motion.p {...show(0.3)} className="text-[3.4cqw]" style={{ color: c.name, fontFamily: "var(--font-deva)" }}>
        {invite.invocation}
      </motion.p>
      <motion.p {...show(0.45)} className="inv-label mt-[2cqw] text-[2.5cqw]" style={{ color: c.ink }}>
        The wedding of
      </motion.p>
      <motion.h1 {...show(0.7)} className="mt-[1cqw] flex flex-col items-center">
        <span className="inv-script text-[15cqw] leading-[0.95]" style={{ color: c.name }}>
          {a.first}
        </span>
        <span className="-my-[1.5cqw] text-[9cqw] leading-none" style={{ color: c.ink, fontFamily: HAND }}>
          weds
        </span>
        <span className="inv-script text-[15cqw] leading-[0.95]" style={{ color: c.name }}>
          {b.first}
        </span>
      </motion.h1>
      <motion.p {...show(1)} className="inv-label mt-[3cqw] text-[2.6cqw]" style={{ color: c.ink }}>
        {weekday(invite.date)} · {fmtDate(invite.date, { day: "numeric" })} {monthName(invite.date)} {yearNum(invite.date)}
      </motion.p>
      <motion.p {...show(1.15)} className="inv-serif mt-[1.5cqw] text-[4cqw] italic" style={{ color: c.ink }}>
        {invite.city}
      </motion.p>
    </div>
  );
}

const showAfterOpen = (opened: boolean) => (delay: number) => ({ initial: { opacity: 0, y: 14 }, animate: opened ? { opacity: 1, y: 0 } : {}, transition: { duration: 1, delay, ease } });

function Hero({ invite }: { invite: Invite }) {
  const opened = useOpened();
  if (usePreview()) {
    return (
      <section className="relative h-full w-full overflow-hidden">
        <Art src={`${art}/mandir-hero.jpg`} priority />
        <div className="absolute inset-x-[8%] top-[3.5%]">
          <Names invite={invite} show={showAfterOpen(opened)} />
        </div>
      </section>
    );
  }
  return <Journey invite={invite} />;
}

function Journey({ invite }: { invite: Invite }) {
  const opened = useOpened();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  // The camera walks up the carpet towards the temple door…
  const imgScale = useTransform(p, [0, 0.75], [1, 1.8]);
  // …the names drift up, grow and fade into the sky…
  const nameScale = useTransform(p, [0, 0.3], [1, 1.4]);
  const nameY = useTransform(p, [0, 0.3], ["0%", "-30%"]);
  const nameOpacity = useTransform(p, [0.04, 0.26], [1, 0]);
  // …and a paper arch rises from the carpet and fills the screen: the invitation card.
  const archScale = useTransform(p, [0.34, 0.86], [0.12, 4.2]);
  const archOpacity = useTransform(p, [0.32, 0.38], [0, 1]);
  const cueOpacity = useTransform(p, [0, 0.06], [1, 0]);
  const show = showAfterOpen(opened);

  return (
    <section ref={ref} className="relative" style={{ height: "215svh" }}>
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        <motion.div className="absolute inset-0" style={{ scale: imgScale, transformOrigin: "50% 60%" }}>
          <Art src={`${art}/mandir-hero.jpg`} alt={`A temple at sunrise for ${couple(invite)[0].first} and ${couple(invite)[1].first}'s wedding`} priority />
        </motion.div>
        <motion.div className="absolute inset-x-[8%] top-[3.5%]" style={{ scale: nameScale, y: nameY, opacity: nameOpacity }}>
          <Names invite={invite} show={show} />
        </motion.div>
        <motion.div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center" style={{ opacity: archOpacity }}>
          <motion.svg viewBox="0 -1 100 131" className="w-[64%]" style={{ scale: archScale, transformOrigin: "50% 100%" }} aria-hidden>
            <path d={`M0.5,130 L0.5,20 ${CUSP} L99.5,130 Z`} fill={c.paper} />
            <path d={`M0.5,130 L0.5,20 ${CUSP} L99.5,130`} fill="none" stroke={c.gold} strokeWidth={0.5} />
          </motion.svg>
        </motion.div>
        <motion.button
          type="button"
          onClick={() => window.scrollBy({ top: window.innerHeight * 1.6, behavior: "smooth" })}
          className="absolute bottom-[4%] left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1 px-[6cqw] py-[2cqw] text-white [text-shadow:0_1px_8px_rgba(0,0,0,.55)]"
          initial={{ opacity: 0 }}
          animate={opened ? { opacity: 1, y: [0, 6, 0] } : {}}
          transition={{ opacity: { delay: 1.8, duration: 0.6 }, y: { delay: 1.8, duration: 1.8, repeat: Infinity } }}
          style={{ opacity: cueOpacity }}
          aria-label="Scroll to the invitation"
        >
          <span className="inv-label text-[2.3cqw]">Scroll to walk in</span>
          <svg viewBox="0 0 24 24" className="size-[4cqw]" fill="none" stroke="currentColor" strokeWidth={1.6}>
            <path d="M6 9l6 6 6-6" />
          </svg>
        </motion.button>
      </div>
    </section>
  );
}

/* ───────── The invitation card ───────── */

function Blessing({ invite }: { invite: Invite }) {
  const [a, b] = couple(invite);
  return (
    // Starts while the hero is still pinned, so the card rises into the growing arch.
    <section className="relative z-10 -mt-[45svh] px-[7cqw] pb-[12cqw]">
      <ArchCard inset>
        <div className="px-[8cqw] pt-[2cqw] pb-[10cqw] text-center">
          <Reveal>
            <Divider />
            <p className="inv-label mt-[4cqw] text-[2.7cqw] leading-relaxed" style={{ color: c.name }}>
              {invite.hosts || "Together with their families"}
            </p>
            <p className="inv-serif mt-[3cqw] text-[4.6cqw] leading-snug" style={{ color: c.ink }}>
              {invite.message}
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="inv-script mt-[7cqw] text-[14cqw] leading-[0.95]" style={{ color: c.name }}>
              {a.first}
            </p>
            <p className="text-[8cqw] leading-none" style={{ color: c.ink, fontFamily: HAND }}>
              and
            </p>
            <p className="inv-script text-[14cqw] leading-[0.95]" style={{ color: c.name }}>
              {b.first}
            </p>
          </Reveal>
          {invite.invocationMeaning && (
            <Reveal delay={0.25}>
              <p className="inv-serif mt-[6cqw] text-[3.6cqw] italic" style={{ color: c.soft }}>
                {invite.invocationMeaning}
              </p>
            </Reveal>
          )}
        </div>
      </ArchCard>
    </section>
  );
}

/* ───────── Functions: the garden and the timeline ───────── */

function Events({ invite }: { invite: Invite }) {
  return (
    <section className="relative">
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "864 / 1280" }}>
        <Art src={`${art}/mandir-garden.jpg`} pos="50% 100%" />
        <div className="absolute inset-x-0 top-[10%] px-[10cqw] text-center">
          <Reveal>
            <p className="inv-serif text-[6.5cqw] italic" style={{ color: c.ink }}>
              On the following events
            </p>
            <motion.svg viewBox="0 0 24 24" className="mx-auto mt-[2cqw] size-[6cqw]" fill="none" stroke={c.gold} strokeWidth={1.2} animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity }}>
              <path d="M12 4v15M6 13l6 6 6-6" />
            </motion.svg>
          </Reveal>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-[22%]" style={{ background: `linear-gradient(to bottom, transparent, ${c.paper})` }} />
      </div>
      <div className="relative -mt-[6cqw] px-[7cqw] pb-[12cqw]">
        <Reveal>
          <Title kicker="Mark your calendar">Wedding timeline</Title>
        </Reveal>
        <ol className="mt-[8cqw] space-y-[7cqw]">
          {invite.events.map((e, i) => (
            <motion.li
              key={e.name + i}
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.9, ease }}
            >
              <ArchCard>
                <div className="-mt-[10cqw] px-[6cqw] pb-[6cqw] text-center">
                  <Sunburst className="mx-auto block w-[18cqw]" />
                  <h3 className="inv-script mt-[2cqw] text-[9cqw] leading-none" style={{ color: c.name }}>
                    {e.name}
                  </h3>
                  <p className="inv-label mt-[2.5cqw] text-[2.6cqw]" style={{ color: c.ink }}>
                    {weekday(e.start)} · {fmtDate(e.start, { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                  <p className="inv-serif mt-[1cqw] text-[4cqw] italic" style={{ color: c.soft }}>
                    {time(e.start)} onwards
                  </p>
                  <p className="inv-serif mt-[3cqw] text-[4.6cqw] leading-tight" style={{ color: c.ink }}>
                    {e.venue}
                  </p>
                  {e.address && (
                    <p className="mt-[1cqw] text-[3cqw]" style={{ color: c.soft }}>
                      {e.address}
                    </p>
                  )}
                  {(e.dress || e.note) && (
                    <p className="inv-serif mt-[2cqw] text-[3.6cqw] italic" style={{ color: c.name }}>
                      {[e.dress && `Dress: ${e.dress}`, e.note].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  <EventActions event={e} invite={invite} theme={mandir} />
                </div>
              </ArchCard>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ───────── The mandap: meet the bride and groom ───────── */

function Couple({ invite }: { invite: Invite }) {
  const [a, b] = couple(invite);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);
  const role = (p: typeof a) => (p === invite.bride ? "The bride" : "The groom");
  return (
    <section className="relative">
      <div ref={ref} className="relative w-full overflow-hidden" style={{ aspectRatio: "864 / 1250" }}>
        <motion.div className="absolute -inset-y-[6%] inset-x-0" style={{ y }}>
          <Art src={`${art}/mandir-mandap.jpg`} pos="50% 100%" />
        </motion.div>
        <div className="absolute inset-x-0 top-[9%] text-center">
          <Reveal>
            <p className="inv-serif text-[6.5cqw]" style={{ color: c.ink }}>
              Meet the
            </p>
            <p className="inv-script text-[10cqw] leading-none tracking-[0.02em] uppercase" style={{ color: c.ink }}>
              Bride &amp; Groom
            </p>
          </Reveal>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-[24%]" style={{ background: `linear-gradient(to bottom, transparent, ${c.paper})` }} />
      </div>
      <div className="relative -mt-[18cqw] px-[7cqw] pb-[12cqw]">
        <ArchCard inset>
          <div className="space-y-[7cqw] px-[8cqw] pt-[2cqw] pb-[10cqw] text-center">
            {[a, b].map((p, i) => (
              <Reveal key={role(p)} delay={0.1 * i}>
                {i > 0 && <Sunburst className="mx-auto mb-[6cqw] block w-[22cqw]" />}
                <p className="inv-label text-[2.6cqw]" style={{ color: c.gold }}>
                  {role(p)}
                </p>
                <p className="inv-script mt-[1.5cqw] text-[10cqw] leading-none" style={{ color: c.name }}>
                  {p.full || p.first}
                </p>
                {p.parents && (
                  <p className="inv-serif mt-[2cqw] text-[4cqw] italic" style={{ color: c.soft }}>
                    {p.parents}
                  </p>
                )}
              </Reveal>
            ))}
          </div>
        </ArchCard>
      </div>
    </section>
  );
}

/* ───────── Photos: an arc that gathers as you scroll ───────── */

function ArcPhoto({ src, i, n, p, onOpen }: { src: string; i: number; n: number; p: MotionValue<number>; onOpen: () => void }) {
  const angle = n > 1 ? -72 + (144 * i) / (n - 1) : 0;
  const r = 38;
  const rad = (angle * Math.PI) / 180;
  const x = useTransform(p, [0, 1], ["0cqw", `${(Math.sin(rad) * r).toFixed(1)}cqw`]);
  const y = useTransform(p, [0, 1], ["10cqw", `${(-Math.cos(rad) * r).toFixed(1)}cqw`]);
  const rotate = useTransform(p, [0, 1], [(i % 2 ? 1 : -1) * 6, angle * 0.4]);
  const scale = useTransform(p, [0, 1], [0.7, 1]);
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      aria-label={`Open photo ${i + 1}`}
      className="absolute top-1/2 left-1/2 -mt-[11cqw] -ml-[11cqw] size-[22cqw] overflow-hidden rounded-[2.5cqw] border-[1cqw] border-white shadow-[0_10px_24px_-10px_rgba(60,25,10,.55)]"
      style={{ x, y, rotate, scale, zIndex: i }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="h-full w-full object-cover" />
    </motion.button>
  );
}

function Moments({ invite }: { invite: Invite }) {
  const photos = (invite.gallery ?? []).slice(0, 7);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const [open, setOpen] = useState<number | null>(null);
  if (!photos.length) return null;
  return (
    <section className="relative pt-[6cqw] pb-[12cqw]">
      <Reveal>
        <Title kicker="Our moments">Before the big day</Title>
      </Reveal>
      <div ref={ref} className="relative mx-auto mt-[6cqw] h-[96cqw] w-full">
        <div className="absolute inset-x-0 top-[58%]">
          {photos.map((src, i) => (
            <ArcPhoto key={src + i} src={src} i={i} n={photos.length} p={scrollYProgress} onOpen={() => setOpen(i)} />
          ))}
        </div>
        <div className="absolute inset-x-0 top-[66%] text-center">
          <p className="inv-script text-[8cqw] leading-[1.1]" style={{ color: c.ink }}>
            Almost time
            <br />
            to celebrate
          </p>
        </div>
      </div>
      <Reveal>
        <button type="button" onClick={() => setOpen(0)} className="relative mx-[7cqw] block overflow-hidden" style={{ width: "86cqw", aspectRatio: "4 / 5", borderRadius: "43cqw 43cqw 3cqw 3cqw" }} aria-label="Open photo 1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photos[0]} alt="" className="h-full w-full object-cover" />
          <span className="pointer-events-none absolute inset-[1.6cqw] border" style={{ borderColor: "rgba(255,246,238,.7)", borderRadius: "41cqw 41cqw 2cqw 2cqw" }} />
        </button>
      </Reveal>
      <AnimatePresence>
        {open !== null && (
          <motion.div className="fixed inset-0 z-[70] grid place-items-center bg-black/85 p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(null)} role="dialog" aria-label="Photo">
            <motion.img src={photos[open]} alt="" className="max-h-[85svh] max-w-full rounded-lg" initial={{ scale: 0.92 }} animate={{ scale: 1 }} />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ───────── Venues, things to know, and the lotus pond ───────── */

function Closing({ invite }: { invite: Invite }) {
  const [a, b] = couple(invite);
  const [tab, setTab] = useState(0);
  const ev = invite.events[tab] ?? invite.events[0];
  return (
    <section className="relative">
      {ev && (
        <div className="px-[7cqw] pt-[8cqw]">
          <Reveal>
            <Title kicker="Venues">Looking forward to seeing you</Title>
          </Reveal>
          {invite.events.length > 1 && (
            <div className="mt-[6cqw] flex flex-wrap justify-center gap-[2cqw]" role="tablist">
              {invite.events.map((e, i) => (
                <button
                  key={e.name + i}
                  type="button"
                  role="tab"
                  aria-selected={i === tab}
                  onClick={() => setTab(i)}
                  className={`px-[4cqw] py-[1.8cqw] text-[3.2cqw] ${i === tab ? mandir.ui.chipOn : mandir.ui.chip}`}
                >
                  {e.name}
                </button>
              ))}
            </div>
          )}
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
              className="mt-[5cqw] rounded-[4cqw] border p-[6cqw] text-center"
              style={{ background: c.card, borderColor: `${c.gold}88` }}
            >
              <p className="inv-label text-[2.5cqw]" style={{ color: c.gold }}>
                {ev.name}
              </p>
              <p className="inv-script mt-[2cqw] text-[6.5cqw] leading-tight" style={{ color: c.ink }}>
                {ev.venue}
              </p>
              {ev.address && (
                <p className="mt-[1.5cqw] text-[3.2cqw]" style={{ color: c.soft }}>
                  {ev.address}
                </p>
              )}
              <a href={directionsLink(ev)} target="_blank" rel="noreferrer" className={`mt-[4cqw] ${mandir.ui.button}`}>
                <svg viewBox="0 0 24 24" className="size-[3.6cqw]" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11Z" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>
                Open in Google Maps
              </a>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {invite.hashtag && (
        <div className="px-[7cqw] pt-[14cqw] text-center">
          <Reveal>
            <Title kicker="Things to know">While you celebrate</Title>
            <div className="mx-auto mt-[6cqw] grid size-[14cqw] place-items-center rounded-full border" style={{ borderColor: c.gold, color: c.name }}>
              <span className="inv-script text-[7cqw] leading-none">#</span>
            </div>
            <p className="inv-label mt-[3cqw] text-[2.6cqw]" style={{ color: c.ink }}>
              Hashtag
            </p>
            <p className="inv-serif mx-auto mt-[2cqw] max-w-[60cqw] text-[4.2cqw] leading-snug" style={{ color: c.soft }}>
              While posting photos on social media, please use
            </p>
            <p className="inv-script mt-[2cqw] text-[7cqw]" style={{ color: c.name }}>
              {invite.hashtag}
            </p>
          </Reveal>
        </div>
      )}

      <div className="relative mt-[10cqw] w-full overflow-hidden" style={{ aspectRatio: "864 / 1536" }}>
        <Art src={`${art}/mandir-closing.jpg`} />
        <div className="absolute inset-x-[10%] top-[7%] text-center">
          <Reveal>
            <Divider />
            <p className="inv-serif mt-[4cqw] text-[5cqw] leading-snug italic" style={{ color: c.ink }}>
              {invite.closing}
            </p>
            <p className="inv-script mt-[4cqw] text-[11cqw] leading-none" style={{ color: c.name }}>
              {a.first} &amp; {b.first}
            </p>
            <Link href="/" className="inv-label mt-[6cqw] inline-block text-[2.2cqw] opacity-60" style={{ color: c.ink }}>
              Crafted with love by {site.name}
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Backdrop() {
  return <div className="pointer-events-none absolute inset-0" style={{ background: c.paper }} />;
}

export const mandir: InviteTheme = {
  ...base,
  id: "mandir",
  vars: { ...base.vars, "--inv-accent": c.name } as CSSProperties,
  accent: c.name,
  Hero,
  Blessing,
  Events,
  AfterEvents: Couple,
  Gallery: Moments,
  Closing,
  Backdrop,
  Frame: undefined,
  Divider,
  Title,
};
