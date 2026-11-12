"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";

/**
 * The Marathi design, storybook style. The mandap's gold arch, pillars, jasmine and lamps form a
 * frame that stays fixed while the whole invite scrolls under it.
 *
 * Opening, "Shubh Mangal Saavdhan": the screen is the silk antarpat with "You're invited" on it.
 * Tap, and the blessing writes itself onto the silk letter by letter; then the antarpat is drawn up
 * and away, uncovering the couple from their feet up. As it rises, golden light blooms out from
 * where they stand, sparkle trails swirl up after the cloth, jasmine and marigold petals scatter and
 * akshata drifts down, while the camera pulls back. The frame settles in and the names write in.
 * Everything is in English.
 */

const C = { maroon: "#7a1424", ink: "#4a1d14", gold: "#b88a2e", goldLight: "#f6d98c", green: "#2d6a35", paper: "#fbf0d6" };
const label = "var(--font-cinzel)";
const serif = "var(--font-cormorant)";
const script = "var(--font-great-vibes)";
const art = (f: string) => `/art/illus/${f}`;
const ease = [0.22, 1, 0.36, 1] as const;

// The opening's beats (seconds after the tap).
// The blessing writes in, then the antarpat is drawn up and away into golden light.
const T = { blessing: 0, lift: 1.3, frame: 2.3, names: 2.8, done: 4.4 };

/** A small seeded random, so every burst plays the same way. */
function seeded(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

export function MarathiInvite() {
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
    <div className="flex min-h-svh justify-center bg-[#1b1412]">
      <div key={run} className="@container relative w-full max-w-[480px]" style={{ background: C.paper }}>
        <Cover opened={opened} />
        <Families />
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

/* ───────── The fixed frame ───────── */

/**
 * The mandap's arch (top), pillars (middle, stretched to any screen height) and lamps (bottom),
 * fixed over the invite. At the reveal it settles gently into place.
 */
function Frame({ opened }: { opened: boolean }) {
  const at = (d: number) => ({ duration: 1.4, delay: opened ? T.frame + d : 0, ease });
  return (
    <div className="pointer-events-none fixed inset-y-0 left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2 overflow-hidden">
      <div className="@container absolute inset-0">
        <motion.div className="absolute inset-x-0 top-0" style={{ aspectRatio: "864 / 506" }} initial={{ y: "-4%", opacity: 0 }} animate={opened ? { y: "0%", opacity: 1 } : {}} transition={at(0)}>
          <Image src={art("marathi-frame-arch.webp")} alt="" fill priority sizes="480px" />
        </motion.div>
        {(["left", "right"] as const).map((side) => (
          <motion.div
            key={side}
            className="absolute inset-x-0 top-[57cqw] bottom-[64cqw]"
            style={{ clipPath: side === "left" ? "inset(0 50% 0 0)" : "inset(0 0 0 50%)" }}
            initial={{ x: side === "left" ? "-3%" : "3%", opacity: 0 }}
            animate={opened ? { x: "0%", opacity: 1 } : {}}
            transition={at(0.1)}
          >
            <Image src={art("marathi-frame-pillars-2.webp")} alt="" fill priority sizes="480px" className="object-fill" />
          </motion.div>
        ))}
        <motion.div className="absolute inset-x-0 bottom-0" style={{ aspectRatio: "864 / 569" }} initial={{ y: "4%", opacity: 0 }} animate={opened ? { y: "0%", opacity: 1 } : {}} transition={at(0.1)}>
          <Image src={art("marathi-frame-lamps-2.webp")} alt="" fill priority sizes="480px" />
        </motion.div>
      </div>
    </div>
  );
}

/* ───────── The opening ───────── */

function Opening({ opened, onOpen }: { opened: boolean; onOpen: () => void }) {
  return (
    <div className="fixed inset-y-0 left-1/2 z-50 w-full max-w-[480px] -translate-x-1/2 overflow-hidden" style={{ pointerEvents: opened ? "none" : "auto" }}>
      <div className="@container absolute inset-0">
        {opened && <Glow />}
        <Antarpat opened={opened} />
        {opened && (
          <>
            <Trails />
            <Akshata />
          </>
        )}
        <AnimatePresence>
          {!opened && (
            <motion.button
              type="button"
              onClick={onOpen}
              exit={{ opacity: 0, transition: { duration: 0.3 } }}
              className="absolute bottom-[7%] left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[rgba(24,14,10,.74)] px-5 py-3 text-[clamp(14px,3.9cqw,17px)] font-semibold whitespace-nowrap text-white shadow-[0_6px_24px_rgba(0,0,0,.3)] ring-1 ring-white/25 backdrop-blur-md"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: [0, -4, 0] }}
              transition={{ opacity: { delay: 0.8, duration: 0.5 }, y: { delay: 1.2, duration: 1.8, repeat: Infinity, ease: "easeInOut" } }}
            >
              <span aria-hidden>👆</span> Tap to draw the curtain
            </motion.button>
          )}
        </AnimatePresence>
        {!opened && <button type="button" onClick={onOpen} aria-label="Draw the antarpat" className="absolute inset-0 cursor-pointer" />}
      </div>
    </div>
  );
}

