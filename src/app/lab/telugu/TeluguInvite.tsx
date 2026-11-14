"use client";

import Image from "next/image";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";

/**
 * The Telugu design (one client: Srilakshmi & Shiva Chander, details from the family's printed card), the walking-couple concept she chose.
 * Colours from her note: mostly beige, a little blue, a little maroon. Shiva–Parvati only at the start
 * (the walking-couple opening, then Gauri Shankar's palm-and-step on the hero) and the end (seated on
 * Kailash); the rest is paper, ornament and a drawn moon. Photo album and Best Compliments added. She has one function, so it gets a single show-piece card. Names in Great Vibes (as Marathi).
 * English first; Telugu once she approves.
 *
 * Opening: the gold Ganesha, "You're invited" and the names over Shiva and Parvati walking hand in
 * hand towards the rising sun. Tap: Ganesha glows, "Srirasthu Subhamasthu" writes in, the sun swells
 * with turning rays, the camera pushes in, light floods and talambralu falls as it dissolves onto the
 * hero. A thin gold-and-blue frame settles around the page and the names write in.
 */

const C = { maroon: "#6e1423", ink: "#3b2418", gold: "#8f6220", goldLight: "#f7dc95", blue: "#8ea7c8", paper: "#f5e9d2" };
const label = "var(--font-cinzel)";
const serif = "var(--font-cormorant)";
const script = "var(--font-great-vibes)";
const art = (f: string) => `/art/illus/telugu-${f}.webp`;
const ease = [0.22, 1, 0.36, 1] as const;
const GLOW = "0 0 16px rgba(255,250,245,.95), 0 0 4px rgba(255,250,245,.9)";

// The opening's beats (seconds after the tap).
const T = { blessing: 0.25, sun: 0.4, push: 0.5, bloom: 1.8, shower: 1.7, fade: 2.4, frame: 3, names: 3.1, done: 6.2 };

// Sample couple until the client's details come in.
// From the family's printed card (Saranala's wedding invitation).
const S = { groom: "Shiva Chander", bride: "Srilakshmi", date: new Date("2026-12-05T11:43:00+05:30"), day: "Saturday · 5 December 2026", city: "Hyderabad" };
const MAP = "https://www.google.com/maps/search/?api=1&query=Sriman+Convention+Aziz+Nagar+Hyderabad";

/** A small seeded random, so every burst plays the same way. */
function seeded(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

// Her song: "Pournami" on the flute, from its 5th second.
const SONG = { src: "/music/pournami-flute.mp3", from: 5 };

/** The song, started by the tap that opens the invite (browsers only allow sound after a tap). */
function useSong() {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  useEffect(() => () => audio.current?.pause(), []);
  const get = () => {
    if (!audio.current) {
      const a = new Audio(`${SONG.src}#t=${SONG.from}`);
      a.preload = "auto";
      // when it ends, go round again from the same point
      a.addEventListener("ended", () => {
        a.currentTime = SONG.from;
        void a.play();
      });
      a.addEventListener("play", () => setPlaying(true));
      a.addEventListener("pause", () => setPlaying(false));
      audio.current = a;
    }
    return audio.current;
  };
  const start = () => {
    const a = get();
    if (a.currentTime < SONG.from) a.currentTime = SONG.from;
    void a.play().catch(() => {});
  };
  const toggle = () => {
    const a = get();
    if (a.paused) start();
    else a.pause();
  };
  return { playing, start, toggle };
}

export function TeluguInvite() {
  const song = useSong();
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
        style={{ background: `linear-gradient(180deg, #f3e4c8, ${C.paper} 25%, #f8eedb 55%, ${C.paper} 80%, #efe0c4)` }}
      >
        <Cover opened={opened} />
        <Families />
        <ScratchReveal />
        <Countdown />
        <Wedding />
        <Album />
        <Compliments />
        <Closing />
        <Frame opened={opened} />
        {!gone && (
          <Opening
            opened={opened}
            onOpen={() => {
              setOpened(true);
              song.start();
            }}
          />
        )}
        {opened && (
          <button
            type="button"
            onClick={song.toggle}
            aria-label={song.playing ? "Pause music" : "Play music"}
            className="fixed bottom-4 z-[60] grid size-11 place-items-center rounded-full shadow-lg ring-1 ring-[#f7dc95]/50 backdrop-blur"
            style={{ right: "max(1rem, calc(50vw - 240px + 1rem))", background: "rgba(110,20,35,.88)", color: C.goldLight }}
          >
            {song.playing ? (
              <span className="flex h-4 items-end gap-[3px]" aria-hidden>
                {[0, 1, 2].map((i) => (
                  <motion.span key={i} className="w-[3px] rounded-full bg-current" animate={{ height: ["30%", "100%", "45%", "80%", "30%"] }} transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }} />
                ))}
              </span>
            ) : (
              <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
                <path d="M9 18V6l11-2v12" stroke="currentColor" strokeWidth="1.6" fill="none" />
                <circle cx="6.5" cy="18" r="2.6" />
                <circle cx="17.5" cy="16" r="2.6" />
              </svg>
            )}
          </button>
        )}
        <button type="button" onClick={replay} className="fixed top-3 right-3 z-[70] rounded-full bg-black/55 px-3 py-1.5 text-[12px] text-white backdrop-blur">
          ↻ Replay
        </button>
      </div>
    </div>
  );
}

/* ───────── Shared bits ───────── */

/** A painting at full width, 2:3, its edges melting into the page. */
function Painting({ src, alt, fade, className, priority }: { src: string; alt: string; fade: string; className?: string; priority?: boolean }) {
  return (
    <div className={`absolute inset-x-0 aspect-[2/3] ${className ?? ""}`} style={{ maskImage: fade, WebkitMaskImage: fade }}>
      <Image src={art(src)} alt={alt} fill priority={priority} sizes="480px" className="object-cover" />
    </div>
  );
}

/** The gold Ganesha that opens the invitation. */
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

