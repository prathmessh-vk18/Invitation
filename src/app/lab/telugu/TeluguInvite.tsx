"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";

/**
 * The Telugu design (one client), from her Shiva–Parvati reference. The first concept, kept as it
 * was, with only the backgrounds changed to the two scenes she picked: a Himalayan dawn of snowy
 * peaks, a soft lavender-blue sky, peach-gold sunrise and blush lotuses. The gold Ganesha opens it.
 * English first; Telugu once she approves. (The walking-couple alternative is saved at /lab/telugu/v2.)
 *
 * Opening, "Srirastu Shubhamastu": Shiva and Parvati sit in meditation inside a golden halo, with
 * "You're invited" and the names above them. Tap, and the halo lights up ring by ring as the
 * blessing writes itself in; light blooms out of the halo and talambralu (pearls and turmeric rice,
 * the Telugu wedding shower) falls over the screen as the scene dissolves onto the cover, the camera
 * easing back from the couple. A thin gold frame settles around the page and the names write in.
 */

const C = {
  maroon: "#6e1423",
  ink: "#3a2030",
  gold: "#8f6220",
  goldLight: "#f7dc95",
  paper: "#fbf5ef",
};
const label = "var(--font-cinzel)";
const serif = "var(--font-cormorant)";
const script = "var(--font-pinyon)";
const art = (f: string) => `/art/illus/telugu-${f}.webp`;
const ease = [0.22, 1, 0.36, 1] as const;
const GLOW = "0 0 16px rgba(255,250,245,.95), 0 0 4px rgba(255,250,245,.9)";

// The opening's beats (seconds after the tap).
const T = {
  blessing: 0.2,
  halo: 0.3,
  bloom: 1.9,
  shower: 1.7,
  fade: 2.4,
  frame: 3,
  names: 3.1,
  done: 6.2,
};

// Sample couple until the client's details come in.
const S = {
  groom: "Karthik",
  bride: "Sravani",
  date: new Date("2027-02-14T07:42:00+05:30"),
  day: "Sunday · 14 February 2027",
  city: "Hyderabad",
};

/** A small seeded random, so every burst plays the same way. */
function seeded(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

export function TeluguInvite() {
  const [opened, setOpened] = useState(false);
  const [gone, setGone] = useState(false);
  const [run, setRun] = useState(0);
  useEffect(() => {
    document.documentElement.style.overflow = gone ? "" : "hidden";
    if (!opened || gone) return;
    const t = window.setTimeout(() => setGone(true), T.done * 1000);
    return () => window.clearTimeout(t);
  }, [opened, gone]);
  useEffect(
    () => () => {
      document.documentElement.style.overflow = "";
    },
    [],
  );
  const replay = () => {
    window.scrollTo({ top: 0 });
    setOpened(false);
    setGone(false);
    setRun((r) => r + 1);
  };

  return (
    <div className="flex min-h-svh justify-center bg-[#1d1a2b]">
      <div
        key={run}
        className="@container relative w-full max-w-[480px] overflow-hidden"
        style={{
          background: `linear-gradient(180deg, ${C.paper}, #f8eef0 30%, #f3eff8 55%, #fbf3ec 80%, #f1e9f6)`,
        }}
      >
        <Cover opened={opened} />
        <Families />
        <Countdown />
        <Functions />
        <Closing />
        <Frame opened={opened} />
        {!gone && <Opening opened={opened} onOpen={() => setOpened(true)} />}
        <button type="button" onClick={replay} className="fixed top-3 right-3 z-[70] rounded-full bg-black/55 px-3 py-1.5 text-[12px] text-white backdrop-blur">
          ↻ Replay
        </button>
      </div>
    </div>
  );
}

/* ───────── Shared bits ───────── */

/** A painting at full width, 2:3, its edges melting into the paper. */
function Painting({ src, alt, fade, className, style, priority }: { src: string; alt: string; fade: string; className?: string; style?: CSSProperties; priority?: boolean }) {
  return (
    <div className={`absolute inset-x-0 aspect-[2/3] ${className ?? ""}`} style={{ maskImage: fade, WebkitMaskImage: fade, ...style }}>
      <Image src={art(src)} alt={alt} fill priority={priority} sizes="480px" className="object-cover" />
    </div>
  );
}

/** The gold Ganesha that opens the invitation (the same one as Srinita's). */
function Ganesha({ className, glow }: { className?: string; glow?: boolean }) {
  return (
    <div className={`relative aspect-[270/346] ${className ?? ""}`}>
      <Image src="/art/seals/srinita-ganesha.png" alt="Shri Ganesha" fill sizes="120px" className="object-contain drop-shadow-[0_0_6px_rgba(255,250,240,.9)]" />
      {glow && (
        <motion.div
          className="absolute inset-[-40%] rounded-full mix-blend-screen"
          style={{ background: "radial-gradient(closest-side, rgba(255,226,150,.9), rgba(255,210,120,.3) 50%, transparent)" }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: [0, 1, 0.5], scale: [0.6, 1.2, 1] }}
          transition={{ duration: 1.6, ease: "easeOut" }}
        />
      )}
    </div>
  );
}

