"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useId, useMemo } from "react";
import { EventGlyph } from "@/art/glyphs";
import { cleanId, seeded } from "@/art/geometry";
import { site } from "@/config/site";
import { dayNum, monthName, time, weekday, yearNum } from "@/lib/format";
import type { Invite } from "@/data/invites";
import { couple, EventActions, Reveal } from "./shared";
import { useOpened } from "./opened";
import type { InviteTheme, OpeningProps } from "./types";

const PINK = "#d6246e";
const SAFFRON = "#f28a1a";
const MUSTARD = "#f6c445";
const MADDER = "#5a0f2a";
const GREEN = "#2f9e5b";
const CREAM = "#fff4e0";
const blocks = [PINK, SAFFRON, MUSTARD, GREEN];
const onBlock: Record<string, string> = { [PINK]: CREAM, [SAFFRON]: MADDER, [MUSTARD]: MADDER, [GREEN]: CREAM };
const gurmukhi = { fontFamily: "var(--font-gurmukhi), sans-serif" };

/* ───────── Embroidery ───────── */

/** Bagh-style diamond embroidery as a repeating SVG pattern. */
function Bagh({ id, size = 48, ground = MADDER }: { id: string; size?: number; ground?: string }) {
  const h = size / 2;
  const diamond = (r: number) => `M${h} ${h - r} L${h + r} ${h} L${h} ${h + r} L${h - r} ${h} Z`;
  return (
    <pattern id={id} width={size} height={size} patternUnits="userSpaceOnUse">
      <rect width={size} height={size} fill={ground} />
      <path d={diamond(h * 0.92)} fill={SAFFRON} />
      <path d={diamond(h * 0.7)} fill={MUSTARD} />
      <path d={diamond(h * 0.48)} fill={PINK} />
      <path d={diamond(h * 0.26)} fill={MUSTARD} />
      <g stroke={CREAM} strokeOpacity={0.55} strokeWidth={0.7} strokeDasharray="1.5 2">
        <path d={`M${h} ${h - h * 0.92} V${h + h * 0.92} M${h - h * 0.92} ${h} H${h + h * 0.92}`} />
        <path d={diamond(h * 0.6)} fill="none" />
      </g>
      {[
        [0, 0],
        [size, 0],
        [0, size],
        [size, size],
      ].map(([x, y]) => (
        <path key={`${x}${y}`} d={`M${x} ${y - 4} L${x + 4} ${y} L${x} ${y + 4} L${x - 4} ${y} Z`} fill={GREEN} />
      ))}
    </pattern>
  );
}