/** A few blush lotus petals drifting down across a scene, all the time. */
function Petals({ count = 7, seed = 3 }: { count?: number; seed?: number }) {
  const petals = useMemo(() => {
    const r = seeded(seed);
    return Array.from({ length: count }, () => ({ x: r() * 92, d: r() * 8, t: 9 + r() * 6, sway: 6 + r() * 10, rot: r() * 360, s: 1.8 + r() * 1.4 }));
  }, [count, seed]);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {petals.map((p, i) => (
        <motion.span
          key={i}
          className="absolute -top-[5cqw] rounded-[70%_0_70%_0]"
          style={{ left: `${p.x}%`, width: `${p.s}cqw`, height: `${p.s * 1.5}cqw`, background: "linear-gradient(135deg, #e9a7b2, #a8384f)", opacity: 0.8 }}
          animate={{ y: ["0cqw", "180cqw"], x: ["0cqw", `${p.sway}cqw`, `${-p.sway / 2}cqw`, `${p.sway / 2}cqw`], rotate: [p.rot, p.rot + 260] }}
          transition={{ duration: p.t, delay: p.d, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </div>
  );
}

/* ───────── The fixed frame ───────── */

/** A thin double gold rule with small jewelled corners, fixed around the page once open. */
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
        <div className="absolute inset-0 border" style={{ borderColor: `${C.gold}bb` }} />
        <div className="absolute inset-[1.2cqw] border" style={{ borderColor: `${C.blue}99` }} />
        {corner("top-[-0.5cqw] left-[-0.5cqw]", 0)}
        {corner("top-[-0.5cqw] right-[-0.5cqw]", 90)}
        {corner("right-[-0.5cqw] bottom-[-0.5cqw]", 180)}
        {corner("bottom-[-0.5cqw] left-[-0.5cqw]", 270)}
      </div>
    </motion.div>
  );
}

/* ───────── The opening ───────── */

// The sun in the opening painting, measured on the 2:3 image (anchored to the screen's bottom):
// 50% across and 39.5% down.
const SUN = { x: 50, fromBottom: 150 * (1 - 0.395) };

function Opening({ opened, onOpen }: { opened: boolean; onOpen: () => void }) {
  return (
    <div className="fixed inset-y-0 left-1/2 z-50 w-full max-w-[480px] -translate-x-1/2 overflow-hidden" style={{ pointerEvents: opened ? "none" : "auto" }}>
      <div className="@container absolute inset-0">
        {/* The scene dissolves onto the cover; the shower keeps falling over it. */}
        <motion.div className="absolute inset-0" style={{ background: "#d6d2d3" }} animate={{ opacity: opened ? 0 : 1 }} transition={{ duration: 1, delay: opened ? T.fade : 0, ease: "easeInOut" }}>
          {/* The camera follows the couple up the path towards the sun. */}
          <motion.div
            className="absolute inset-0"
            style={{ transformOrigin: `${SUN.x}% calc(100% - ${SUN.fromBottom}cqw)` }}
            animate={opened ? { scale: 1.35 } : { scale: [1, 1.025, 1] }}
            transition={opened ? { duration: 3, delay: T.push, ease: [0.5, 0, 0.3, 1] } : { duration: 9, repeat: Infinity, ease: "easeInOut" }}
          >
            <Painting
              src="v4-opening"
              alt="Shiva and Parvati walk hand in hand up a lotus path towards the rising sun"
              fade="linear-gradient(180deg, transparent, #000 14%)"
              className="bottom-0"
              priority
            />
            <Sun opened={opened} />
          </motion.div>
          <Motes />
          <div className="absolute inset-x-0 top-0 flex flex-col items-center justify-center text-center" style={{ bottom: "100cqw" }}>
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.1 }}>
              <Ganesha className="w-[17cqw]" glow={opened} />
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
              className="absolute bottom-[5%] left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[rgba(70,20,34,.8)] px-5 py-3 text-[clamp(14px,3.9cqw,17px)] font-semibold whitespace-nowrap text-[#fff0dc] shadow-[0_6px_24px_rgba(0,0,0,.3)] ring-1 ring-white/30 backdrop-blur-md"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: [0, -4, 0] }}
              transition={{ opacity: { delay: 0.8, duration: 0.5 }, y: { delay: 1.2, duration: 1.8, repeat: Infinity, ease: "easeInOut" } }}
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

/** Before the tap: "You're invited" and the names, under Ganesha. */
function Invitation({ opened }: { opened: boolean }) {
  return (
    <motion.div
      className="col-start-1 row-start-1 flex flex-col items-center"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: opened ? 0 : 1, y: 0 }}
      transition={{ duration: opened ? 0.5 : 1.2, delay: opened ? 0 : 0.35 }}
    >
      <p className="text-[3.1cqw] tracking-[0.36em] uppercase" style={{ fontFamily: label, color: C.maroon, textShadow: GLOW }}>
        You&rsquo;re invited
      </p>
      <p className="mt-[2cqw] text-[14cqw] leading-[1.1]" style={{ fontFamily: script, color: C.maroon, textShadow: GLOW }}>
        {S.bride}
      </p>
      <p className="text-[6cqw] leading-none" style={{ fontFamily: serif, color: C.gold, textShadow: GLOW }}>
        &amp;
      </p>
      <p className="text-[14cqw] leading-[1.1]" style={{ fontFamily: script, color: C.maroon, textShadow: GLOW }}>
        {S.groom}
      </p>
    </motion.div>
  );
}

/** At the tap: the Telugu wedding blessing writes itself in where the names were. */
function Blessing() {
  return (
    <div className="col-start-1 row-start-1 flex flex-col items-center" style={{ color: C.maroon, textShadow: GLOW }}>
      <Letters text="SRIRASTHU" delay={T.blessing} className="text-[6.4cqw] tracking-[0.22em]" style={{ fontFamily: label }} />
      <Letters text="Subhamasthu" delay={T.blessing + 0.45} className="mt-[1cqw] text-[15cqw] leading-[1.15]" style={{ fontFamily: script }} />
      <Letters text="AVIGHNAMASTHU" delay={T.blessing + 1} className="mt-[1cqw] text-[3.2cqw] tracking-[0.34em]" style={{ fontFamily: label, color: C.gold }} />
    </div>
  );
}