/** A phrase arriving one letter at a time out of a soft blur. */
function Letters({ text, delay, className, style }: { text: string; delay: number; className?: string; style?: CSSProperties }) {
  return (
    <span className={`inline-block ${className ?? ""}`} style={style} aria-label={text}>
      {[...text].map((ch, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="inline-block whitespace-pre"
          initial={{ opacity: 0, y: "0.3em", filter: "blur(6px)" }}
          animate={{ opacity: 1, y: "0em", filter: "blur(0px)" }}
          transition={{ delay: delay + i * 0.045, duration: 0.7, ease }}
        >
          {ch}
        </motion.span>
      ))}
    </span>
  );
}

/** A name written in, as if by hand: wiped in from the left. */
function Written({ text, delay, style }: { text: ReactNode; delay: number; style?: CSSProperties }) {
  return (
    <motion.span
      className="inline-block whitespace-pre"
      style={style}
      initial={{ clipPath: "inset(-30% 100% -30% 0)", opacity: 0.4 }}
      animate={{ clipPath: "inset(-30% -8% -30% 0)", opacity: 1 }}
      transition={{ delay, duration: 1.3, ease: [0.45, 0, 0.25, 1] }}
    >
      {text}
    </motion.span>
  );
}

function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, filter: "blur(4px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.9, delay, ease }}
      className={`flex flex-col items-center ${className}`}
    >
      {children}
    </motion.div>
  );
}

const Small = ({ children, color = C.ink, className = "" }: { children: ReactNode; color?: string; className?: string }) => (
  <p className={`text-[2.5cqw] tracking-[0.26em] uppercase ${className}`} style={{ fontFamily: label, color }}>
    {children}
  </p>
);