/** The silk: maroon, peacock borders down both edges. */
function Silk({ children }: { children?: ReactNode }) {
  return (
    <div
      className="absolute inset-0"
      style={{
        borderStyle: "solid",
        borderWidth: "4cqw 10cqw 9cqw 10cqw",
        borderImage: `url(${art("marathi-antarpat-plain.webp")}) 6% 17.5% 12% 17.5% / 4cqw 10cqw 9cqw 10cqw stretch round`,
        background: `url(${art("marathi-antarpat-silk.webp")}) center / 100% 100% no-repeat padding-box`,
      }}
    >
      {children}
    </div>
  );
}

/**
 * The antarpat fills the screen. At the tap the blessing writes itself onto it, then it is drawn
 * up and away, uncovering the couple from their feet up. Its tasselled hem sways as it rises.
 */
function Antarpat({ opened }: { opened: boolean }) {
  return (
    <motion.div
      className="absolute inset-0 drop-shadow-[0_10px_18px_rgba(60,20,10,.35)]"
      initial={false}
      animate={opened ? { y: "-112%" } : { y: "0%" }}
      transition={{ duration: 1.9, delay: opened ? T.lift : 0, ease: [0.65, 0, 0.35, 1] }}
    >
      <motion.div
        className="absolute inset-0 origin-top"
        animate={opened ? { skewX: [0, 0.8, -0.6, 0] } : {}}
        transition={{ duration: 1.9, delay: T.lift, ease: "easeInOut" }}
      >
        <Silk>
          <Invitation opened={opened} />
          {/* The blessing, written onto the silk letter by letter. */}
          {opened && (
            <div className="absolute inset-x-0 top-[33%] flex flex-col items-center text-center" style={{ color: "#ffe6a6", textShadow: "0 0 14px rgba(255,205,110,.6)" }}>
              <Letters text="SHUBH MANGAL" delay={T.blessing + 0.1} className="text-[7.6cqw] tracking-[0.16em]" style={{ fontFamily: label }} />
              <Letters text="Saavdhan" delay={T.blessing + 0.55} className="mt-[2cqw] text-[17cqw] leading-none" style={{ fontFamily: script }} />
            </div>
          )}
        </Silk>
        <motion.div
          className="absolute inset-y-0 w-[55%] opacity-30 mix-blend-screen"
          style={{ background: "linear-gradient(100deg, transparent, rgba(255,214,170,.6), transparent)" }}
          animate={{ x: ["-90%", "230%"] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.5 }}
        />
      </motion.div>
    </motion.div>
  );
}