/** The painted sun, alive: it pulses gently before the tap, then swells and throws out turning rays. */
function Sun({ opened }: { opened: boolean }) {
  const box: CSSProperties = { left: `${SUN.x}%`, bottom: `${SUN.fromBottom}cqw`, width: "22cqw", height: "22cqw", translate: "-50% 50%" };
  return (
    <div className="pointer-events-none absolute" style={box}>
      <motion.div
        className="absolute inset-[-40%] rounded-full mix-blend-screen"
        style={{ background: "radial-gradient(closest-side, rgba(255,252,235,.95), rgba(255,226,160,.55) 45%, transparent)" }}
        animate={opened ? { opacity: 1, scale: 2.2 } : { opacity: [0.55, 0.95, 0.55], scale: [1, 1.12, 1] }}
        transition={opened ? { duration: 1.6, delay: T.sun, ease: "easeOut" } : { duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      />
      {opened && (
        <motion.div
          className="absolute inset-[-260%] rounded-full mix-blend-screen"
          style={{
            background: "repeating-conic-gradient(from 0deg, rgba(255,240,200,.6) 0deg 2.5deg, transparent 2.5deg 11deg)",
            maskImage: "radial-gradient(closest-side, #000 8%, rgba(0,0,0,.5) 40%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(closest-side, #000 8%, rgba(0,0,0,.5) 40%, transparent 75%)",
          }}
          initial={{ opacity: 0, rotate: 0, scale: 0.5 }}
          animate={{ opacity: [0, 1, 1], rotate: 30, scale: 1 }}
          transition={{ opacity: { delay: T.sun + 0.2, duration: 1.2 }, scale: { delay: T.sun, duration: 2, ease }, rotate: { duration: 6, ease: "linear" } }}
        />
      )}
    </div>
  );
}

/** Specks of light drifting up through the painting before the tap. */
function Motes() {
  const motes = useMemo(() => {
    const r = seeded(11);
    return Array.from({ length: 16 }, () => ({ x: 6 + r() * 88, y: 35 + r() * 60, s: 0.5 + r() * 0.9, d: r() * 5, t: 5 + r() * 4 }));
  }, []);
  return (
    <div className="pointer-events-none absolute inset-0">
      {motes.map((m, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-[#fff8e6] shadow-[0_0_6px_2px_rgba(255,230,180,.8)]"
          style={{ left: `${m.x}%`, top: `${m.y}%`, width: `${m.s}cqw`, height: `${m.s}cqw` }}
          animate={{ y: ["0cqw", "-26cqw"], opacity: [0, 1, 0] }}
          transition={{ duration: m.t, delay: m.d, repeat: Infinity, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

/** Sunlight flooding out from the sun and washing the screen as the scene dissolves. */
function Bloom() {
  return (
    <motion.div
      className="pointer-events-none absolute rounded-full"
      style={{
        left: `${SUN.x}%`,
        bottom: `${SUN.fromBottom}cqw`,
        width: "80cqw",
        height: "80cqw",
        translate: "-50% 50%",
        background: "radial-gradient(closest-side, #fffdf6, #fff0d4 40%, rgba(255,226,190,.55) 68%, transparent)",
      }}
      initial={{ scale: 0.2, opacity: 0 }}
      animate={{ scale: [0.2, 1.4, 5], opacity: [0, 1, 0] }}
      transition={{ delay: T.bloom, duration: 2.6, times: [0, 0.38, 1], ease: "easeOut" }}
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
      kind: i % 3 === 0 ? "pearl" : i % 7 === 0 ? "petal" : i % 11 === 0 ? "kumkum" : "rice",
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
            width: b.kind === "pearl" ? `${1.5 * b.s}cqw` : b.kind === "kumkum" ? "1cqw" : b.kind === "petal" ? "2.2cqw" : `${2.1 * b.s}cqw`,
            height: b.kind === "pearl" ? `${1.5 * b.s}cqw` : b.kind === "kumkum" ? "1cqw" : b.kind === "petal" ? "3cqw" : `${0.85 * b.s}cqw`,
            borderRadius: b.kind === "petal" ? "70% 0 70% 0" : 999,
            background:
              b.kind === "pearl"
                ? "radial-gradient(circle at 32% 30%, #ffffff, #f4ecdc 45%, #cdbb9a)"
                : b.kind === "kumkum"
                  ? "#a3121f"
                  : b.kind === "petal"
                    ? "linear-gradient(135deg, #ffd6e0, #ec8fa8)"
                    : "linear-gradient(180deg, #ffd45a, #e8a317)",
            boxShadow: b.kind === "pearl" ? "0 0 4px rgba(255,255,240,.9)" : "none",
          }}
          initial={{ y: 0, x: 0, rotate: b.rot, opacity: 0 }}
          animate={{ y: "205cqw", x: ["0cqw", `${b.sway}cqw`, `${-b.sway / 2}cqw`], rotate: b.rot + 360, opacity: [0, 1, 1, 0] }}
          transition={{ duration: b.t, delay: b.d, ease: [0.35, 0, 0.8, 1], times: [0, 0.08, 0.85, 1] }}
        />
      ))}
    </div>
  );
}

/* ───────── Hero: Shiva's palm and Parvati's step, as in Gauri Shankar ───────── */

// One step of the hero's layout: a hundredth of the width, unless the screen is short for its width,
// so the hand, foot and names shrink together (as Gauri Shankar's opening does).
const u = (n: number) => `calc(min(1cqw, 0.5svh) * ${n})`;
// When the hero's beats play (seconds after the tap): as the opening dissolves onto it.
const H = { hand: 2.3, foot: 2.8, glow: 4.5, kicker: 4.4, names: 4.9, details: 6.4 };

function Cover({ opened }: { opened: boolean }) {
  const show = (d: number) => ({
    initial: { opacity: 0, y: 12, filter: "blur(6px)" },
    animate: opened ? { opacity: 1, y: 0, filter: "blur(0px)" } : {},
    transition: { duration: 1, delay: d, ease },
  });
  return (
    <section className="relative h-svh min-h-[200cqw] w-full overflow-hidden">
      {/* a soft blue morning sky fading into the beige paper */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #cfd9e6, #e3e4e2 30%, #f3e8d4 60%, transparent)" }} />
      <Petals />

      {/* Shiv's open palm, a jasmine string in it, reaches in from beyond the left edge… */}
      <motion.div
        className="absolute"
        style={{ left: u(-12), top: u(68), width: u(112), aspectRatio: "1100 / 618" }}
        initial={{ x: "-100%", opacity: 0 }}
        animate={opened ? { x: "0%", opacity: 1 } : {}}
        transition={{ duration: 2, delay: H.hand, ease: "easeOut" }}
      >
        <Image src="/art/illus/shiv-hand.webp" alt="" fill priority sizes="480px" className="object-contain" />
      </motion.div>

      {/* …as Parvati steps down from the upper right until her foot rests just above it. */}
      <motion.div
        className="absolute"
        style={{ top: u(-8), right: `min(calc(100cqw - ${u(130)}), 0px)`, width: u(90), aspectRatio: "788 / 890" }}
        initial={{ x: "35%", y: "-35%", opacity: 0 }}
        animate={opened ? { x: "0%", y: "0%", opacity: 1 } : {}}
        transition={{ duration: 2.6, delay: H.foot, ease: [0.25, 0.8, 0.3, 1] }}
      >
        <Image src="/art/illus/shiv-parvati-step.webp" alt="" fill priority sizes="480px" className="object-contain" />
      </motion.div>

      {/* a glow where they meet */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ left: u(62), top: u(78), width: u(54), height: u(54), background: "radial-gradient(closest-side, rgba(255,246,225,.95), rgba(255,236,200,0))" }}
        initial={{ opacity: 0, scale: 0.4 }}
        animate={opened ? { opacity: [0, 0.95, 0.45], scale: [0.4, 1.2, 1] } : {}}
        transition={{ duration: 2.2, delay: H.glow, ease }}
      />

      <div className="absolute inset-x-[8%] flex flex-col items-center text-center" style={{ top: u(134) }}>
        <motion.p {...show(H.kicker)} className="text-[2.7cqw] tracking-[0.34em] uppercase" style={{ fontFamily: label, color: C.gold }}>
          Srirasthu · Subhamasthu
        </motion.p>
        <motion.p {...show(H.kicker + 0.2)} className="mt-[2cqw] text-[3cqw] tracking-[0.3em] uppercase" style={{ fontFamily: label, color: C.maroon }}>
          The wedding of
        </motion.p>
        {opened && (
          <p className="mt-[1cqw] flex flex-col items-center leading-[1.1]" style={{ fontFamily: script, color: C.maroon, fontSize: u(12.5) }}>
            <Written text={S.bride} delay={H.names} />
            <Written text="&" delay={H.names + 0.6} style={{ color: C.gold, fontSize: u(9), lineHeight: 1 }} />
            <Written text={S.groom} delay={H.names + 0.9} />
          </p>
        )}
        <motion.div {...show(H.details)} className="mt-[2cqw] flex flex-col items-center">
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

/** A small maroon lotus between two soft-blue rules: the page's ornament. */
function Lotus({ className = "" }: { className?: string }) {
  return (
    <div className={`flex w-[56%] items-center gap-[2cqw] ${className}`} aria-hidden>
      <span className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${C.blue})` }} />
      <svg viewBox="0 0 40 22" className="w-[9cqw]">
        <path d="M20 2 C24 8 24 14 20 20 C16 14 16 8 20 2 Z" fill={C.maroon} />
        <path d="M20 20 C13 18 9 13 8 7 C14 9 18 13 20 20 Z" fill={C.maroon} opacity=".8" />
        <path d="M20 20 C27 18 31 13 32 7 C26 9 22 13 20 20 Z" fill={C.maroon} opacity=".8" />
        <path d="M20 20 C11 21 5 18 2 13 C9 13 15 15 20 20 Z" fill={C.gold} opacity=".9" />
        <path d="M20 20 C29 21 35 18 38 13 C31 13 25 15 20 20 Z" fill={C.gold} opacity=".9" />
      </svg>
      <span className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${C.blue}, transparent)` }} />
    </div>
  );
}

function Families() {
  return (
    <section className="relative flex w-full flex-col items-center px-[11%] pt-[20cqw] pb-[16cqw] text-center">
      <Reveal>
        {/* the three blessings spread across the top, as on their printed card */}
        <div className="flex w-[84cqw] items-start justify-between">
          {["Srirasthu", "Subhamasthu", "Avighnamasthu"].map((w) => (
            <Small key={w} color={C.gold} className="!tracking-[0.16em]">
              {w}
            </Small>
          ))}
        </div>
        <Ganesha className="mt-[4cqw] w-[13cqw]" />
        <p className="mt-[5cqw] text-[4.8cqw] leading-snug font-semibold" style={{ fontFamily: serif, color: C.maroon, textWrap: "balance" }}>
          Smt. Jayalakshmi &amp; Sri&nbsp;Saranala Babu&nbsp;Rao
        </p>
        <p className="mt-[2cqw] text-[4.2cqw] leading-snug" style={{ fontFamily: serif, color: C.ink }}>
          request the pleasure of your company at the wedding ceremony of their granddaughter
        </p>
      </Reveal>
      <Lotus className="my-[7cqw]" />
      <Reveal delay={0.1}>
        <Small color={C.gold}>Chi. Sow.</Small>
        <p className="mt-[1cqw] text-[13cqw] leading-tight" style={{ fontFamily: script, color: C.maroon }}>
          Srilakshmi
        </p>
        <p className="mt-[1cqw] text-[3.8cqw] italic" style={{ fontFamily: serif, color: C.ink }}>
          daughter of Smt. Sridevi &amp; Sri Saranala Srinath
        </p>
      </Reveal>
      <p className="my-[4cqw] text-[8cqw] leading-none" style={{ fontFamily: script, color: C.gold }}>
        with
      </p>
      <Reveal delay={0.2}>
        <Small color={C.gold}>Chi.</Small>
        <p className="mt-[1cqw] text-[11cqw] leading-tight" style={{ fontFamily: script, color: C.maroon }}>
          Shiva Chander Reddy
        </p>
        <p className="mt-[1cqw] text-[3.8cqw] italic" style={{ fontFamily: serif, color: C.ink }}>
          elder son of Smt. Kavitha &amp; Sri Cheryala Raji Reddy
        </p>
      </Reveal>
    </section>
  );
}

/* ───────── A quiet South Indian touch: a slim temple-border trim ───────── */

const ZARI = "linear-gradient(135deg, #c99a3e, #f8e2a6 30%, #b8862e 55%, #f3d68d 80%, #a87a28)";
const SILK = `radial-gradient(120% 80% at 50% 30%, #8a1f30, ${C.maroon} 55%, #520d1a)`;

/**
 * The Kanjeevaram temple border, kept slim: a fine double gold line with a row of small gopuram
 * triangles drawn in outline. `w` in cqw.
 */
function TempleTrim({ w, flip = false, color = C.gold, className = "" }: { w: number; flip?: boolean; color?: string; className?: string }) {
  const n = Math.round(w / 3.2);
  const step = w / n;
  return (
    <svg viewBox={`0 0 ${w} 4.6`} className={className} style={{ width: `${w}cqw`, height: "4.6cqw", transform: flip ? "scaleY(-1)" : undefined }} aria-hidden>
      <line x1="0" x2={w} y1="0.4" y2="0.4" stroke={color} strokeWidth="0.3" />
      <line x1="0" x2={w} y1="1.2" y2="1.2" stroke={color} strokeWidth="0.15" />
      {Array.from({ length: n }, (_, i) => {
        const x = i * step;
        const m = x + step / 2;
        return (
          <g key={i}>
            <path d={`M${x + step * 0.12} 1.2 L${m} 4.2 L${x + step * 0.88} 1.2`} fill="none" stroke={color} strokeWidth="0.22" strokeLinejoin="round" />
            <circle cx={m} cy="2" r="0.3" fill={color} />
          </g>
        );
      })}
    </svg>
  );
}

/* ───────── Save the date: scratch to reveal ───────── */

/** Paints the gold foil, with a sparkle and the hint, sized to the canvas. */
function paintFoil(ctx: CanvasRenderingContext2D, w: number, h: number, dpr: number) {
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, "#b8862e");
  g.addColorStop(0.3, "#f3d98a");
  g.addColorStop(0.5, "#c99a3c");
  g.addColorStop(0.72, "#f7e3a3");
  g.addColorStop(1, "#a9782a");
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  const r = seeded(7);
  for (let i = 0; i < 260; i++) {
    ctx.fillStyle = `rgba(255,255,255,${0.15 + r() * 0.45})`;
    ctx.fillRect(r() * w, r() * h, dpr * (0.6 + r()), dpr * (0.6 + r()));
  }
  ctx.strokeStyle = "rgba(110,20,35,.35)";
  ctx.lineWidth = dpr;
  ctx.setLineDash([4 * dpr, 4 * dpr]);
  ctx.strokeRect(10 * dpr, 10 * dpr, w - 20 * dpr, h - 20 * dpr);
  ctx.setLineDash([]);
  ctx.fillStyle = "rgba(110,20,35,.85)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `600 ${Math.round(14 * dpr)}px Georgia, serif`;
  ctx.fillText("Scratch to reveal the date", w / 2, h / 2);
}

/** Petals, pearls and turmeric rice bursting out of the card once it's revealed. */
function RevealBurst({ from }: { from: { x: number; y: number } }) {
  const [vh] = useState(() => window.innerHeight);
  const bits = useMemo(() => {
    const r = seeded(31);
    return Array.from({ length: 46 }, (_, i) => {
      const a = r() * Math.PI * 2;
      const power = 70 + r() * 170;
      return {
        kind: i % 3 === 0 ? "pearl" : i % 4 === 0 ? "rice" : "petal",
        bx: Math.cos(a) * power,
        by: Math.sin(a) * power * 0.7 - 120 - r() * 120,
        fx: (r() - 0.5) * 140,
        spin: (r() > 0.5 ? 1 : -1) * (200 + r() * 400),
        delay: r() * 0.2,
        dur: 3 + r() * 2,
        s: 0.8 + r() * 0.7,
      };
    });
  }, []);
  return (
    <div className="pointer-events-none fixed inset-0 z-[80] overflow-hidden" aria-hidden>
      {bits.map((b, i) => (
        <motion.span
          key={i}
          className="absolute"
          style={{
            left: from.x,
            top: from.y,
            width: b.kind === "petal" ? 12 * b.s : b.kind === "pearl" ? 8 * b.s : 10 * b.s,
            height: b.kind === "petal" ? 17 * b.s : b.kind === "pearl" ? 8 * b.s : 4 * b.s,
            borderRadius: b.kind === "petal" ? "70% 0 70% 0" : 999,
            background:
              b.kind === "petal" ? (i % 2 ? "linear-gradient(135deg, #e9a7b2, #a8384f)" : "linear-gradient(135deg, #ffd27a, #f08a1c)") : b.kind === "pearl" ? "radial-gradient(circle at 32% 30%, #fff, #e9dcc0)" : "linear-gradient(180deg, #ffd45a, #e8a317)",
          }}
          initial={{ x: 0, y: 0, opacity: 0, rotate: 0 }}
          animate={{ x: [0, b.bx, b.bx + b.fx], y: [0, b.by, vh - from.y + 60], opacity: [0, 1, 1], rotate: [0, b.spin * 0.3, b.spin] }}
          transition={{ duration: b.dur, delay: b.delay, times: [0, 0.2, 1], ease: ["easeOut", "easeIn"] }}
        />
      ))}
    </div>
  );
}

const REVEAL_AT = 0.5; // share of the foil scratched before it clears itself

function ScratchReveal() {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [burst, setBurst] = useState<{ x: number; y: number } | null>(null);

  function reveal() {
    const r = box.current?.getBoundingClientRect();
    setBurst(r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : { x: window.innerWidth / 2, y: window.innerHeight / 2 });
    setRevealed(true);
    window.setTimeout(() => setBurst(null), 5500);
  }

  useEffect(() => {
    const el = box.current;
    const cv = canvas.current;
    if (!el || !cv) return;
    const setup = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = el.clientWidth * dpr;
      cv.height = el.clientHeight * dpr;
      const ctx = cv.getContext("2d");
      if (ctx) paintFoil(ctx, cv.width, cv.height, dpr);
    };
    setup();
    const ro = new ResizeObserver(() => !revealed && setup());
    ro.observe(el);
    return () => ro.disconnect();
  }, [revealed]);

  function scratchedShare() {
    const cv = canvas.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return 0;
    const { data } = ctx.getImageData(0, 0, cv.width, cv.height);
    let clear = 0;
    let n = 0;
    for (let i = 3; i < data.length; i += 4 * 24) {
      n++;
      if (data[i] < 40) clear++;
    }
    return clear / n;
  }

  function scratch(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current || revealed) return;
    const cv = canvas.current!;
    const ctx = cv.getContext("2d")!;
    const rect = cv.getBoundingClientRect();
    const k = cv.width / rect.width;
    const p = { x: (e.clientX - rect.left) * k, y: (e.clientY - rect.top) * k };
    ctx.globalCompositeOperation = "destination-out";
    ctx.strokeStyle = "#000";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 34 * k;
    ctx.beginPath();
    const from = last.current ?? p;
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
  }

  function end() {
    drawing.current = false;
    last.current = null;
    if (!revealed && scratchedShare() > REVEAL_AT) reveal();
  }

  return (
    <section className="relative flex w-full flex-col items-center pt-[6cqw] pb-[10cqw] text-center">
      <Reveal>
        <Small color={C.gold}>A little surprise</Small>
        <p className="text-[12cqw] leading-tight" style={{ fontFamily: script, color: C.maroon }}>
          Save the date
        </p>
      </Reveal>
      <Reveal delay={0.1} className="mt-[6cqw]">
        <div ref={box} className="relative w-[74cqw] border shadow-[0_2cqw_5cqw_rgba(90,60,30,.12)]" style={{ borderColor: `${C.gold}77`, background: "rgba(255,251,242,.85)" }}>
          <div className="flex flex-col items-center px-[6cqw] py-[5cqw]">
            <TempleTrim w={60} />
            <p className="mt-[5cqw] text-[2.8cqw] tracking-[0.3em] uppercase" style={{ fontFamily: label, color: C.gold }}>
              Saturday
            </p>
            <p className="mt-[1cqw] text-[20cqw] leading-none font-medium" style={{ fontFamily: serif, color: C.maroon }}>
              05
            </p>
            <p className="mt-[1cqw] text-[3.4cqw] tracking-[0.28em] uppercase" style={{ fontFamily: label, color: C.ink }}>
              December · 2026
            </p>
            <p className="mt-[3cqw] mb-[5cqw] text-[4cqw] italic" style={{ fontFamily: serif, color: C.maroon }}>
              Sumuhurtham 11:43 am · {S.city}
            </p>
            <TempleTrim w={60} flip />
          </div>
          <AnimatePresence>
            {!revealed && (
              <motion.canvas
                key="foil"
                ref={canvas}
                exit={{ opacity: 0, scale: 1.04 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 h-full w-full cursor-grab touch-none active:cursor-grabbing"
                onPointerDown={(e) => {
                  drawing.current = true;
                  e.currentTarget.setPointerCapture(e.pointerId);
                  scratch(e);
                }}
                onPointerMove={scratch}
                onPointerUp={end}
                onPointerCancel={end}
                aria-label="Scratch to reveal the wedding date"
                role="img"
              />
            )}
          </AnimatePresence>
        </div>
        {!revealed && (
          <button type="button" onClick={reveal} className="mx-auto mt-[4cqw] block text-[3.2cqw] underline underline-offset-4" style={{ fontFamily: serif, color: C.ink }}>
            Tap here to reveal instead
          </button>
        )}
      </Reveal>
      {burst && <RevealBurst from={burst} />}
    </section>
  );
}

/* ───────── Countdown: a quiet ivory panel ───────── */

function useCountdown(to: Date) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = window.setTimeout(tick, 0);
    const t = window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(t);
    };
  }, []);
  const left = Math.max(0, to.getTime() - (now ?? to.getTime()));
  const s = Math.floor(left / 1000);
  return { days: Math.floor(s / 86400), hours: Math.floor(s / 3600) % 24, mins: Math.floor(s / 60) % 60, secs: s % 60, ready: now !== null };
}