function Divider({ color = C.gold }: { color?: string }) {
  return (
    <div className="my-[5cqw] flex w-[46%] items-center gap-[2cqw]" aria-hidden>
      <span className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${color})` }} />
      <svg viewBox="0 0 20 20" className="size-[3.4cqw]" fill={color}>
        <path d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z" />
      </svg>
      <span className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
    </div>
  );
}

/* ───────── The fixed frame ───────── */

/** A thin double gold rule with maroon-and-gold corner jewels, fixed around the page once open. */
function Frame({ opened }: { opened: boolean }) {
  const corner = (pos: string, rot: number) => (
    <svg viewBox="0 0 40 40" className={`absolute size-[9cqw] ${pos}`} style={{ rotate: `${rot}deg` }} aria-hidden>
      <path d="M2 38 V2 H38" fill="none" stroke={C.gold} strokeWidth="1.2" />
      <path d="M6 38 V6 H38" fill="none" stroke={C.gold} strokeWidth="0.6" />
      <path d="M6 6 L14 10 L10 14 Z" fill={C.maroon} />
      <circle cx="6" cy="6" r="2.6" fill={C.gold} />
      <circle cx="18" cy="6" r="1.1" fill={C.gold} />
      <circle cx="6" cy="18" r="1.1" fill={C.gold} />
    </svg>
  );
  return (
    <motion.div
      className="pointer-events-none fixed inset-y-0 left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2"
      initial={{ opacity: 0, scale: 1.03 }}
      animate={opened ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 1.4, delay: opened ? T.frame : 0, ease }}
    >
      <div className="@container absolute inset-[2.5cqw]">
        <div className="absolute inset-0 border" style={{ borderColor: `${C.gold}cc` }} />
        <div className="absolute inset-[1.2cqw] border" style={{ borderColor: `${C.gold}66` }} />
        {corner("top-[-0.5cqw] left-[-0.5cqw]", 0)}
        {corner("top-[-0.5cqw] right-[-0.5cqw]", 90)}
        {corner("right-[-0.5cqw] bottom-[-0.5cqw]", 180)}
        {corner("bottom-[-0.5cqw] left-[-0.5cqw]", 270)}
      </div>
    </motion.div>
  );
}

/* ───────── The opening ───────── */

// The halo in the opening painting, measured on the 2:3 image (anchored to the screen's bottom):
// centre 49.8% across and 57% down, 61% of the width across.
const HALO = { x: 49.8, fromBottom: 150 * (1 - 0.57), size: 61 };

function Opening({ opened, onOpen }: { opened: boolean; onOpen: () => void }) {
  return (
    <div className="fixed inset-y-0 left-1/2 z-50 w-full max-w-[480px] -translate-x-1/2 overflow-hidden" style={{ pointerEvents: opened ? "none" : "auto" }}>
      <div className="@container absolute inset-0">
        {/* The scene itself dissolves onto the cover; the shower keeps falling over it. */}
        <motion.div
          className="absolute inset-0"
          style={{ background: "#aba8d7" }}
          animate={{ opacity: opened ? 0 : 1 }}
          transition={{
            duration: 1,
            delay: opened ? T.fade : 0,
            ease: "easeInOut",
          }}
        >
          <motion.div className="absolute inset-0" animate={opened ? { scale: 1.08 } : {}} transition={{ duration: 3.4, ease }} style={{ transformOrigin: `${HALO.x}% 62%` }}>
            <Painting src="v3-opening" alt="Shiva and Parvati seated together in meditation inside a golden halo" fade="linear-gradient(180deg, transparent, #000 16%)" className="bottom-0" priority />
            <Halo opened={opened} />
          </motion.div>
          <Motes />
          <div className="absolute inset-x-0 top-0 flex flex-col items-center justify-center text-center" style={{ bottom: "100cqw" }}>
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.1 }}>
              <Ganesha className="w-[16cqw]" glow={opened} />
            </motion.div>
            <div className="relative mt-[3cqw] grid w-full place-items-center">
              <Invitation opened={opened} />
              {opened && <Blessing />}
            </div>
          </div>
        </motion.div>
        {opened && <Bloom />}
        {opened && <Talambralu />}
        <AnimatePresence>
          {!opened && (
            <motion.button
              type="button"
              onClick={onOpen}
              exit={{ opacity: 0, transition: { duration: 0.3 } }}
              className="absolute bottom-[5%] left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[rgba(52,14,14,.78)] px-5 py-3 text-[clamp(14px,3.9cqw,17px)] font-semibold whitespace-nowrap text-[#fbe7b8] shadow-[0_6px_24px_rgba(0,0,0,.3)] ring-1 ring-[#f7dc95]/40 backdrop-blur-md"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: [0, -4, 0] }}
              transition={{
                opacity: { delay: 0.8, duration: 0.5 },
                y: {
                  delay: 1.2,
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
            >
              <span aria-hidden>🪔</span> Tap to receive their blessings
            </motion.button>
          )}
        </AnimatePresence>
        {!opened && <button type="button" onClick={onOpen} aria-label="Open the invitation" className="absolute inset-0 cursor-pointer" />}
      </div>
    </div>
  );
}

/** Before the tap: only the invitation and the names, above the couple. */
function Invitation({ opened }: { opened: boolean }) {
  return (
    <motion.div
      className="col-start-1 row-start-1 flex flex-col items-center"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: opened ? 0 : 1, y: 0 }}
      transition={{ duration: opened ? 0.5 : 1.2, delay: opened ? 0 : 0.2 }}
    >
      <p className="text-[3.1cqw] tracking-[0.36em] uppercase" style={{ fontFamily: label, color: C.maroon, textShadow: GLOW }}>
        You&rsquo;re invited
      </p>
      <p
        className="mt-[2cqw] text-[14cqw] leading-[1.1]"
        style={{
          fontFamily: script,
          color: C.maroon,
          textShadow: GLOW,
        }}
      >
        {S.groom}
      </p>
      <p className="text-[6cqw] leading-none" style={{ fontFamily: serif, color: C.gold, textShadow: GLOW }}>
        &amp;
      </p>
      <p
        className="text-[14cqw] leading-[1.1]"
        style={{
          fontFamily: script,
          color: C.maroon,
          textShadow: GLOW,
        }}
      >
        {S.bride}
      </p>
    </motion.div>
  );
}

/** At the tap: the Telugu wedding blessing writes itself in where the names were. */
function Blessing() {
  return (
    <div
      className="col-start-1 row-start-1 flex flex-col items-center"
      style={{
        color: C.maroon,
        textShadow: GLOW,
      }}
    >
      <Letters text="SRIRASTU" delay={T.blessing} className="text-[6.4cqw] tracking-[0.22em]" style={{ fontFamily: label }} />
      <Letters text="Shubhamastu" delay={T.blessing + 0.45} className="mt-[1cqw] text-[15cqw] leading-[1.15]" style={{ fontFamily: script }} />
      <Letters text="AVIGHNAMASTU" delay={T.blessing + 1} className="mt-[1cqw] text-[3.2cqw] tracking-[0.34em]" style={{ fontFamily: label, color: C.gold }} />
    </div>
  );
}

/** The painted halo, alive: it breathes before the tap, then lights up ring by ring with turning rays. */
function Halo({ opened }: { opened: boolean }) {
  const box: CSSProperties = {
    left: `${HALO.x}%`,
    bottom: `${HALO.fromBottom}cqw`,
    width: `${HALO.size}cqw`,
    height: `${HALO.size}cqw`,
    translate: "-50% 50%",
  };
  return (
    <div className="pointer-events-none absolute" style={box}>
      {/* soft breathing glow */}
      <motion.div
        className="absolute inset-[-12%] rounded-full mix-blend-screen"
        style={{
          background: "radial-gradient(closest-side, transparent 62%, rgba(255,226,150,.55) 74%, transparent 86%)",
        }}
        animate={{
          opacity: opened ? 1 : [0.35, 0.8, 0.35],
          scale: opened ? 1.06 : [1, 1.03, 1],
        }}
        transition={opened ? { duration: 0.6 } : { duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      />
      {opened && (
        <>
          {/* rays turning slowly behind the ring */}
          <motion.div
            className="absolute inset-[-30%] rounded-full mix-blend-screen"
            style={{
              background: "repeating-conic-gradient(from 0deg, rgba(255,236,180,.55) 0deg 2deg, transparent 2deg 12deg)",
              maskImage: "radial-gradient(closest-side, transparent 48%, #000 56%, transparent 100%)",
              WebkitMaskImage: "radial-gradient(closest-side, transparent 48%, #000 56%, transparent 100%)",
            }}
            initial={{ opacity: 0, rotate: 0 }}
            animate={{ opacity: [0, 1, 1], rotate: 40 }}
            transition={{
              opacity: { delay: T.halo + 0.5, duration: 1.4 },
              rotate: { duration: 6, ease: "linear" },
            }}
          />
          {/* the ring itself, drawn round in light, then a second ring outside it */}
          <svg viewBox="0 0 100 100" className="absolute inset-0 size-full -rotate-90 overflow-visible">
            {[
              { r: 49, w: 1.4, d: 0 },
              { r: 55, w: 0.6, d: 0.35 },
            ].map((c) => (
              <motion.circle
                key={c.r}
                cx="50"
                cy="50"
                r={c.r}
                fill="none"
                stroke="#fff3c8"
                strokeWidth={c.w}
                strokeLinecap="round"
                style={{
                  filter: "drop-shadow(0 0 2px #ffe08a) drop-shadow(0 0 5px #ffcf6a)",
                }}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{
                  delay: T.halo + c.d,
                  duration: 1.3,
                  ease: [0.65, 0, 0.35, 1],
                }}
              />
            ))}
          </svg>
        </>
      )}
    </div>
  );
}

/** Gold dust drifting up through the painting before the tap. */
function Motes() {
  const motes = useMemo(() => {
    const r = seeded(11);
    return Array.from({ length: 16 }, () => ({
      x: 6 + r() * 88,
      y: 30 + r() * 65,
      s: 0.5 + r() * 0.9,
      d: r() * 5,
      t: 5 + r() * 4,
    }));
  }, []);
  return (
    <div className="pointer-events-none absolute inset-0">
      {motes.map((m, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-[#fff1c4] shadow-[0_0_6px_2px_rgba(255,220,140,.75)]"
          style={{
            left: `${m.x}%`,
            top: `${m.y}%`,
            width: `${m.s}cqw`,
            height: `${m.s}cqw`,
          }}
          animate={{ y: ["0cqw", "-26cqw"], opacity: [0, 1, 0] }}
          transition={{
            duration: m.t,
            delay: m.d,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

/** Light blooming out of the halo and washing the screen gold as the scene dissolves. */
function Bloom() {
  return (
    <motion.div
      className="pointer-events-none absolute rounded-full"
      style={{
        left: `${HALO.x}%`,
        bottom: `${HALO.fromBottom}cqw`,
        width: "80cqw",
        height: "80cqw",
        translate: "-50% 50%",
        background: "radial-gradient(closest-side, #fffaf0, #fbe7b0 40%, rgba(247,214,140,.55) 68%, transparent)",
      }}
      initial={{ scale: 0.2, opacity: 0 }}
      animate={{ scale: [0.2, 1.4, 5], opacity: [0, 1, 0] }}
      transition={{
        delay: T.bloom,
        duration: 2.6,
        times: [0, 0.38, 1],
        ease: "easeOut",
      }}
    />
  );
}

/** Talambralu: pearls and turmeric rice showered over the couple, falling across the whole screen. */
function Talambralu() {
  const bits = useMemo(() => {
    const r = seeded(23);
    return Array.from({ length: 60 }, (_, i) => ({
      x: 3 + r() * 94,
      d: T.shower + r() * 1.4,
      t: 2.6 + r() * 1.6,
      sway: (r() - 0.5) * 12,
      rot: r() * 360,
      kind: i % 3 === 0 ? "pearl" : i % 11 === 0 ? "kumkum" : "rice",
      s: 0.8 + r() * 0.6,
    }));
  }, []);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {bits.map((b, i) => (
        <motion.span
          key={i}
          className="absolute -top-[4cqw]"
          style={{
            left: `${b.x}%`,
            width: b.kind === "pearl" ? `${1.5 * b.s}cqw` : b.kind === "kumkum" ? "1cqw" : `${2.1 * b.s}cqw`,
            height: b.kind === "pearl" ? `${1.5 * b.s}cqw` : b.kind === "kumkum" ? "1cqw" : `${0.85 * b.s}cqw`,
            borderRadius: 999,
            background: b.kind === "pearl" ? "radial-gradient(circle at 32% 30%, #ffffff, #f4ecdc 45%, #cdbb9a)" : b.kind === "kumkum" ? "#a3121f" : "linear-gradient(180deg, #ffd45a, #e8a317)",
            boxShadow: b.kind === "pearl" ? "0 0 4px rgba(255,255,240,.9)" : "none",
          }}
          initial={{ y: 0, x: 0, rotate: b.rot, opacity: 0 }}
          animate={{
            y: "205cqw",
            x: ["0cqw", `${b.sway}cqw`, `${-b.sway / 2}cqw`],
            rotate: b.rot + 360,
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: b.t,
            delay: b.d,
            ease: [0.35, 0, 0.8, 1],
            times: [0, 0.08, 0.85, 1],
          }}
        />
      ))}
    </div>
  );
}

/* ───────── Cover ───────── */

/** A few maroon petals drifting down across a scene, all the time. */
function Petals({ count = 7, seed = 3 }: { count?: number; seed?: number }) {
  const petals = useMemo(() => {
    const r = seeded(seed);
    return Array.from({ length: count }, () => ({
      x: r() * 92,
      d: r() * 8,
      t: 9 + r() * 6,
      sway: 6 + r() * 10,
      rot: r() * 360,
      s: 1.8 + r() * 1.4,
    }));
  }, [count, seed]);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {petals.map((p, i) => (
        <motion.span
          key={i}
          className="absolute -top-[5cqw] rounded-[70%_0_70%_0]"
          style={{
            left: `${p.x}%`,
            width: `${p.s}cqw`,
            height: `${p.s * 1.5}cqw`,
            background: "linear-gradient(135deg, #ffd6e0, #ec8fa8)",
            opacity: 0.85,
          }}
          animate={{
            y: ["0cqw", "180cqw"],
            x: ["0cqw", `${p.sway}cqw`, `${-p.sway / 2}cqw`, `${p.sway / 2}cqw`],
            rotate: [p.rot, p.rot + 260],
          }}
          transition={{
            duration: p.t,
            delay: p.d,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

function Cover({ opened }: { opened: boolean }) {
  const show = (d: number) => ({
    initial: { opacity: 0, y: 12, filter: "blur(6px)" },
    animate: opened ? { opacity: 1, y: 0, filter: "blur(0px)" } : {},
    transition: { duration: 1, delay: T.names + d, ease },
  });
  return (
    <section className="relative h-svh min-h-[200cqw] w-full overflow-hidden">
      {/* The camera eases back from close on the couple as the light clears. */}
      <motion.div
        className="absolute inset-0"
        style={{ transformOrigin: "50% 25%" }}
        initial={{ scale: 1.28 }}
        animate={opened ? { scale: 1 } : {}}
        transition={{ duration: 3.4, delay: T.fade - 0.4, ease }}
      >
        <Painting src="v3-cover" alt="Shiva and Parvati, foreheads touching, the trishul and snowy peaks behind them" fade="linear-gradient(180deg, #000 60%, transparent 86%)" className="top-0" priority />
      </motion.div>
      <Petals />
      <div className="absolute inset-x-[10%] top-[118cqw] flex flex-col items-center text-center">
        <motion.p {...show(0)} className="text-[2.7cqw] tracking-[0.34em] uppercase" style={{ fontFamily: label, color: C.gold }}>
          Srirastu · Shubhamastu
        </motion.p>
        <motion.p {...show(0.2)} className="mt-[2.5cqw] text-[3cqw] tracking-[0.3em] uppercase" style={{ fontFamily: label, color: C.maroon }}>
          The wedding of
        </motion.p>
        {opened && (
          <p className="mt-[1cqw] flex flex-col items-center text-[14cqw] leading-[1.08]" style={{ fontFamily: script, color: C.maroon }}>
            <Written text={S.groom} delay={T.names + 0.4} />
            <Written text="&" delay={T.names + 1.1} style={{ color: C.gold, fontSize: "9cqw", lineHeight: 1 }} />
            <Written text={S.bride} delay={T.names + 1.4} />
          </p>
        )}
        <motion.div {...show(2)} className="mt-[3cqw] flex flex-col items-center">
          <Divider />
          <p className="-mt-[1cqw] text-[2.7cqw] tracking-[0.24em] uppercase" style={{ fontFamily: label, color: C.ink }}>
            {S.day}
          </p>
          <p className="mt-[1.5cqw] text-[4.4cqw] font-semibold italic" style={{ fontFamily: serif, color: C.maroon }}>
            {S.city}
          </p>
        </motion.div>
      </div>
    </section>
  );
}

/* ───────── Families ───────── */

function Families() {
  return (
    <section className="relative w-full pb-[22cqw]">
      <Painting src="v2-cover" alt="On Kailash, Shiva tucks a jasmine flower into Parvati's hair" fade="linear-gradient(180deg, transparent, #000 10%, #000 60%, transparent 82%)" className="top-0" />
      <motion.div className="absolute inset-x-0 top-0 aspect-[2/3]" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 1.2 }}>
        <Petals count={4} seed={9} />
      </motion.div>
      <div className="relative flex flex-col items-center px-[13%] pt-[118cqw] text-center">
        <Reveal>
          <Small color={C.gold}>With the blessings of Lord Shiva &amp; Goddess Parvati</Small>
          <p className="mt-[4cqw] text-[4.5cqw] leading-snug font-semibold" style={{ fontFamily: serif, color: C.ink }}>
            Smt. Padma &amp; Sri Srinivas Reddy and Smt. Lakshmi &amp; Sri Venkata Rao request the honour of your presence at the marriage of their children
          </p>
        </Reveal>
        <Divider />
        <Reveal delay={0.1}>
          <Small color={C.gold}>The bride</Small>
          <p className="text-[13cqw] leading-tight" style={{ fontFamily: script, color: C.maroon }}>
            {S.bride}
          </p>
          <p className="mt-[1cqw] text-[3.8cqw] italic" style={{ fontFamily: serif, color: C.ink }}>
            daughter of Smt. Padma &amp; Sri Srinivas Reddy
          </p>
        </Reveal>
        <p className="my-[3cqw] text-[7cqw]" style={{ fontFamily: script, color: C.gold }}>
          &amp;
        </p>
        <Reveal delay={0.2}>
          <Small color={C.gold}>The groom</Small>
          <p className="text-[13cqw] leading-tight" style={{ fontFamily: script, color: C.maroon }}>
            {S.groom}
          </p>
          <p className="mt-[1cqw] text-[3.8cqw] italic" style={{ fontFamily: serif, color: C.ink }}>
            son of Smt. Lakshmi &amp; Sri Venkata Rao
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ───────── Countdown under the moon ───────── */

function useCountdown(to: Date) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);
  const left = Math.max(0, to.getTime() - (now ?? to.getTime()));
  const s = Math.floor(left / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor(s / 3600) % 24,
    mins: Math.floor(s / 60) % 60,
    secs: s % 60,
    ready: now !== null,
  };
}

// The diyas floating on the lake, measured on the 2:3 painting (x%, y%, size).
const DIYAS = [
  [28.8, 91.5, 1],
  [85.9, 94.7, 1],
  [17.8, 82.4, 0.8],
  [86.7, 80.7, 0.8],
  [94.2, 90.2, 0.7],
  [12.5, 66.7, 0.6],
  [5.4, 69, 0.55],
  [94.5, 71.3, 0.6],
  [79.3, 64.5, 0.5],
  [73.5, 62.8, 0.45],
] as const;

function Countdown() {
  const { days, hours, mins, secs, ready } = useCountdown(S.date);
  const two = (n: number) => String(n).padStart(2, "0");
  return (
    <section className="relative w-full pt-[8cqw]">
      <Reveal className="relative z-10 text-center">
        <Small color={C.gold}>Counting the days</Small>
        <p className="text-[11cqw] leading-tight" style={{ fontFamily: script, color: C.maroon }}>
          Until the Muhurtham
        </p>
        <Small color={C.ink}>{S.day.split(" · ")[1]} · 7:42 am</Small>
        <p className="mt-[2cqw] text-[3.4cqw] tracking-[0.14em] tabular-nums" style={{ fontFamily: label, color: C.maroon }}>
          {ready ? `${two(hours)} h · ${two(mins)} m · ${two(secs)} s` : "\u00a0"}
        </p>
      </Reveal>
      <div className="relative mt-[2cqw] aspect-[2/3] w-full">
        <Painting src="v2-moon" alt="Shiva and Parvati sit by moonlit Lake Mansarovar among floating diyas and lotuses" fade="linear-gradient(180deg, transparent, #000 5%, #000 93%, transparent)" className="top-0" />
        {/* the diyas' flames flicker on the water */}
        {DIYAS.map(([x, y, s], i) => (
          <motion.span
            key={i}
            className="pointer-events-none absolute rounded-full mix-blend-screen"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: `${7 * s}cqw`,
              height: `${7 * s}cqw`,
              translate: "-50% -60%",
              background: "radial-gradient(closest-side, rgba(255,214,120,.9), rgba(255,170,60,.35) 55%, transparent)",
            }}
            animate={{
              opacity: [0.55, 1, 0.7, 0.95, 0.55],
              scale: [1, 1.12, 0.96, 1.08, 1],
            }}
            transition={{
              duration: 1.6 + (i % 4) * 0.35,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.13,
            }}
          />
        ))}
        {/* the moon is the dial: the days in its face */}
        <motion.div
          className="absolute flex flex-col items-center justify-center rounded-full text-center"
          style={{
            left: "54%",
            top: "13.8%",
            width: "21cqw",
            height: "21cqw",
            translate: "-50% -50%",
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 1.2, ease }}
        >
          <p className="text-[9cqw] leading-none font-bold" style={{ fontFamily: serif, color: C.maroon }}>
            {ready ? days : "–"}
          </p>
          <p className="text-[1.9cqw] tracking-[0.3em] uppercase" style={{ fontFamily: label, color: C.maroon }}>
            days
          </p>
        </motion.div>
      </div>
    </section>
  );
}

/* ───────── Functions ───────── */

function Event({ name, en, when, venue, note, i }: { name: string; en: string; when: string; venue: string; note?: string; i: number }) {
  return (
    <motion.div
      className="relative w-full overflow-hidden rounded-[3cqw] p-[1.4cqw] shadow-[0_2cqw_5cqw_rgba(70,20,10,.28)]"
      style={{
        background: `linear-gradient(135deg, #d9a94a, #f6dc96 40%, #b8862e)`,
        transformOrigin: "50% 0%",
      }}
      initial={{ opacity: 0, rotateX: -70, y: 20 }}
      whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
      viewport={{ once: true, amount: 0.45 }}
      transition={{ duration: 1, delay: 0.1, ease }}
    >
      <div
        className="relative overflow-hidden rounded-[2.2cqw] px-[6cqw] py-[7cqw] text-center"
        style={{
          background: `radial-gradient(120% 90% at 50% 0%, #8a1d2e, ${C.maroon} 55%, #4e0d18)`,
        }}
      >
        <div className="pointer-events-none absolute inset-[1.6cqw] rounded-[1.6cqw] border" style={{ borderColor: "rgba(247,220,149,.45)" }} />
        {/* a gold shimmer sweeps across once the card has opened */}
        <motion.div
          className="pointer-events-none absolute inset-y-0 w-[45%] mix-blend-screen"
          style={{
            background: "linear-gradient(100deg, transparent, rgba(255,226,160,.35), transparent)",
          }}
          initial={{ x: "-120%" }}
          whileInView={{ x: "320%" }}
          viewport={{ once: true }}
          transition={{
            duration: 1.8,
            delay: 0.9 + i * 0.1,
            ease: "easeInOut",
          }}
        />
        <p className="text-[11cqw] leading-tight" style={{ fontFamily: script, color: C.goldLight }}>
          {name}
        </p>
        <p className="mt-[0.5cqw] text-[2.5cqw] tracking-[0.26em] uppercase" style={{ fontFamily: label, color: "#e9c77e" }}>
          {en}
        </p>
        <p className="mt-[3.5cqw] text-[4.6cqw] font-semibold" style={{ fontFamily: serif, color: "#fff3dc" }}>
          {when}
        </p>
        <p className="mt-[0.5cqw] text-[3.9cqw] leading-snug" style={{ fontFamily: serif, color: "#f3dfc0" }}>
          {venue}
        </p>
        {note && (
          <p className="mt-[2cqw] text-[3.6cqw] italic" style={{ fontFamily: serif, color: "#e9c77e" }}>
            {note}
          </p>
        )}
        <span
          className="mt-[4cqw] inline-block rounded-full px-[4.5cqw] py-[1.6cqw] text-[2.8cqw] tracking-[0.14em]"
          style={{
            background: C.goldLight,
            color: C.maroon,
            fontFamily: label,
          }}
        >
          DIRECTIONS →
        </span>
      </div>
    </motion.div>
  );
}