/** A band of embroidery, full width. */
function Band({ className, size = 40 }: { className?: string; size?: number }) {
  const id = cleanId(useId());
  return (
    <svg className={className} preserveAspectRatio="none" aria-hidden>
      <defs>
        <Bagh id={`${id}b`} size={size} />
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id}b)`} />
      <line x1="0" y1="2" x2="100%" y2="2" stroke={MUSTARD} strokeWidth="2" strokeDasharray="6 4" />
      <line x1="0" y1="97%" x2="100%" y2="97%" stroke={MUSTARD} strokeWidth="2" strokeDasharray="6 4" />
    </svg>
  );
}

/** Copper jaggo pot crowned with flickering lamps. */
function Jaggo({ className }: { className?: string }) {
  const id = cleanId(useId());
  return (
    <svg viewBox="0 0 120 130" className={className} aria-hidden>
      <defs>
        <linearGradient id={`${id}c`} x1="0" x2="1">
          <stop offset="0" stopColor="#8a3d14" />
          <stop offset="0.45" stopColor="#e08a3c" />
          <stop offset="1" stopColor="#7a3210" />
        </linearGradient>
        <radialGradient id={`${id}f`} cx="50%" cy="80%" r="70%">
          <stop offset="0" stopColor="#fffbe0" />
          <stop offset="0.4" stopColor={MUSTARD} />
          <stop offset="1" stopColor={SAFFRON} />
        </radialGradient>
      </defs>
      {[30, 60, 90].map((x, i) => (
        <g key={x}>
          <circle cx={x} cy={i === 1 ? 22 : 30} r="14" fill={MUSTARD} opacity="0.25" className="animate-pulse" />
          <g className="animate-flicker" style={{ transformOrigin: `${x}px ${i === 1 ? 34 : 42}px`, transformBox: "view-box", animationDelay: `${i * 0.3}s` }}>
            <path d={`M${x} ${i === 1 ? 10 : 18} C${x + 6} ${i === 1 ? 20 : 28} ${x + 5} ${i === 1 ? 30 : 38} ${x} ${i === 1 ? 33 : 41} C${x - 5} ${i === 1 ? 30 : 38} ${x - 6} ${i === 1 ? 20 : 28} ${x} ${i === 1 ? 10 : 18} Z`} fill={`url(#${id}f)`} />
          </g>
          <ellipse cx={x} cy={i === 1 ? 36 : 44} rx="9" ry="3.5" fill="#b8642a" />
        </g>
      ))}
      <path d="M28 52 H92 C96 56 96 60 92 62 H28 C24 60 24 56 28 52 Z" fill="#b8642a" />
      <path d="M34 62 C10 74 10 116 40 124 H80 C110 116 110 74 86 62 Z" fill={`url(#${id}c)`} />
      <g fill="none" stroke={MUSTARD} strokeWidth="2" strokeDasharray="3 3">
        <path d="M24 86 C44 92 76 92 96 86" />
        <path d="M22 100 C44 107 76 107 98 100" />
      </g>
      <g fill={PINK}>
        {[38, 52, 66, 80].map((x) => (
          <path key={x} d={`M${x} 92 l4 4 -4 4 -4 -4 Z`} />
        ))}
      </g>
    </svg>
  );
}

function Confetti({ count = 18, seed = 5 }: { count?: number; seed?: number }) {
  const bits = useMemo(() => {
    const rnd = seeded(seed);
    return Array.from({ length: count }, (_, i) => ({ x: rnd() * 100, y: rnd() * 100, s: 1.5 + rnd() * 2.5, c: blocks[i % 4], r: rnd() * 360, d: rnd() * 3 }));
  }, [count, seed]);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {bits.map((b, i) => (
        <motion.span
          key={i}
          className="absolute"
          style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.s}cqw`, height: `${b.s}cqw`, background: b.c, rotate: `${b.r}deg`, clipPath: "polygon(50% 0,100% 50%,50% 100%,0 50%)" }}
          animate={{ y: [0, -10, 0], rotate: [b.r, b.r + 90, b.r] }}
          transition={{ duration: 4 + b.d, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/* ───────── Opening: the dupatta un-stitches ───────── */

function Panel({ side }: { side: "left" | "right" }) {
  const id = cleanId(useId());
  return (
    <svg className="h-full w-full" preserveAspectRatio="none" aria-hidden>
      <defs>
        <Bagh id={`${id}p`} size={56} />
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id}p)`} />
      <rect x={side === "left" ? "0" : "6%"} width="94%" height="100%" fill="none" stroke={MUSTARD} strokeWidth="6" strokeDasharray="10 6" />
    </svg>
  );
}