/** One number, turning over softly when it changes. */
function Tile({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex w-[15cqw] flex-col items-center">
      <div className="relative grid h-[11cqw] w-full place-items-center overflow-hidden" style={{ perspective: "300px" }}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            className="text-[9cqw] leading-none font-medium tabular-nums"
            style={{ fontFamily: serif, color: C.maroon }}
            initial={{ rotateX: 80, opacity: 0 }}
            animate={{ rotateX: 0, opacity: 1 }}
            exit={{ rotateX: -80, opacity: 0 }}
            transition={{ duration: 0.45, ease }}
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="mt-[1cqw] h-px w-[8cqw]" style={{ background: `${C.gold}88` }} />
      <p className="mt-[1.5cqw] text-[2cqw] tracking-[0.24em] uppercase" style={{ fontFamily: label, color: C.gold }}>
        {label}
      </p>
    </div>
  );
}

function Countdown() {
  const { days, hours, mins, secs, ready } = useCountdown(S.date);
  const two = (n: number) => (ready ? String(n).padStart(2, "0") : "--");
  return (
    <section className="relative flex w-full flex-col items-center pt-[10cqw] pb-[16cqw] text-center">
      <Reveal>
        <Small color={C.gold}>Counting the days</Small>
        <p className="text-[10.5cqw] leading-tight whitespace-nowrap" style={{ fontFamily: script, color: C.maroon }}>
          Until the Sumuhurtham
        </p>
      </Reveal>
      <Reveal delay={0.15} className="mt-[6cqw]">
        <div className="relative w-[84cqw] border px-[3cqw] py-[3cqw]" style={{ borderColor: `${C.gold}66`, background: "rgba(255,251,242,.55)" }}>
          <TempleTrim w={78} className="mx-auto block" />
          <div className="flex items-start justify-center gap-[3cqw] py-[5cqw]">
            <Tile value={ready ? String(days) : "--"} label="Days" />
            <Tile value={two(hours)} label="Hours" />
            <Tile value={two(mins)} label="Mins" />
            <Tile value={two(secs)} label="Secs" />
          </div>
          <TempleTrim w={78} flip className="mx-auto block" />
        </div>
      </Reveal>
      <Small color={C.ink} className="mt-[6cqw]">
        {S.day} · 11:43 am
      </Small>
    </section>
  );
}