function Functions() {
  return (
    <section className="relative flex w-full flex-col items-center px-[11%] pt-[24cqw] pb-[20cqw] text-center" style={{ perspective: "900px" }}>
      <Reveal>
        <Small color={C.gold}>Join us for</Small>
        <p className="text-[12cqw] leading-tight" style={{ fontFamily: script, color: C.maroon }}>
          The celebrations
        </p>
      </Reveal>
      <Divider />
      <div className="flex w-full flex-col gap-[8cqw]">
        <Event i={0} name="Pellikuthuru" en="The bride's blessing" when="Saturday, 13 Feb · 10:00 am" venue="Reddy residence, Jubilee Hills, Hyderabad" note="Dress: shades of yellow" />
        <Event
          i={1}
          name="Kalyanam"
          en="The wedding · Muhurtham"
          when="Sunday, 14 Feb · 7:42 am"
          venue="Sri Sai Convention, Gachibowli, Hyderabad"
          note="Jeelakarra Bellam & Talambralu at the muhurtham"
        />
        <Event i={2} name="Reception" en="An evening together" when="Sunday, 14 Feb · 7:30 pm" venue="Sri Sai Convention, Gachibowli, Hyderabad" />
      </div>
    </section>
  );
}

/* ───────── Closing ───────── */