function Opening({ invite, opened, onOpen }: OpeningProps) {
  const [a, b] = couple(invite);
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ pointerEvents: opened ? "none" : "auto" }}>
      <motion.div
        className="absolute inset-y-0 left-0 w-1/2 origin-left"
        animate={opened ? { x: "-105%", rotate: -8, skewY: 4 } : { x: "0%", rotate: 0, skewY: 0 }}
        transition={{ duration: 1.1, ease: [0.7, 0, 0.3, 1], delay: opened ? 0.9 : 0 }}
      >
        <Panel side="left" />
      </motion.div>
      <motion.div
        className="absolute inset-y-0 right-0 w-1/2 origin-right"
        animate={opened ? { x: "105%", rotate: 8, skewY: -4 } : { x: "0%", rotate: 0, skewY: 0 }}
        transition={{ duration: 1.1, ease: [0.7, 0, 0.3, 1], delay: opened ? 0.9 : 0 }}
      >
        <Panel side="right" />
      </motion.div>

      {/* the centre seam: a running stitch that unpicks from top to bottom */}
      <motion.div className="absolute top-0 left-1/2 h-full w-[1.2cqw] -translate-x-1/2" animate={{ opacity: opened ? [1, 1, 0] : 1 }} transition={{ duration: 1.2, times: [0, 0.8, 1] }}>
        <div className="h-full w-full" style={{ background: `repeating-linear-gradient(180deg, ${CREAM} 0 3cqw, transparent 3cqw 5cqw)` }} />
        <motion.div className="absolute inset-x-0 top-0 bg-[#5a0f2a]" initial={{ height: "0%" }} animate={{ height: opened ? "100%" : "0%" }} transition={{ duration: 0.9, ease: "easeIn" }} />
        <motion.span
          className="absolute left-1/2 h-[7cqw] w-[0.8cqw] -translate-x-1/2 rounded-full bg-[#e8e8e8] shadow"
          initial={{ top: "-8%" }}
          animate={{ top: opened ? "102%" : "-8%" }}
          transition={{ duration: 0.9, ease: "easeIn" }}
        />
      </motion.div>

      <motion.div
        className="absolute inset-x-[8cqw] top-[12%] -rotate-2 rounded-[3cqw] bg-[#fff4e0] px-[5cqw] py-[4cqw] text-center shadow-[0_2cqw_0_#5a0f2a]"
        animate={{ opacity: opened ? 0 : 1, y: opened ? -30 : 0 }}
        transition={{ duration: 0.4 }}
      >
        <p className="text-[2.8cqw] font-bold tracking-[0.2em] text-[#d6246e] uppercase" style={gurmukhi}>
          Shaadi di khabar!
        </p>
        <p className="inv-script mt-[1cqw] text-[10cqw] leading-none text-[#5a0f2a]">
          {a.first} <span className="text-[#f28a1a]">+</span> {b.first}
        </p>
      </motion.div>

      <motion.button
        onClick={onOpen}
        aria-label="Open invitation"
        className="absolute top-[56%] left-1/2 z-10 grid size-[34cqw] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#d6246e] shadow-[0_0_0_2cqw_#f6c445,0_0_0_3cqw_#5a0f2a,0_3cqw_0_3cqw_#5a0f2a]"
        animate={{ scale: opened ? 0 : [1, 1.05, 1], rotate: opened ? 180 : 0 }}
        transition={opened ? { duration: 0.5 } : { duration: 1.6, repeat: Infinity }}
      >
        <span className="absolute inset-[2cqw] rounded-full border-[0.6cqw] border-dashed border-[#fff4e0]/80" />
        <span className="relative text-[15cqw] leading-none text-[#f6c445]" style={gurmukhi}>
          {invite.invocation}
        </span>
      </motion.button>
      <motion.p
        className="absolute inset-x-0 bottom-[12%] text-center text-[3.4cqw] font-bold text-[#fff4e0] [text-shadow:0_0.5cqw_0_#5a0f2a]"
        style={gurmukhi}
        animate={{ opacity: opened ? 0 : 1, y: opened ? 0 : [0, -6, 0] }}
        transition={{ duration: 1.4, repeat: opened ? 0 : Infinity }}
      >
        Tap to open the dupatta ✨
      </motion.p>
    </div>
  );
}

/* ───────── Hero ───────── */

function Sticker({ bg, rotate, className, children }: { bg: string; rotate: number; className?: string; children: React.ReactNode }) {
  return (
    <span className={`inline-block rounded-[2.5cqw] px-[4cqw] py-[1.5cqw] shadow-[0_1.2cqw_0_#5a0f2a] ${className ?? ""}`} style={{ background: bg, color: onBlock[bg], rotate: `${rotate}deg` }}>
      {children}
    </span>
  );
}