/** What is written on the antarpat before the tap; it fades as the blessing comes in. */
function Invitation({ opened }: { opened: boolean }) {
  return (
    // Only the invitation and the names: nothing else on the silk.
    <motion.div className="absolute inset-0 flex flex-col items-center justify-center pb-[6%] text-center" animate={{ opacity: opened ? 0 : 1 }} transition={{ duration: 0.5 }}>
      <p className="text-[3.2cqw] tracking-[0.34em] uppercase" style={{ fontFamily: label, color: C.goldLight }}>
        You&rsquo;re invited
      </p>
      <p className="mt-[2cqw] text-[15cqw] leading-[1.05]" style={{ fontFamily: script, color: C.goldLight }}>
        Divyesh
      </p>
      <p className="text-[6cqw] leading-none" style={{ fontFamily: serif, color: C.goldLight }}>
        &amp;
      </p>
      <p className="text-[15cqw] leading-[1.05]" style={{ fontFamily: script, color: C.goldLight }}>
        Shruti
      </p>
    </motion.div>
  );
}

/** A name or phrase arriving one letter at a time out of a soft blur, as on Chameli's cover. */
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

// Where the light comes from: between the couple, at the height of their garlands.
const SOURCE = { x: 50, y: 62 };

/** Warm golden light blooming out from where the couple stand as the cloth starts to rise. */
function Glow() {
  return (
    <motion.div
      className="pointer-events-none absolute size-[70cqw] -translate-x-1/2 -translate-y-1/2 rounded-full"
      style={{ left: `${SOURCE.x}%`, top: `${SOURCE.y}%`, background: "radial-gradient(closest-side, #fffaf0, #fbe3a0 45%, rgba(246,210,130,.4) 70%, transparent)" }}
      initial={{ scale: 0.1, opacity: 0 }}
      animate={{ scale: [0.1, 1.3, 4.5], opacity: [0, 1, 0] }}
      transition={{ delay: T.lift + 0.15, duration: 2.4, times: [0, 0.35, 1], ease: "easeOut" }}
    />
  );
}

const SPARKS = (() => {
  const r = seeded(29);
  return Array.from({ length: 24 }, () => ({ x: (r() - 0.5) * 90, y: -20 - r() * 90, d: T.lift + 0.35 + r() * 1.1, s: 0.6 + r() * 1.2 }));
})();
const PETALS = (() => {
  const r = seeded(7);
  return Array.from({ length: 26 }, (_, i) => {
    const a = -Math.PI / 2 + (r() - 0.5) * Math.PI * 1.6;
    const d = 40 + r() * 60;
    return { x: Math.cos(a) * d, y: Math.sin(a) * d - 10, rot: (r() - 0.5) * 720, size: 2.4 + r() * 2.8, delay: T.lift + 0.4 + r() * 0.6, jasmine: i % 2 === 0 };
  });
})();

