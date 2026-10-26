"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useId, useMemo } from "react";
import { EventGlyph } from "@/art/glyphs";
import { cleanId, r2, seeded } from "@/art/geometry";
import { site } from "@/config/site";
import { dayNum, monthName, time, weekday, yearNum } from "@/lib/format";
import type { Invite } from "@/data/invites";
import { couple, EventActions, Reveal } from "./shared";
import { useOpened } from "./opened";
import type { InviteTheme, OpeningProps } from "./types";

const GOLD = "#e3b964";
const MOON = "#f4efe2";
const ease = [0.22, 1, 0.36, 1] as const;

/* ───────── Geometry ───────── */

/** Eight-pointed star (two overlapping squares) centred on 0,0. */
function starPath(r: number) {
  const pts: string[] = [];
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 - Math.PI / 2;
    const rad = i % 2 ? r * 0.72 : r;
    pts.push(`${r2(Math.cos(a) * rad)} ${r2(Math.sin(a) * rad)}`);
  }
  return `M${pts.join(" L")} Z`;
}

/** Onion (ogee) arch spanning 0..w, apex at y=0, springing at y=s, base at y=h. */
function ogeePath(w: number, h: number, s: number) {
  const m = w / 2;
  return [
    `M0 ${h} L0 ${s}`,
    `C0 ${r2(s * 0.4)} ${r2(w * 0.16)} ${r2(s * 0.3)} ${r2(w * 0.32)} ${r2(s * 0.18)}`,
    `C${r2(w * 0.43)} ${r2(s * 0.1)} ${r2(m - w * 0.02)} ${r2(s * 0.06)} ${m} 0`,
    `C${r2(m + w * 0.02)} ${r2(s * 0.06)} ${r2(w * 0.57)} ${r2(s * 0.1)} ${r2(w * 0.68)} ${r2(s * 0.18)}`,
    `C${r2(w * 0.84)} ${r2(s * 0.3)} ${w} ${r2(s * 0.4)} ${w} ${s}`,
    `L${w} ${h} Z`,
  ].join(" ");
}

/** Repeating star-and-cross lattice, as an SVG pattern fill. */
function Lattice({ id, size = 40, stroke = GOLD, width = 1, opacity = 1 }: { id: string; size?: number; stroke?: string; width?: number; opacity?: number }) {
  const h = size / 2;
  return (
    <pattern id={id} width={size} height={size} patternUnits="userSpaceOnUse">
      <g fill="none" stroke={stroke} strokeWidth={width} strokeOpacity={opacity}>
        <path d={starPath(h * 0.62)} transform={`translate(${h} ${h})`} />
        <path d={`M0 0 L${h * 0.38} ${h * 0.38} M${size} 0 L${size - h * 0.38} ${h * 0.38} M0 ${size} L${h * 0.38} ${size - h * 0.38} M${size} ${size} L${size - h * 0.38} ${size - h * 0.38}`} />
        <path d={`M${h} 0 V${h * 0.38} M${h} ${size} V${size - h * 0.38} M0 ${h} H${h * 0.38} M${size} ${h} H${size - h * 0.38}`} />
      </g>
    </pattern>
  );
}

function Rosette({ className, color = GOLD }: { className?: string; color?: string }) {
  return (
    <svg viewBox="-100 -100 200 200" className={className} aria-hidden>
      <g fill="none" stroke={color} strokeWidth={0.8}>
        {[96, 78, 58, 38].map((r, i) => (
          <path key={r} d={starPath(r)} transform={`rotate(${i * 11.25})`} strokeOpacity={0.4 + i * 0.15} />
        ))}
        {Array.from({ length: 16 }, (_, i) => (
          <line key={i} x1={0} y1={-20} x2={0} y2={-96} transform={`rotate(${i * 22.5})`} strokeOpacity={0.25} />
        ))}
        <circle r={14} />
      </g>
    </svg>
  );
}

function Crescent({ className }: { className?: string }) {
  const id = cleanId(useId());
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <defs>
        <radialGradient id={`${id}g`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={MOON} stopOpacity={0.35} />
          <stop offset="100%" stopColor={MOON} stopOpacity={0} />
        </radialGradient>
        <mask id={`${id}m`}>
          <rect width="100" height="100" fill="white" />
          <circle cx="62" cy="40" r="28" fill="black" />
        </mask>
      </defs>
      <circle cx="50" cy="50" r="48" fill={`url(#${id}g)`} />
      <circle cx="50" cy="50" r="30" fill={MOON} mask={`url(#${id}m)`} />
    </svg>
  );
}