/* ───────── The wedding: a silk card behind temple doors ───────── */

/** One leaf of the brass temple door. */
function Door({ side, on }: { side: "left" | "right"; on: boolean }) {
  const left = side === "left";
  return (
    <motion.div
      className="absolute inset-y-0 w-1/2"
      style={{
        [side]: 0,
        transformOrigin: left ? "0% 50%" : "100% 50%",
        background: "linear-gradient(90deg, #8a6420, #c9a04a 25%, #ecd08c 50%, #c49340 78%, #7a5418)",
        boxShadow: "inset 0 0 0 0.4cqw rgba(90,55,15,.45)",
        backfaceVisibility: "hidden",
      }}
      initial={{ rotateY: 0, opacity: 1 }}
      animate={on ? { rotateY: left ? -104 : 104, opacity: [1, 1, 0] } : {}}
      transition={{ rotateY: { delay: 0.5, duration: 1.8, ease: [0.6, 0, 0.3, 1] }, opacity: { delay: 0.5, duration: 1.8, times: [0, 0.8, 1] } }}
    >
      {[
        ["8%", "53%"],
        ["53%", "8%"],
      ].map(([top, bottom]) => (
        <div
          key={top}
          className="absolute inset-x-[16%] rounded-[0.8cqw]"
          style={{
            top,
            bottom,
            boxShadow: "inset 0 0 0 0.3cqw rgba(110,70,20,.45)",
            backgroundImage: "radial-gradient(circle, rgba(255,243,207,.9) 0 0.35cqw, transparent 0.5cqw)",
            backgroundSize: "5.6cqw 5.6cqw",
            backgroundPosition: "center",
          }}
        />
      ))}
      <div className="absolute top-[47%] size-[4cqw] rounded-full border-[0.5cqw]" style={{ [left ? "right" : "left"]: "3cqw", borderColor: "#8a5f1c" }} />
    </motion.div>
  );
}