function Hero({ invite }: { invite: Invite }) {
  const opened = useOpened();
  const [a, b] = couple(invite);
  const pop = (delay: number, rotate = 0) => ({
    initial: { opacity: 0, scale: 0.6, rotate: rotate - 10 },
    animate: opened ? { opacity: 1, scale: 1, rotate } : {},
    transition: { type: "spring" as const, stiffness: 160, damping: 12, delay },
  });
  return (
    <section className="relative flex min-h-[var(--screen-h,100svh)] flex-col overflow-hidden">
      <Band className="h-[14cqw] w-full shrink-0" />
      <div className="relative flex flex-1 flex-col items-center justify-center px-[6cqw] py-[8cqw] text-center">
        <Confetti />
        <motion.p {...pop(0.3)} className="text-[16cqw] leading-none text-[#f6c445] [text-shadow:0_1.2cqw_0_#d6246e]" style={gurmukhi}>
          {invite.invocation}
        </motion.p>
        <motion.p {...pop(0.45)} className="mt-[2cqw] text-[2.8cqw] font-bold tracking-[0.25em] text-[#fff4e0]/80 uppercase" style={gurmukhi}>
          {invite.hosts}
        </motion.p>
        <motion.h1 className="mt-[5cqw] flex flex-col items-center gap-[2cqw]">
          <motion.span {...pop(0.7, -3)}>
            <Sticker bg={PINK} rotate={0}>
              <span className="inv-script text-[15cqw] leading-[1.05]">{a.first}</span>
            </Sticker>
          </motion.span>
          <motion.span {...pop(0.85, 4)}>
            <Sticker bg={GREEN} rotate={0} className="text-[4cqw] font-bold tracking-[0.2em] uppercase">
              <span style={gurmukhi}>weds</span>
            </Sticker>
          </motion.span>
          <motion.span {...pop(1, 2)}>
            <Sticker bg={MUSTARD} rotate={0}>
              <span className="inv-script text-[15cqw] leading-[1.05]">{b.first}</span>
            </Sticker>
          </motion.span>
        </motion.h1>
        <motion.div {...pop(1.25, -2)} className="mt-[7cqw] flex items-stretch gap-[2cqw]">
          <Sticker bg={SAFFRON} rotate={-3} className="flex flex-col justify-center">
            <span className="text-[2.6cqw] font-bold uppercase" style={gurmukhi}>
              {weekday(invite.date).slice(0, 3)}
            </span>
          </Sticker>
          <Sticker bg={CREAM} rotate={2}>
            <span className="inv-script block text-[10cqw] leading-none text-[#d6246e]">{dayNum(invite.date)}</span>
          </Sticker>
          <Sticker bg={PINK} rotate={-2} className="flex flex-col justify-center text-left">
            <span className="text-[2.6cqw] font-bold uppercase" style={gurmukhi}>
              {monthName(invite.date)}
              <br />
              {yearNum(invite.date)}
            </span>
          </Sticker>
        </motion.div>
        <motion.p {...pop(1.4)} className="mt-[4cqw] text-[3.4cqw] font-bold text-[#f6c445]" style={gurmukhi}>
          📍 {invite.city}
        </motion.p>
        <Jaggo className="absolute right-[3cqw] bottom-[2cqw] w-[20cqw]" />
      </div>
      <Band className="h-[8cqw] w-full shrink-0" size={30} />
    </section>
  );
}

/* ───────── Blessing ───────── */

