"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";

/**
 * Three openings for the Marathi design, to choose between:
 *  A · Antarpat: the silk cloth held between bride and groom is lowered at "शुभमंगल सावधान".
 *  B · Akshata: a brass taat of akshata; tap and the rice is thrown, then showers down.
 *  C · Both: the antarpat lowers as akshata rains over the couple.
 * All open onto the reference scene (a placeholder until the final painting).
 */

type Concept = "A" | "B" | "C";

const C = {
  maroon: "#6d0f22",
  maroonDeep: "#4a0816",
  gold: "#e3b75a",
  goldLight: "#f7dc8f",
  kumkum: "#c8102e",
  paper: "#f7ecd9",
  ink: "#5a1420",
  green: "#1f5a2c",
};

const ease = [0.65, 0, 0.35, 1] as const;

export function MarathiIntros() {
  const [concept, setConcept] = useState<Concept>("A");
  const [run, setRun] = useState(0);
  const pick = (c: Concept) => {
    setConcept(c);
    setRun((r) => r + 1);
  };

  return (
    <div className="flex min-h-svh flex-col items-center bg-[#1b1412]">
      <div className="sticky top-0 z-[60] flex w-full max-w-[480px] items-center gap-2 bg-[#1b1412]/95 px-3 py-2 text-[13px] text-white backdrop-blur">
        {(["A", "B", "C"] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => pick(c)}
            className={`rounded-full px-3 py-1.5 font-semibold ${concept === c ? "bg-white text-black" : "bg-white/10 text-white"}`}
          >
            {c === "A" ? "A · Antarpat" : c === "B" ? "B · Akshata" : "C · Both"}
          </button>
        ))}
        <button type="button" onClick={() => setRun((r) => r + 1)} className="ml-auto rounded-full bg-white/10 px-3 py-1.5">
          ↻ Replay
        </button>
      </div>
      <div className="@container relative h-[calc(100svh-46px)] w-full max-w-[480px] overflow-hidden">
        <Stage key={`${concept}-${run}`} concept={concept} />
      </div>
    </div>
  );
}

function Stage({ concept }: { concept: Concept }) {
  const [opened, setOpened] = useState(false);
  const hint = concept === "B" ? "Tap to shower the akshata" : "Tap to lower the antarpat";
  return (
    <div className="absolute inset-0" style={{ background: C.paper }}>
      <Reveal opened={opened} />
      {/* What falls over the couple once the opening plays. */}
      {opened && concept !== "A" && <AkshataRain delay={concept === "B" ? 0.55 : 0.35} />}
      <AnimatePresence>{!opened || concept !== "B" ? null : <ThrowBurst key="burst" />}</AnimatePresence>

      {concept === "B" ? <Taat opened={opened} onOpen={() => setOpened(true)} /> : <Antarpat opened={opened} onOpen={() => setOpened(true)} />}

      <motion.button
        type="button"
        onClick={() => setOpened(true)}
        className="absolute bottom-[7%] left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[rgba(24,14,10,.74)] px-5 py-3 text-[clamp(14px,3.9cqw,17px)] font-semibold whitespace-nowrap text-white shadow-[0_6px_24px_rgba(0,0,0,.35)] ring-1 ring-white/25 backdrop-blur-md"
        animate={opened ? { opacity: 0, y: 12 } : { opacity: 1, y: [0, -4, 0] }}
        transition={opened ? { duration: 0.25 } : { y: { duration: 1.8, repeat: Infinity, ease: "easeInOut" } }}
        style={{ pointerEvents: opened ? "none" : "auto" }}
      >
        <span aria-hidden>👆</span> {hint}
      </motion.button>
    </div>
  );
}

/* ───────── The scene behind (placeholder art) ───────── */

