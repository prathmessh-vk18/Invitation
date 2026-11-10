"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";
import { site } from "@/config/site";
import type { Invite } from "@/data/invites";
import { fmtDate } from "@/lib/format";
import { INVITE_ART_SIZES, PREVIEW_ART_SIZES, useOpened, usePreview } from "./opened";
import { couple, EventActions, Reveal } from "./shared";
import type { InviteTheme, OpeningProps } from "./types";

/**
 * Chameli: ivory stationery with jasmine, a brass lantern and the Himalayan hills.
 *
 * It opens on an embossed ivory envelope sealed with gold wax and the couple's initials. A tap
 * lifts the seal away, the flap opens in a bloom of golden light, petals scatter and sparkle
 * trails swirl, then it all dissolves into the card. The card scrolls inside a fixed frame: a
 * jasmine-and-lantern spray at the top left and the urn, hills and jaali balustrade along the
 * bottom, like Mandir and Haveli. Everything a couple sees is either a fixed design label or
 * comes from the order form (the Gulmohar rule): no sample wording they can't change.
 */

const art = "/art/illus";
const c = {
  paper: "#f3ece0",
  ink: "#4f4020",
  soft: "#6a5b38",
  gold: "#b19254",
  goldHi: "#e9d39b",
  ribbon: "#e8dcc1",
};
const ease = [0.22, 1, 0.36, 1] as const;
// When the card starts writing itself in, after the envelope's light has filled the screen.
const AFTER_OPEN = 2.95;

const ist = (iso: string, o: Intl.DateTimeFormatOptions) => fmtDate(iso, o);
const suffix = (d: number) => (d % 10 === 1 && d !== 11 ? "st" : d % 10 === 2 && d !== 12 ? "nd" : d % 10 === 3 && d !== 13 ? "rd" : "th");
/** "Friday, 11th December 2026" */
function DayLine({ iso }: { iso: string }) {
  const d = Number(ist(iso, { day: "numeric" }));
  return (
    <>
      {ist(iso, { weekday: "long" })}, {d}
      <sup className="text-[0.65em]">{suffix(d)}</sup> {ist(iso, { month: "long" })} {ist(iso, { year: "numeric" })}
    </>
  );
}
/** "11:00 A.M.", "12:00 Noon", "8:30 P.M.", as engraved cards print them. */
function clock(iso: string) {
  const h = Number(ist(iso, { hour: "numeric", hour12: false }));
  const m = ist(iso, { minute: "2-digit" }).padStart(2, "0");
  if (h === 12 && m === "00") return "12:00 Noon";
  return `${((h + 11) % 12) + 1}:${m} ${h < 12 ? "A.M." : "P.M."}`;
}
const initials = (invite: Invite) => couple(invite).map((p) => p.first.trim()[0]?.toUpperCase() ?? "").join("");

function Art({ src, alt = "", priority, className = "object-cover", style }: { src: string; alt?: string; priority?: boolean; className?: string; style?: CSSProperties }) {
  const preview = usePreview();
  return <Image src={src} alt={alt} fill priority={priority && !preview} sizes={preview ? PREVIEW_ART_SIZES : INVITE_ART_SIZES} className={className} style={style} />;
}

/** The card's divider: a gold diamond between two hairlines that draw outwards. */
function Divider({ className, delay = 0 }: { className?: string; delay?: number }) {
  const line = (origin: string) => (
    <motion.span
      className="h-px flex-1"
      style={{ background: c.gold, transformOrigin: origin }}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1.1, delay: delay + 0.15, ease }}
    />
  );
  return (
    <div className={`mx-auto flex w-[44cqw] items-center gap-[2cqw] ${className ?? "my-[5cqw]"}`} aria-hidden>
      {line("right")}
      <motion.span className="size-[1.6cqw] rotate-45" style={{ background: c.gold }} initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay }} />
      {line("left")}
    </div>
  );
}

/** Section titles in spaced capitals that settle in from wide tracking. */
function Title({ kicker, children }: { kicker?: string; children: ReactNode }) {
  return (
    <div className="text-center">
      {kicker && <p className="inv-label text-[3.4cqw] tracking-[0.28em]">{kicker}</p>}
      <motion.h2
        className="inv-label mt-[1cqw] text-[5.6cqw]"
        initial={{ opacity: 0, letterSpacing: "0.6em" }}
        whileInView={{ opacity: 1, letterSpacing: "0.3em" }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 1.4, ease }}
      >
        {children}
      </motion.h2>
      <Divider />
    </div>
  );
}