function Closing() {
  const twinkles = useMemo(() => {
    const r = seeded(41);
    return Array.from({ length: 14 }, () => ({
      x: 6 + r() * 88,
      y: 36 + r() * 58,
      d: r() * 3,
      s: 0.6 + r(),
    }));
  }, []);
  return (
    <section className="relative aspect-[2/3] min-h-svh w-full overflow-hidden">
      <Painting src="v2-dance" alt="Shiva and Parvati dance together on the clouds above the Himalayas" fade="linear-gradient(180deg, transparent, #000 8%)" className="bottom-0" />
      {twinkles.map((t, i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute rounded-full bg-[#fff4cf] shadow-[0_0_8px_3px_rgba(255,220,140,.8)]"
          style={{
            left: `${t.x}%`,
            top: `${t.y}%`,
            width: `${t.s}cqw`,
            height: `${t.s}cqw`,
          }}
          animate={{ opacity: [0, 1, 0], scale: [0.4, 1.2, 0.4] }}
          transition={{
            duration: 2.4,
            delay: t.d,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
      <Petals count={5} seed={21} />
      <div className="absolute inset-x-[12%] top-[16cqw] flex flex-col items-center text-center">
        <Reveal>
          <p className="text-[4.4cqw] leading-snug font-semibold italic" style={{ fontFamily: serif, color: C.ink, textShadow: GLOW }}>
            As Shiva and Parvati, two souls become one. Come, bless the beginning of forever.
          </p>
          <p className="mt-[2cqw] text-[11cqw] leading-tight whitespace-nowrap" style={{ fontFamily: script, color: C.maroon, textShadow: GLOW }}>
            {S.groom} &amp; {S.bride}
          </p>
          <Small className="mt-[1.5cqw]" color={C.maroon}>
            With love · the Reddy &amp; Rao families
          </Small>
        </Reveal>
      </div>
    </section>
  );
}
