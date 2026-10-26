"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AgniFire, SevenRings } from "@/art/agni";
import { EventGlyph } from "@/art/glyphs";
import { site } from "@/config/site";
import { dayNum, fmtDate, monthName, time, weekday, yearNum } from "@/lib/format";
import type { Invite } from "@/data/invites";
import { couple, EventActions, Reveal } from "./shared";
import { useOpened } from "./opened";
import type { InviteTheme, OpeningProps } from "./types";

const TERRA = "#c0502a";
const ease = [0.22, 1, 0.36, 1] as const;

const numericDate = (iso: string) => fmtDate(iso, { day: "2-digit", month: "2-digit", year: "2-digit" }).replace(/\//g, ".");

/* ───────── Opening: seal that becomes the page ───────── */

function Opening({ invite, opened, onOpen }: OpeningProps) {
  const [a, b] = couple(invite);
  return (
    <motion.div
      className="grain absolute inset-0 overflow-hidden bg-[#f5ede1]"
      style={{ pointerEvents: opened ? "none" : "auto" }}
      animate={{ opacity: opened ? 0 : 1 }}
      transition={{ delay: opened ? 1.1 : 0, duration: 0.6 }}
    >
      <div className="absolute inset-x-[8cqw] top-[12cqw] flex justify-between text-[2.4cqw] font-semibold tracking-[0.3em] text-[#2a1c15]/60 uppercase">
        <span>Vivah</span>
        <span>{numericDate(invite.date)}</span>
      </div>
      <motion.div
        className="absolute inset-x-0 top-[26%] text-center"
        animate={{ opacity: opened ? 0 : 1, y: opened ? -16 : 0 }}
        transition={{ duration: 0.4 }}
      >
        <p className="inv-script text-[11cqw] leading-none text-[#2a1c15]">
          {a.first} <span className="text-[#c0502a]">&amp;</span> {b.first}
        </p>
        <p className="mt-[3cqw] text-[2.6cqw] tracking-[0.3em] text-[#2a1c15]/60 uppercase">invite you</p>
      </motion.div>

      <button onClick={onOpen} aria-label="Open invitation" className="absolute top-[56%] left-1/2 size-[40cqw] -translate-x-1/2 -translate-y-1/2">
        <motion.span
          className="absolute inset-0 rounded-full bg-[#c0502a]"
          animate={opened ? { scale: 7 } : { scale: [1, 1.04, 1] }}
          transition={opened ? { duration: 1.1, ease: [0.7, 0, 0.3, 1] } : { duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.span
          className="absolute inset-[-4cqw] rounded-full border border-[#c0502a]/40"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          style={{ borderStyle: "dashed" }}
        />
        <motion.span className="relative flex h-full flex-col items-center justify-center text-[#f5ede1]" animate={{ opacity: opened ? 0 : 1 }}>
          <span className="inv-deva text-[7cqw] leading-none">ॐ</span>
          <span className="mt-[2cqw] text-[2.4cqw] font-semibold tracking-[0.3em] uppercase">Tap to open</span>
        </motion.span>
      </button>

      <div className="absolute inset-x-[8cqw] bottom-[12cqw] flex justify-between text-[2.4cqw] tracking-[0.3em] text-[#2a1c15]/50 uppercase">
        <span>Saat Phere</span>
        <span>{invite.city}</span>
      </div>
    </motion.div>
  );
}

/* ───────── Hero ───────── */

function Hero({ invite }: { invite: Invite }) {
  const opened = useOpened();
  const [a, b] = couple(invite);
  const show = (delay: number) => ({
    initial: { opacity: 0, y: 30 },
    animate: opened ? { opacity: 1, y: 0 } : {},
    transition: { duration: 1.1, delay, ease },
  });
  const ticker = `${a.first} & ${b.first} · ${dayNum(invite.date)} ${monthName(invite.date)} ${yearNum(invite.date)} · ${invite.city} · `;
  return (
    <section className="relative flex min-h-[var(--screen-h,100svh)] flex-col overflow-hidden">
      <motion.div {...show(0.1)} className="flex justify-between px-[8cqw] pt-[12cqw] text-[2.4cqw] font-semibold tracking-[0.3em] text-[#2a1c15]/60 uppercase">
        <span className="inv-deva text-[3.6cqw] tracking-normal text-[#c0502a]">{invite.invocation}</span>
        <span>{invite.invocationMeaning}</span>
      </motion.div>

      <div className="flex flex-1 items-center justify-center px-[6cqw]">
        {opened && (
          <SevenRings className="w-[88cqw]" color={TERRA}>
            <div className="flex aspect-square flex-col items-center justify-center text-center">
              <motion.p {...show(0.6)} className="text-[2.4cqw] font-semibold tracking-[0.3em] text-[#2a1c15]/60 uppercase">
                Together
              </motion.p>
              <motion.h1 {...show(0.9)} className="mt-[2cqw] flex flex-col items-center">
                <span className="inv-script text-[15cqw] leading-[0.95] text-[#2a1c15]">{a.first}</span>
                <span className="inv-serif text-[7cqw] leading-none text-[#c0502a] italic">&amp;</span>
                <span className="inv-script text-[15cqw] leading-[0.95] text-[#2a1c15]">{b.first}</span>
              </motion.h1>
            </div>
          </SevenRings>
        )}
      </div>

      <motion.div {...show(1.4)} className="grid grid-cols-3 border-t border-[#2a1c15]/15 text-center">
        {[
          { k: "Date", v: numericDate(invite.date) },
          { k: "Day", v: weekday(invite.date).slice(0, 3) },
          { k: "Time", v: time(invite.date) },
        ].map((x, i) => (
          <div key={x.k} className={`py-[5cqw] ${i ? "border-l border-[#2a1c15]/15" : ""}`}>
            <p className="text-[2.2cqw] tracking-[0.3em] text-[#2a1c15]/50 uppercase">{x.k}</p>
            <p className="inv-serif mt-[1cqw] text-[6cqw] leading-none">{x.v}</p>
          </div>
        ))}
      </motion.div>
      <div className="overflow-hidden bg-[#2a1c15] py-[2.6cqw] text-[#f5ede1]">
        <div className="flex w-max animate-marquee">
          {[0, 1].map((k) => (
            <span key={k} className="inv-serif shrink-0 pr-[2cqw] text-[4cqw] whitespace-nowrap italic">
              {ticker.repeat(3)}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────── Blessing ───────── */

function Blessing({ invite }: { invite: Invite }) {
  const [a, b] = couple(invite);
  return (
    <section className="relative px-[8cqw] py-[16cqw]">
      <AgniFire className="mx-auto w-[56cqw]" />
      <Reveal className="mt-[4cqw] text-center">
        <p className="text-[2.4cqw] font-semibold tracking-[0.3em] text-[#c0502a] uppercase">{invite.hosts}</p>
        <p className="inv-serif mx-auto mt-[4cqw] max-w-[76cqw] text-[6cqw] leading-[1.25]">{invite.message}</p>
      </Reveal>
      <div className="mt-[12cqw] grid grid-cols-2 border-y border-[#2a1c15]/15">
        {[a, b].map((p, i) => (
          <Reveal key={p === invite.bride ? "bride" : "groom"} delay={i * 0.15} className={`py-[6cqw] ${i ? "border-l border-[#2a1c15]/15 pl-[5cqw]" : "pr-[5cqw]"}`}>
            <p className="text-[2.2cqw] tracking-[0.3em] text-[#2a1c15]/50 uppercase">{p === invite.bride ? "The bride" : "The groom"}</p>
            <p className="inv-script mt-[2cqw] text-[10cqw] leading-none">{p.first}</p>
            <p className="mt-[2cqw] text-[3.2cqw] font-semibold">{p.full}</p>
            <p className="mt-[1cqw] text-[3cqw] leading-snug text-[#2a1c15]/60">{p.parents}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ───────── Events ───────── */

function Events({ invite }: { invite: Invite }) {
  return (
    <section className="relative bg-[#efe4d4] px-[8cqw] py-[16cqw]">
      <Reveal>
        <Title kicker={`${invite.events.length} occasions`}>The programme</Title>
      </Reveal>
      <ol className="mt-[10cqw]">
        {invite.events.map((e, i) => (
          <Reveal key={e.name}>
            <li className="border-t border-[#2a1c15]/20 py-[8cqw]">
              <div className="flex items-start justify-between">
                <span className="inv-serif text-[16cqw] leading-[0.8] text-transparent [-webkit-text-stroke:1px_#c0502a]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <EventGlyph kind={e.kind} className="size-[11cqw] text-[#c0502a]" />
              </div>
              <h3 className="inv-script mt-[4cqw] text-[11cqw] leading-none">{e.name}</h3>
              {e.devanagari && <p className="inv-deva mt-[1.5cqw] text-[3.6cqw] text-[#c0502a]">{e.devanagari}</p>}
              <dl className="mt-[5cqw] grid grid-cols-[22cqw_1fr] gap-y-[2.5cqw] text-[3.5cqw]">
                <dt className="text-[2.3cqw] tracking-[0.25em] text-[#2a1c15]/50 uppercase">When</dt>
                <dd>
                  {weekday(e.start)}, {dayNum(e.start)} {monthName(e.start)} · {time(e.start)}
                </dd>
                <dt className="text-[2.3cqw] tracking-[0.25em] text-[#2a1c15]/50 uppercase">Where</dt>
                <dd>
                  <span className="font-semibold">{e.venue}</span>
                  {e.address && (
                    <>
                      <br />
                      <span className="text-[#2a1c15]/60">{e.address}</span>
                    </>
                  )}
                </dd>
                {e.dress && (
                  <>
                    <dt className="text-[2.3cqw] tracking-[0.25em] text-[#2a1c15]/50 uppercase">Wear</dt>
                    <dd>{e.dress}</dd>
                  </>
                )}
                {e.note && (
                  <>
                    <dt className="text-[2.3cqw] tracking-[0.25em] text-[#2a1c15]/50 uppercase">Note</dt>
                    <dd className="inv-serif text-[#c0502a] italic">{e.note}</dd>
                  </>
                )}
              </dl>
              <div className="[&>div]:justify-start">
                <EventActions event={e} invite={invite} theme={agni} />
              </div>
            </li>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}

/* ───────── Closing ───────── */

function Closing({ invite }: { invite: Invite }) {
  const [a, b] = couple(invite);
  return (
    <section className="relative overflow-hidden bg-[#c0502a] px-[8cqw] pt-[18cqw] pb-[24cqw] text-center text-[#f5ede1]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        {Array.from({ length: 7 }, (_, i) => (
          <span
            key={i}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#f5ede1]/15"
            style={{ width: `${40 + i * 14}cqw`, height: `${40 + i * 14}cqw` }}
          />
        ))}
      </div>
      <Reveal className="relative">
        <p className="text-[2.4cqw] font-semibold tracking-[0.3em] uppercase opacity-70">With love</p>
        <p className="inv-serif mx-auto mt-[5cqw] max-w-[72cqw] text-[7cqw] leading-[1.15]">{invite.closing}</p>
        <p className="inv-script mt-[8cqw] text-[13cqw] leading-none">
          {a.first} &amp; {b.first}
        </p>
        <p className="mt-[4cqw] text-[2.6cqw] tracking-[0.3em] uppercase opacity-70">{invite.hosts}</p>
      </Reveal>
      <Link href="/" className="absolute inset-x-0 bottom-[6cqw] text-[2.2cqw] tracking-[0.3em] uppercase opacity-50">
        Crafted by {site.name}
      </Link>
    </section>
  );
}

function Backdrop() {
  return <div className="grain pointer-events-none absolute inset-0 bg-[#f5ede1]" />;
}

function Divider({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-[2cqw] ${className ?? ""}`}>
      {Array.from({ length: 7 }, (_, i) => (
        <span key={i} className="size-[1.6cqw] rounded-full border border-[#c0502a]" style={{ background: i === 3 ? TERRA : "transparent" }} />
      ))}
    </div>
  );
}

function Title({ kicker, children }: { kicker?: string; children: React.ReactNode }) {
  return (
    <div>
      {kicker && <p className="text-[2.4cqw] font-semibold tracking-[0.3em] text-[#c0502a] uppercase">{kicker}</p>}
      <h2 className="inv-script mt-[2cqw] text-[12cqw] leading-none">{children}</h2>
    </div>
  );
}

export const agni: InviteTheme = {
  id: "agni",
  root: "bg-[#f5ede1] text-[#2a1c15]",
  vars: {
    "--inv-script": "var(--font-bodoni), serif",
    "--inv-serif": "var(--font-bodoni), serif",
    "--inv-label": "var(--font-manrope), sans-serif",
  } as React.CSSProperties,
  accent: TERRA,
  ui: {
    section: "relative px-[8cqw] py-[14cqw]",
    card: "rounded-[2cqw] border border-[#2a1c15]/15 bg-[#fbf6ee]",
    input:
      "w-full rounded-[1.5cqw] border border-[#2a1c15]/20 bg-transparent px-[4cqw] py-[3cqw] text-[3.8cqw] text-[#2a1c15] placeholder:text-[#2a1c15]/35 outline-none focus:border-[#c0502a]",
    chip: "rounded-full border border-[#2a1c15]/25 text-[#2a1c15]/80 transition",
    chipOn: "rounded-full border border-[#2a1c15] bg-[#2a1c15] text-[#f5ede1] transition",
    button:
      "inline-flex items-center gap-[1.5cqw] rounded-full bg-[#c0502a] px-[5cqw] py-[2.6cqw] text-[3.4cqw] font-semibold text-[#f5ede1] active:scale-95 transition",
    ghost: "inline-flex items-center gap-[1.5cqw] rounded-full border border-[#2a1c15]/40 px-[5cqw] py-[2.6cqw] text-[3.4cqw] active:scale-95 transition",
    muted: "text-[#2a1c15]/60",
    tile: "rounded-[2cqw] border border-[#2a1c15]/15 bg-[#fbf6ee] text-[#2a1c15]",
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