function Reveal({ opened }: { opened: boolean }) {
  return (
    <div className="absolute inset-0 flex flex-col">
      <motion.div
        className="relative h-[62%] w-full overflow-hidden"
        initial={{ scale: 1.12 }}
        animate={{ scale: opened ? 1 : 1.12 }}
        transition={{ duration: 2.2, ease }}
      >
        <Image src="/art/illus/marathi-ref.jpg" alt="" fill priority sizes="480px" className="object-cover" style={{ objectPosition: "50% 40%" }} />
        <div className="absolute inset-x-0 bottom-0 h-[18%]" style={{ background: `linear-gradient(transparent, ${C.paper})` }} />
      </motion.div>
      <motion.div
        className="relative -mt-[2cqw] flex flex-1 flex-col items-center text-center"
        initial={{ opacity: 0, y: 18 }}
        animate={opened ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1.1, delay: 1.1, ease }}
      >
        <p className="text-[3cqw] tracking-[0.3em] uppercase" style={{ color: C.ink, fontFamily: "var(--font-cinzel)" }}>
          The wedding of
        </p>
        <p className="mt-[1cqw] text-[12cqw] leading-none" style={{ color: C.maroon, fontFamily: "var(--font-pinyon)" }}>
          Aditi <span style={{ color: C.gold, fontSize: "0.6em" }}>&amp;</span> Sameer
        </p>
        <p className="mt-[2cqw] text-[4.4cqw]" style={{ color: C.ink, fontFamily: "var(--font-deva)" }}>
          शनिवार, २० फेब्रुवारी २०२७ · पुणे
        </p>
      </motion.div>
    </div>
  );
}

/* ───────── A · the antarpat ───────── */

/** The silk antarpat: maroon with gold zari borders, a kumkum swastik, "शुभमंगल सावधान". */
function Antarpat({ opened, onOpen }: { opened: boolean; onOpen: () => void }) {
  return (
    <motion.button
      type="button"
      aria-label="Lower the antarpat"
      onClick={onOpen}
      className="absolute inset-0 z-30 block cursor-pointer [perspective:120cqw]"
      style={{ pointerEvents: opened ? "none" : "auto" }}
    >
      <motion.div
        className="absolute -inset-[3%] origin-bottom overflow-hidden"
        initial={false}
        animate={opened ? { y: "150%", rotateX: 30, scaleY: 0.9, opacity: [1, 1, 0] } : { y: ["0%", "0.6%", "0%"], rotateX: 0, scaleY: 1, opacity: 1 }}
        transition={
          opened
            ? { duration: 1.5, ease: [0.55, 0, 0.75, 0.2], opacity: { duration: 1.5, times: [0, 0.75, 1] } }
            : { y: { duration: 3.5, repeat: Infinity, ease: "easeInOut" } }
        }
        style={{ transformStyle: "preserve-3d" }}
      >
        <Silk />
        {/* The hands holding it: two gathered folds at the top corners. */}
        {(["left", "right"] as const).map((s) => (
          <div
            key={s}
            className={`absolute top-0 h-[16cqw] w-[22cqw] ${s === "left" ? "left-0" : "right-0"}`}
            style={{ background: `radial-gradient(ellipse at ${s === "left" ? "0% 0%" : "100% 0%"}, rgba(0,0,0,.45), transparent 70%)` }}
          />
        ))}
        <div className="absolute inset-x-[8%] top-1/2 flex -translate-y-1/2 flex-col items-center text-center">
          <Swastik />
          <p className="mt-[6cqw] text-[8.4cqw] leading-tight" style={{ color: C.goldLight, fontFamily: "var(--font-rozha)", textShadow: "0 2px 10px rgba(0,0,0,.45)" }}>
            ॥ शुभमंगल सावधान ॥
          </p>
          <p className="mt-[3cqw] text-[3cqw] tracking-[0.32em] uppercase" style={{ color: `${C.goldLight}cc`, fontFamily: "var(--font-cinzel)" }}>
            Aditi &amp; Sameer
          </p>
        </div>
      </motion.div>
    </motion.button>
  );
}