function Wedding() {
  const ref = useRef<HTMLDivElement>(null);
  // the doors open once most of the card is on screen
  const on = useInView(ref, { once: true, amount: 0.6 });
  const show = (d: number) => ({ initial: { opacity: 0, y: 10 }, animate: on ? { opacity: 1, y: 0 } : {}, transition: { duration: 0.9, delay: d, ease } });
  return (
    <section className="relative flex w-full flex-col items-center pt-[8cqw] pb-[18cqw] text-center">
      <div ref={ref} className="relative h-[112cqw] w-[74cqw] p-[0.8cqw] shadow-[0_2cqw_6cqw_rgba(90,30,20,.22)]" style={{ background: ZARI, perspective: "1400px" }}>
        <div className="relative flex size-full flex-col items-center justify-between overflow-hidden px-[3cqw] py-[3cqw]" style={{ background: SILK }}>
          <TempleTrim w={66} color="#e9c77e" />
          <div className="flex flex-col items-center px-[3cqw]">
            <motion.p {...show(1.5)} className="text-[15cqw] leading-none" style={{ fontFamily: script, color: C.goldLight }}>
              Wedding
            </motion.p>
            <motion.p {...show(1.8)} className="mt-[5cqw] text-[5.2cqw] font-semibold" style={{ fontFamily: serif, color: "#fff3dc" }}>
              Saturday, 5 December 2026
            </motion.p>
            <motion.div {...show(2)} className="mt-[4cqw] flex flex-col items-center">
              <p className="text-[2.4cqw] tracking-[0.3em] uppercase" style={{ fontFamily: label, color: "#e9c77e" }}>
                Sumuhurtham
              </p>
              <p className="text-[11cqw] leading-tight" style={{ fontFamily: script, color: C.goldLight }}>
                11:43 am
              </p>
            </motion.div>
            <motion.div {...show(2.2)} className="mt-[3cqw] flex flex-col items-center">
              <p className="text-[4.5cqw] leading-snug font-semibold" style={{ fontFamily: serif, color: "#fff3dc" }}>
                Sriman Convention
              </p>
              <p className="text-[3.9cqw] leading-snug" style={{ fontFamily: serif, color: "#f0dcc0" }}>
                Aziz Nagar, {S.city}
              </p>
              <p className="mt-[2.5cqw] text-[3.6cqw] italic" style={{ fontFamily: serif, color: "#e9c77e" }}>
                Followed by lunch
              </p>
              <a
                href={MAP}
                target="_blank"
                rel="noreferrer"
                className="mt-[5cqw] inline-block rounded-full border px-[5cqw] py-[1.8cqw] text-[2.5cqw] tracking-[0.14em] whitespace-nowrap"
                style={{ borderColor: "#e9c77e", color: C.goldLight, fontFamily: label }}
              >
                DIRECTIONS →
              </a>
            </motion.div>
          </div>
          <TempleTrim w={66} flip color="#e9c77e" />
        </div>
        {/* the temple doors, closed until the card comes into view */}
        <div className="absolute inset-[0.8cqw]" style={{ perspective: "1400px" }}>
          <Door side="left" on={on} />
          <Door side="right" on={on} />
        </div>
      </div>
    </section>
  );
}

