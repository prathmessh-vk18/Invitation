"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useRef, type CSSProperties, type ReactNode } from "react";
import { site } from "@/config/site";
import type { Invite, InviteEvent } from "@/data/invites";
import { fmtDate, monthName, time, weekday, yearNum } from "@/lib/format";
import { langOf } from "./i18n";
import { makeIllustrated } from "./illustrated";
import { INVITE_ART_SIZES, PREVIEW_ART_SIZES, useOpened, usePreview } from "./opened";
import { couple, EventActions, Reveal } from "./shared";
import type { InviteTheme, OpeningProps } from "./types";

/**
 * Gauri Shankar: Shiv's open palm and Parvati's alta-painted foot drift together across a dawn sky,
 * then the couple's names appear: "Written by destiny, blessed by Mahadev". Tapping opens onto
 * Shiv and Parvati seated on Kailash with the wedding details above them; scrolling steps into the
 * peaks as the invitation zooms in, and every function sits on a flower-shaped card over a still
 * sky. Art: public/art/illus/shiv-*.
 */

const art = "/art/illus";
const c = {
  paper: "#fbf4f1",
  ink: "#4a1a28",
  rose: "#b2385a",
  crimson: "#8e1f2f",
  gold: "#b8862f",
  soft: "#7a5a5f",
};
const SCRIPT = "var(--font-pinyon), cursive";
const HAND = "var(--font-parisienne), cursive";
const SKY = "#f3dce4";
const ease = [0.22, 1, 0.36, 1] as const;
// The lehenga drifts out of the clouds and the arm out of the side, instead of ending in a hard edge.
const FROM_SKY: CSSProperties = { WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 30%)", maskImage: "linear-gradient(to bottom, transparent 0%, #000 30%)" };
const FROM_SIDE: CSSProperties = { WebkitMaskImage: "linear-gradient(to right, transparent 0%, #000 30%)", maskImage: "linear-gradient(to right, transparent 0%, #000 30%)" };

const base = makeIllustrated({
  id: "gaurishankar",
  images: { opening: `${art}/shiv-sky.jpg`, hero: `${art}/shiv-kailash.jpg`, card: `${art}/shiv-sky.jpg` },
  opening: "envelope",
  heroTextTop: 6,
  frame: { top: 0, bottom: 0, side: 0 },
  colors: { ink: c.ink, accent: c.rose, soft: c.soft, paper: c.paper, onAccent: "#fff" },
  fonts: { script: SCRIPT, serif: "var(--font-cormorant), serif", label: "var(--font-cinzel), serif" },
});

function Art({ src, alt = "", priority, contain }: { src: string; alt?: string; priority?: boolean; contain?: boolean }) {
  const preview = usePreview();
  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority && !preview}
      sizes={preview ? PREVIEW_ART_SIZES : INVITE_ART_SIZES}
      className={contain ? "object-contain" : "object-cover"}
    />
  );
}