function Blessing({ invite }: { invite: Invite }) {
  const [a, b] = couple(invite);
  return (
    <section className="relative px-[7cqw] py-[14cqw] text-center">
      <Reveal>
        <p className="mx-auto max-w-[78cqw] text-[5cqw] leading-snug font-semibold text-[#fff4e0]" style={gurmukhi}>
          {invite.hosts} <span className="text-[#f6c445]">{invite.message}</span>
        </p>
      </Reveal>
      <div className="mt-[10cqw] grid grid-cols-2 gap-[4cqw]">
        {[a, b].map((p, i) => (
          <Reveal key={p === invite.bride ? "bride" : "groom"} delay={i * 0.15}>
            <div
              className="h-full rounded-[4cqw] p-[4cqw] text-left shadow-[0_1.5cqw_0_#2a0614]"
              style={{ background: i ? MUSTARD : PINK, color: i ? MADDER : CREAM, rotate: `${i ? 2 : -2}deg` }}
            >
              <div className="rounded-[2.5cqw] border-[0.5cqw] border-dashed border-current/40 p-[3cqw]">
                <p className="text-[2.4cqw] font-bold tracking-[0.2em] uppercase opacity-80" style={gurmukhi}>
                  {p === invite.bride ? "Kudi" : "Munda"}
                </p>
                <p className="inv-script mt-[1cqw] text-[9cqw] leading-none">{p.first}</p>
                <p className="mt-[2cqw] text-[3cqw] leading-snug font-medium opacity-85" style={gurmukhi}>
                  {p.parents}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ───────── Events ───────── */

function Events({ invite }: { invite: Invite }) {
  return (
    <section className="relative px-[7cqw] py-[14cqw]">
      <Reveal>
        <Title kicker="Programme">Ki ki honda?</Title>
      </Reveal>
      <div className="mt-[10cqw] space-y-[8cqw]">
        {invite.events.map((e, i) => {
          const bg = blocks[i % 4];
          const ink = onBlock[bg];
          return (
            <Reveal key={e.name}>
              <article className="rounded-[5cqw] p-[3cqw] shadow-[0_2cqw_0_#2a0614]" style={{ background: bg, color: ink, rotate: `${i % 2 ? 1.5 : -1.5}deg` }}>
                <div className="rounded-[3.5cqw] border-[0.6cqw] border-dashed border-current/40 px-[5cqw] py-[6cqw]">
                  <div className="flex items-start justify-between">
                    <p className="inv-script text-[16cqw] leading-[0.8] opacity-30">{String(i + 1).padStart(2, "0")}</p>
                    <EventGlyph kind={e.kind} className="size-[13cqw]" />
                  </div>
                  <h3 className="inv-script mt-[2cqw] text-[11cqw] leading-none">{e.name}</h3>
                  <p className="mt-[4cqw] text-[3.4cqw] font-bold" style={gurmukhi}>
                    {weekday(e.start)}, {dayNum(e.start)} {monthName(e.start)} · {time(e.start)}
                  </p>
                  <p className="mt-[2cqw] text-[4.4cqw] leading-tight font-bold" style={gurmukhi}>
                    {e.venue}
                  </p>
                  <p className="mt-[1cqw] text-[3.2cqw] opacity-80" style={gurmukhi}>
                    {e.address}
                  </p>
                  {(e.dress || e.note) && (
                    <p className="mt-[3cqw] inline-block rounded-full bg-black/10 px-[3cqw] py-[1cqw] text-[3cqw] font-semibold" style={gurmukhi}>
                      {[e.dress && `Wear: ${e.dress}`, e.note].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  <div className="[&>div]:justify-start">
                    <EventActions event={e} invite={invite} theme={phulkari} />
                  </div>
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

/* ───────── Closing ───────── */

function Closing({ invite }: { invite: Invite }) {
  const [a, b] = couple(invite);
  return (
    <section className="relative overflow-hidden pb-[24cqw] text-center">
      <Band className="h-[10cqw] w-full" />
      <div className="relative px-[7cqw] pt-[14cqw]">
        <Confetti count={12} seed={9} />
        <Reveal className="relative">
          <Jaggo className="mx-auto w-[28cqw]" />
          <p className="mx-auto mt-[4cqw] max-w-[76cqw] text-[5.6cqw] leading-snug font-bold text-[#fff4e0]" style={gurmukhi}>
            {invite.closing}
          </p>
          <p className="inv-script mt-[6cqw] text-[12cqw] leading-none text-[#f6c445] [text-shadow:0_1cqw_0_#d6246e]">
            {a.first} &amp; {b.first}
          </p>
          {invite.hashtag && (
            <span className="mt-[5cqw] inline-block -rotate-2 rounded-full bg-[#d6246e] px-[4cqw] py-[1.5cqw] text-[3.2cqw] font-bold text-[#fff4e0]" style={gurmukhi}>
              {invite.hashtag}
            </span>
          )}
        </Reveal>
      </div>
      <Link href="/" className="absolute inset-x-0 bottom-[6cqw] text-[2.4cqw] font-semibold text-[#fff4e0]/50" style={gurmukhi}>
        Crafted by {site.name}
      </Link>
    </section>
  );
}

function Backdrop() {
  return <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(120% 40% at 50% 0%, #7a1438 0%, ${MADDER} 45%, #3a0819 100%)` }} />;
}

function Divider({ className }: { className?: string }) {
  return (
    <div className={`flex justify-center gap-[2cqw] ${className ?? ""}`}>
      {blocks.map((c) => (
        <span key={c} className="size-[3cqw] rotate-45" style={{ background: c }} />
      ))}
    </div>
  );
}

function Title({ kicker, children }: { kicker?: string; children: React.ReactNode }) {
  return (
    <div className="text-center">
      {kicker && (
        <span className="inline-block -rotate-2 rounded-full bg-[#f6c445] px-[3.5cqw] py-[1cqw] text-[2.8cqw] font-bold tracking-[0.15em] text-[#5a0f2a] uppercase" style={gurmukhi}>
          {kicker}
        </span>
      )}
      <h2 className="inv-script mt-[3cqw] text-[12cqw] leading-none text-[#fff4e0] [text-shadow:0_1cqw_0_#d6246e]">{children}</h2>
    </div>
  );
}

export const phulkari: InviteTheme = {
  id: "phulkari",
  root: "bg-[#5a0f2a] text-[#fff4e0]",
  vars: {
    "--inv-script": "var(--font-rozha), serif",
    "--inv-serif": "var(--font-gurmukhi), sans-serif",
    "--inv-label": "var(--font-gurmukhi), sans-serif",
  } as React.CSSProperties,
  accent: MUSTARD,
  ui: {
    section: "relative px-[7cqw] py-[14cqw]",
    card: "rounded-[5cqw] bg-[#fff4e0] text-[#5a0f2a] shadow-[0_2cqw_0_#2a0614]",
    input:
      "w-full rounded-[3cqw] border-[0.5cqw] border-[#5a0f2a]/20 bg-white px-[4cqw] py-[3cqw] text-[3.8cqw] text-[#5a0f2a] placeholder:text-[#5a0f2a]/40 outline-none focus:border-[#d6246e]",
    chip: "rounded-full border-[0.5cqw] border-[#5a0f2a]/25 bg-white text-[#5a0f2a] font-semibold transition",
    chipOn: "rounded-full border-[0.5cqw] border-[#d6246e] bg-[#d6246e] text-white font-bold transition",
    button:
      "inline-flex items-center gap-[1.5cqw] rounded-full bg-[#5a0f2a] px-[5cqw] py-[2.6cqw] text-[3.4cqw] font-bold text-[#f6c445] shadow-[0_1cqw_0_rgba(0,0,0,.3)] active:translate-y-[0.5cqw] transition",
    ghost: "inline-flex items-center gap-[1.5cqw] rounded-full border-[0.5cqw] border-current px-[5cqw] py-[2.6cqw] text-[3.4cqw] font-bold active:scale-95 transition",
    muted: "opacity-75",
    tile: "rounded-[3cqw] bg-[#f6c445] text-[#5a0f2a] shadow-[0_1cqw_0_#2a0614]",
  },
  Opening,
  Hero,
  Blessing,
  Events,
  Closing,
  Backdrop,
  Divider,
  Title,
};
