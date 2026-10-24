"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BAGH, BananaLeaves, Chhatri, Elephant, GardenScene, GateLeaf, Kalash, PaintedArch, PaintedBand, Shrubs, Sparkles } from "@/art/bagh";
import { site } from "@/config/site";
import type { Invite } from "@/data/invites";
import { dayNum, fmtDate, monthName, time, weekday, yearNum } from "@/lib/format";
import { couple, EventActions, initials, Reveal } from "./shared";
import type { InviteTheme, OpeningProps } from "./types";

const ease = [0.22, 1, 0.36, 1] as const;

/** "31st Jan" */
function shortOrdinal(iso: string) {
  const d = Number(fmtDate(iso, { day: "numeric" }));
  const suffix = d % 10 === 1 && d !== 11 ? "st" : d % 10 === 2 && d !== 12 ? "nd" : d % 10 === 3 && d !== 13 ? "rd" : "th";
  return { d, suffix, m: fmtDate(iso, { month: "short" }) };
}

/** The 9:16 stage the arch is drawn on, resting on the bottom edge so the garden meets the screen's foot. */
function Stage({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`absolute bottom-0 left-0 w-full ${className ?? ""}`} style={{ aspectRatio: "360 / 640" }}>
      {children}
    </div>
  );
}

// The arch opening inside the 360×640 stage, as percentages.
const opening = { left: "8.34%", right: "8.34%", top: "10.94%", bottom: "0%" };

/* ───────── Opening: the garden gate ───────── */

function Opening({ invite, opened, onOpen }: OpeningProps) {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ pointerEvents: opened ? "none" : "auto" }}>
      <motion.div
        className="absolute inset-0 bg-[#d47a3c]"
        animate={opened ? { scale: 1.35, opacity: 0 } : { scale: 1, opacity: 1 }}
        transition={{ delay: opened ? 0.7 : 0, duration: 0.9, ease: [0.6, 0, 0.3, 1] }}
      >
        <PaintedBand className="absolute inset-0 h-full w-full" />
        <Stage>
          <div className="absolute overflow-hidden" style={opening}>
            <GardenScene className="absolute inset-0 h-full w-full" peacocks={false} />
          </div>
          <div className="absolute flex" style={{ ...opening, perspective: "120cqw" }}>
            {(["left", "right"] as const).map((side) => (
              <motion.div
                key={side}
                className="h-full w-1/2"
                style={{ transformOrigin: side === "left" ? "left center" : "right center", transformStyle: "preserve-3d" }}
                animate={{ rotateY: opened ? (side === "left" ? -100 : 100) : 0 }}
                transition={{ duration: 1.1, ease: [0.7, 0, 0.3, 1] }}
              >
                <GateLeaf side={side} />
              </motion.div>
            ))}
          </div>
          <PaintedArch className="absolute inset-0 h-full w-full" />

          <motion.button
            onClick={onOpen}
            aria-label="Open invitation"
            className="absolute top-[34%] left-1/2 z-10 grid size-[30cqw] -translate-x-1/2 -translate-y-1/2 place-items-center"
            animate={{ opacity: opened ? 0 : 1, scale: opened ? 0.7 : [1, 1.04, 1] }}
            transition={opened ? { duration: 0.2 } : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg viewBox="-50 -50 100 100" className="absolute inset-0 h-full w-full drop-shadow-[0_6px_14px_rgba(80,40,10,.35)]" aria-hidden>
              <path d="M0 -46 L40 -23 L40 23 L0 46 L-40 23 L-40 -23 Z" fill="#fffaf0" stroke={BAGH.gold} strokeWidth="2.5" />
              <path d="M0 -39 L34 -19.5 L34 19.5 L0 39 L-34 19.5 L-34 -19.5 Z" fill="none" stroke={BAGH.gold} strokeWidth="0.8" />
            </svg>
            <span className="relative text-[9cqw] leading-none text-[#9a7428]" style={{ fontFamily: "var(--font-parisienne)" }}>
              {initials(invite)}
            </span>
          </motion.button>
          <motion.p
            className="absolute inset-x-[12%] top-[44%] rounded-full bg-[#fffaf0]/85 py-[1.5cqw] text-center text-[2.6cqw] font-semibold tracking-[0.22em] text-[#8a4a20] uppercase"
          style={{ fontFamily: "var(--font-cinzel)" }}
          animate={{ opacity: opened ? 0 : [0.55, 1, 0.55] }}
          transition={{ duration: 2.4, repeat: opened ? 0 : Infinity }}
        >
            Tap the seal to enter
          </motion.p>
        </Stage>
      </motion.div>
    </div>
  );
}

/* ───────── The card ───────── */