/** Maroon silk: a slow sheen across it, folds, and gold zari bands top and bottom. */
function Silk() {
  const zari = `repeating-linear-gradient(90deg, ${C.gold} 0 2px, #b88a2e 2px 4px, ${C.goldLight} 4px 6px, #b88a2e 6px 8px)`;
  return (
    <>
      <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, ${C.maroon}, ${C.maroonDeep} 55%, ${C.maroon})` }} />
      {/* Folds: soft vertical shading, as silk hangs. */}
      <div
        className="absolute inset-0 opacity-60"
        style={{ background: "repeating-linear-gradient(90deg, rgba(0,0,0,.18) 0 6%, rgba(255,255,255,.04) 9%, rgba(0,0,0,.12) 13%)" }}
      />
      <motion.div
        className="absolute inset-y-0 w-[60%] opacity-40 mix-blend-screen"
        style={{ background: "linear-gradient(100deg, transparent, rgba(255,214,170,.55), transparent)" }}
        animate={{ x: ["-80%", "220%"] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
      />
      {(["top", "bottom"] as const).map((e) => (
        <div key={e} className={`absolute inset-x-0 ${e === "top" ? "top-[5%]" : "bottom-[5%]"} h-[7cqw]`}>
          <div className="absolute inset-x-0 top-0 h-[1.2cqw]" style={{ background: C.gold }} />
          <div className="absolute inset-x-0 top-[1.8cqw] h-[3.4cqw] opacity-90" style={{ background: zari }} />
          <div className="absolute inset-x-0 bottom-0 h-[1.2cqw]" style={{ background: C.gold }} />
        </div>
      ))}
      {/* A tasselled hem. */}
      <div
        className="absolute inset-x-0 bottom-0 h-[3cqw]"
        style={{ background: `repeating-linear-gradient(90deg, ${C.gold} 0 1.2cqw, transparent 1.2cqw 2.4cqw)` }}
      />
    </>
  );
}

/** A kumkum swastik in a gold ring, as drawn on the antarpat. */
function Swastik() {
  return (
    <svg viewBox="0 0 120 120" className="w-[34cqw] drop-shadow-[0_4px_14px_rgba(0,0,0,.4)]">
      <circle cx="60" cy="60" r="56" fill="#f6e7c6" stroke={C.gold} strokeWidth="4" />
      <circle cx="60" cy="60" r="49" fill="none" stroke={C.gold} strokeWidth="1.2" strokeDasharray="2 3" />
      <g stroke={C.kumkum} strokeWidth="7" strokeLinecap="round" fill="none">
        <path d="M60 28 V92 M28 60 H92" />
        <path d="M60 28 H86 M92 60 V86 M60 92 H34 M28 60 V34" />
      </g>
      {[[44, 44], [76, 44], [44, 76], [76, 76]].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="4.2" fill={C.kumkum} />
      ))}
    </svg>
  );
}

/* ───────── B · the akshata ───────── */

const RICE = ["#fbf3d6", "#f6e6b4", "#fff8e6", "#efd99b"];
const TINT = ["#d62a2a", "#e0a02b"];
function grainColour(i: number) {
  return i % 7 === 0 ? TINT[i % 2] : RICE[i % RICE.length];
}

/** A brass taat heaped with akshata; tapping it throws the rice. */
function Taat({ opened, onOpen }: { opened: boolean; onOpen: () => void }) {
  const heap = useMemo(
    () =>
      Array.from({ length: 140 }, (_, i) => {
        const a = (i * 137.5 * Math.PI) / 180;
        const r = Math.sqrt(i / 140) * 30;
        return { x: 50 + Math.cos(a) * r, y: 50 + Math.sin(a) * r * 0.42, rot: (i * 47) % 180, c: grainColour(i) };
      }),
    [],
  );
  return (
    <motion.button
      type="button"
      aria-label="Shower the akshata"
      onClick={onOpen}
      className="absolute inset-0 z-30 block cursor-pointer"
      style={{ pointerEvents: opened ? "none" : "auto", background: `radial-gradient(circle at 50% 45%, #fff6e3, ${C.paper} 60%, #ead6b4)` }}
      animate={{ opacity: opened ? 0 : 1 }}
      transition={{ duration: 0.6, delay: opened ? 0.9 : 0 }}
    >
      <div className="absolute inset-x-0 top-[13%] text-center">
        <p className="text-[8cqw]" style={{ color: C.maroon, fontFamily: "var(--font-rozha)" }}>
          ॥ शुभविवाह ॥
        </p>
        <p className="mt-[2cqw] text-[3cqw] tracking-[0.32em] uppercase" style={{ color: C.ink, fontFamily: "var(--font-cinzel)" }}>
          Your blessings, in akshata
        </p>
      </div>
      <motion.div
        className="absolute top-[47%] left-1/2 w-[76cqw] -translate-x-1/2 -translate-y-1/2"
        animate={opened ? { scale: 1.08, y: -18 } : { scale: [1, 1.02, 1] }}
        transition={opened ? { duration: 0.3 } : { duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg viewBox="0 0 100 60" className="w-full overflow-visible">
          <defs>
            <radialGradient id="brass" cx="40%" cy="30%" r="80%">
              <stop offset="0" stopColor="#fbe7a4" />
              <stop offset=".45" stopColor="#d7a640" />
              <stop offset="1" stopColor="#8a5f17" />
            </radialGradient>
          </defs>
          <ellipse cx="50" cy="34" rx="48" ry="22" fill="url(#brass)" />
          <ellipse cx="50" cy="32" rx="40" ry="17" fill="#b9862b" opacity=".55" />
          <ellipse cx="50" cy="32" rx="40" ry="17" fill="none" stroke="#fbe7a4" strokeWidth=".6" opacity=".8" />
          {/* A small diya and a kumkum dish on the taat. */}
          <circle cx="22" cy="34" r="4" fill="#c8102e" />
          <ellipse cx="78" cy="35" rx="5" ry="2.4" fill="#a8651d" />
          <path d="M78 27 q-1.6 3.4 0 6 q1.6 -2.6 0 -6z" fill="#ffb02e" />
          <g transform="translate(0 -8)">
            {heap.map((g, i) => (
              <ellipse key={i} cx={g.x} cy={g.y} rx="1.5" ry=".6" fill={g.c} transform={`rotate(${g.rot} ${g.x} ${g.y})`} opacity={opened ? 0 : 1} />
            ))}
          </g>
        </svg>
      </motion.div>
    </motion.button>
  );
}

/** The throw: rice flung up out of the taat. */
function ThrowBurst() {
  const grains = useMemo(
    () =>
      Array.from({ length: 130 }, (_, i) => {
        const a = (-90 + ((i * 53) % 140) - 70) * (Math.PI / 180);
        const v = 40 + ((i * 29) % 45);
        return { dx: Math.cos(a) * v, dy: Math.sin(a) * v, rot: (i * 83) % 360, c: grainColour(i) };
      }),
    [],
  );
  return (
    <div className="pointer-events-none absolute inset-0 z-[35]">
      {grains.map((g, i) => (
        <motion.span
          key={i}
          className="absolute top-[44%] left-1/2 h-[1.3cqw] w-[3.2cqw] rounded-full shadow-[0_1px_2px_rgba(0,0,0,.2)]"
          style={{ background: g.c }}
          initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
          animate={{ x: `${g.dx}cqw`, y: [`0cqw`, `${g.dy}cqw`, `${g.dy + 70}cqw`], rotate: g.rot, opacity: [1, 1, 0] }}
          transition={{ duration: 1.9, ease: "easeOut", times: [0, 0.38, 1], delay: (i % 10) * 0.012 }}
        />
      ))}
    </div>
  );
}

/** Akshata showering down over the couple, gently swaying as it falls. */
function AkshataRain({ delay = 0 }: { delay?: number }) {
  const grains = useMemo(
    () =>
      Array.from({ length: 110 }, (_, i) => ({
        x: (i * 37) % 100,
        d: delay + ((i * 13) % 100) / 60,
        t: 2.2 + ((i * 7) % 10) / 6,
        sway: ((i * 17) % 10) - 5,
        rot: (i * 61) % 360,
        c: grainColour(i),
        s: 0.8 + ((i * 11) % 10) / 14,
      })),
    [delay],
  );
  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      {grains.map((g, i) => (
        <motion.span
          key={i}
          className="absolute -top-[4cqw] rounded-full shadow-[0_1px_1px_rgba(0,0,0,.15)]"
          style={{ left: `${g.x}%`, width: `${2.2 * g.s}cqw`, height: `${0.9 * g.s}cqw`, background: g.c }}
          initial={{ y: 0, x: 0, rotate: g.rot, opacity: 0 }}
          animate={{ y: "105cqh", x: [`0cqw`, `${g.sway}cqw`, `${-g.sway / 2}cqw`], rotate: g.rot + 540, opacity: [0, 1, 1, 0] }}
          transition={{ duration: g.t, delay: g.d, ease: "easeIn", times: [0, 0.1, 0.85, 1] }}
        />
      ))}
    </div>
  );
}