const caps = "inv-label tracking-[0.2em]";
const italic = "inv-serif italic";

/* ───────── Opening: the sealed envelope ───────── */

// A small seeded random, so the petals fall the same way on every render.
function seeded(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}
// Where the flap's edge meets the sides, and its point, as % of the envelope (from the painting).
const FLAP = { side: 34, tip: 58.5 };
const flapShape = `polygon(0 0, 100% 0, 100% ${FLAP.side}%, 50% ${FLAP.tip}%, 0 ${FLAP.side}%)`;
const bodyShape = `polygon(0 ${FLAP.side}%, 50% ${FLAP.tip}%, 100% ${FLAP.side}%, 100% 100%, 0 100%)`;
// A few petals and sparks that float up out of the opened envelope with the card.
const PETALS = (() => {
  const r = seeded(7);
  return Array.from({ length: 16 }, (_, i) => ({
    x: (r() - 0.5) * 70,
    y: -40 - r() * 70,
    rot: (r() - 0.5) * 360,
    size: 2.2 + r() * 2.4,
    delay: 1.75 + r() * 0.6,
    blush: i % 3 !== 0,
  }));
})();
const SPARKS = (() => {
  const r = seeded(31);
  return Array.from({ length: 14 }, () => ({ x: (r() - 0.5) * 60, y: -20 - r() * 60, d: 1.6 + r() * 0.7, s: 0.5 + r() * 0.8 }));
})();

/** The gold wax seal with the couple's initials, drawn so every couple gets their own. */
function WaxSeal({ text }: { text: string }) {
  return (
    <div className="relative grid size-full place-items-center">
      <svg viewBox="0 0 100 100" className="absolute inset-0 size-full drop-shadow-[0_10px_16px_rgba(80,55,10,.45)]" aria-hidden>
        <defs>
          <radialGradient id="ch-wax" cx="38%" cy="32%" r="70%">
            <stop offset="0%" stopColor="#fbe7a8" />
            <stop offset="45%" stopColor="#d7a845" />
            <stop offset="80%" stopColor="#a8761f" />
            <stop offset="100%" stopColor="#7c5410" />
          </radialGradient>
        </defs>
        {/* A wax pool with an uneven edge. */}
        <path
          d="M50 3c6 0 9 4 14 5s10-1 13 3 1 9 4 13 9 6 9 12-4 8-4 13 4 9 2 14-8 6-11 10-3 10-8 12-10-2-15-1-9 6-14 5-7-6-12-8-11-1-13-6 1-10-1-15-8-7-8-13 5-8 6-13-3-10 0-14 9-3 13-6 5-9 10-10 8 1 13 0 8-4 12-4z"
          fill="url(#ch-wax)"
        />
        <circle cx="50" cy="50" r="31" fill="none" stroke="#fdeebf" strokeOpacity=".55" strokeWidth="1.4" />
        <circle cx="50" cy="50" r="27" fill="none" stroke="#7c5410" strokeOpacity=".35" strokeWidth=".8" />
      </svg>
      <span className="relative text-[10cqw] leading-none text-[#6b4a10] [text-shadow:0_1px_0_rgba(255,240,200,.6)]" style={{ fontFamily: "var(--font-pinyon), cursive" }}>
        {text}
      </span>
    </div>
  );
}

/**
 * The envelope opens like a real one. The painting is cut into its flap and its front panel: the
 * camera eases back to show the whole envelope, the flap swings up on its hinge (seal and all),
 * the inside glows, the card slides out with the couple's names, and the camera moves into the
 * card until it becomes the invitation.
 */
