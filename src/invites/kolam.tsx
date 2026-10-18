"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useId, useMemo } from "react";
import { EventGlyph } from "@/art/glyphs";
import { cleanId, petalPath, r2 } from "@/art/geometry";
import { site } from "@/config/site";
import { dayNum, monthName, time, weekday, yearNum } from "@/lib/format";
import type { Invite } from "@/data/invites";
import { couple, EventActions, Reveal } from "./shared";
import { useOpened } from "./opened";
import type { InviteTheme, OpeningProps } from "./types";

const MAGENTA = "#9c1650";
const ZARI = "#d9a53c";
const PARROT = "#3f8f3a";
const RICE = "#fbf6ea";
const ease = [0.22, 1, 0.36, 1] as const;
const tamil = { fontFamily: "var(--font-tamil), serif" };

/* ───────── Kolam ───────── */

/** Dot positions for a diamond-shaped pulli grid (rows 1,3,5,…,n,…,3,1). */
function diamondDots(n: number, gap: number) {
  const dots: [number, number][] = [];
  const half = Math.floor(n / 2);
  for (let r = -half; r <= half; r++) {
    const count = n - 2 * Math.abs(r);
    for (let c = 0; c < count; c++) dots.push([(c - (count - 1) / 2) * gap, r * gap]);
  }
  return dots;
}

/**
 * A kolam that draws itself: dots appear, then petal loops bloom around each dot,
 * then a flowing outer line traces the whole figure. `play` starts the drawing.
 */