/** Sparkle trails swirling up after the rising cloth, with sparks and a scatter of petals. */
function Trails() {
  return (
    <>
      <svg className="pointer-events-none absolute inset-0 size-full" viewBox="0 0 100 177" preserveAspectRatio="none" aria-hidden>
        {["M50 110 C 22 96, 78 80, 40 60 S 70 30, 54 -6", "M50 110 C 82 98, 26 82, 64 62 S 30 32, 46 -8", "M50 110 C 38 88, 92 80, 78 52 S 90 20, 76 -8"].map((d, i) => (
          <motion.path
            key={d}
            d={d}
            fill="none"
            stroke={i === 1 ? "#fff3cf" : "#f5d989"}
            strokeWidth={0.6}
            strokeLinecap="round"
            style={{ filter: "drop-shadow(0 0 1.2px #fff3cf)" }}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: [0, 1, 1], opacity: [0, 1, 0] }}
            transition={{ delay: T.lift + 0.3 + i * 0.15, duration: 1.8, times: [0, 0.6, 1], ease: "easeOut" }}
          />
        ))}
      </svg>
      {SPARKS.map((sp, i) => (
        <motion.span
          key={`s${i}`}
          className="pointer-events-none absolute rounded-full bg-[#fff6d6] shadow-[0_0_6px_2px_rgba(255,226,150,.8)]"
          style={{ left: `${SOURCE.x}%`, top: `${SOURCE.y}%`, width: `${sp.s}cqw`, height: `${sp.s}cqw` }}
          initial={{ x: 0, y: 0, opacity: 0 }}
          animate={{ x: `${sp.x}cqw`, y: `${sp.y}cqw`, opacity: [0, 1, 0] }}
          transition={{ delay: sp.d, duration: 1.5, ease: "easeOut" }}
        />
      ))}
      {PETALS.map((p, i) => (
        <motion.span
          key={`p${i}`}
          className="pointer-events-none absolute rounded-[60%_40%_60%_40%] shadow-sm"
          style={{
            left: `${SOURCE.x}%`,
            top: `${SOURCE.y}%`,
            width: `${p.size}cqw`,
            height: `${p.size * 1.35}cqw`,
            background: p.jasmine ? "radial-gradient(circle at 30% 30%, #ffffff, #efe6d2)" : "radial-gradient(circle at 30% 30%, #ffd27a, #f08a1c)",
          }}
          initial={{ x: 0, y: 0, rotate: 0, opacity: 0 }}
          animate={{ x: `${p.x}cqw`, y: ["0cqw", `${p.y}cqw`, `${p.y + 35}cqw`], rotate: p.rot, opacity: [0, 1, 1, 0] }}
          transition={{ delay: p.delay, duration: 2.2, ease: "easeOut" }}
        />
      ))}
    </>
  );
}

/** A light fall of akshata and a few petals as the cloth goes up: blessings, not confetti. */
function Akshata() {
  const bits = useMemo(() => {
    const r = seeded(17);
    return Array.from({ length: 34 }, (_, i) => ({ x: 6 + r() * 88, d: T.lift + 0.3 + r() * 1.6, t: 3 + r() * 1.5, sway: (r() - 0.5) * 10, rot: r() * 360, kind: i % 7 === 0 ? "petal" : i % 5 === 0 ? "red" : "rice" }));
  }, []);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {bits.map((b, i) => (
        <motion.span
          key={i}
          className="absolute -top-[3cqw]"
          style={{
            left: `${b.x}%`,
            width: b.kind === "petal" ? "2.2cqw" : b.kind === "red" ? "1.2cqw" : "2.2cqw",
            height: b.kind === "petal" ? "2.8cqw" : b.kind === "red" ? "1.2cqw" : "0.9cqw",
            borderRadius: b.kind === "petal" ? "60% 40% 60% 40%" : 999,
            background: b.kind === "petal" ? "radial-gradient(circle at 30% 30%, #ffd27a, #f08a1c)" : b.kind === "red" ? "#c8202f" : "#fff4d6",
            border: b.kind === "rice" ? "1px solid #c9a35a" : "none",
          }}
          initial={{ y: 0, x: 0, rotate: b.rot, opacity: 0 }}
          animate={{ y: "190cqw", x: ["0cqw", `${b.sway}cqw`, `${-b.sway / 2}cqw`], rotate: b.rot + 300, opacity: [0, 1, 1, 0] }}
          transition={{ duration: b.t, delay: b.d, ease: "linear", times: [0, 0.1, 0.85, 1] }}
        />
      ))}
    </div>
  );
}

/* ───────── Cover ───────── */

/** A name written in, as if by hand: wiped in from the left. */
function Written({ text, delay, style }: { text: ReactNode; delay: number; style?: CSSProperties }) {
  return (
    <motion.span
      className="inline-block whitespace-pre"
      style={style}
      initial={{ clipPath: "inset(-20% 100% -20% 0)", opacity: 0.4 }}
      animate={{ clipPath: "inset(-20% -5% -20% 0)", opacity: 1 }}
      transition={{ delay, duration: 1.3, ease: [0.45, 0, 0.25, 1] }}
    >
      {text}
    </motion.span>
  );
}

