"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { EventGlyph } from "@/art/glyphs";
import { seeded } from "@/art/geometry";
import { FloralCorner, LotusDivider, PetalShape } from "@/art/ornaments";
import { site } from "@/config/site";
import { dayNum, monthName, time, weekday, yearNum } from "@/lib/format";
import type { Invite } from "@/data/invites";
import { couple, EventActions, initials, Reveal } from "./shared";
import { useOpened } from "./opened";
import type { InviteTheme, OpeningProps } from "./types";

const ROSE = "#a2405f";
const ease = [0.22, 1, 0.36, 1] as const;

/* ───────── Petals ───────── */

export function Petals({ count = 14, seed = 7 }: { count?: number; seed?: number }) {
  const petals = useMemo(() => {
    const rnd = seeded(seed);
    const colors = ["#f2b8c0", "#f7cdd0", "#e89aa9", "#fbe1dc", "#f0a8a0"];
    return Array.from({ length: count }, (_, i) => ({
      left: rnd() * 100,
      size: 3 + rnd() * 4,
      dur: 9 + rnd() * 9,
      delay: -rnd() * 18,
      drift: (rnd() - 0.5) * 30,
      spin: (rnd() > 0.5 ? 1 : -1) * (180 + rnd() * 360),
      color: colors[i % colors.length],
    }));
  }, [count, seed]);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {petals.map((p, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: `${p.left}%`, width: `${p.size}cqw` }}
          initial={{ top: "-6%" }}
          animate={{ top: ["-6%", "106%"], x: [0, p.drift, -p.drift / 2, p.drift], rotate: [0, p.spin] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "linear" }}
        >
          <PetalShape color={p.color} className="w-full opacity-90" />
        </motion.div>
      ))}
    </div>
  );
}