function Lantern({ className, delay = 0, chain = 60 }: { className?: string; delay?: number; chain?: number }) {
  const id = cleanId(useId());
  return (
    <div className={className}>
      <div className="animate-sway" style={{ transformOrigin: "top center", animationDelay: `${delay}s`, animationDuration: "6s" }}>
        <div className="mx-auto w-px bg-gradient-to-b from-transparent to-[#e3b964]" style={{ height: chain }} />
        <svg viewBox="0 0 60 120" className="-mt-px w-full overflow-visible" aria-hidden>
          <defs>
            <radialGradient id={`${id}l`} cx="50%" cy="55%" r="55%">
              <stop offset="0%" stopColor="#fff4c8" />
              <stop offset="45%" stopColor="#f2c463" />
              <stop offset="100%" stopColor="#b8742a" />
            </radialGradient>
            <radialGradient id={`${id}h`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffd77a" stopOpacity={0.55} />
              <stop offset="100%" stopColor="#ffd77a" stopOpacity={0} />
            </radialGradient>
          </defs>
          <circle cx="30" cy="62" r="55" fill={`url(#${id}h)`} className="animate-pulse" />
          <circle cx="30" cy="4" r="4" fill="none" stroke={GOLD} strokeWidth={1.5} />
          <path d="M18 18 L30 8 L42 18 Z" fill={GOLD} />
          <path d="M14 22 H46 L42 18 H18 Z" fill="#b98a3a" />
          <path d="M14 22 C6 40 6 78 18 96 H42 C54 78 54 40 46 22 Z" fill={`url(#${id}l)`} stroke={GOLD} strokeWidth={1.5} />
          <g stroke="#7a4a14" strokeWidth={1} fill="none" opacity={0.55}>
            <path d="M30 22 V96 M20 24 C14 46 14 72 22 95 M40 24 C46 46 46 72 38 95" />
            <path d={starPath(7)} transform="translate(30 58)" />
          </g>
          <path d="M18 96 H42 L36 104 H24 Z" fill="#b98a3a" />
          <path d="M30 104 V116" stroke={GOLD} strokeWidth={1.5} />
          <circle cx="30" cy="118" r="2.5" fill={GOLD} />
        </svg>
      </div>
    </div>
  );
}

function Stars({ count = 26, seed = 11 }: { count?: number; seed?: number }) {
  const stars = useMemo(() => {
    const rnd = seeded(seed);
    return Array.from({ length: count }, () => ({ x: rnd() * 100, y: rnd() * 60, s: 0.4 + rnd() * 0.9, d: rnd() * 4 }));
  }, [count, seed]);
  return (
    <div className="pointer-events-none absolute inset-0">
      {stars.map((s, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-[#f4efe2]"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.s}cqw`, height: `${s.s}cqw` }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 2.5 + s.d, repeat: Infinity, delay: s.d }}
        />
      ))}
    </div>
  );
}

/* ───────── Opening: sliding jaali ───────── */

function JaaliPanel({ side }: { side: "left" | "right" }) {
  const id = cleanId(useId());
  return (
    <div className="relative h-full w-full overflow-hidden" style={{ background: "linear-gradient(180deg,#0f4a40,#082c26)" }}>
      <svg className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <Lattice id={`${id}p`} size={46} width={1.6} />
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id}p)`} opacity={0.75} />
      </svg>
      <div className="absolute inset-[3cqw] rounded-t-[30cqw] border-2 border-[#e3b964]/70" />
      <div
        className={`absolute top-0 bottom-0 w-[2cqw] ${side === "left" ? "right-0" : "left-0"}`}
        style={{ background: "linear-gradient(90deg,#8a6420,#f3d48a,#8a6420)" }}
      />
    </div>
  );
}

function Opening({ invite, opened, onOpen }: OpeningProps) {
  const [a, b] = couple(invite);
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ pointerEvents: opened ? "none" : "auto" }}>
      <motion.div
        className="absolute inset-0"
        style={{ background: "radial-gradient(circle at 50% 45%, #fff2c4 0%, #e3b964 25%, #0c3b33 70%)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: opened ? [0, 0.9, 0] : 0 }}
        transition={{ duration: 2, times: [0, 0.35, 1] }}
      />
      <motion.div className="absolute inset-y-0 left-0 w-1/2" animate={{ x: opened ? "-102%" : "0%" }} transition={{ duration: 1.6, ease: [0.7, 0, 0.3, 1], delay: 0.2 }}>
        <JaaliPanel side="left" />
      </motion.div>
      <motion.div className="absolute inset-y-0 right-0 w-1/2" animate={{ x: opened ? "102%" : "0%" }} transition={{ duration: 1.6, ease: [0.7, 0, 0.3, 1], delay: 0.2 }}>
        <JaaliPanel side="right" />
      </motion.div>

      <motion.div className="absolute inset-x-0 top-[13%] text-center" animate={{ opacity: opened ? 0 : 1, y: opened ? -20 : 0 }}>
        <p className="inv-label text-[2.6cqw] text-[#e3b964]">The Nikah of</p>
        <p className="mt-[2cqw] text-[9cqw] leading-none text-[#f4efe2] [text-shadow:0_2px_12px_#000]" style={{ fontFamily: "var(--font-amiri)" }}>
          {a.first} <span className="text-[#e3b964]">&amp;</span> {b.first}
        </p>
      </motion.div>

      <motion.button
        onClick={onOpen}
        aria-label="Open invitation"
        className="absolute top-1/2 left-1/2 z-10 grid size-[38cqw] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
        animate={{ scale: opened ? 0.3 : 1, opacity: opened ? 0 : 1, rotate: opened ? 90 : 0 }}
        transition={{ duration: 0.6 }}
      >
        <span className="absolute inset-0 rounded-full bg-[#0c3b33] shadow-[0_0_0_2px_#e3b964,0_0_0_8px_#0c3b33,0_0_0_9px_#e3b96488,0_20px_50px_-10px_#000]" />
        <Rosette className="absolute inset-[3cqw] animate-spin-slow" />
        <Crescent className="relative w-[20cqw]" />
      </motion.button>
      <motion.p
        className="inv-label absolute inset-x-0 bottom-[14%] text-center text-[2.8cqw] text-[#e3b964]"
        animate={{ opacity: opened ? 0 : [0.5, 1, 0.5] }}
        transition={{ duration: 2.4, repeat: opened ? 0 : Infinity }}
      >
        Tap the moon to enter
      </motion.p>
    </div>
  );
}

/* ───────── Hero ───────── */

function Hero({ invite }: { invite: Invite }) {
  const opened = useOpened();
  const [a, b] = couple(invite);
  const id = cleanId(useId());
  const show = (delay: number) => ({
    initial: { opacity: 0, y: 22 },
    animate: opened ? { opacity: 1, y: 0 } : {},
    transition: { duration: 1.2, delay, ease },
  });
  const W = 300, H = 440, S = 170;
  return (
    <section className="relative flex min-h-[var(--screen-h,100svh)] flex-col items-center justify-center overflow-hidden px-[6cqw] pt-[22cqw] pb-[14cqw]">
      <Stars />
      <Crescent className="absolute top-[8cqw] right-[8cqw] w-[18cqw]" />
      <Lantern className="absolute top-0 left-[5cqw] w-[13cqw]" chain={90} />
      <Lantern className="absolute top-0 right-[22cqw] w-[9cqw] opacity-80" chain={40} delay={-2} />
      <Lantern className="absolute top-0 right-[4cqw] w-[11cqw]" chain={150} delay={-1} />

      <motion.div {...show(0.1)} className="relative w-[82cqw]">
        <svg viewBox={`-6 -6 ${W + 12} ${H + 12}`} className="absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden>
          <defs>
            <Lattice id={`${id}h`} size={34} width={0.8} opacity={0.35} />
            <clipPath id={`${id}c`}>
              <path d={ogeePath(W, H, S)} />
            </clipPath>
          </defs>
          <path d={ogeePath(W, H, S)} fill="#072822" />
          <rect width={W} height={H} fill={`url(#${id}h)`} clipPath={`url(#${id}c)`} />
          <path d={ogeePath(W, H, S)} fill="none" stroke={GOLD} strokeWidth={2} />
          <path d={ogeePath(W - 20, H - 14, S - 10)} transform="translate(10 12)" fill="none" stroke={GOLD} strokeOpacity={0.5} strokeWidth={1} strokeDasharray="2 4" />
        </svg>
        <div className="relative flex min-h-[124cqw] flex-col items-center px-[9cqw] pt-[30cqw] pb-[10cqw] text-center">
          <motion.p {...show(0.4)} dir="rtl" className="text-[6.4cqw] leading-tight text-[#e3b964]" style={{ fontFamily: "var(--font-amiri)" }}>
            {invite.invocation}
          </motion.p>
          <motion.p {...show(0.55)} className="inv-label mt-[2cqw] text-[2.2cqw] text-[#f4efe2]/60">
            {invite.invocationMeaning}
          </motion.p>
          <motion.h1 {...show(0.85)} className="mt-[6cqw] flex flex-col items-center">
            <span className="inv-script text-[13cqw] leading-[1] text-[#f4efe2]">{a.first}</span>
            <span className="my-[1cqw] flex items-center gap-[2cqw] text-[#e3b964]">
              <span className="h-px w-[10cqw] bg-[#e3b964]/60" />
              <svg viewBox="-10 -10 20 20" className="w-[5cqw]" aria-hidden>
                <path d={starPath(9)} fill={GOLD} />
              </svg>
              <span className="h-px w-[10cqw] bg-[#e3b964]/60" />
            </span>
            <span className="inv-script text-[13cqw] leading-[1] text-[#f4efe2]">{b.first}</span>
          </motion.h1>
          <motion.div {...show(1.2)} className="mt-[6cqw]">
            <p className="inv-label text-[2.6cqw] text-[#e3b964]">
              {weekday(invite.date)} · {dayNum(invite.date)} {monthName(invite.date)} {yearNum(invite.date)}
            </p>
            <p className="inv-serif mt-[1.5cqw] text-[4cqw] text-[#f4efe2]/75 italic">{invite.city}</p>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

/* ───────── Blessing ───────── */

function Blessing({ invite }: { invite: Invite }) {
  const [a, b] = couple(invite);
  return (
    <section className="relative px-[7cqw] py-[14cqw] text-center">
      <Reveal>
        <p className="inv-label text-[2.5cqw] text-[#e3b964]">{invite.hosts}</p>
        <p className="inv-serif mx-auto mt-[4cqw] max-w-[76cqw] text-[5.2cqw] leading-snug text-[#f4efe2]/90 italic">{invite.message}</p>
      </Reveal>
      <div className="mt-[10cqw] grid grid-cols-2 gap-[4cqw]">
        {[a, b].map((p, i) => (
          <Reveal key={p === invite.bride ? "bride" : "groom"} delay={i * 0.15}>
            <div className="relative h-full overflow-hidden rounded-t-[30cqw] rounded-b-[3cqw] border border-[#e3b964]/50 bg-[#072822]/70 px-[3cqw] pt-[12cqw] pb-[5cqw]">
              <Rosette className="absolute -top-[14cqw] left-1/2 w-[34cqw] -translate-x-1/2 opacity-30" />
              <p className="inv-label relative text-[2cqw] text-[#e3b964]">{p === invite.bride ? "The bride" : "The groom"}</p>
              <p className="inv-script relative mt-[2cqw] text-[8.5cqw] leading-none text-[#f4efe2]">{p.first}</p>
              <p className="inv-serif relative mt-[3cqw] text-[3.4cqw] leading-snug text-[#f4efe2]/65 italic">{p.parents}</p>
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
        <Title kicker="Join us">The celebrations</Title>
      </Reveal>
      <div className="mt-[10cqw] space-y-[7cqw]">
        {invite.events.map((e) => (
          <Reveal key={e.name}>
            <article className="relative overflow-hidden rounded-t-[42cqw] rounded-b-[4cqw] border border-[#e3b964]/60 bg-gradient-to-b from-[#0f4a40] to-[#072822] px-[7cqw] pt-[16cqw] pb-[8cqw] text-center">
              <Rosette className="absolute -top-[20cqw] left-1/2 w-[64cqw] -translate-x-1/2 opacity-20" />
              <span className="relative mx-auto grid size-[15cqw] place-items-center rounded-full border border-[#e3b964]/70 bg-[#0c3b33] text-[#e3b964]">
                <EventGlyph kind={e.kind} className="size-[8.5cqw]" />
              </span>
              <h3 className="inv-script relative mt-[4cqw] text-[10cqw] leading-none text-[#f4efe2]">{e.name}</h3>
              <p className="inv-label relative mt-[4cqw] text-[2.5cqw] text-[#e3b964]">
                {weekday(e.start)} · {dayNum(e.start)} {monthName(e.start).slice(0, 3)} · {time(e.start)}
              </p>
              <p className="inv-serif relative mt-[3cqw] text-[5cqw] leading-tight text-[#f4efe2]">{e.venue}</p>
              {e.address && <p className="relative mt-[1cqw] text-[3.2cqw] text-[#f4efe2]/60">{e.address}</p>}
              {(e.dress || e.note) && <p className="inv-serif relative mt-[3cqw] text-[3.6cqw] text-[#e3b964] italic">{[e.dress && `Dress: ${e.dress}`, e.note].filter(Boolean).join(" · ")}</p>}
              <div className="relative">
                <EventActions event={e} invite={invite} theme={noor} />
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ───────── Closing ───────── */

function Closing({ invite }: { invite: Invite }) {
  const [a, b] = couple(invite);
  return (
    <section className="relative overflow-hidden px-[7cqw] pt-[18cqw] pb-[26cqw] text-center">
      <Rosette className="absolute top-[6cqw] left-1/2 w-[110cqw] -translate-x-1/2 animate-spin-slow opacity-10" />
      <Reveal className="relative">
        <Crescent className="mx-auto w-[20cqw]" />
        <p className="inv-serif mx-auto mt-[4cqw] max-w-[70cqw] text-[5.4cqw] leading-snug text-[#f4efe2]/90 italic">{invite.closing}</p>
        <p className="inv-script mt-[6cqw] text-[11cqw] leading-none text-[#e3b964]">
          {a.first} &amp; {b.first}
        </p>
        {invite.hashtag && <p className="inv-label mt-[5cqw] text-[2.6cqw] text-[#f4efe2]/70">{invite.hashtag}</p>}
      </Reveal>
      <Link href="/" className="inv-label absolute inset-x-0 bottom-[6cqw] text-[2cqw] text-[#f4efe2]/40">
        Crafted by {site.name}
      </Link>
    </section>
  );
}

function Backdrop() {
  const id = cleanId(useId());
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0" style={{ background: "radial-gradient(120% 50% at 50% 0%, #135447 0%, #0c3b33 40%, #05211c 100%)" }} />
      <svg className="absolute inset-0 h-full w-full opacity-[0.07]" aria-hidden>
        <defs>
          <Lattice id={`${id}b`} size={56} />
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id}b)`} />
      </svg>
    </div>
  );
}

function Divider({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-[3cqw] ${className ?? ""}`}>
      <span className="h-px w-[20cqw] bg-gradient-to-r from-transparent to-[#e3b964]" />
      <svg viewBox="-10 -10 20 20" className="w-[5cqw]" aria-hidden>
        <path d={starPath(9)} fill="none" stroke={GOLD} />
      </svg>
      <span className="h-px w-[20cqw] bg-gradient-to-l from-transparent to-[#e3b964]" />
    </div>
  );
}

function Title({ kicker, children }: { kicker?: string; children: React.ReactNode }) {
  return (
    <div className="text-center">
      {kicker && <p className="inv-label text-[2.5cqw] text-[#e3b964]">{kicker}</p>}
      <h2 className="inv-script mt-[2cqw] text-[10cqw] leading-tight text-[#f4efe2]">{children}</h2>
      <Divider className="mt-[3cqw]" />
    </div>
  );
}

export const noor: InviteTheme = {
  id: "noor",
  root: "bg-[#0c3b33] text-[#f4efe2]",
  vars: {
    "--inv-script": "var(--font-amiri), serif",
    "--inv-serif": "var(--font-cormorant), serif",
    "--inv-label": "var(--font-marcellus), serif",
  } as React.CSSProperties,
  accent: GOLD,
  ui: {
    section: "relative px-[7cqw] py-[14cqw]",
    card: "rounded-[5cqw] border border-[#e3b964]/40 bg-[#072822]/80 backdrop-blur-sm",
    input:
      "w-full rounded-[3cqw] border border-[#e3b964]/35 bg-[#05211c]/60 px-[4cqw] py-[3cqw] text-[3.8cqw] text-[#f4efe2] placeholder:text-[#f4efe2]/35 outline-none focus:border-[#e3b964]",
    chip: "rounded-full border border-[#e3b964]/40 text-[#f4efe2]/80 transition",
    chipOn: "rounded-full border border-[#e3b964] bg-[#e3b964] font-semibold text-[#0c3b33] transition",
    button:
      "inline-flex items-center gap-[1.5cqw] rounded-full bg-[#e3b964] px-[5cqw] py-[2.6cqw] text-[3.4cqw] font-semibold text-[#0c3b33] active:scale-95 transition",
    ghost: "inline-flex items-center gap-[1.5cqw] rounded-full border border-[#e3b964]/60 px-[5cqw] py-[2.6cqw] text-[3.4cqw] text-[#e3b964] active:scale-95 transition",
    muted: "text-[#f4efe2]/70",
    tile: "rounded-[3cqw] border border-[#e3b964]/40 bg-[#072822]/70 text-[#e3b964]",
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

