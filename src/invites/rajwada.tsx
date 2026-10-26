"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { EventGlyph } from "@/art/glyphs";
import { HangingDiya, Diya, JharokhaFrame, LotusDivider, Mandala, Toran } from "@/art/ornaments";
import { dayNum, monthName, time, weekday, yearNum } from "@/lib/format";
import { site } from "@/config/site";
import { couple, EventActions, initials, Reveal } from "./shared";
import { useOpened } from "./opened";
import type { InviteTheme, OpeningProps } from "./types";
import type { Invite } from "@/data/invites";

const GOLD = "#e9bf62";
const ease = [0.22, 1, 0.36, 1] as const;

/* ───────── Opening: palace doors ───────── */

function Door({ side }: { side: "left" | "right" }) {
  const studs = {
    backgroundImage: `radial-gradient(circle at center, #f6d987 0 1.6px, #9c6d22 2.2px, transparent 2.8px)`,
    backgroundSize: "9cqw 9cqw",
    backgroundPosition: "center",
  };
  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{
        background: "linear-gradient(180deg,#6d1328 0%,#4f0c1d 55%,#3a0815 100%)",
        boxShadow: side === "left" ? "inset -10px 0 30px #0008" : "inset 10px 0 30px #0008",
      }}
    >
      <div className="absolute inset-[3cqw] rounded-t-[22cqw] border-2 border-[#e9bf62]/80" />
      <div className="absolute inset-[5cqw] rounded-t-[20cqw] border border-[#e9bf62]/40" />
      <div className="absolute inset-x-[7cqw] top-[26cqw] bottom-[42%] rounded-t-full border border-[#e9bf62]/60 opacity-80" style={studs} />
      <div className="absolute inset-x-[7cqw] bottom-[7cqw] h-[34%] border border-[#e9bf62]/60" style={studs} />
      <Mandala color={GOLD} className="absolute top-[8cqw] left-1/2 w-[22cqw] -translate-x-1/2 opacity-70" />
      {/* inner edge strip */}
      <div
        className={`absolute top-0 bottom-0 w-[2.4cqw] ${side === "left" ? "right-0" : "left-0"}`}
        style={{ background: "linear-gradient(90deg,#9c6d22,#f6d987,#9c6d22)" }}
      />
      {/* knocker */}
      <div className={`absolute top-[54%] size-[9cqw] rounded-full border-[0.8cqw] border-[#e9bf62] ${side === "left" ? "right-[5cqw]" : "left-[5cqw]"}`} />
    </div>
  );
}