export function KolamDrawing({ className, color = RICE, play = true, size = 7, speed = 1 }: { className?: string; color?: string; play?: boolean; size?: number; speed?: number }) {
  const gap = 20;
  const dots = useMemo(() => diamondDots(size, gap), [size]);
  const R = (Math.floor(size / 2) + 1) * gap;
  const outer = useMemo(() => {
    // Four-lobed outline that swings out between the diamond's corners.
    const pts: string[] = [];
    for (let i = 0; i <= 240; i++) {
      const t = (i / 240) * Math.PI * 2;
      const rad = R * (0.92 + 0.16 * Math.cos(4 * t)) + 2.5 * Math.cos(12 * t);
      pts.push(`${r2(Math.cos(t - Math.PI / 4) * rad)} ${r2(Math.sin(t - Math.PI / 4) * rad)}`);
    }
    return `M${pts.join(" L")} Z`;
  }, [R]);
  const v = { pathLength: 1, opacity: 1 };
  const h = { pathLength: 0, opacity: 0 };
  return (
    <svg viewBox={`${-R - 16} ${-R - 16} ${2 * R + 32} ${2 * R + 32}`} className={className} aria-hidden>
      <g fill={color}>
        {dots.map(([x, y], i) => (
          <motion.circle key={i} cx={x} cy={y} r={1.8} initial={{ opacity: 0, scale: 0 }} animate={play ? { opacity: 1, scale: 1 } : {}} transition={{ delay: (i * 0.02) / speed, duration: 0.3 }} />
        ))}
      </g>
      <g fill="none" stroke={color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
        {dots.map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y})`}>
            {[0, 90, 180, 270].map((rot) => (
              <motion.path
                key={rot}
                d={petalPath(3, 6.5, 4.2)}
                transform={`rotate(${rot + 45})`}
                initial={h}
                animate={play ? v : {}}
                transition={{ delay: (0.6 + i * 0.03) / speed, duration: 0.6 / speed, ease: "easeInOut" }}
              />
            ))}
          </g>
        ))}
        <motion.path d={outer} strokeWidth={1.6} initial={h} animate={play ? v : {}} transition={{ delay: 1.6 / speed, duration: 2.2 / speed, ease: "easeInOut" }} />
        <motion.path
          d={outer}
          strokeWidth={0.8}
          strokeDasharray="1 4"
          transform="scale(1.1)"
          initial={h}
          animate={play ? v : {}}
          transition={{ delay: 2.4 / speed, duration: 2 / speed, ease: "easeInOut" }}
        />
      </g>
    </svg>
  );
}

/* ───────── Silk, brass and jasmine ───────── */

/** Kanjeevaram border: magenta body, zari band of temple teeth, a parrot-green rule. */
function SilkBorder({ className, flip }: { className?: string; flip?: boolean }) {
  const id = cleanId(useId());
  return (
    <svg className={className} preserveAspectRatio="none" style={{ transform: flip ? "scaleY(-1)" : undefined }} aria-hidden>
      <defs>
        <pattern id={`${id}t`} width="24" height="22" patternUnits="userSpaceOnUse">
          <path d="M0 22 L12 4 L24 22 Z" fill={ZARI} />
          <path d="M6 22 L12 12 L18 22 Z" fill={MAGENTA} />
          <circle cx="12" cy="2.5" r="2" fill={ZARI} />
        </pattern>
        <linearGradient id={`${id}z`} x1="0" x2="1">
          <stop offset="0" stopColor="#b7832b" />
          <stop offset="0.5" stopColor="#f3d68c" />
          <stop offset="1" stopColor="#b7832b" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill={MAGENTA} />
      <rect y="18%" width="100%" height="10%" fill={`url(#${id}z)`} />
      <rect y="34%" width="100%" height="34%" fill={`url(#${id}t)`} />
      <rect y="72%" width="100%" height="6%" fill={PARROT} />
      <rect y="84%" width="100%" height="4%" fill={`url(#${id}z)`} />
    </svg>
  );
}

function BrassLamp({ className, delay = 0 }: { className?: string; delay?: number }) {
  const id = cleanId(useId());
  return (
    <svg viewBox="0 0 80 200" className={className} aria-hidden>
      <defs>
        <linearGradient id={`${id}b`} x1="0" x2="1">
          <stop offset="0" stopColor="#8a5a14" />
          <stop offset="0.45" stopColor="#f2cf7a" />
          <stop offset="1" stopColor="#7a4c10" />
        </linearGradient>
        <radialGradient id={`${id}f`} cx="50%" cy="80%" r="70%">
          <stop offset="0" stopColor="#fffbe6" />
          <stop offset="0.45" stopColor="#ffd34a" />
          <stop offset="1" stopColor="#f07a1a" />
        </radialGradient>
      </defs>
      <path d="M40 2 C44 8 44 14 40 18 C36 14 36 8 40 2 Z" fill={`url(#${id}b)`} />
      <rect x="37" y="18" width="6" height="16" fill={`url(#${id}b)`} />
      {[12, 26, 40, 54, 68].map((x, i) => (
        <g key={x} className="animate-flicker" style={{ transformOrigin: `${x}px 44px`, transformBox: "view-box", animationDelay: `${delay + i * 0.25}s` }}>
          <circle cx={x} cy={34} r={8} fill="#ffd34a" opacity={0.22} />
          <path d={`M${x} 26 C${x + 4} 33 ${x + 3} 39 ${x} 42 C${x - 3} 39 ${x - 4} 33 ${x} 26 Z`} fill={`url(#${id}f)`} />
        </g>
      ))}
      <path d="M4 44 H76 C72 54 58 58 40 58 C22 58 8 54 4 44 Z" fill={`url(#${id}b)`} />
      <path d="M36 58 H44 V150 H36 Z" fill={`url(#${id}b)`} />
      {[78, 104, 128].map((y) => (
        <ellipse key={y} cx="40" cy={y} rx="9" ry="6" fill={`url(#${id}b)`} />
      ))}
      <path d="M40 150 C28 152 22 160 22 168 H58 C58 160 52 152 40 150 Z" fill={`url(#${id}b)`} />
      <path d="M10 176 C14 168 66 168 70 176 C74 184 66 192 40 192 C14 192 6 184 10 176 Z" fill={`url(#${id}b)`} />
    </svg>
  );
}

function Jasmine({ className, length = 9, delay = 0 }: { className?: string; length?: number; delay?: number }) {
  return (
    <div className={className}>
      <div className="animate-sway" style={{ transformOrigin: "top center", animationDelay: `${delay}s` }}>
        <svg viewBox={`0 0 20 ${length * 14 + 10}`} className="w-full" aria-hidden>
          <line x1="10" y1="0" x2="10" y2={length * 14} stroke={PARROT} strokeWidth="0.8" />
          {Array.from({ length }, (_, i) => (
            <g key={i} transform={`translate(10 ${8 + i * 14})`}>
              <ellipse rx="4" ry="6" fill="#fffdf6" transform="rotate(-30)" />
              <ellipse rx="4" ry="6" fill="#f6efdc" transform="rotate(30)" />
              <circle r="1.4" fill="#e9d79c" />
            </g>
          ))}
          <path d={`M10 ${length * 14} l-3 8 h6 Z`} fill={ZARI} />
        </svg>
      </div>
    </div>
  );
}

function Gopuram({ className, color = ZARI }: { className?: string; color?: string }) {
  const tiers = 6;
  return (
    <svg viewBox="0 0 200 220" className={className} aria-hidden>
      <g fill={color}>
        {Array.from({ length: tiers }, (_, i) => {
          const w = 180 - i * 24;
          const y = 200 - i * 26;
          return <path key={i} d={`M${100 - w / 2} ${y} H${100 + w / 2} L${100 + w / 2 - 8} ${y - 24} H${100 - w / 2 + 8} Z`} opacity={0.55 + i * 0.07} />;
        })}
        <path d="M58 44 C58 24 142 24 142 44 Z" />
        {[76, 100, 124].map((x) => (
          <path key={x} d={`M${x} 26 C${x + 5} 18 ${x + 4} 10 ${x} 4 C${x - 4} 10 ${x - 5} 18 ${x} 26 Z`} />
        ))}
      </g>
      <g fill="#00000033">
        {Array.from({ length: tiers - 1 }, (_, i) => (
          <rect key={i} x={96} y={186 - i * 26} width={8} height={10} rx={4} />
        ))}
      </g>
    </svg>
  );
}

function BananaLeaf({ className, flip }: { className?: string; flip?: boolean }) {
  return (
    <svg viewBox="0 0 120 160" className={className} style={{ transform: flip ? "scaleX(-1)" : undefined }} aria-hidden>
      <path d="M8 156 C10 100 40 40 112 6 C96 60 70 120 8 156 Z" fill={PARROT} />
      <path d="M8 156 C46 104 76 56 112 6" stroke="#bfe39a" strokeWidth="1.6" fill="none" />
      {Array.from({ length: 9 }, (_, i) => {
        const t = 0.15 + i * 0.09;
        const x = 8 + 104 * t;
        const y = 156 - 150 * t;
        return <path key={i} d={`M${x} ${y} l${18 - i} ${6 + i}`} stroke="#2d6e29" strokeWidth="0.8" />;
      })}
    </svg>
  );
}

/* ───────── Opening: kolam at the threshold ───────── */

function Opening({ invite, opened, onOpen }: OpeningProps) {
  const [a, b] = couple(invite);
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ pointerEvents: opened ? "none" : "auto" }}>
      <motion.div className="absolute inset-x-0 top-0 h-1/2 overflow-hidden bg-[#fbf6ea]" animate={{ y: opened ? "-101%" : "0%" }} transition={{ duration: 1.2, ease: [0.7, 0, 0.3, 1], delay: 0.15 }}>
        <SilkBorder className="absolute inset-x-0 top-0 h-[16cqw] w-full" />
      </motion.div>
      <motion.div className="absolute inset-x-0 bottom-0 h-1/2 overflow-hidden bg-[#fbf6ea]" animate={{ y: opened ? "101%" : "0%" }} transition={{ duration: 1.2, ease: [0.7, 0, 0.3, 1], delay: 0.15 }}>
        <SilkBorder className="absolute inset-x-0 bottom-0 h-[16cqw] w-full" flip />
      </motion.div>

      <motion.div className="absolute inset-0 flex flex-col items-center justify-center" animate={{ opacity: opened ? 0 : 1, scale: opened ? 1.1 : 1 }} transition={{ duration: 0.4 }}>
        <p className="text-[4.6cqw] text-[#9c1650]" style={tamil}>
          {invite.invocation}
        </p>
        <button onClick={onOpen} aria-label="Open invitation" className="relative mt-[4cqw] w-[74cqw]">
          <KolamDrawing className="w-full" color={MAGENTA} speed={1.4} />
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid size-[20cqw] place-items-center rounded-full bg-[#9c1650] text-[3cqw] font-semibold tracking-[0.2em] text-[#fbf6ea] uppercase shadow-[0_0_0_1.2cqw_#fbf6ea,0_0_0_1.8cqw_#d9a53c]" style={{ fontFamily: "var(--font-marcellus)" }}>
              Enter
            </span>
          </span>
        </button>
        <p className="inv-script mt-[5cqw] text-[8cqw] leading-none text-[#3b0a1f]">
          {a.first} <span className="text-[#d9a53c]">&amp;</span> {b.first}
        </p>
        <p className="inv-label mt-[3cqw] text-[2.4cqw] text-[#3b0a1f]/60">Tap the kolam to step inside</p>
      </motion.div>
    </div>
  );
}