/** A small lotus between two hairlines. */
function Divider({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-[2.5cqw] ${className ?? ""}`}>
      <span className="h-px w-[16cqw]" style={{ background: `linear-gradient(to right, transparent, ${c.gold})` }} />
      <svg viewBox="0 0 24 24" className="w-[5cqw]" fill="none" stroke={c.gold} strokeWidth={1.3} aria-hidden>
        <path d="M12 19c-3-1.5-5-4-5-7 2 0 4 1 5 3 1-2 3-3 5-3 0 3-2 5.5-5 7zM12 15c-1.6-2-1.6-5 0-8 1.6 3 1.6 6 0 8zM4 13c1.5 0 3 .6 4 2M20 13c-1.5 0-3 .6-4 2" />
      </svg>
      <span className="h-px w-[16cqw]" style={{ background: `linear-gradient(to left, transparent, ${c.gold})` }} />
    </div>
  );
}

function Title({ kicker, children }: { kicker?: string; children: ReactNode }) {
  return (
    <div className="text-center">
      {kicker && (
        <p className="inv-label text-[2.6cqw]" style={{ color: c.gold }}>
          {kicker}
        </p>
      )}
      <h2 className="mt-[1cqw] text-[10cqw] leading-[1.1]" style={{ color: c.rose, fontFamily: SCRIPT }}>
        {children}
      </h2>
      <Divider className="mt-[1.5cqw]" />
    </div>
  );
}

/* ───────── Petals drifting down ───────── */

// Fixed positions so the server and the browser draw the same petals.
const PETALS = [
  { x: 8, d: 0, s: 1, t: 9 },
  { x: 22, d: 2.4, s: 0.8, t: 11 },
  { x: 37, d: 1.1, s: 1.15, t: 10 },
  { x: 51, d: 3.6, s: 0.7, t: 12 },
  { x: 64, d: 0.6, s: 0.95, t: 9.5 },
  { x: 78, d: 2.9, s: 1.1, t: 10.5 },
  { x: 90, d: 1.7, s: 0.85, t: 11.5 },
  { x: 15, d: 5.2, s: 0.75, t: 12.5 },
  { x: 45, d: 6.1, s: 1, t: 10 },
  { x: 71, d: 4.4, s: 0.9, t: 11 },
];

function Petals({ burst = false }: { burst?: boolean }) {
  const still = useReducedMotion();
  if (still) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {PETALS.map((p, i) => (
        <motion.svg
          key={i}
          viewBox="0 0 20 14"
          className="absolute -top-[6%]"
          style={{ left: `${p.x}%`, width: `${3.4 * p.s}cqw` }}
          initial={{ y: "-10%", opacity: 0 }}
          animate={{ y: ["0vh", "112vh"], x: ["0cqw", "5cqw", "-3cqw", "4cqw"], rotate: [0, 120, 220, 340], opacity: [0, 0.9, 0.9, 0] }}
          transition={{ duration: burst ? p.t * 0.6 : p.t, delay: burst ? p.d * 0.15 : p.d, repeat: Infinity, ease: "linear" }}
        >
          <path d="M1 7C4 1 13 0 19 7 13 14 4 13 1 7z" fill={i % 3 ? "#f2a3b5" : "#e77f98"} opacity={0.85} />
        </motion.svg>
      ))}
    </div>
  );
}

/* ───────── Opening: the meeting ───────── */

const LINE = { en: ["Written by destiny,", "blessed by Mahadev"], hi: ["विधि ने लिखा,", "महादेव ने आशीष दिया"] };

function Meeting({ invite, opened, onOpen }: OpeningProps) {
  const still = useReducedMotion();
  const [a, b] = couple(invite);
  const hi = langOf(invite) === "hi";
  const at = (delay: number) => (still ? 0 : delay);
  const line = hi ? LINE.hi : LINE.en;
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      aria-label="Open invitation"
      className="absolute inset-0 block cursor-pointer overflow-hidden text-left"
      style={{ background: SKY, pointerEvents: opened ? "none" : "auto" }}
      animate={opened ? { opacity: 0, scale: 1.06 } : { opacity: 1, scale: 1 }}
      transition={{ duration: opened ? 1.3 : 0.4, ease }}
    >
      <Art src={`${art}/shiv-sky.jpg`} priority />
      <Petals />

      {/* Parvati's foot descends from the sky… */}
      <motion.div
        className="absolute left-[46cqw] w-[40cqw]"
        style={{ top: "calc(40% - 41cqw)", aspectRatio: "700 / 1046", ...FROM_SKY }}
        initial={still ? false : { y: "-140%", opacity: 0 }}
        animate={{ y: ["-140%", "0%", "4%"], opacity: 1 }}
        transition={{ duration: 3, delay: at(0.5), times: [0, 0.72, 1], ease: "easeOut" }}
      >
        <Art src={`${art}/shiv-foot.webp`} alt="" priority contain />
      </motion.div>

      {/* …as Shiv's open palm reaches in to receive it. */}
      <motion.div
        className="absolute -left-[6cqw] w-[104cqw]"
        style={{ top: "40%", aspectRatio: "1100 / 618" }}
        initial={still ? false : { x: "-100%", opacity: 0 }}
        animate={{ x: ["-100%", "0%", "0%"], y: ["0%", "0%", "-2%"], opacity: 1 }}
        transition={{ duration: 3.2, delay: at(0.2), times: [0, 0.6, 1], ease: "easeOut" }}
      >
        <Art src={`${art}/shiv-hand.webp`} alt="" priority contain />
      </motion.div>

      {/* A glow where they meet. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute size-[46cqw] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ left: "70cqw", top: "calc(40% + 14cqw)", background: "radial-gradient(closest-side, rgba(255,240,230,.9), rgba(255,220,225,0))" }}
        initial={{ opacity: 0, scale: 0.4 }}
        animate={{ opacity: [0, 0.95, 0.4], scale: [0.4, 1.2, 1] }}
        transition={{ duration: 2.2, delay: at(3.1), ease }}
      />

      <div className="absolute inset-x-[6%] bottom-[9%] text-center">
        <motion.p
          className={`${hi ? "" : "inv-label"} text-[4.6cqw] leading-snug font-semibold`}
          style={{ color: c.crimson, fontFamily: hi ? "var(--font-deva)" : undefined, letterSpacing: hi ? undefined : "0.06em" }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: at(3.5), ease }}
        >
          {line[0]}
          <br />
          {line[1]}
        </motion.p>
        <motion.p
          className="mt-[2cqw] text-[14cqw] leading-[1.15]"
          style={{ color: c.rose, fontFamily: SCRIPT }}
          initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.4, delay: at(4.3), ease }}
        >
          {a.first} <span className="text-[10cqw]">{invite.joiner ?? "&"}</span> {b.first}
        </motion.p>
        <motion.p
          className="inv-label mt-[4cqw] text-[2.6cqw]"
          style={{ color: c.ink }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.85, 0.45, 0.85] }}
          transition={{ duration: 2.6, delay: at(5.6), repeat: Infinity, repeatType: "reverse" }}
        >
          {invite.openHint ?? (hi ? "प्रवेश के लिए स्पर्श करें" : "Tap anywhere to enter")}
        </motion.p>
      </div>
    </motion.button>
  );
}

/* ───────── Cover: seated together on Kailash ───────── */

const showAfterOpen = (opened: boolean) => (delay: number) => ({ initial: { opacity: 0, y: 12 }, animate: opened ? { opacity: 1, y: 0 } : {}, transition: { duration: 1, delay, ease } });

function Details({ invite, show }: { invite: Invite; show: (d: number) => object }) {
  const [a, b] = couple(invite);
  return (
    <div className="relative flex flex-col items-center text-center">
      <div className="absolute -inset-x-[10%] -inset-y-[18%] rounded-[50%] bg-[radial-gradient(closest-side,rgba(255,250,248,.82),rgba(255,250,248,0))]" />
      <motion.p {...show(0.2)} className="relative text-[3.4cqw] leading-snug" style={{ color: c.crimson, fontFamily: "var(--font-deva)" }}>
        {invite.invocation}
      </motion.p>
      {invite.invocationMeaning && (
        <motion.p {...show(0.35)} className="inv-serif relative mt-[1cqw] text-[3.6cqw] italic" style={{ color: c.soft }}>
          {invite.invocationMeaning}
        </motion.p>
      )}
      <motion.p {...show(0.5)} className="inv-label relative mt-[3cqw] text-[2.5cqw] leading-relaxed" style={{ color: c.ink }}>
        We cordially invite you to the wedding of
      </motion.p>
      <motion.h1 {...show(0.75)} className="relative mt-[1.5cqw] text-[13cqw] leading-[1.05]" style={{ color: c.rose, fontFamily: SCRIPT }}>
        {a.first}
        <span className="mx-[2cqw] text-[9cqw]">{invite.joiner ?? "&"}</span>
        {b.first}
      </motion.h1>
      <motion.p {...show(1)} className="inv-label relative mt-[3cqw] text-[3.2cqw]" style={{ color: c.crimson, letterSpacing: "0.12em" }}>
        {weekday(invite.date)} · {fmtDate(invite.date, { day: "numeric" })} {monthName(invite.date)} {yearNum(invite.date)}
      </motion.p>
      <motion.p {...show(1.15)} className="inv-serif relative mt-[1.5cqw] text-[4.4cqw] italic" style={{ color: c.ink }}>
        {invite.city}
      </motion.p>
    </div>
  );
}

function Hero({ invite }: { invite: Invite }) {
  const opened = useOpened();
  if (usePreview()) {
    return (
      <section className="relative h-full w-full overflow-hidden">
        <Art src={`${art}/shiv-kailash.jpg`} />
        <div className="absolute inset-x-[8%] top-[7%]">
          <Details invite={invite} show={showAfterOpen(opened)} />
        </div>
      </section>
    );
  }
  return <Kailash invite={invite} />;
}

/** The couple on the peak; scrolling steps towards them while the scene gives way to the invitation. */
function Kailash({ invite }: { invite: Invite }) {
  const opened = useOpened();
  const [a, b] = couple(invite);
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const scale = useTransform(p, [0, 0.95], [1, 1.8]);
  const textY = useTransform(p, [0, 0.3], ["0%", "-40%"]);
  const textOpacity = useTransform(p, [0.03, 0.26], [1, 0]);
  const sceneOpacity = useTransform(p, [0.66, 0.98], [1, 0]);
  const cue = useTransform(p, [0, 0.06], [1, 0]);
  return (
    <section ref={ref} className="relative" style={{ height: "210svh" }}>
      <motion.div className="sticky top-0 h-[100svh] w-full overflow-hidden" style={{ opacity: sceneOpacity }}>
        <motion.div className="absolute inset-0" style={{ scale, transformOrigin: "50% 66%" }}>
          <Art src={`${art}/shiv-kailash.jpg`} alt={`Shiv and Parvati seated together on Kailash, for ${a.first} and ${b.first}`} priority />
        </motion.div>
        <Petals />
        <Mist />
        <motion.div className="absolute inset-x-[7%] top-[6%]" style={{ y: textY, opacity: textOpacity }}>
          <Details invite={invite} show={showAfterOpen(opened)} />
        </motion.div>
        <motion.button
          type="button"
          onClick={() => window.scrollBy({ top: window.innerHeight, behavior: "smooth" })}
          className="absolute bottom-[3%] left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1 px-[6cqw] py-[2cqw] text-white [text-shadow:0_1px_8px_rgba(0,0,0,.55)]"
          initial={{ opacity: 0 }}
          animate={opened ? { opacity: 1, y: [0, 6, 0] } : {}}
          transition={{ opacity: { delay: 1.8, duration: 0.6 }, y: { delay: 1.8, duration: 1.8, repeat: Infinity } }}
          style={{ opacity: cue }}
          aria-label="Scroll"
        >
          <span className="inv-label text-[2.3cqw]">Scroll</span>
          <svg viewBox="0 0 24 24" className="size-[4cqw]" fill="none" stroke="currentColor" strokeWidth={1.6}>
            <path d="M6 9l6 6 6-6" />
          </svg>
        </motion.button>
      </motion.div>
    </section>
  );
}

/** Soft mist drifting along the bottom of a scene. */
function Mist() {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-x-[-20%] bottom-0 h-[20%]"
      style={{ background: "radial-gradient(60% 70% at 30% 100%, rgba(255,255,255,.8), transparent 70%), radial-gradient(60% 70% at 75% 100%, rgba(255,255,255,.7), transparent 70%)" }}
      animate={{ x: ["-4%", "4%", "-4%"] }}
      transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

/* ───────── The invitation: zooms in as the scene fades ───────── */

function Blessing({ invite }: { invite: Invite }) {
  const [a, b] = couple(invite);
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 15%"] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.5, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.45], [0, 1]);
  const preview = usePreview();
  const person = (p: typeof a) => (
    <div>
      <p className="mt-[1.5cqw] text-[13cqw] leading-[1.05]" style={{ color: c.rose, fontFamily: SCRIPT }}>
        {p.full || p.first}
      </p>
      {p.elders && !p.eldersBelow && (
        <p className="inv-label mx-auto mt-[1cqw] max-w-[70cqw] text-[2.6cqw] leading-relaxed" style={{ color: c.gold }}>
          {p.elders}
        </p>
      )}
      {p.parents && (
        <p className="inv-serif mx-auto mt-[1cqw] max-w-[70cqw] text-[3.8cqw] leading-snug italic" style={{ color: c.soft }}>
          {p.parents}
        </p>
      )}
      {p.elders && p.eldersBelow && (
        <p className="inv-serif mx-auto mt-[1cqw] max-w-[70cqw] text-[3.6cqw] leading-snug italic" style={{ color: c.soft }}>
          {p.elders}
        </p>
      )}
    </div>
  );
  return (
    <section ref={ref} className={`relative z-10 px-[11cqw] pb-[10cqw] text-center ${preview ? "pt-[14cqw]" : "-mt-[55svh] pt-[20cqw]"}`}>
      <motion.div style={preview ? undefined : { scale, opacity, transformOrigin: "50% 30%" }}>
        <p className="text-[9cqw] leading-none" style={{ color: c.gold, fontFamily: "var(--font-deva)" }}>
          ॐ
        </p>
        <p className="inv-label mt-[4cqw] text-[2.7cqw] leading-relaxed" style={{ color: c.gold }}>
          {invite.hosts || "Together with their families"}
        </p>
        <p className="inv-serif mt-[2.5cqw] text-[4.8cqw] leading-snug italic" style={{ color: c.ink }}>
          {invite.message}
        </p>
        <Divider className="my-[6cqw]" />
        {person(a)}
        <p className="my-[3cqw] text-[9cqw] leading-none" style={{ color: c.gold, fontFamily: HAND }}>
          with
        </p>
        {person(b)}
      </motion.div>
    </section>
  );
}

/* ───────── Functions on flower-shaped cards ───────── */

// A rosette: petals round an ellipse, in a 100 × 135 box, so it fits a tall card without stretching.
const ROSETTE = Array.from({ length: 26 }, (_, i) => {
  const t = (i / 26) * Math.PI * 2;
  // Rounded so the server and browser render identical numbers.
  return { x: Math.round((50 + Math.cos(t) * 40) * 100) / 100, y: Math.round((67.5 + Math.sin(t) * 57) * 100) / 100 };
});

function FlowerCard({ e, invite }: { e: InviteEvent; invite: Invite }) {
  return (
    <div>
      <div className="relative mx-auto w-full" style={{ aspectRatio: "100 / 135" }}>
        <svg viewBox="0 0 100 135" className="absolute inset-0 h-full w-full drop-shadow-[0_10px_18px_rgba(140,40,70,.16)]" aria-hidden>
          {ROSETTE.map((p, i) => <circle key={`o${i}`} cx={p.x} cy={p.y} r={9.4} fill="#e9a7b8" opacity={0.8} />)}
          {ROSETTE.map((p, i) => <circle key={`i${i}`} cx={p.x} cy={p.y} r={8.9} fill="#fffaf8" />)}
          <ellipse cx={50} cy={67.5} rx={40} ry={57} fill="#fffaf8" />
          <ellipse cx={50} cy={67.5} rx={35.5} ry={52} fill="none" stroke={c.gold} strokeWidth={0.35} strokeDasharray="1.2 1.2" opacity={0.8} />
          {ROSETTE.map((p, i) => <circle key={`d${i}`} cx={Math.round((50 + (p.x - 50) * 1.02) * 100) / 100} cy={Math.round((67.5 + (p.y - 67.5) * 1.02) * 100) / 100} r={0.9} fill={c.rose} opacity={0.55} />)}
        </svg>
        <div className="absolute inset-x-[19%] inset-y-[14%] flex flex-col items-center justify-center text-center">
          <svg viewBox="0 0 24 24" className="w-[6cqw]" fill="none" stroke={c.gold} strokeWidth={1.3} aria-hidden>
            <path d="M12 19c-3-1.5-5-4-5-7 2 0 4 1 5 3 1-2 3-3 5-3 0 3-2 5.5-5 7zM12 15c-1.6-2-1.6-5 0-8 1.6 3 1.6 6 0 8z" />
          </svg>
          <h3 className="mt-[1cqw] text-[10cqw] leading-[1.05]" style={{ color: c.rose, fontFamily: SCRIPT }}>
            {e.name}
          </h3>
          {e.note && (
            <p className="inv-serif mt-[0.5cqw] text-[3.3cqw] leading-snug italic" style={{ color: c.soft }}>
              {e.note}
            </p>
          )}
          <p className="inv-label mt-[2cqw] text-[3.4cqw] leading-snug" style={{ color: c.crimson, letterSpacing: "0.06em" }}>
            {weekday(e.start).slice(0, 3)} · {fmtDate(e.start, { day: "numeric", month: "short", year: "numeric" })}
            <br />
            {time(e.start)}
          </p>
          <p className="inv-serif mt-[2cqw] text-[4cqw] leading-tight font-semibold" style={{ color: c.ink }}>
            {e.venue}
          </p>
          {e.address && (
            <p className="inv-serif mt-[0.5cqw] line-clamp-2 text-[3cqw] leading-snug" style={{ color: c.soft }}>
              {e.address}
            </p>
          )}
          {e.dress && (
            <p className="inv-serif mt-[1cqw] text-[3.2cqw] italic" style={{ color: c.rose }}>
              Dress: {e.dress}
            </p>
          )}
        </div>
      </div>
      <div className="-mt-[2cqw] flex justify-center">
        <EventActions event={e} invite={invite} theme={gaurishankar} />
      </div>
    </div>
  );
}

function Events({ invite }: { invite: Invite }) {
  return (
    <section className="relative px-[11cqw] py-[12cqw]">
      <Reveal>
        <Title kicker="Join us for">The celebrations</Title>
      </Reveal>
      <ol className="mt-[8cqw] space-y-[9cqw]">
        {invite.events.map((e, i) => (
          <motion.li key={e.name + i} initial={{ opacity: 0, y: 30, scale: 0.94 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.9, ease }}>
            <FlowerCard e={e} invite={invite} />
          </motion.li>
        ))}
      </ol>
    </section>
  );
}

/* ───────── Closing: the meeting again, small ───────── */

function Closing({ invite }: { invite: Invite }) {
  const [a, b] = couple(invite);
  return (
    <section className="relative overflow-hidden px-[11cqw] pt-[8cqw] pb-[16cqw] text-center">
      <Reveal>
        <div className="relative mx-auto h-[74cqw] w-[78cqw]" aria-hidden>
          <div className="absolute left-[38cqw] w-[28cqw]" style={{ top: "0", aspectRatio: "700 / 1046", ...FROM_SKY }}>
            <Art src={`${art}/shiv-foot.webp`} contain />
          </div>
          <div className="absolute -left-[8cqw] w-[76cqw]" style={{ top: "27cqw", aspectRatio: "1100 / 618", ...FROM_SIDE }}>
            <Art src={`${art}/shiv-hand.webp`} contain />
          </div>
        </div>
        <Divider className="mt-[4cqw]" />
        <p className="inv-serif mt-[4cqw] text-[5cqw] leading-snug italic" style={{ color: c.ink }}>
          {invite.closing}
        </p>
        <p className="mt-[3cqw] text-[13cqw] leading-[1.1]" style={{ color: c.rose, fontFamily: SCRIPT }}>
          {a.first} {invite.joiner ?? "&"} {b.first}
        </p>
        {invite.hashtag && (
          <p className="inv-label mt-[3cqw] text-[2.8cqw]" style={{ color: c.gold }}>
            {invite.hashtag}
          </p>
        )}
        {!invite.noBranding && (
          <Link href="/" className="inv-label mt-[6cqw] inline-block text-[2.2cqw] opacity-70" style={{ color: c.ink }}>
            Crafted with love by {site.name}
          </Link>
        )}
      </Reveal>
    </section>
  );
}

/** The dawn sky stays still behind everything after the cover. */
function Backdrop() {
  return (
    <div className="pointer-events-none absolute inset-0" style={{ background: SKY }}>
      <div className="sticky top-0 h-[var(--screen-h,100svh)] w-full">
        <Art src={`${art}/shiv-sky.jpg`} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(75% 60% at 50% 45%, rgba(255,252,250,.62), rgba(255,252,250,.2) 80%)" }} />
      </div>
    </div>
  );
}

export const gaurishankar: InviteTheme = {
  ...base,
  id: "gaurishankar",
  vars: { ...base.vars, "--inv-accent": c.rose } as CSSProperties,
  accent: c.rose,
  ui: { ...base.ui, section: "relative px-[10cqw] py-[12cqw]" },
  Opening: Meeting,
  Hero,
  Blessing,
  Events,
  Closing,
  Backdrop,
  Divider,
  Title,
};