function Washes() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -top-[20cqw] -left-[30cqw] size-[100cqw] rounded-full bg-[#f7cfd3] opacity-70 blur-[14cqw]"
        animate={{ x: [0, 20, 0], y: [0, 30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[40%] -right-[40cqw] size-[90cqw] rounded-full bg-[#dfe6d3] opacity-80 blur-[14cqw]"
        animate={{ x: [0, -25, 0], y: [0, -20, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-[30cqw] left-[10cqw] size-[80cqw] rounded-full bg-[#fde3d3] opacity-80 blur-[14cqw]"
        animate={{ x: [0, 15, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

/* ───────── Opening: wax-sealed envelope ───────── */

function Seal({ invite, className }: { invite: Invite; className?: string }) {
  return (
    <span className={`relative grid place-items-center ${className ?? ""}`}>
      <svg viewBox="-50 -50 100 100" className="absolute inset-0 h-full w-full drop-shadow-[0_6px_10px_rgba(90,20,40,.45)]">
        <defs>
          <radialGradient id="waxg" cx="35%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#d4677f" />
            <stop offset="55%" stopColor="#a2405f" />
            <stop offset="100%" stopColor="#6e2440" />
          </radialGradient>
        </defs>
        <path
          d="M0 -46 C14 -47 22 -40 32 -34 C42 -27 47 -14 46 0 C47 14 41 26 33 34 C23 43 12 47 0 46 C-14 47 -25 42 -34 33 C-43 24 -47 12 -46 -2 C-46 -15 -41 -26 -32 -34 C-23 -42 -12 -46 0 -46 Z"
          fill="url(#waxg)"
        />
        <circle r={33} fill="none" stroke="#f7c8d2" strokeOpacity={0.55} strokeWidth={1.2} />
        <circle r={29} fill="none" stroke="#5e1d36" strokeOpacity={0.4} strokeWidth={0.8} strokeDasharray="1 3" />
      </svg>
      <span className="inv-script relative text-[9cqw] leading-none text-[#fbe1e6] [text-shadow:0_1px_0_#5e1d36]">{initials(invite)}</span>
    </span>
  );
}

function Opening({ invite, opened, onOpen }: OpeningProps) {
  const [a, b] = couple(invite);
  return (
    <motion.div
      className="absolute inset-0 overflow-hidden bg-[#fbeee9]"
      style={{ pointerEvents: opened ? "none" : "auto" }}
      animate={{ opacity: opened ? 0 : 1 }}
      transition={{ delay: opened ? 1.9 : 0, duration: 0.7 }}
    >
      <Washes />
      <Petals count={10} seed={3} />
      <FloralCorner className="absolute -top-[4cqw] -left-[6cqw] w-[58cqw]" />
      <FloralCorner className="absolute -right-[6cqw] -bottom-[4cqw] w-[58cqw] rotate-180" />

      <motion.p
        className="inv-script absolute inset-x-0 top-[34%] text-center text-[11cqw] text-[#a2405f]"
        animate={{ opacity: opened ? 0 : 1, y: opened ? -20 : 0 }}
      >
        You&rsquo;re invited
      </motion.p>

      <button onClick={onOpen} aria-label="Open invitation" className="absolute top-[47%] left-1/2 w-[80cqw] -translate-x-1/2" style={{ perspective: "200cqw" }}>
        <motion.div
          className="relative aspect-[1.45] w-full"
          animate={opened ? { y: ["0%", "0%", "30%"], scale: [1, 1, 0.9] } : { y: [0, -6, 0] }}
          transition={opened ? { duration: 1.9, times: [0, 0.5, 1], ease } : { duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* back */}
          <div className="absolute inset-0 rounded-[2cqw] bg-[#ecc6c3] shadow-[0_24px_50px_-20px_rgba(110,36,64,.5)]" />
          {/* card */}
          <motion.div
            className="absolute inset-x-[5cqw] top-[4cqw] bottom-[4cqw] flex flex-col items-center justify-center rounded-[1.5cqw] bg-[#fffaf6] text-center"
            animate={{ y: opened ? "-62%" : "0%" }}
            transition={{ delay: opened ? 0.7 : 0, duration: 1, ease }}
            style={{ zIndex: opened ? 3 : 1 }}
          >
            <span className="inv-script text-[8cqw] leading-none text-[#a2405f]">{a.first}</span>
            <span className="inv-serif text-[3cqw] text-[#869d7a] italic">and</span>
            <span className="inv-script text-[8cqw] leading-none text-[#a2405f]">{b.first}</span>
          </motion.div>
          {/* pocket */}
          <svg viewBox="0 0 145 100" preserveAspectRatio="none" className="absolute inset-0 z-[2] h-full w-full">
            <path d="M0 0 L72.5 58 L145 0 V100 H0 Z" fill="#f4d5d1" />
            <path d="M0 100 L60 50 M145 100 L85 50" stroke="#e3b1ae" strokeWidth={0.6} />
            <path d="M0 0 L72.5 58 L145 0" fill="none" stroke="#e8bcb8" strokeWidth={0.5} />
          </svg>
          {/* flap */}
          <motion.div
            className="absolute inset-x-0 top-0 h-[62%]"
            style={{ transformOrigin: "top center", transformStyle: "preserve-3d", zIndex: opened ? 0 : 4 }}
            animate={{ rotateX: opened ? 180 : 0 }}
            transition={{ duration: 0.8, ease }}
          >
            <svg viewBox="0 0 145 62" preserveAspectRatio="none" className="h-full w-full drop-shadow-[0_4px_4px_rgba(110,36,64,.15)]">
              <path d="M0 0 H145 L76 58 Q72.5 61 69 58 Z" fill="#efcbc7" />
            </svg>
          </motion.div>
          {/* seal */}
          <motion.span
            className="absolute top-[62%] left-1/2 z-[5] block -translate-x-1/2 -translate-y-1/2"
            animate={{ scale: opened ? [1, 1.15, 0] : 1, rotate: opened ? 25 : 0 }}
            transition={{ duration: 0.5 }}
          >
            <Seal invite={invite} className="size-[22cqw]" />
          </motion.span>
        </motion.div>
      </button>

      <motion.p
        className="inv-label absolute inset-x-0 bottom-[22%] text-center text-[2.6cqw] text-[#869d7a]"
        animate={{ opacity: opened ? 0 : [0.4, 1, 0.4] }}
        transition={{ duration: 2.4, repeat: opened ? 0 : Infinity }}
      >
        Tap the seal to open
      </motion.p>
    </motion.div>
  );
}

/* ───────── Hero ───────── */

function Hero({ invite }: { invite: Invite }) {
  const opened = useOpened();
  const [a, b] = couple(invite);
  const show = (delay: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: opened ? { opacity: 1, y: 0 } : {},
    transition: { duration: 1.2, delay, ease },
  });
  return (
    <section className="relative flex min-h-[var(--screen-h,100svh)] flex-col items-center justify-center overflow-hidden px-[8cqw] py-[18cqw]">
      <Washes />
      <Petals />
      <motion.div {...show(0.1)} className="relative w-[78cqw]">
        <div className="relative rounded-t-full border border-[#869d7a]/50 bg-white/55 px-[6cqw] pt-[24cqw] pb-[12cqw] text-center shadow-[0_30px_60px_-30px_rgba(162,64,95,.35)] backdrop-blur-[2px]">
          <div className="pointer-events-none absolute inset-[2cqw] rounded-t-full border border-[#a2405f]/20" />
          <motion.p {...show(0.5)} className="inv-deva text-[4cqw] text-[#a2405f]">
            {invite.invocation}
          </motion.p>
          <motion.p {...show(0.7)} className="inv-label mt-[4cqw] text-[2.3cqw] text-[#869d7a]">
            {invite.hosts}
          </motion.p>
          <motion.h1 {...show(1)} className="mt-[4cqw] flex flex-col items-center">
            <span className="inv-script text-[16cqw] leading-[1.1] text-[#a2405f]">{a.first}</span>
            <span className="inv-serif text-[6cqw] leading-none text-[#869d7a] italic">&amp;</span>
            <span className="inv-script text-[16cqw] leading-[1.1] text-[#a2405f]">{b.first}</span>
          </motion.h1>
          <motion.div {...show(1.3)}>
            <p className="inv-serif mx-auto mt-[3cqw] max-w-[56cqw] text-[3.8cqw] leading-snug text-[#5a2236]/80 italic">{invite.message}</p>
            <div className="mt-[6cqw] flex items-center justify-center gap-[3cqw] text-[#5a2236]">
              <span className="inv-label border-y border-[#a2405f]/30 py-[1.5cqw] text-[2.4cqw]">{weekday(invite.date)}</span>
              <span className="inv-serif text-[11cqw] leading-none text-[#a2405f]">{dayNum(invite.date)}</span>
              <span className="inv-label border-y border-[#a2405f]/30 py-[1.5cqw] text-[2.4cqw]">
                {monthName(invite.date).slice(0, 3)} {yearNum(invite.date)}
              </span>
            </div>
            <p className="inv-label mt-[3cqw] text-[2.4cqw] text-[#869d7a]">{invite.city}</p>
          </motion.div>
        </div>
        <motion.div
          className="absolute -top-[10cqw] -left-[14cqw] w-[48cqw]"
          initial={{ opacity: 0, scale: 0.6, rotate: -20 }}
          animate={opened ? { opacity: 1, scale: 1, rotate: 0 } : {}}
          transition={{ duration: 1.4, delay: 0.3, ease }}
        >
          <FloralCorner className="w-full" />
        </motion.div>
        <motion.div
          className="absolute -right-[14cqw] -bottom-[10cqw] w-[48cqw]"
          initial={{ opacity: 0, scale: 0.6, rotate: 20 }}
          animate={opened ? { opacity: 1, scale: 1, rotate: 0 } : {}}
          transition={{ duration: 1.4, delay: 0.5, ease }}
        >
          <FloralCorner className="w-full rotate-180" />
        </motion.div>
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
        <Title kicker="The couple">Two hearts, one home</Title>
      </Reveal>
      <div className="mt-[10cqw] space-y-[6cqw]">
        {[a, b].map((p, i) => (
          <Reveal key={p === invite.bride ? "bride" : "groom"} delay={i * 0.15}>
            <div className={`flex items-center gap-[5cqw] ${i ? "flex-row-reverse text-right" : "text-left"}`}>
              <span className="relative grid size-[26cqw] shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#f7d6d8] to-[#e7efe0]">
                <span className="absolute inset-[1.5cqw] rounded-full border border-dashed border-[#a2405f]/40" />
                <span className="inv-script text-[13cqw] leading-none text-[#a2405f]">{p.first[0]}</span>
              </span>
              <div>
                <p className="inv-script text-[10cqw] leading-none text-[#a2405f]">{p.first}</p>
                <p className="inv-label mt-[2cqw] text-[2.2cqw] text-[#5a2236]">{p.full}</p>
                <p className="inv-serif mt-[1cqw] text-[3.4cqw] text-[#5a2236] italic">{p.parents}</p>
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
        <Title kicker="Save the dates">The celebrations</Title>
      </Reveal>
      <div className="relative mt-[10cqw]">
        <span className="absolute top-0 bottom-0 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[#a2405f]/30 to-transparent" />
        {invite.events.map((e, i) => (
          <Reveal key={e.name} className="relative mb-[8cqw]">
            <article className="relative overflow-hidden rounded-[6cqw] border border-white bg-white/75 px-[6cqw] pt-[8cqw] pb-[7cqw] text-center shadow-[0_24px_50px_-30px_rgba(162,64,95,.5)] backdrop-blur">
              <FloralCorner className={`absolute -top-[6cqw] w-[30cqw] opacity-90 ${i % 2 ? "-left-[6cqw]" : "-right-[6cqw] -scale-x-100"}`} />
              <span className="mx-auto grid size-[14cqw] place-items-center rounded-full bg-[#f8e3e4] text-[#a2405f]">
                <EventGlyph kind={e.kind} className="size-[8cqw]" />
              </span>
              <h3 className="inv-script mt-[3cqw] text-[12cqw] leading-none text-[#a2405f]">{e.name}</h3>
              {e.devanagari && <p className="inv-deva mt-[1cqw] text-[3.4cqw] text-[#869d7a]">{e.devanagari}</p>}
              <p className="inv-label mt-[4cqw] text-[2.5cqw] text-[#5a2236]">
                {weekday(e.start)} · {dayNum(e.start)} {monthName(e.start)} · {time(e.start)}
              </p>
              <p className="inv-serif mt-[3cqw] text-[5cqw] leading-tight text-[#5a2236]">{e.venue}</p>
              {e.address && <p className="mt-[1cqw] text-[3.2cqw] text-[#5a2236]/60">{e.address}</p>}
              {e.dress && (
                <p className="mt-[3cqw] inline-block rounded-full bg-[#eef2e8] px-[3.5cqw] py-[1.2cqw] text-[3cqw] text-[#5d7552]">Dress · {e.dress}</p>
              )}
              {e.note && <p className="inv-serif mt-[2cqw] text-[3.6cqw] text-[#a2405f] italic">{e.note}</p>}
              <EventActions event={e} invite={invite} theme={gulmohar} />
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
      <FloralCorner className="absolute top-0 -left-[8cqw] w-[50cqw]" />
      <FloralCorner className="absolute top-0 -right-[8cqw] w-[50cqw] -scale-x-100" />
      <Reveal className="relative pt-[20cqw]">
        <p className="inv-serif mx-auto max-w-[70cqw] text-[5.4cqw] leading-snug text-[#5a2236] italic">{invite.closing}</p>
        <p className="inv-script mt-[5cqw] text-[14cqw] leading-none text-[#a2405f]">
          {a.first} & {b.first}
        </p>
        {invite.hashtag && <p className="inv-label mt-[5cqw] text-[2.6cqw] text-[#869d7a]">{invite.hashtag}</p>}
      </Reveal>
      <Link href="/" className="inv-label absolute inset-x-0 bottom-[6cqw] text-[2cqw] text-[#5a2236]/40">
        Crafted by {site.name}
      </Link>
    </section>
  );
}

function Backdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-[#fdf6f2]">
      <div className="absolute inset-0" style={{ background: "radial-gradient(80% 40% at 0% 30%, #fbe3e3 0%, transparent 70%), radial-gradient(70% 40% at 100% 70%, #e9efe1 0%, transparent 70%)" }} />
    </div>
  );
}

function Divider({ className }: { className?: string }) {
  return <LotusDivider color={ROSE} className={`mx-auto w-[50cqw] opacity-60 ${className ?? ""}`} />;
}

function Title({ kicker, children }: { kicker?: string; children: React.ReactNode }) {
  return (
    <div className="text-center">
      {kicker && <p className="inv-label text-[2.5cqw] text-[#869d7a]">{kicker}</p>}
      <h2 className="inv-script mt-[1cqw] text-[12cqw] leading-tight text-[#a2405f]">{children}</h2>
    </div>
  );
}

export const gulmohar: InviteTheme = {
  id: "gulmohar",
  root: "bg-[#fdf6f2] text-[#5a2236]",
  vars: {
    "--inv-script": "var(--font-pinyon), cursive",
    "--inv-serif": "var(--font-cormorant), serif",
    "--inv-label": "var(--font-manrope), sans-serif",
  } as React.CSSProperties,
  accent: ROSE,
  ui: {
    section: "relative px-[7cqw] py-[14cqw]",
    card: "rounded-[6cqw] border border-white bg-white/75 shadow-[0_24px_50px_-30px_rgba(162,64,95,.5)] backdrop-blur",
    input:
      "w-full rounded-[3cqw] border border-[#a2405f]/20 bg-white px-[4cqw] py-[3cqw] text-[3.8cqw] text-[#5a2236] placeholder:text-[#5a2236]/35 outline-none focus:border-[#a2405f]/60",
    chip: "rounded-full border border-[#a2405f]/25 bg-white text-[#5a2236]/80 transition",
    chipOn: "rounded-full border border-[#a2405f] bg-[#a2405f] text-white transition",
    button:
      "inline-flex items-center gap-[1.5cqw] rounded-full bg-[#a2405f] px-[5cqw] py-[2.6cqw] text-[3.4cqw] font-semibold text-white shadow-[0_10px_24px_-10px_#a2405f] active:scale-95 transition",
    ghost: "inline-flex items-center gap-[1.5cqw] rounded-full border border-[#869d7a] px-[5cqw] py-[2.6cqw] text-[3.4cqw] text-[#5d7552] active:scale-95 transition",
    muted: "text-[#5a2236]/65",
    tile: "rounded-[4cqw] bg-white/80 text-[#a2405f] shadow-[0_10px_30px_-18px_rgba(162,64,95,.6)]",
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