function Hero({ invite }: { invite: Invite }) {
  const [a, b] = couple(invite);
  return (
    <section className="relative overflow-hidden px-[7cqw] pt-[30cqw] pb-[14cqw] text-center">
      <BananaLeaves className="absolute -top-[2cqw] -left-[4cqw] w-[44cqw]" />
      <BananaLeaves className="absolute -top-[2cqw] -right-[4cqw] w-[44cqw]" flip />
      <Reveal>
        <Kalash className="mx-auto w-[9cqw]" />
        <p className="inv-label mx-auto mt-[4cqw] max-w-[60cqw] text-[3.2cqw] leading-snug text-[#5a3a3a]">
          {invite.hosts ? `${invite.hosts} invite you` : "Join us to celebrate"}
          <br />
          the wedding of
        </p>
      </Reveal>
      <Reveal delay={0.25}>
        <h2 className="inv-script mt-[4cqw] text-[14cqw] leading-[1.05] text-[#3d1633]">
          {a.first} <span className="text-[8cqw] align-middle">&amp;</span> {b.first}
        </h2>
      </Reveal>
      <Reveal delay={0.5}>
        <div className="mt-[6cqw] flex items-center justify-center gap-[3cqw] text-[#3d1633]">
          <span className="inv-label border-y border-[#3d1633]/60 px-[1cqw] py-[1.5cqw] text-[3.4cqw]">{weekday(invite.date)}</span>
          <span className="inv-serif text-[14cqw] leading-none">{dayNum(invite.date).replace(/^0/, "")}</span>
          <span className="inv-label border-y border-[#3d1633]/60 px-[1cqw] py-[1.5cqw] text-[3.4cqw]">{monthName(invite.date)}</span>
        </div>
        <p className="inv-label mt-[3cqw] text-[3.6cqw] text-[#3d1633]">{yearNum(invite.date)}</p>
      </Reveal>
      <Reveal delay={0.7}>
        <p className="inv-serif mx-auto mt-[6cqw] max-w-[74cqw] text-[4.4cqw] leading-snug text-[#5a3a3a] italic">{invite.message}</p>
        <div className="mt-[6cqw] grid gap-[3cqw] text-[3.4cqw] text-[#5a3a3a]">
          {[a, b].map((p) => (
            <p key={p === invite.bride ? "bride" : "groom"}>
              <span className="inv-label text-[3cqw] text-[#3d1633]">{p.full}</span>
              {p.parents && <span className="inv-serif mt-[0.5cqw] block italic">{p.parents}</span>}
            </p>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

function Events({ invite }: { invite: Invite }) {
  return (
    <section className="relative px-[7cqw] py-[12cqw]">
      <Reveal>
        <Title>Functions</Title>
      </Reveal>
      <ol className="mt-[7cqw] space-y-[6cqw]">
        {invite.events.map((e, i) => {
          const o = shortOrdinal(e.start);
          return (
            <motion.li
              key={e.name + i}
              initial={{ opacity: 0, x: -14 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.8, delay: i * 0.15, ease }}
              className="border-b border-[#3d1633]/15 pb-[5cqw] last:border-0"
            >
              <div className="flex items-baseline justify-between gap-[3cqw] text-[#3d1633]">
                <p className="inv-label text-[3.8cqw] leading-snug">{e.name}</p>
                <p className="inv-label shrink-0 border-l border-[#3d1633]/40 pl-[2.5cqw] text-[3.6cqw]">
                  {o.d}
                  <sup className="text-[2.2cqw]">{o.suffix}</sup> {o.m}
                </p>
              </div>
              <p className="inv-serif mt-[1.5cqw] text-[3.8cqw] text-[#5a3a3a]">
                {time(e.start)} · {e.venue}
              </p>
              {(e.dress || e.note) && <p className="inv-serif text-[3.4cqw] text-[#b5603a] italic">{[e.dress && `Dress: ${e.dress}`, e.note].filter(Boolean).join(" · ")}</p>}
              <div className="[&>div]:mt-[3cqw] [&>div]:justify-start">
                <EventActions event={e} invite={invite} theme={bagh} />
              </div>
            </motion.li>
          );
        })}
      </ol>
    </section>
  );
}

/* ───────── Closing: the procession ───────── */

function Closing({ invite }: { invite: Invite }) {
  const [a, b] = couple(invite);
  return (
    <section className="relative overflow-hidden pt-[12cqw] text-center">
      <Reveal className="relative px-[7cqw]">
        <p className="inv-serif mx-auto max-w-[72cqw] text-[5cqw] leading-snug text-[#5a3a3a] italic">{invite.closing}</p>
        <p className="inv-script mt-[5cqw] text-[11cqw] leading-none text-[#3d1633]">
          {a.first} &amp; {b.first}
        </p>
        {invite.hashtag && <p className="inv-label mt-[4cqw] text-[3cqw] text-[#b5603a]">{invite.hashtag}</p>}
      </Reveal>
      <motion.div className="relative mt-[8cqw] h-[62cqw]" initial="away" whileInView="here" viewport={{ once: true, amount: 0.4 }}>
        <svg viewBox="-50 -70 100 115" className="absolute bottom-[22cqw] left-1/2 w-[24cqw] -translate-x-1/2 opacity-80" aria-hidden>
          <Chhatri x={0} y={0} s={1} tone="#efe6d2" />
        </svg>
        <motion.div
          className="absolute bottom-[19cqw] left-0 flex w-full items-end justify-center gap-[2cqw]"
          variants={{ away: { x: "-100%" }, here: { x: "0%" } }}
          transition={{ duration: 6, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <Elephant className="w-[34cqw]" />
          <Elephant className="w-[40cqw]" delay={0.4} />
        </motion.div>
        <Shrubs className="absolute inset-x-0 bottom-0 h-[30cqw] w-full" />
        <Link href="/" className="inv-label absolute inset-x-0 bottom-[3cqw] text-[2.2cqw] text-[#f4ecdd]/70">
          Crafted by {site.name}
        </Link>
      </motion.div>
    </section>
  );
}

/* ───────── Frame ───────── */

function Backdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ background: BAGH.wall }}>
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='260' viewBox='0 0 180 260'%3E%3Cpath d='M20 260 V110 C20 50 50 20 90 14 C130 20 160 50 160 110 V260' fill='none' stroke='%23d6c7a8' stroke-width='2'/%3E%3Cpath d='M40 260 V120 C40 70 62 44 90 38 C118 44 140 70 140 120 V260' fill='none' stroke='%23ddd0b4' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundSize: "60cqw auto",
          backgroundPosition: "center top",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(120%_60%_at_50%_10%,#fbf5ea_0%,transparent_70%)]" />
      <Sparkles count={30} seed={8} />
      <div className="absolute inset-[1.6cqw] rounded-[1cqw] border-[0.6cqw] border-[#c9a24a]/70" />
    </div>
  );
}

function Divider({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-[3cqw] ${className ?? ""}`}>
      <span className="h-px w-[22cqw] bg-[#3d1633]/40" />
      <Kalash className="w-[6cqw]" />
      <span className="h-px w-[22cqw] bg-[#3d1633]/40" />
    </div>
  );
}

function Title({ kicker, children }: { kicker?: string; children: React.ReactNode }) {
  return (
    <div className="text-center">
      {kicker && <p className="inv-label text-[2.8cqw] text-[#b5603a]">{kicker}</p>}
      <div className="mt-[1cqw] flex items-center justify-center gap-[4cqw]">
        <span className="h-px flex-1 bg-[#3d1633]/50" />
        <h2 className="inv-label text-[5.4cqw] font-semibold text-[#3d1633]">{children}</h2>
        <span className="h-px flex-1 bg-[#3d1633]/50" />
      </div>
    </div>
  );
}

export const bagh: InviteTheme = {
  id: "bagh",
  root: "bg-[#ebe0cc] text-[#3d1633]",
  vars: {
    "--inv-script": "var(--font-dancing), cursive",
    "--inv-serif": "var(--font-cormorant), serif",
    "--inv-label": "var(--font-cinzel), serif",
  } as React.CSSProperties,
  accent: BAGH.terracotta,
  ui: {
    section: "relative px-[7cqw] py-[12cqw]",
    card: "rounded-[4cqw] border border-[#c9a24a]/50 bg-[#f7f0e3]/90",
    input:
      "w-full rounded-[2.5cqw] border border-[#3d1633]/20 bg-[#fffaf1] px-[4cqw] py-[3cqw] text-[3.8cqw] text-[#3d1633] placeholder:text-[#3d1633]/35 outline-none focus:border-[#c4622d]",
    chip: "rounded-full border border-[#3d1633]/25 text-[#3d1633]/80 transition",
    chipOn: "rounded-full border border-[#c4622d] bg-[#c4622d] text-white transition",
    button:
      "inline-flex items-center gap-[1.5cqw] rounded-full bg-[#3d1633] px-[4.5cqw] py-[2.4cqw] text-[3.2cqw] font-semibold text-[#f4ecdd] active:scale-95 transition",
    ghost: "inline-flex items-center gap-[1.5cqw] rounded-full border border-[#3d1633]/40 px-[4.5cqw] py-[2.4cqw] text-[3.2cqw] text-[#3d1633] active:scale-95 transition",
    muted: "text-[#5a3a3a]",
    tile: "rounded-[3cqw] border border-[#c9a24a]/50 bg-[#f7f0e3] text-[#3d1633]",
  },
  Opening,
  Hero,
  // The card opens straight after the gate, so there's no separate blessing section.
  Blessing: () => null,
  Events,
  Closing,
  Backdrop,
  Divider,
  Title,
};