function Cover({ opened }: { opened: boolean }) {
  const show = (d: number) => ({
    initial: { opacity: 0, y: 12, filter: "blur(6px)" },
    animate: opened ? { opacity: 1, y: 0, filter: "blur(0px)" } : {},
    transition: { duration: 1, delay: T.names + d, ease },
  });
  return (
    <section className="relative h-svh min-h-[170cqw] w-full overflow-hidden">
      {/* The camera eases back from close on the couple as the light clears. */}
      <motion.div className="absolute inset-0" style={{ transformOrigin: "50% 60%" }} initial={{ scale: 1.3 }} animate={opened ? { scale: 1 } : {}} transition={{ duration: 2.8, delay: T.lift + 0.2, ease }}>
        <Image src={art("marathi-couple.jpg")} alt="A Marathi bride and groom face each other under the mandap" fill priority sizes="480px" className="object-cover object-bottom" />
      </motion.div>
      <div className="absolute inset-x-[16%] top-[22cqw] flex flex-col items-center text-center">
        <motion.p {...show(0)} className="text-[2.8cqw] tracking-[0.3em] uppercase" style={{ fontFamily: label, color: C.gold }}>
          Shri Ganeshaya Namah
        </motion.p>
        <motion.p {...show(0.2)} className="mt-[2.5cqw] text-[3.6cqw] leading-none tracking-[0.32em]" style={{ fontFamily: label, color: C.maroon }}>
          SHUBH VIVAH
        </motion.p>
        {opened && (
          <p className="mt-[2cqw] text-[12cqw] leading-[1.1] whitespace-nowrap" style={{ fontFamily: script, color: C.ink }}>
            <Written text="Divyesh" delay={T.names + 0.4} />
            <Written text=" & " delay={T.names + 1.1} style={{ color: C.gold }} />
            <Written text="Shruti" delay={T.names + 1.4} />
          </p>
        )}
        <motion.p {...show(1.9)} className="mt-[2cqw] text-[2.5cqw] leading-relaxed tracking-[0.24em] uppercase" style={{ fontFamily: label, color: C.ink }}>
          Saturday · 20 February 2027 · Pune
        </motion.p>
      </div>
    </section>
  );
}

/* ───────── Under the frame: families, functions, closing ───────── */

function Page({ children }: { children: ReactNode }) {
  return <section className="relative flex min-h-svh w-full flex-col items-center justify-center px-[17%] pt-[50cqw] pb-[46cqw] text-center">{children}</section>;
}

function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.9, delay, ease }} className="flex flex-col items-center">
      {children}
    </motion.div>
  );
}

const Small = ({ children, color = C.ink, className = "" }: { children: ReactNode; color?: string; className?: string }) => (
  <p className={`text-[2.5cqw] tracking-[0.26em] uppercase ${className}`} style={{ fontFamily: label, color }}>
    {children}
  </p>
);

function Divider() {
  return (
    <div className="my-[4cqw] flex w-[50%] items-center gap-[2cqw]">
      <span className="h-px flex-1" style={{ background: C.gold }} />
      <span className="text-[3cqw]" style={{ color: C.maroon }}>✦</span>
      <span className="h-px flex-1" style={{ background: C.gold }} />
    </div>
  );
}