function Opening({ invite, opened, onOpen }: OpeningProps) {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ perspective: "140cqw", pointerEvents: opened ? "none" : "auto" }}>
      {/* light behind the doors */}
      <motion.div
        className="absolute inset-0"
        style={{ background: "radial-gradient(circle at 50% 50%, #ffe7a3 0%, #f3a93b 30%, #6d1328 75%)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: opened ? [0, 1, 0] : 0 }}
        transition={{ duration: 2.2, times: [0, 0.35, 1] }}
      />
      <motion.div
        className="absolute inset-y-0 left-0 w-1/2"
        style={{ transformOrigin: "left center", transformStyle: "preserve-3d" }}
        animate={{ rotateY: opened ? -105 : 0 }}
        transition={{ duration: 1.8, ease: [0.7, 0, 0.3, 1] }}
      >
        <Door side="left" />
      </motion.div>
      <motion.div
        className="absolute inset-y-0 right-0 w-1/2"
        style={{ transformOrigin: "right center", transformStyle: "preserve-3d" }}
        animate={{ rotateY: opened ? 105 : 0 }}
        transition={{ duration: 1.8, ease: [0.7, 0, 0.3, 1] }}
      >
        <Door side="right" />
      </motion.div>

      <motion.div animate={{ opacity: opened ? 0 : 1, y: opened ? -40 : 0 }} transition={{ duration: 0.6 }}>
        <Toran className="absolute inset-x-0 top-0 h-[28cqw] w-full" />
      </motion.div>

      <motion.button
        onClick={onOpen}
        aria-label="Open invitation"
        className="absolute top-1/2 left-1/2 z-10 grid size-[34cqw] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
        animate={{ scale: opened ? 0.4 : 1, opacity: opened ? 0 : 1 }}
        transition={{ duration: 0.5 }}
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-[#e9bf62]/25 [animation-duration:2.4s]" />
        <span
          className="absolute inset-0 rounded-full shadow-[0_10px_40px_-5px_#000a]"
          style={{ background: "radial-gradient(circle at 35% 30%, #fff1b8, #e0ae4c 45%, #9c6d22 100%)" }}
        />
        <Mandala color="#6d1328" className="absolute inset-[2cqw] animate-spin-slow opacity-50" stroke={1.4} />
        <span className="inv-script relative text-[12cqw] leading-none text-[#4f0c1d]">{initials(invite)}</span>
      </motion.button>
      <motion.p
        className="inv-label absolute inset-x-0 bottom-[16cqw] text-center text-[3cqw] font-semibold text-[#f6d987] [text-shadow:0_1px_8px_#000]"
        animate={{ opacity: opened ? 0 : [0.5, 1, 0.5] }}
        transition={{ duration: 2.4, repeat: opened ? 0 : Infinity }}
      >
        Tap the seal to enter
      </motion.p>
    </div>
  );
}

/* ───────── Hero ───────── */

function Hero({ invite }: { invite: Invite }) {
  const opened = useOpened();
  const [a, b] = couple(invite);
  const show = (delay: number) => ({
    initial: { opacity: 0, y: 24, filter: "blur(6px)" },
    animate: opened ? { opacity: 1, y: 0, filter: "blur(0px)" } : {},
    transition: { duration: 1.2, delay, ease },
  });
  return (
    <section className="relative flex min-h-[var(--screen-h,100svh)] flex-col items-center justify-center overflow-hidden px-[6cqw] pt-[30cqw] pb-[18cqw]">
      <Toran className="absolute inset-x-0 top-0 h-[28cqw] w-full" />
      <HangingDiya className="absolute top-[22cqw] left-[3cqw] w-[13cqw]" chain={70} />
      <HangingDiya className="absolute top-[22cqw] right-[3cqw] w-[13cqw]" chain={110} delay={-1.6} />

      <div className="relative w-[80cqw]">
        <Mandala color={GOLD} className="absolute top-[18cqw] left-1/2 w-[110cqw] -translate-x-1/2 animate-spin-slow opacity-[0.13]" />
        <JharokhaFrame className="absolute inset-0 h-full w-full" />
        <div className="relative flex min-h-[118cqw] flex-col items-center px-[8cqw] pt-[26cqw] pb-[10cqw] text-center">
          <motion.p {...show(0.4)} className="inv-deva text-[4.6cqw] text-[#f6d987]">
            {invite.invocation}
          </motion.p>
          <motion.p {...show(0.6)} className="inv-label mt-[3cqw] text-[2.3cqw] text-[#fbf1dc]/70">
            The wedding of
          </motion.p>
          <motion.h1 {...show(0.9)} className="mt-[3cqw] flex flex-col items-center leading-[0.9]">
            <span className="inv-script text-gold-shimmer text-[17cqw]">{a.first}</span>
            <span className="inv-serif my-[1cqw] text-[6cqw] text-[#f6d987] italic">weds</span>
            <span className="inv-script text-gold-shimmer text-[17cqw]">{b.first}</span>
          </motion.h1>
          <motion.div {...show(1.3)} className="mt-[5cqw] w-full">
            <LotusDivider color={GOLD} className="mx-auto w-[50cqw]" />
            <div className="inv-label mt-[3cqw] flex items-center justify-center gap-[3cqw] text-[#fbf1dc]">
              <span className="text-[2.6cqw]">{monthName(invite.date)}</span>
              <span className="inv-serif text-[9cqw] leading-none tracking-normal text-[#f6d987]">{dayNum(invite.date)}</span>
              <span className="text-[2.6cqw]">{yearNum(invite.date)}</span>
            </div>
            <p className="inv-serif mt-[2cqw] text-[3.8cqw] text-[#fbf1dc]/75 italic">{invite.city}</p>
          </motion.div>
        </div>
      </div>

      <motion.div
        className="inv-label absolute bottom-[6cqw] flex flex-col items-center gap-1 text-[2.2cqw] text-[#f6d987]/80"
        initial={{ opacity: 0 }}
        animate={opened ? { opacity: 1, y: [0, 6, 0] } : {}}
        transition={{ delay: 2.2, y: { repeat: Infinity, duration: 2 } }}
      >
        Scroll
        <svg viewBox="0 0 24 24" className="size-[4cqw]" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </motion.div>
    </section>
  );
}

/* ───────── Blessing & couple ───────── */

function Blessing({ invite }: { invite: Invite }) {
  const [a, b] = couple(invite);
  return (
    <section className="relative px-[7cqw] py-[14cqw] text-center">
      <Reveal>
        <p className="inv-label text-[2.6cqw] text-[#f6d987]">{invite.hosts}</p>
        <p className="inv-serif mx-auto mt-[4cqw] max-w-[78cqw] text-[5cqw] leading-snug text-[#fbf1dc]/90 italic">{invite.message}</p>
      </Reveal>
      <div className="mt-[10cqw] grid grid-cols-[1fr_auto_1fr] items-center gap-[2cqw]">
        {[a, b].map((p, i) => (
          <Reveal key={p === invite.bride ? "bride" : "groom"} delay={i * 0.2} className={i === 1 ? "col-start-3" : ""}>
            <div className="relative overflow-hidden rounded-t-full border border-[#e9bf62]/60 bg-[#3a0815]/60 px-[3cqw] pt-[10cqw] pb-[5cqw]">
              <Mandala color={GOLD} className="absolute -top-[10cqw] left-1/2 w-[40cqw] -translate-x-1/2 opacity-20" />
              <p className="inv-script relative text-[10cqw] leading-none text-[#f6d987]">{p.first}</p>
              <p className="inv-label relative mt-[3cqw] text-[2cqw] leading-relaxed text-[#fbf1dc]">{p.full}</p>
              <p className="inv-serif relative mt-[2cqw] text-[3.2cqw] leading-snug text-[#fbf1dc]/65 italic">{p.parents}</p>
            </div>
          </Reveal>
        ))}
        <Diya className="col-start-2 row-start-1 w-[10cqw]" />
      </div>
    </section>
  );
}

/* ───────── Events ───────── */

function Events({ invite }: { invite: Invite }) {
  return (
    <section className="relative px-[7cqw] py-[14cqw]">
      <Reveal>
        <Title kicker="The celebrations">Wedding festivities</Title>
      </Reveal>
      <div className="mt-[10cqw] space-y-[8cqw]">
        {invite.events.map((e, i) => (
          <Reveal key={e.name} delay={0.05}>
            <article className="relative overflow-hidden rounded-t-[40cqw] rounded-b-[4cqw] border border-[#e9bf62]/60 bg-gradient-to-b from-[#6d1328]/80 to-[#3a0815]/90 px-[7cqw] pt-[14cqw] pb-[8cqw] text-center shadow-[0_20px_50px_-20px_#000]">
              <div className="pointer-events-none absolute inset-[2cqw] rounded-t-[38cqw] rounded-b-[3cqw] border border-dashed border-[#e9bf62]/30" />
              <Mandala color={GOLD} className="absolute -top-[22cqw] left-1/2 w-[70cqw] -translate-x-1/2 opacity-15" />
              <span className="relative mx-auto grid size-[16cqw] place-items-center rounded-full border border-[#e9bf62]/70 bg-[#4f0c1d] text-[#f6d987]">
                <EventGlyph kind={e.kind} className="size-[9cqw]" />
              </span>
              <p className="inv-label relative mt-[4cqw] text-[2.4cqw] text-[#f6d987]/80">
                {String(i + 1).padStart(2, "0")} · {e.devanagari && <span className="inv-deva tracking-normal normal-case">{e.devanagari}</span>}
              </p>
              <h3 className="inv-script text-gold-shimmer relative mt-[1cqw] text-[13cqw] leading-tight">{e.name}</h3>
              <div className="relative mx-auto mt-[3cqw] flex w-fit items-stretch divide-x divide-[#e9bf62]/40 border-y border-[#e9bf62]/40 text-[#fbf1dc]">
                <span className="inv-label px-[3cqw] py-[2cqw] text-[2.4cqw]">{weekday(e.start)}</span>
                <span className="inv-label px-[3cqw] py-[2cqw] text-[2.4cqw]">
                  {dayNum(e.start)} {monthName(e.start).slice(0, 3)}
                </span>
                <span className="inv-label px-[3cqw] py-[2cqw] text-[2.4cqw]">{time(e.start)}</span>
              </div>
              <p className="inv-serif relative mt-[5cqw] text-[5.2cqw] leading-tight text-[#fbf1dc]">{e.venue}</p>
              {e.address && <p className="inv-serif relative mt-[1cqw] text-[3.4cqw] text-[#fbf1dc]/65">{e.address}</p>}
              {(e.dress || e.note) && (
                <p className="inv-serif relative mt-[3cqw] text-[3.6cqw] text-[#f6d987] italic">{[e.dress && `Dress: ${e.dress}`, e.note].filter(Boolean).join(" · ")}</p>
              )}
              <div className="relative">
                <EventActions event={e} invite={invite} theme={rajwada} />
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
    <section className="relative overflow-hidden px-[7cqw] pt-[16cqw] pb-[24cqw] text-center">
      <Mandala color={GOLD} className="absolute top-[4cqw] left-1/2 w-[120cqw] -translate-x-1/2 animate-spin-slow opacity-10" />
      <Reveal className="relative">
        <Diya className="mx-auto w-[22cqw]" />
        <p className="inv-serif mx-auto mt-[4cqw] max-w-[70cqw] text-[5.4cqw] leading-snug text-[#fbf1dc]/90 italic">{invite.closing}</p>
        <p className="inv-script text-gold-shimmer mt-[6cqw] text-[13cqw] leading-none">
          {a.first} & {b.first}
        </p>
        {invite.hashtag && <p className="inv-label mt-[5cqw] text-[2.8cqw] text-[#f6d987]">{invite.hashtag}</p>}
        <p className="inv-label mt-[3cqw] text-[2.2cqw] text-[#fbf1dc]/60">With love · {invite.hosts}</p>
      </Reveal>
      <Link href="/" className="inv-label absolute inset-x-0 bottom-[6cqw] text-[2cqw] text-[#fbf1dc]/40">
        Crafted by {site.name}
      </Link>
    </section>
  );
}

/* ───────── Frame pieces ───────── */

function Backdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0" style={{ background: "radial-gradient(120% 60% at 50% 0%, #7a1730 0%, #4a0b1b 45%, #2c0510 100%)" }} />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cg fill='none' stroke='%23e9bf62' stroke-width='1'%3E%3Cpath d='M30 6 C36 16 36 24 30 30 C24 24 24 16 30 6Z M30 54 C24 44 24 36 30 30 C36 36 36 44 30 54Z M6 30 C16 24 24 24 30 30 C24 36 16 36 6 30Z M54 30 C44 36 36 36 30 30 C36 24 44 24 54 30Z'/%3E%3Ccircle cx='0' cy='0' r='3'/%3E%3Ccircle cx='60' cy='0' r='3'/%3E%3Ccircle cx='0' cy='60' r='3'/%3E%3Ccircle cx='60' cy='60' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: "15cqw 15cqw",
        }}
      />
    </div>
  );
}

function Divider({ className }: { className?: string }) {
  return <LotusDivider color={GOLD} className={`mx-auto w-[56cqw] ${className ?? ""}`} />;
}

function Title({ kicker, children }: { kicker?: string; children: React.ReactNode }) {
  return (
    <div className="text-center">
      {kicker && <p className="inv-label text-[2.6cqw] text-[#f6d987]/80">{kicker}</p>}
      <h2 className="inv-script text-gold-shimmer mt-[2cqw] text-[12cqw] leading-tight">{children}</h2>
      <LotusDivider color={GOLD} className="mx-auto mt-[2cqw] w-[44cqw]" />
    </div>
  );
}

export const rajwada: InviteTheme = {
  id: "rajwada",
  root: "bg-[#4a0b1b] text-[#fbf1dc]",
  vars: {
    "--inv-script": "var(--font-parisienne), cursive",
    "--inv-serif": "var(--font-cormorant), serif",
    "--inv-label": "var(--font-cinzel), serif",
  } as React.CSSProperties,
  accent: GOLD,
  ui: {
    section: "relative px-[7cqw] py-[14cqw]",
    card: "rounded-[5cqw] border border-[#e9bf62]/40 bg-[#3a0815]/70 backdrop-blur-sm",
    input:
      "w-full rounded-[3cqw] border border-[#e9bf62]/35 bg-[#2c0510]/50 px-[4cqw] py-[3cqw] text-[3.8cqw] text-[#fbf1dc] placeholder:text-[#fbf1dc]/35 outline-none focus:border-[#e9bf62]",
    chip: "rounded-full border border-[#e9bf62]/40 text-[#fbf1dc]/80 transition",
    chipOn: "rounded-full border border-[#e9bf62] bg-[#e9bf62] font-semibold text-[#4a0b1b] transition",
    button:
      "inline-flex items-center gap-[1.5cqw] rounded-full bg-gradient-to-b from-[#f6d987] to-[#c99a3c] px-[5cqw] py-[2.6cqw] text-[3.4cqw] font-semibold text-[#3a0815] shadow-[0_8px_24px_-8px_#e9bf62] active:scale-95 transition",
    ghost:
      "inline-flex items-center gap-[1.5cqw] rounded-full border border-[#e9bf62]/60 px-[5cqw] py-[2.6cqw] text-[3.4cqw] text-[#f6d987] active:scale-95 transition",
    muted: "text-[#fbf1dc]/70",
    tile: "rounded-[3cqw] border border-[#e9bf62]/40 bg-[#3a0815]/60 text-[#f6d987]",
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
