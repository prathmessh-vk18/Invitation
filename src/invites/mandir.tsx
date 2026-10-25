"use client";

import Image from "next/image";
import { AnimatePresence, motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { Invite } from "@/data/invites";
import { fmtDate, monthName, time, weekday, yearNum } from "@/lib/format";
import { makeIllustrated } from "./illustrated";
import { useOpened } from "./opened";
import { couple, EventActions, Reveal } from "./shared";
import type { InviteTheme } from "./types";

/**
 * Mandir: carved temple doors open onto a temple at sunrise, with the names in the sky under a
 * floral arch and hanging bells. The rest scrolls inside a fixed cusped-arch frame, with arch-shaped
 * function cards and photos that gather into an arc. Art: public/art/illus/mandir-*.
 */

const art = "/art/illus";
const c = {
  paper: "#f7ebd5",
  card: "#fdf6ec",
  ink: "#5b2615",
  name: "#a8573a",
  gold: "#b9853f",
  soft: "#86553f",
};
const HAND = "var(--font-alex-brush), cursive";
const ease = [0.22, 1, 0.36, 1] as const;

// Doors, seal, fixed frame, backdrop and closing come from the shared illustrated engine.
const base = makeIllustrated({
  id: "mandir",
  images: { opening: `${art}/mandir-gate.jpg`, hero: `${art}/mandir-temple.jpg`, card: `${art}/mandir-card.jpg` },
  opening: "doors",
  heroTextTop: 8,
  frame: { top: 16, bottom: 22, side: 6 },
  colors: { ink: c.ink, accent: c.name, soft: c.soft, paper: c.paper, onAccent: "#fff" },
  fonts: { script: "var(--font-bodoni), serif", serif: "var(--font-cormorant), serif", label: "var(--font-marcellus), serif" },
});

/* ───────── Ornaments ───────── */

/** A fine gold line with a half sun of rays below it, the design's divider. */
function Sunburst({ className }: { className?: string }) {
  const rays = Array.from({ length: 11 }, (_, i) => {
    const a = (Math.PI * (i + 1)) / 12;
    const len = i % 2 ? 9 : 15;
    return <line key={i} x1={60} y1={3} x2={60 + Math.cos(a) * len} y2={3 + Math.sin(a) * len} />;
  });
  return (
    <svg viewBox="0 0 120 20" className={className} fill="none" stroke={c.gold} strokeWidth={0.7} strokeLinecap="round" aria-hidden>
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
function ArchCard({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      <svg viewBox="0 -1 100 31" className="block w-full" preserveAspectRatio="none" aria-hidden>
        <path d={`M0.5,30 L0.5,20 ${CUSP} L99.5,30 Z`} fill={c.card} />
        <path d={`M0.5,30 L0.5,20 ${CUSP} L99.5,30`} fill="none" stroke={c.gold} strokeWidth={1} vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="-mt-px rounded-b-[3cqw] border-x border-b" style={{ background: c.card, borderColor: c.gold }}>
        {children}
      </div>
    </div>
  );
}

/* ───────── Hero: names in the sky over the temple ───────── */

function Hero({ invite }: { invite: Invite }) {
  const opened = useOpened();
  const [a, b] = couple(invite);
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.05]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const textFade = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const show = (delay: number) => ({ initial: { opacity: 0, y: 14 }, animate: opened ? { opacity: 1, y: 0 } : {}, transition: { duration: 1, delay, ease } });
  return (
    <section ref={ref} className="relative w-full overflow-hidden" style={{ aspectRatio: "864 / 1536" }}>
      <motion.div className="absolute inset-0" style={{ y: imgY, scale: imgScale }}>
        <Image src={`${art}/mandir-temple.jpg`} alt={`A temple at sunrise for ${a.first} and ${b.first}'s wedding`} fill priority sizes="(max-width: 480px) 100vw, 480px" className="object-cover" />
      </motion.div>
      <motion.div className="absolute inset-x-[14%] top-[8%] flex flex-col items-center text-center [text-shadow:0_0_16px_rgba(255,240,228,.9)]" style={{ y: textY, opacity: textFade }}>
        <motion.p {...show(0.3)} className="text-[3.4cqw]" style={{ color: c.name, fontFamily: "var(--font-deva)" }}>
          {invite.invocation}
        </motion.p>
        <motion.p {...show(0.45)} className="inv-label mt-[2.5cqw] text-[2.5cqw]" style={{ color: c.ink }}>
          The wedding of
        </motion.p>
        <motion.h1 {...show(0.7)} className="mt-[1.5cqw] flex flex-col items-center">
          <span className="inv-script text-[15cqw] leading-[0.95]" style={{ color: c.name }}>
            {a.first}
          </span>
          <span className="-my-[1cqw] text-[8.5cqw] leading-none" style={{ color: c.ink, fontFamily: HAND }}>
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
      </motion.div>
      <motion.button
        type="button"
        onClick={() => ref.current?.nextElementSibling?.scrollIntoView({ behavior: "smooth", block: "start" })}
        className="absolute bottom-[3%] left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1 px-[6cqw] py-[2cqw] text-white [text-shadow:0_1px_8px_rgba(0,0,0,.55)]"
        initial={{ opacity: 0 }}
        animate={opened ? { opacity: 1, y: [0, 6, 0] } : {}}
        transition={{ opacity: { delay: 1.8, duration: 0.6 }, y: { delay: 1.8, duration: 1.8, repeat: Infinity } }}
        style={{ opacity: textFade }}
        aria-label="Scroll to the invitation"
      >
        <span className="inv-label text-[2.3cqw]">Scroll</span>
        <svg viewBox="0 0 24 24" className="size-[4cqw]" fill="none" stroke="currentColor" strokeWidth={1.6}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </motion.button>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[10%]" style={{ backgroundImage: `linear-gradient(to bottom, transparent, ${c.paper})` }} />
    </section>
  );
}

/* ───────── The invitation: each name with their parents above it ───────── */

function Blessing({ invite }: { invite: Invite }) {
  const [a, b] = couple(invite);
  const person = (p: typeof a, delay: number) => (
    <Reveal delay={delay}>
      {p.parents && (
        <p className="mx-auto max-w-[62cqw] text-[3.3cqw] leading-snug font-semibold" style={{ color: c.name }}>
          {p.parents}
        </p>
      )}
      <p className="inv-script mt-[2cqw] text-[14cqw] leading-[0.95]" style={{ color: c.name }}>
        {p.full || p.first}
      </p>
    </Reveal>
  );
  return (
    <section className="relative px-[13cqw] pt-[22cqw] pb-[12cqw] text-center">
      <Reveal>
        <Divider />
        <p className="inv-label mt-[4cqw] text-[2.7cqw] leading-relaxed" style={{ color: c.gold }}>
          {invite.hosts || "Together with their families"}
        </p>
        <p className="inv-serif mt-[3cqw] text-[4.6cqw] leading-snug" style={{ color: c.ink }}>
          {invite.message}
        </p>
      </Reveal>
      <div className="mt-[8cqw]">
        {person(a, 0.1)}
        <p className="my-[3cqw] text-[8cqw] leading-none" style={{ color: c.ink, fontFamily: HAND }}>
          and
        </p>
        {person(b, 0.2)}
      </div>
      {invite.invocationMeaning && (
        <Reveal delay={0.25}>
          <p className="inv-serif mt-[7cqw] text-[3.6cqw] italic" style={{ color: c.soft }}>
            {invite.invocationMeaning}
          </p>
        </Reveal>
      )}
    </section>
  );
}

/* ───────── Functions on arch cards ───────── */

function Events({ invite }: { invite: Invite }) {
  return (
    <section className="relative px-[11cqw] py-[12cqw]">
      <Reveal>
        <Title kicker="Mark your calendar">On the following events</Title>
      </Reveal>
      <ol className="mt-[8cqw] space-y-[7cqw]">
        {invite.events.map((e, i) => (
          <motion.li key={e.name + i} initial={{ opacity: 0, y: 30, scale: 0.96 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.9, ease }}>
            <ArchCard>
              <div className="-mt-[9cqw] px-[5cqw] pb-[6cqw] text-center">
                <Sunburst className="mx-auto block w-[16cqw]" />
                <h3 className="inv-script mt-[2cqw] text-[8.5cqw] leading-none" style={{ color: c.name }}>
                  {e.name}
                </h3>
                <p className="inv-label mt-[2.5cqw] text-[2.5cqw]" style={{ color: c.ink }}>
                  {weekday(e.start)} · {fmtDate(e.start, { day: "numeric", month: "short", year: "numeric" })}
                </p>
                <p className="inv-serif mt-[1cqw] text-[4cqw] italic" style={{ color: c.soft }}>
                  {time(e.start)} onwards
                </p>
                <p className="inv-serif mt-[3cqw] text-[4.4cqw] leading-tight" style={{ color: c.ink }}>
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
    </section>
  );
}

/* ───────── Photos: an arc that gathers as you scroll ───────── */

function ArcPhoto({ src, i, n, p, onOpen }: { src: string; i: number; n: number; p: MotionValue<number>; onOpen: () => void }) {
  const angle = n > 1 ? -70 + (140 * i) / (n - 1) : 0;
  const r = 31;
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
      className="absolute top-1/2 left-1/2 -mt-[9.5cqw] -ml-[9.5cqw] size-[19cqw] overflow-hidden rounded-[2.5cqw] border-[0.9cqw] border-white shadow-[0_10px_24px_-10px_rgba(60,25,10,.55)]"
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
  return (
    <section className="relative px-[11cqw] pt-[6cqw] pb-[12cqw]">
      <Reveal>
        <Title kicker="Our moments">Before the big day</Title>
      </Reveal>
      <div ref={ref} className="relative mt-[4cqw] h-[80cqw] w-full">
        <div className="absolute inset-x-0 top-[60%]">
          {photos.map((src, i) => (
            <ArcPhoto key={src + i} src={src} i={i} n={photos.length} p={scrollYProgress} onOpen={() => setOpen(i)} />
          ))}
        </div>
        <p className="inv-script absolute inset-x-0 top-[64%] text-center text-[7.5cqw] leading-[1.1]" style={{ color: c.ink }}>
          Almost time
          <br />
          to celebrate
        </p>
      </div>
      {photos[0] && (
        <Reveal>
          <button type="button" onClick={() => setOpen(0)} className="relative mx-auto block w-full overflow-hidden" style={{ aspectRatio: "4 / 5", borderRadius: "39cqw 39cqw 3cqw 3cqw" }} aria-label="Open photo 1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photos[0]} alt="" className="h-full w-full object-cover" />
            <span className="pointer-events-none absolute inset-[1.6cqw] border" style={{ borderColor: "rgba(255,246,238,.75)", borderRadius: "37cqw 37cqw 2cqw 2cqw" }} />
          </button>
        </Reveal>
      )}
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

export const mandir: InviteTheme = {
  ...base,
  id: "mandir",
  vars: { ...base.vars, "--inv-accent": c.name } as CSSProperties,
  accent: c.name,
  Hero,
  Blessing,
  Events,
  Gallery: Moments,
  Divider,
  Title,
};