/* ───────── Hero ───────── */

function Hero({ invite }: { invite: Invite }) {
  const opened = useOpened();
  const [a, b] = couple(invite);
  const show = (delay: number) => ({
    initial: { opacity: 0, y: 22 },
    animate: opened ? { opacity: 1, y: 0 } : {},
    transition: { duration: 1.1, delay, ease },
  });
  return (
    <section className="relative flex min-h-[var(--screen-h,100svh)] flex-col overflow-hidden" style={{ background: "linear-gradient(160deg,#b01d5e 0%,#9c1650 40%,#6e0d38 100%)" }}>
      <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: "repeating-linear-gradient(115deg, #ffffff22 0 1px, transparent 1px 6px)" }} />
      <SilkBorder className="relative h-[16cqw] w-full shrink-0" />
      <Jasmine className="absolute top-[14cqw] left-[4cqw] w-[6cqw]" length={10} />
      <Jasmine className="absolute top-[14cqw] left-[12cqw] w-[5cqw]" length={6} delay={-1} />
      <Jasmine className="absolute top-[14cqw] right-[4cqw] w-[6cqw]" length={12} delay={-2} />
      <Jasmine className="absolute top-[14cqw] right-[12cqw] w-[5cqw]" length={7} delay={-0.5} />

      <div className="relative flex flex-1 flex-col items-center justify-center px-[8cqw] py-[10cqw] text-center">
        <div className="absolute top-1/2 left-1/2 w-[110cqw] -translate-x-1/2 -translate-y-1/2 opacity-25">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 120, repeat: Infinity, ease: "linear" }}>
            <KolamDrawing className="w-full" color={ZARI} play={opened} size={9} />
          </motion.div>
        </div>
        <motion.p {...show(0.3)} className="relative text-[5.6cqw] text-[#f3d68c]" style={tamil}>
          {invite.invocation}
        </motion.p>
        <motion.p {...show(0.45)} className="inv-label relative mt-[1.5cqw] text-[2.4cqw] text-[#fbf6ea]/70">
          {invite.invocationMeaning}
        </motion.p>
        <motion.h1 {...show(0.8)} className="relative mt-[6cqw] flex flex-col items-center">
          <span className="inv-script text-[14cqw] leading-[1.05] text-[#fbf6ea]">{a.first}</span>
          <span className="inv-serif my-[1cqw] text-[6cqw] text-[#f3d68c] italic">weds</span>
          <span className="inv-script text-[14cqw] leading-[1.05] text-[#fbf6ea]">{b.first}</span>
        </motion.h1>
        <motion.div {...show(1.2)} className="relative mt-[7cqw] flex items-center gap-[4cqw] text-[#fbf6ea]">
          <div className="text-right">
            <p className="inv-label text-[2.4cqw] text-[#f3d68c]">{weekday(invite.date)}</p>
            <p className="inv-label text-[2.4cqw]">{monthName(invite.date)}</p>
          </div>
          <p className="inv-script text-[14cqw] leading-none text-[#f3d68c]">{dayNum(invite.date)}</p>
          <div className="text-left">
            <p className="inv-label text-[2.4cqw] text-[#f3d68c]">{yearNum(invite.date)}</p>
            <p className="inv-label text-[2.4cqw]">{time(invite.date)}</p>
          </div>
        </motion.div>
        <motion.p {...show(1.35)} className="inv-serif relative mt-[3cqw] text-[4cqw] text-[#fbf6ea]/80 italic">
          {invite.city}
        </motion.p>
      </div>

      <div className="relative h-[34cqw] shrink-0">
        <Gopuram className="absolute bottom-[6cqw] left-1/2 w-[40cqw] -translate-x-1/2 opacity-50" color="#f3d68c" />
        <BananaLeaf className="absolute bottom-[4cqw] -left-[4cqw] w-[26cqw]" />
        <BananaLeaf className="absolute -right-[4cqw] bottom-[4cqw] w-[26cqw]" flip />
        <BrassLamp className="absolute bottom-[5cqw] left-[18cqw] w-[11cqw]" />
        <BrassLamp className="absolute right-[18cqw] bottom-[5cqw] w-[11cqw]" delay={0.6} />
        <SilkBorder className="absolute inset-x-0 bottom-0 h-[8cqw] w-full" flip />
      </div>
    </section>
  );
}