function Families() {
  return (
    <Page>
      <Reveal>
        <p className="text-[2.8cqw] tracking-[0.3em] uppercase" style={{ fontFamily: label, color: C.gold }}>
          Shri Ganeshaya Namah
        </p>
        <Small className="mt-[4cqw]">With the blessings of our elders</Small>
        <p className="mt-[3.5cqw] text-[4.4cqw] leading-snug font-semibold" style={{ fontFamily: serif, color: C.ink }}>
          Mr. Vijay &amp; Mrs. Sunanda Kulkarni and Mr. Prakash &amp; Mrs. Meera Deshpande request the pleasure of your company at the wedding of their children
        </p>
      </Reveal>
      <Divider />
      <Reveal delay={0.15}>
        <Small color={C.green}>The bride</Small>
        <p className="text-[12cqw] leading-tight" style={{ fontFamily: script, color: C.maroon }}>Shruti</p>
        <p className="mt-[1cqw] text-[3.6cqw] italic" style={{ fontFamily: serif, color: C.ink }}>daughter of Mr. Vijay &amp; Mrs. Sunanda Kulkarni</p>
      </Reveal>
      <p className="my-[2.5cqw] text-[6cqw]" style={{ fontFamily: serif, color: C.gold }}>&amp;</p>
      <Reveal delay={0.3}>
        <Small color={C.green}>The groom</Small>
        <p className="text-[12cqw] leading-tight" style={{ fontFamily: script, color: C.maroon }}>Divyesh</p>
        <p className="mt-[1cqw] text-[3.6cqw] italic" style={{ fontFamily: serif, color: C.ink }}>son of Mr. Prakash &amp; Mrs. Meera Deshpande</p>
      </Reveal>
    </Page>
  );
}

function Event({ mr, en, when, venue, dress }: { mr: string; en: string; when: string; venue: string; dress: string }) {
  return (
    <Reveal>
      <p className="text-[11cqw] leading-tight" style={{ fontFamily: script, color: C.maroon }}>{mr}</p>
      <Small className="mt-[1cqw]" color={C.gold}>{en}</Small>
      <p className="mt-[2.5cqw] text-[4.4cqw] font-semibold" style={{ fontFamily: serif, color: C.ink }}>{when}</p>
      <p className="mt-[0.5cqw] text-[3.8cqw] leading-snug" style={{ fontFamily: serif, color: C.ink }}>{venue}</p>
      <p className="mt-[1.5cqw] text-[3.6cqw] italic" style={{ fontFamily: serif, color: C.green }}>Dress: {dress}</p>
      <span className="mt-[2.5cqw] rounded-full px-[4cqw] py-[1.5cqw] text-[3cqw] tracking-[0.12em] text-white" style={{ background: C.maroon, fontFamily: label }}>
        DIRECTIONS →
      </span>
    </Reveal>
  );
}

function Functions() {
  return (
    <Page>
      <Reveal>
        <Small color={C.gold}>Join us for</Small>
        <p className="text-[11cqw] leading-tight" style={{ fontFamily: script, color: C.maroon }}>The celebrations</p>
      </Reveal>
      <div className="mt-[3cqw]" />
      <Event mr="Haldi" en="The turmeric ceremony" when="Friday, 19 Feb · 10:00 am" venue="Kulkarni Wada, Sadashiv Peth, Pune" dress="Shades of yellow" />
      <Divider />
      <Event mr="Lagna" en="The wedding · Muhurta 11:45 am" when="Saturday, 20 Feb · 11:45 am" venue="Shree Ganesh Mangal Karyalay, Kothrud, Pune" dress="Paithani & pheta" />
    </Page>
  );
}

function Closing() {
  return (
    <section className="relative h-svh min-h-[170cqw] w-full overflow-hidden">
      <Image src={art("marathi-wada.jpg")} alt="The bride and groom walk home together, her pallu tied to his shela" fill sizes="480px" className="object-cover object-bottom" />
      <div className="absolute inset-x-[17%] top-[19cqw] flex flex-col items-center text-center">
        <Reveal>
          <p className="text-[4.2cqw] leading-snug font-semibold italic" style={{ fontFamily: serif, color: C.ink }}>
            Two families, one new home. Come, bless the beginning.
          </p>
          <p className="mt-[1cqw] text-[11cqw] leading-tight whitespace-nowrap" style={{ fontFamily: script, color: C.maroon }}>
            Divyesh &amp; Shruti
          </p>
          <p className="mt-[2cqw] text-[2.8cqw] tracking-[0.28em] uppercase" style={{ fontFamily: label, color: C.maroon }}>
            We await your presence
          </p>
        </Reveal>
      </div>
    </section>
  );
}