/* ───────── Photo album ───────── */

// Sample photos (the site's demo moments) until the couple's own arrive.
const PHOTOS = ["/art/moments/m1.jpg", "/art/moments/m2.jpg", "/art/moments/m3.jpg", "/art/moments/m4.jpg"];

/** Arch-topped, gold-edged photos in a swipeable row; tap one to see it large. */
function Album() {
  const [open, setOpen] = useState<number | null>(null);
  const [active, setActive] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const onScroll = () => {
    const el = track.current;
    const card = el?.firstElementChild as HTMLElement | null;
    if (el && card) setActive(Math.round(el.scrollLeft / (card.offsetWidth + 16)));
  };
  return (
    <section className="relative w-full pt-[6cqw] pb-[16cqw] text-center">
      <Reveal>
        <Small color={C.gold}>Our moments</Small>
        <p className="text-[12cqw] leading-tight" style={{ fontFamily: script, color: C.maroon }}>
          Photo album
        </p>
      </Reveal>
      <Reveal delay={0.15}>
        <div ref={track} onScroll={onScroll} className="no-scrollbar mt-[6cqw] flex snap-x snap-mandatory gap-4 overflow-x-auto px-[18cqw] pt-[3cqw] pb-[6cqw]">
          {PHOTOS.map((src, i) => (
            <motion.button
              key={src}
              type="button"
              onClick={() => setOpen(i)}
              className="relative aspect-[3/4] w-[64cqw] shrink-0 snap-center p-[1.2cqw] shadow-[0_2cqw_5cqw_rgba(80,40,20,.22)]"
              style={{ borderRadius: "32cqw 32cqw 2cqw 2cqw", background: "linear-gradient(135deg, #c99a3e, #f8e2a6 35%, #b8862e 65%, #f3d68d)" }}
              animate={{ scale: active === i ? 1 : 0.92, rotate: active === i ? 0 : i % 2 ? 1.5 : -1.5 }}
              transition={{ duration: 0.5, ease }}
              aria-label={`Open photo ${i + 1}`}
            >
              <div className="relative size-full overflow-hidden" style={{ borderRadius: "31cqw 31cqw 1.4cqw 1.4cqw" }}>
                <Image src={src} alt="" fill sizes="320px" className="object-cover" />
                <div className="pointer-events-none absolute inset-0" style={{ boxShadow: "inset 0 0 0 0.6cqw rgba(255,240,210,.45)", borderRadius: "inherit" }} />
              </div>
            </motion.button>
          ))}
        </div>
        <div className="flex justify-center gap-[2cqw]">
          {PHOTOS.map((p, i) => (
            <span key={p} className="h-[1.6cqw] rounded-full transition-all" style={{ width: active === i ? "5cqw" : "1.6cqw", background: active === i ? C.maroon : `${C.gold}66` }} />
          ))}
        </div>
      </Reveal>
      <AnimatePresence>
        {open !== null && (
          <motion.button
            type="button"
            className="fixed inset-0 z-[80] grid place-items-center bg-[rgba(30,15,10,.88)] p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
            aria-label="Close photo"
          >
            <motion.div className="relative h-[80svh] w-full max-w-[440px]" initial={{ scale: 0.92 }} animate={{ scale: 1 }}>
              <Image src={PHOTOS[open]} alt="" fill sizes="440px" className="object-contain" />
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ───────── With best compliments ───────── */

// As on the family's printed card.
const COMPLIMENTS = ["Sri S. Sridhar Rao", "Sri S. Srikrishna"];

function Compliments() {
  return (
    <section className="relative flex w-full flex-col items-center px-[12%] pt-[6cqw] pb-[14cqw] text-center">
      <Reveal className="relative w-full">
        <div className="relative w-full rounded-[3cqw] px-[7cqw] py-[9cqw]" style={{ background: "linear-gradient(180deg, rgba(255,252,245,.75), rgba(250,240,222,.6))", boxShadow: `inset 0 0 0 1px ${C.gold}55, 0 2cqw 6cqw rgba(90,60,30,.1)` }}>
          <div className="pointer-events-none absolute inset-[1.6cqw] rounded-[2cqw] border" style={{ borderColor: `${C.blue}88` }} />
          <Small color={C.gold}>With</Small>
          <p className="text-[11cqw] leading-tight" style={{ fontFamily: script, color: C.maroon }}>
            Best Compliments
          </p>
          <Lotus className="mx-auto my-[5cqw]" />
          <div className="flex flex-col gap-[2cqw]">
            {COMPLIMENTS.map((n, i) => (
              <motion.p
                key={n}
                className="text-[4.4cqw] font-semibold"
                style={{ fontFamily: serif, color: C.ink }}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.12, duration: 0.7, ease }}
              >
                {n}
              </motion.p>
            ))}
          </div>
          <p className="mt-[4cqw] text-[4cqw] italic" style={{ fontFamily: serif, color: C.ink }}>
            and near &amp; dear
          </p>
        </div>
      </Reveal>
    </section>
  );
}

/* ───────── Closing: seated together on Kailash ───────── */

function Closing() {
  return (
    <section className="relative w-full overflow-hidden pb-[22cqw]">
      <Painting
        src="v4-cover"
        alt="On snowy Kailash, Shiva tucks a jasmine flower into Parvati's hair"
        fade="linear-gradient(180deg, transparent, #000 8%, #000 58%, transparent 84%)"
        className="top-0"
      />
      <Petals count={5} seed={21} />
      <div className="relative flex flex-col items-center px-[12%] pt-[112cqw] text-center">
        <Reveal>
          <p className="text-[4.4cqw] leading-snug font-semibold italic" style={{ fontFamily: serif, color: C.ink }}>
            Blessed by Shiva and Parvati, two hearts become one. Come, bless the beginning of forever.
          </p>
          <p className="mt-[3cqw] flex flex-col items-center text-[11cqw] leading-[1.1]" style={{ fontFamily: script, color: C.maroon }}>
            <span>{S.bride}</span>
            <span className="text-[7cqw]" style={{ color: C.gold }}>
              &amp;
            </span>
            <span>{S.groom}</span>
          </p>
          <Small className="mt-[2cqw]" color={C.maroon}>
            With love · the Saranala family
          </Small>
        </Reveal>
      </div>
    </section>
  );
}