/* ───────── Blessing ───────── */

function Blessing({ invite }: { invite: Invite }) {
  const [a, b] = couple(invite);
  return (
    <section className="relative px-[7cqw] py-[14cqw] text-center">
      <Reveal>
        <KolamDrawing className="mx-auto w-[30cqw]" color={MAGENTA} size={5} />
        <p className="inv-label mt-[4cqw] text-[2.5cqw] text-[#9c1650]">{invite.hosts}</p>
        <p className="inv-serif mx-auto mt-[4cqw] max-w-[76cqw] text-[5.2cqw] leading-snug text-[#3b0a1f] italic">{invite.message}</p>
      </Reveal>
      <div className="mt-[10cqw] space-y-[4cqw]">
        {[a, b].map((p, i) => (
          <Reveal key={p.full} delay={i * 0.15}>
            <div className="overflow-hidden rounded-[4cqw] bg-white shadow-[0_2cqw_6cqw_-4cqw_rgba(59,10,31,.35)]">
              <SilkBorder className="h-[7cqw] w-full" />
              <div className="px-[6cqw] py-[5cqw]">
                <p className="inv-label text-[2.3cqw] text-[#3f8f3a]">{p === invite.bride ? "Manamagal · Bride" : "Manamagan · Groom"}</p>
                <p className="inv-script mt-[1.5cqw] text-[9cqw] leading-none text-[#9c1650]">{p.full}</p>
                <p className="inv-serif mt-[2cqw] text-[3.8cqw] text-[#3b0a1f]/70 italic">{p.parents}</p>
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
        <Title kicker="The functions">Wedding celebrations</Title>
      </Reveal>
      <div className="mt-[10cqw] space-y-[7cqw]">
        {invite.events.map((e, i) => {
          const hero = e.kind === "muhurtham";
          return (
            <Reveal key={e.name}>
              <article className={`relative overflow-hidden rounded-[5cqw] ${hero ? "bg-[#9c1650] text-[#fbf6ea]" : "bg-white text-[#3b0a1f]"} shadow-[0_2cqw_6cqw_-4cqw_rgba(59,10,31,.35)]`}>
                <div className="h-[2.4cqw]" style={{ background: i % 2 ? PARROT : ZARI }} />
                <div className="px-[7cqw] py-[7cqw]">
                  <div className="flex items-center gap-[4cqw]">
                    <span className={`grid size-[14cqw] shrink-0 place-items-center rounded-full ${hero ? "bg-[#fbf6ea] text-[#9c1650]" : "bg-[#9c1650] text-[#f3d68c]"}`}>
                      <EventGlyph kind={e.kind} className="size-[8cqw]" />
                    </span>
                    <div className="min-w-0">
                      <h3 className={`inv-script leading-none ${e.name.length > 11 ? "text-[5.6cqw]" : "text-[8cqw]"}`}>{e.name}</h3>
                      <p className={`inv-label mt-[1.5cqw] text-[2.4cqw] ${hero ? "text-[#f3d68c]" : "text-[#3f8f3a]"}`}>
                        {weekday(e.start)} · {dayNum(e.start)} {monthName(e.start).slice(0, 3)} · {time(e.start)}
                      </p>
                    </div>
                  </div>
                  <p className="inv-serif mt-[5cqw] text-[5cqw] leading-tight font-semibold">{e.venue}</p>
                  <p className="mt-[1cqw] text-[3.2cqw] opacity-70">{e.address}</p>
                  {(e.dress || e.note) && <p className="inv-serif mt-[3cqw] text-[3.8cqw] italic opacity-90">{[e.dress && `Dress: ${e.dress}`, e.note].filter(Boolean).join(" · ")}</p>}
                  <div className="[&>div]:justify-start">
                    <EventActions event={e} invite={invite} theme={kolam} />
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
    <section className="relative overflow-hidden bg-[#9c1650] pt-[16cqw] pb-[26cqw] text-center text-[#fbf6ea]">
      <SilkBorder className="absolute inset-x-0 top-0 h-[10cqw] w-full" />
      <Reveal className="relative px-[7cqw]">
        <div className="flex items-end justify-center gap-[6cqw]">
          <BrassLamp className="w-[12cqw]" />
          <BrassLamp className="w-[12cqw]" delay={0.5} />
        </div>
        <p className="inv-serif mx-auto mt-[5cqw] max-w-[72cqw] text-[5.4cqw] leading-snug italic">{invite.closing}</p>
        <p className="inv-script mt-[6cqw] text-[11cqw] leading-none text-[#f3d68c]">
          {a.first} &amp; {b.first}
        </p>
        <p className="inv-label mt-[4cqw] text-[2.4cqw] text-[#fbf6ea]/70">{invite.hosts}</p>
      </Reveal>
      <Link href="/" className="inv-label absolute inset-x-0 bottom-[6cqw] text-[2cqw] text-[#fbf6ea]/45">
        Crafted by {site.name}
      </Link>
    </section>
  );
}

function Backdrop() {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{ background: RICE, backgroundImage: "radial-gradient(#9c165022 1.2px, transparent 1.2px)", backgroundSize: "6cqw 6cqw" }}
    />
  );
}

function Divider({ className }: { className?: string }) {
  return (
    <div className={`flex justify-center ${className ?? ""}`}>
      <KolamDrawing className="w-[18cqw]" color={MAGENTA} size={3} />
    </div>
  );
}

function Title({ kicker, children }: { kicker?: string; children: React.ReactNode }) {
  return (
    <div className="text-center">
      {kicker && <p className="inv-label text-[2.5cqw] text-[#3f8f3a]">{kicker}</p>}
      <h2 className="inv-script mt-[2cqw] text-[10cqw] leading-tight text-[#9c1650]">{children}</h2>
      <div className="mx-auto mt-[3cqw] flex w-[40cqw] items-center gap-[2cqw]">
        <span className="h-[0.6cqw] flex-1 bg-[#d9a53c]" />
        <span className="size-[2.4cqw] rotate-45 bg-[#3f8f3a]" />
        <span className="h-[0.6cqw] flex-1 bg-[#d9a53c]" />
      </div>
    </div>
  );
}

export const kolam: InviteTheme = {
  id: "kolam",
  root: "bg-[#fbf6ea] text-[#3b0a1f]",
  vars: {
    "--inv-script": "var(--font-yeseva), serif",
    "--inv-serif": "var(--font-cormorant), serif",
    "--inv-label": "var(--font-marcellus), serif",
  } as React.CSSProperties,
  accent: MAGENTA,
  ui: {
    section: "relative px-[7cqw] py-[14cqw]",
    card: "rounded-[5cqw] bg-white shadow-[0_2cqw_6cqw_-4cqw_rgba(59,10,31,.35)]",
    input:
      "w-full rounded-[3cqw] border border-[#9c1650]/20 bg-[#fbf6ea] px-[4cqw] py-[3cqw] text-[3.8cqw] text-[#3b0a1f] placeholder:text-[#3b0a1f]/35 outline-none focus:border-[#9c1650]",
    chip: "rounded-full border border-[#9c1650]/25 text-[#3b0a1f]/80 transition",
    chipOn: "rounded-full border border-[#9c1650] bg-[#9c1650] text-[#fbf6ea] transition",
    button:
      "inline-flex items-center gap-[1.5cqw] rounded-full bg-[#d9a53c] px-[5cqw] py-[2.6cqw] text-[3.4cqw] font-semibold text-[#3b0a1f] active:scale-95 transition",
    ghost: "inline-flex items-center gap-[1.5cqw] rounded-full border border-current/40 px-[5cqw] py-[2.6cqw] text-[3.4cqw] active:scale-95 transition",
    muted: "text-[#3b0a1f]/65",
    tile: "rounded-[3cqw] bg-white text-[#9c1650] shadow-[0_1cqw_4cqw_-2cqw_rgba(59,10,31,.35)]",
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