function Opening({ invite, opened, onOpen }: OpeningProps) {
  const reduce = useReducedMotion();
  const [a, b] = couple(invite);
  const go = opened && !reduce;
  const envelope = `url(${art}/chameli-envelope.jpg) center/cover`;
  const t = (from: number, dur: number, extra: object = {}) => ({ delay: from, duration: dur, ease, ...extra });
  return (
    <motion.div
      className="absolute inset-0 overflow-hidden"
      style={{ background: "radial-gradient(120% 90% at 50% 40%, #d9cdb6, #b3a284 70%, #8f7f63)", color: c.ink }}
      animate={{ opacity: opened ? 0 : 1 }}
      transition={{ delay: opened ? (reduce ? 0 : 3.15) : 0, duration: 0.45, ease }}
    >
      {/* The envelope: eases back, then follows the card in. */}
      <motion.div
        className="absolute inset-0 [perspective:1400px]"
        animate={go ? { scale: [1, 0.82, 0.82, 1.75], y: ["0%", "5%", "5%", "30%"] } : { scale: 1 }}
        transition={go ? { duration: 3.2, times: [0, 0.16, 0.74, 1], ease: "easeInOut" } : {}}
        style={{ boxShadow: go ? "0 40px 80px -30px rgba(40,28,10,.55)" : undefined }}
      >
        {/* The inside: the paper of the envelope's back, in shadow, showing once the flap lifts. */}
        <div className="absolute inset-0" style={{ clipPath: flapShape }}>
          <div className="absolute inset-0" style={{ background: `url(${art}/chameli-paper.jpg) center/cover`, filter: "brightness(.86) sepia(.15)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(60,42,15,.28), rgba(60,42,15,.05) 60%, rgba(60,42,15,.22))" }} />
          {go && (
            <motion.div
              className="absolute inset-x-0 bottom-0 h-3/4"
              style={{ background: "radial-gradient(60% 70% at 50% 100%, rgba(255,233,175,.95), rgba(255,220,150,.35) 55%, transparent)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.85] }}
              transition={t(1.3, 1.1)}
            />
          )}
        </div>

        {/* The flap's inside, folded up behind the card once it's past upright. */}
        <motion.div
          className="absolute inset-0 origin-top"
          style={{ zIndex: 1 }}
          initial={{ rotateX: -90, opacity: 0 }}
          animate={go ? { rotateX: [-90, -90, -178], opacity: [0, 0, 1, 1] } : { rotateX: -90, opacity: 0 }}
          transition={go ? { rotateX: { duration: 1.85, times: [0, 0.62, 1], ease: "easeOut" }, opacity: { duration: 1.85, times: [0, 0.62, 0.63, 1] } } : {}}
        >
          <div
            className="absolute inset-0"
            style={{
              clipPath: flapShape,
              background: "linear-gradient(180deg, #ddd0b6, #ece2cf)",
              boxShadow: "inset 0 0 40px rgba(80,60,25,.25)",
            }}
          />
        </motion.div>

        {/* The card inside, which slides out. */}
        <motion.div
          className="absolute left-[10%] w-[80%] rounded-[1.5cqw] shadow-[0_18px_40px_-18px_rgba(60,40,10,.55)]"
          style={{ top: "22%", aspectRatio: "0.72", background: `url(${art}/chameli-paper.jpg) center/cover`, zIndex: 2 }}
          initial={{ y: "20%" }}
          animate={go ? { y: ["20%", "20%", "-36%"] } : { y: "20%" }}
          transition={go ? { duration: 2.55, times: [0, 0.62, 1], ease: [0.5, 0, 0.2, 1] } : {}}
        >
          <div className="absolute inset-[4%] border" style={{ borderColor: `${c.gold}aa` }} />
          <div className="absolute inset-[5.5%] border" style={{ borderColor: `${c.gold}55` }} />
          <motion.div className="absolute inset-x-0 top-[16%] text-center" animate={go ? { opacity: [1, 1, 0] } : {}} transition={go ? { duration: 3.1, times: [0, 0.84, 1] } : {}}>
            <p className="inv-label text-[2.6cqw] tracking-[0.3em]" style={{ color: c.soft }}>
              The {invite.occasion === "engagement" ? "Engagement" : invite.occasion === "reception" ? "Reception" : "Wedding"} of
            </p>
            <p className="inv-script mt-[2cqw] text-[10cqw] leading-tight" style={{ color: c.ink }}>{a.first}</p>
            <p className="inv-script text-[5.5cqw] leading-none" style={{ color: c.gold }}>&amp;</p>
            <p className="inv-script text-[10cqw] leading-tight" style={{ color: c.ink }}>{b.first}</p>
          </motion.div>
        </motion.div>

        {/* The front panel, in front of the card. */}
        <div className="absolute inset-0" style={{ clipPath: bodyShape, background: envelope, zIndex: 3 }} />

        {/* The flap's outside, hinged along the top, with the seal riding on its point. It turns until
            it's edge-on, and the inside (above) takes over from there. */}
        <motion.div
          className="absolute inset-0 origin-top"
          style={{ zIndex: 4 }}
          initial={{ rotateX: 0, opacity: 1 }}
          animate={go ? { rotateX: [0, 0, -90], opacity: [1, 1, 1, 0] } : { rotateX: 0, opacity: 1 }}
          transition={go ? { rotateX: { duration: 1.15, times: [0, 0.43, 1], ease: "easeIn" }, opacity: { duration: 1.16, times: [0, 0.5, 0.99, 1] } } : {}}
        >
          <div className="absolute inset-0" style={{ clipPath: flapShape, background: envelope }} />
          {/* A shadow under the flap's edge, as it lifts off the panel. */}
          {go && <motion.div className="absolute inset-0" style={{ clipPath: flapShape, background: "linear-gradient(180deg, transparent 50%, rgba(255,248,230,.55))" }} initial={{ opacity: 0 }} animate={{ opacity: [0, 0.9] }} transition={t(0.55, 0.2)} />}
          <button
            type="button"
            onClick={onOpen}
            aria-label="Open the invitation"
            className="absolute size-[30cqw] -translate-x-1/2 -translate-y-1/2"
            style={{ left: "50%", top: `${FLAP.tip}%` }}
          >
            <motion.span className="block size-full" animate={go ? { scale: [1, 1.1, 1] } : { scale: [1, 1.035, 1] }} transition={go ? { duration: 0.5 } : { duration: 2.6, repeat: Infinity, ease: "easeInOut" }}>
              <WaxSeal text={initials(invite)} />
            </motion.span>
          </button>
        </motion.div>

        {/* Petals and sparks float up out of the envelope as the card rises. */}
        {go && (
          <div className="pointer-events-none absolute left-1/2 z-[5]" style={{ top: `${FLAP.side + 2}%` }}>
            {SPARKS.map((sp, i) => (
              <motion.span
                key={`s${i}`}
                className="absolute rounded-full bg-[#fff6d6] shadow-[0_0_6px_2px_rgba(255,226,150,.8)]"
                style={{ width: `${sp.s}cqw`, height: `${sp.s}cqw` }}
                initial={{ x: 0, y: 0, opacity: 0 }}
                animate={{ x: `${sp.x}cqw`, y: `${sp.y}cqw`, opacity: [0, 1, 0] }}
                transition={{ delay: sp.d, duration: 1.4, ease: "easeOut" }}
              />
            ))}
            {PETALS.map((p, i) => (
              <motion.span
                key={`p${i}`}
                className="absolute rounded-[60%_40%_60%_40%] shadow-sm"
                style={{
                  width: `${p.size}cqw`,
                  height: `${p.size * 1.35}cqw`,
                  background: p.blush ? "radial-gradient(circle at 30% 30%, #fde0e3, #f1a7b2)" : "radial-gradient(circle at 30% 30%, #ffffff, #efe6d2)",
                }}
                initial={{ x: 0, y: 0, rotate: 0, opacity: 0 }}
                animate={{ x: `${p.x}cqw`, y: `${p.y}cqw`, rotate: p.rot, opacity: [0, 1, 1, 0] }}
                transition={{ delay: p.delay, duration: 1.6, ease: "easeOut" }}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Title above the flap, while it waits. */}
      <motion.div className="pointer-events-none absolute inset-x-0 top-[9%] text-center" animate={{ opacity: opened ? 0 : 1, y: opened ? -16 : 0 }} transition={{ duration: 0.45 }}>
        <p className="inv-label text-[2.9cqw] tracking-[0.34em]" style={{ color: c.soft }}>
          A special invitation awaits
        </p>
        <p className="inv-script mt-[3cqw] text-[10cqw] leading-none" style={{ color: c.ink }}>
          {a.first} <span style={{ color: c.gold }}>&amp;</span> {b.first}
        </p>
      </motion.div>

      {/* The card fills the screen at the end and becomes the invitation's paper. */}
      {go && <motion.div className="pointer-events-none absolute inset-0" style={{ background: c.paper }} initial={{ opacity: 0 }} animate={{ opacity: [0, 0, 1] }} transition={{ duration: 3.2, times: [0, 0.82, 1] }} />}
    </motion.div>
  );
}

/* ───────── The card ───────── */

/** A name in spaced capitals, each letter arriving out of a soft blur. */
function Letters({ text, delay, className }: { text: string; delay: number; className: string }) {
  const opened = useOpened();
  return (
    <span className={`inline-block ${className}`} aria-label={text}>
      {[...text].map((ch, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="inline-block whitespace-pre"
          initial={{ opacity: 0, y: "0.3em", filter: "blur(6px)" }}
          animate={opened ? { opacity: 1, y: "0em", filter: "blur(0px)" } : {}}
          transition={{ delay: delay + i * 0.045, duration: 0.7, ease }}
        >
          {ch}
        </motion.span>
      ))}
    </span>
  );
}

function Hero({ invite }: { invite: Invite }) {
  const opened = useOpened();
  const [a, b] = couple(invite);
  const show = (d: number) => ({ initial: { opacity: 0, y: 14 }, animate: opened ? { opacity: 1, y: 0 } : {}, transition: { delay: AFTER_OPEN + d, duration: 1.1, ease } });
  return (
    <section className="relative flex min-h-[var(--screen-h,100svh)] flex-col items-center justify-center px-[12cqw] pt-[24cqw] pb-[44cqw] text-center">
      {invite.invocation && (
        <motion.p {...show(0)} className="inv-deva text-[4cqw]" style={{ color: c.gold }}>
          {invite.invocation}
        </motion.p>
      )}
      <motion.p {...show(0.15)} className={`${caps} mt-[4cqw] text-[3.6cqw]`}>
        The
      </motion.p>
      <motion.p {...show(0.3)} className="inv-script text-[15cqw] leading-none">
        {invite.occasion === "engagement" ? "Engagement" : invite.occasion === "reception" ? "Reception" : "Wedding"}
      </motion.p>
      <motion.p {...show(0.45)} className={`${caps} text-[3.6cqw]`}>
        Celebrations
      </motion.p>
      <Divider className="my-[5cqw]" delay={AFTER_OPEN + 0.5} />
      <p className="mt-[3cqw] leading-tight">
        <Letters text={a.first.toUpperCase()} delay={AFTER_OPEN + 1.0} className={`${caps} text-[7.4cqw] tracking-[0.24em]`} />
      </p>
      <motion.p
        className="inv-script text-[8cqw] leading-tight"
        style={{ color: c.gold }}
        initial={{ opacity: 0, clipPath: "inset(0 100% 0 0)" }}
        animate={opened ? { opacity: 1, clipPath: "inset(0 0% 0 0)" } : {}}
        transition={{ delay: AFTER_OPEN + 1.5, duration: 0.9, ease }}
      >
        and
      </motion.p>
      <p className="leading-tight">
        <Letters text={b.first.toUpperCase()} delay={AFTER_OPEN + 1.7} className={`${caps} text-[7.4cqw] tracking-[0.24em]`} />
      </p>
      <motion.p {...show(2.4)} className="inv-label mt-[6cqw] text-[3.3cqw] tracking-[0.16em] uppercase">
        <DayLine iso={invite.date} />
      </motion.p>
      <motion.p {...show(2.55)} className={`${italic} mt-[1.5cqw] text-[4cqw]`} style={{ color: c.soft }}>
        {invite.city}
      </motion.p>
    </section>
  );
}

function Blessing({ invite }: { invite: Invite }) {
  const [a, b] = couple(invite);
  const person = (p: typeof a, i: number) => (
    <Reveal delay={i * 0.12} className="mt-[7cqw]">
      <p className={`${caps} text-[6cqw]`}>{p.full || p.first}</p>
      {p.parents && (
        <p className={`${italic} mt-[1.5cqw] text-[3.9cqw] leading-relaxed whitespace-pre-line`} style={{ color: c.soft }}>
          {p.parents}
        </p>
      )}
    </Reveal>
  );
  return (
    <section className="relative px-[12cqw] pt-[12cqw] text-center">
      <Reveal>
        {invite.invocationMeaning && <p className={`${caps} text-[2.8cqw]`} style={{ color: c.soft }}>{invite.invocationMeaning}</p>}
        <p className="inv-serif mt-[3cqw] text-[4.4cqw] font-semibold">{invite.hosts}</p>
        <p className={`${italic} mt-[2cqw] text-[4cqw] leading-relaxed whitespace-pre-line`} style={{ color: c.soft }}>
          {invite.message}
        </p>
      </Reveal>
      {person(a, 0)}
      <Reveal delay={0.1}>
        <p className="inv-script mt-[3cqw] text-[8cqw] leading-none" style={{ color: c.gold }}>
          and
        </p>
      </Reveal>
      {person(b, 1)}
    </section>
  );
}

/* ───────── The celebrations ───────── */

function Glance({ invite }: { invite: Invite }) {
  const events = [...invite.events].sort((x, y) => x.start.localeCompare(y.start));
  return (
    <section className="relative px-[11cqw] pt-[10cqw] text-center">
      <Reveal>
        <Title kicker="The Celebrations">At a Glance</Title>
      </Reveal>
      <div className="grid gap-[8cqw]">
        {events.map((e, i) => (
          <motion.div
            key={e.name + i}
            className="relative overflow-hidden rounded-[3cqw] border px-[6cqw] pt-[6cqw] pb-[6cqw]"
            style={{ borderColor: `${c.gold}66`, background: "rgba(251,247,239,.82)" }}
            initial={{ opacity: 0, y: 36, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.9, ease }}
          >
            <motion.p
              className="inv-label mx-auto w-fit px-[5cqw] py-[1.8cqw] text-[3.1cqw] tracking-[0.14em] uppercase"
              style={{ background: c.ribbon }}
              initial={{ opacity: 0, letterSpacing: "0.32em" }}
              whileInView={{ opacity: 1, letterSpacing: "0.14em" }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2, ease }}
            >
              <DayLine iso={e.start} />
            </motion.p>
            <p className="inv-script mt-[3cqw] text-[9cqw] leading-tight">{e.name}</p>
            <p className="inv-label mt-[1.5cqw] text-[3.4cqw] tracking-[0.14em] uppercase">{clock(e.start)} onwards</p>
            <p className={`${italic} mt-[2cqw] text-[4cqw] leading-relaxed`} style={{ color: c.soft }}>
              {e.venue}
              {e.address && (
                <>
                  <br />
                  {e.address}
                </>
              )}
            </p>
            {(e.dress || e.note) && (
              <p className="inv-serif mt-[2cqw] text-[3.8cqw] font-medium" style={{ color: c.gold }}>
                {[e.dress && `Dress: ${e.dress}`, e.note].filter(Boolean).join(" · ")}
              </p>
            )}
            <div className="mt-[4cqw]">
              <EventActions event={e} invite={invite} theme={chameli} />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Events({ invite }: { invite: Invite }) {
  return (
    <>
      <Glance invite={invite} />
    </>
  );
}

/* ───────── Sign-off ───────── */

function Closing({ invite }: { invite: Invite }) {
  const [a, b] = couple(invite);
  return (
    // Room at the end so the last lines scroll clear of the balustrade in the frame.
    <section className="relative px-[11cqw] pt-[12cqw] pb-[64cqw] text-center">
      <Divider className="mb-[8cqw]" />
      <Reveal>
        {invite.closing && <p className={`${italic} text-[4.6cqw] leading-relaxed whitespace-pre-line`}>{invite.closing}</p>}
        <p className="inv-script mt-[6cqw] text-[11cqw] leading-none">
          {a.first} <span style={{ color: c.gold }}>&amp;</span> {b.first}
        </p>
        {invite.hashtag && <p className="inv-serif mt-[4cqw] text-[4.2cqw] font-semibold tracking-[0.04em]" style={{ color: c.gold }}>{invite.hashtag}</p>}
        {!invite.noBranding && (
          <Link href="/" className="inv-label mt-[8cqw] inline-block text-[2.4cqw] tracking-[0.26em] opacity-70">
            Crafted with love by {site.name}
          </Link>
        )}
      </Reveal>
    </section>
  );
}

/* ───────── The paper and its fixed frame ───────── */

function Backdrop() {
  return (
    <div className="pointer-events-none absolute inset-0" style={{ background: c.paper }}>
      <div className="sticky top-0 h-[var(--screen-h,100svh)] w-full">
        <Art src={`${art}/chameli-paper.jpg`} />
      </div>
    </div>
  );
}

// Jasmine petals that now and then drift down across the card.
const DRIFT = (() => {
  const r = seeded(91);
  return Array.from({ length: 6 }, (_, i) => ({ x: 8 + r() * 84, delay: i * 3.1 + r() * 2, dur: 11 + r() * 6, sway: 6 + r() * 8, size: 1.6 + r() * 1.4 }));
})();

function Frame() {
  const reduce = useReducedMotion();
  // Rounded fades, so no straight edge shows as the page scrolls under the art.
  const corner = "radial-gradient(120% 115% at 0 0, #000 52%, transparent 80%)";
  const ledge = "linear-gradient(to bottom, transparent, #000 34%)";
  return (
    <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.6, delay: 1.2 }}>
      <div className="absolute inset-[2.6cqw] border" style={{ borderColor: `${c.gold}aa` }} />
      <div className="absolute inset-[3.6cqw] border" style={{ borderColor: `${c.gold}55` }} />

      {/* Jasmine and the brass lantern, top left, swaying a touch, its flame breathing. */}
      <motion.div
        className="absolute top-0 left-0 aspect-[470/560] w-[34cqw] origin-top-left"
        style={{ maskImage: corner, WebkitMaskImage: corner }}
        animate={reduce ? {} : { rotate: [0, 0.8, 0, -0.5, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      >
        <Art src={`${art}/chameli-corner.jpg`} />
        <motion.div
          className="absolute top-[58%] left-[25%] h-[24%] w-[30%] rounded-full mix-blend-screen"
          style={{ background: "radial-gradient(closest-side, rgba(255,226,160,.75), rgba(255,210,122,.18) 65%, transparent)" }}
          animate={{ opacity: [0.55, 1, 0.6, 0.9, 0.55] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* The urn, the hills and the jaali balustrade along the bottom, with mist drifting over the hills. */}
      <div className="absolute inset-x-0 bottom-0 h-[48cqw] overflow-hidden" style={{ maskImage: ledge, WebkitMaskImage: ledge }}>
        <motion.div className="absolute inset-0" animate={reduce ? {} : { scale: [1, 1.025, 1] }} transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}>
          <Art src={`${art}/chameli-ledge.jpg`} style={{ objectPosition: "50% 100%" }} />
        </motion.div>
        {!reduce && (
          <motion.div
            className="absolute top-[22%] h-[26%] w-[70%] rounded-full bg-white/45 blur-[5cqw]"
            animate={{ x: ["-60%", "150%"] }}
            transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
          />
        )}
      </div>

      {!reduce &&
        DRIFT.map((p, i) => (
          <motion.span
            key={i}
            className="absolute top-[-4%] rounded-[60%_40%_60%_40%] bg-[radial-gradient(circle_at_30%_30%,#fff,#efe6d2)] shadow-sm"
            style={{ left: `${p.x}%`, width: `${p.size}cqw`, height: `${p.size * 1.3}cqw` }}
            animate={{ y: ["0vh", "110vh"], x: [0, p.sway, -p.sway, 0].map((v) => `${v}cqw`), rotate: [0, 180, 360], opacity: [0, 0.9, 0.9, 0] }}
            transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "linear" }}
          />
        ))}
    </motion.div>
  );
}

export const chameli: InviteTheme = {
  id: "chameli",
  tapHint: "tapSeal",
  // The seal, the bloom and the petals take a little longer than other openings.
  openingMs: 3700,
  root: "",
  vars: {
    "--inv-script": "var(--font-pinyon), cursive",
    "--inv-serif": "var(--font-cormorant), serif",
    "--inv-label": "var(--font-cinzel), serif",
    "--inv-accent": c.ink,
    background: c.paper,
    color: c.ink,
  } as CSSProperties,
  accent: c.ink,
  ui: {
    section: "relative px-[11cqw] py-[12cqw]",
    card: "rounded-[3cqw] border border-[#b19254]/40 bg-[#fbf7ef]/90",
    input: "w-full rounded-[2cqw] border border-black/15 bg-white/90 px-[4cqw] py-[3cqw] text-[3.8cqw] outline-none",
    chip: "rounded-full border border-black/15 bg-white/70 transition",
    chipOn: "rounded-full border border-transparent font-semibold text-white transition [background:var(--inv-accent)]",
    button: "inline-flex items-center gap-[1.5cqw] rounded-full px-[4.5cqw] py-[2.2cqw] text-[3.2cqw] font-medium text-[#f6efe2] active:scale-95 transition [background:var(--inv-accent)]",
    ghost: "inline-flex items-center gap-[1.5cqw] rounded-full border border-[#b19254] bg-[#fbf7ef] px-[4.5cqw] py-[2.2cqw] text-[3.2cqw] font-medium active:scale-95 transition",
    muted: "opacity-80",
    tile: "rounded-[3cqw] border border-[#b19254]/60 bg-[#fbf7ef]/95",
  },
  Opening,
  Hero,
  Blessing,
  Events,
  Closing,
  Backdrop,
  Frame,
  Divider,
  Title,
};
