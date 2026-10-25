"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "framer-motion";
import { Children, createContext, useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { site } from "@/config/site";
import type { Invite } from "@/data/invites";
import { fmtDate, monthName, time, weekday, yearNum } from "@/lib/format";
import { makeIllustrated } from "./illustrated";
import { useOpened, usePreview } from "./opened";
import { couple, EventActions } from "./shared";
import type { InviteTheme } from "./types";

/**
 * Mandir: a walk into a temple. Guests open carved doors, then scroll up the carpet towards the
 * temple until it dissolves into a painted arch. From there the arch stays fixed and every section
 * is a scene that comes towards you from the distance, settles inside the arch, and flies past as
 * the next one arrives. Art: public/art/illus/mandir-*.
 */

const art = "/art/illus";
const c = {
  paper: "#f7ebd5",
  card: "#fdf6ec",
  ink: "#5b2615",
  name: "#a8573a",
  gold: "#b9853f",
  soft: "#86553f",
};
const HAND = "var(--font-alex-brush), cursive";
const ease = [0.22, 1, 0.36, 1] as const;

// Doors and seal, and the painted arch as the page backdrop, come from the shared illustrated engine.
const base = makeIllustrated({
  id: "mandir",
  images: { opening: `${art}/mandir-gate.jpg`, hero: `${art}/mandir-temple.jpg`, card: `${art}/mandir-card.jpg` },
  opening: "doors",
  heroTextTop: 8,
  frame: { top: 16, bottom: 22, side: 6 },
  colors: { ink: c.ink, accent: c.name, soft: c.soft, paper: c.paper, onAccent: "#fff" },
  fonts: { script: "var(--font-bodoni), serif", serif: "var(--font-cormorant), serif", label: "var(--font-marcellus), serif" },
});

/* ───────── Ornaments ───────── */

/** A fine gold line with a half sun of rays below it, the design's divider. */
function Sunburst({ className }: { className?: string }) {
  const rays = Array.from({ length: 11 }, (_, i) => {
    const a = (Math.PI * (i + 1)) / 12;
    const len = i % 2 ? 9 : 15;
    return <line key={i} x1={60} y1={3} x2={60 + Math.cos(a) * len} y2={3 + Math.sin(a) * len} />;
  });
  return (
    <svg viewBox="0 0 120 20" className={className} fill="none" stroke={c.gold} strokeWidth={0.7} strokeLinecap="round" aria-hidden>
      <line x1={4} y1={3} x2={116} y2={3} strokeOpacity={0.7} />
      {rays}
    </svg>
  );
}

function Divider({ className }: { className?: string }) {
  return <Sunburst className={`mx-auto block w-[30cqw] ${className ?? ""}`} />;
}

function Title({ kicker, children }: { kicker?: string; children: ReactNode }) {
  return (
    <div className="text-center">
      {kicker && (
        <p className="inv-label text-[2.6cqw]" style={{ color: c.gold }}>
          {kicker}
        </p>
      )}
      <h2 className="inv-script mt-[1.5cqw] text-[8.5cqw] leading-[1.05]" style={{ color: c.ink }}>
        {children}
      </h2>
      <Divider className="mt-[2.5cqw]" />
    </div>
  );
}

// A cusped (scalloped) temple arch across the top of a 100-wide box, 30 high.
const CUSP = "Q0.5,14 6,13 Q9,8 15,8 Q18,3.5 25,4 Q30,1 37,2 Q42,0 50,0.5 Q58,0 63,2 Q70,1 75,4 Q82,3.5 85,8 Q91,8 94,13 Q99.5,14 99.5,20";

/** A card whose top is a scalloped temple arch, with a gold outline. */
function ArchCard({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      <svg viewBox="0 -1 100 31" className="block w-full" preserveAspectRatio="none" aria-hidden>
        <path d={`M0.5,30 L0.5,20 ${CUSP} L99.5,30 Z`} fill={c.card} />
        <path d={`M0.5,30 L0.5,20 ${CUSP} L99.5,30`} fill="none" stroke={c.gold} strokeWidth={1} vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="-mt-px rounded-b-[3cqw] border-x border-b" style={{ background: c.card, borderColor: c.gold }}>
        {children}
      </div>
    </div>
  );
}

/* ───────── Cover: walking up the carpet into the temple ───────── */

function Names({ invite, show }: { invite: Invite; show: (d: number) => object }) {
  const [a, b] = couple(invite);
  return (
    <div className="flex flex-col items-center text-center [text-shadow:0_0_16px_rgba(255,240,228,.9)]">
      <motion.p {...show(0.3)} className="text-[3.4cqw]" style={{ color: c.name, fontFamily: "var(--font-deva)" }}>
        {invite.invocation}
      </motion.p>
      <motion.p {...show(0.45)} className="inv-label mt-[2.5cqw] text-[2.5cqw]" style={{ color: c.ink }}>
        The wedding of
      </motion.p>
      <motion.h1 {...show(0.7)} className="mt-[1.5cqw] flex flex-col items-center">
        <span className="inv-script text-[15cqw] leading-[0.95]" style={{ color: c.name }}>
          {a.first}
        </span>
        <span className="-my-[1cqw] text-[8.5cqw] leading-none" style={{ color: c.ink, fontFamily: HAND }}>
          weds
        </span>
        <span className="inv-script text-[15cqw] leading-[0.95]" style={{ color: c.name }}>
          {b.first}
        </span>
      </motion.h1>
      <motion.p {...show(1)} className="inv-label mt-[3cqw] text-[2.6cqw]" style={{ color: c.ink }}>
        {weekday(invite.date)} · {fmtDate(invite.date, { day: "numeric" })} {monthName(invite.date)} {yearNum(invite.date)}
      </motion.p>
      <motion.p {...show(1.15)} className="inv-serif mt-[1.5cqw] text-[4cqw] italic" style={{ color: c.ink }}>
        {invite.city}
      </motion.p>
    </div>
  );
}

const showAfterOpen = (opened: boolean) => (delay: number) => ({ initial: { opacity: 0, y: 14 }, animate: opened ? { opacity: 1, y: 0 } : {}, transition: { duration: 1, delay, ease } });

function Hero({ invite }: { invite: Invite }) {
  const opened = useOpened();
  if (usePreview()) {
    return (
      <section className="relative h-full w-full overflow-hidden">
        <Image src={`${art}/mandir-temple.jpg`} alt="" fill priority sizes="(max-width: 480px) 100vw, 480px" className="object-cover" />
        <div className="absolute inset-x-[14%] top-[8%]">
          <Names invite={invite} show={showAfterOpen(opened)} />
        </div>
      </section>
    );
  }
  return <Walk invite={invite} />;
}

function Walk({ invite }: { invite: Invite }) {
  const opened = useOpened();
  const [a, b] = couple(invite);
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  // Walk up the carpet towards the temple door…
  const scale = useTransform(p, [0, 0.95], [1, 2.3]);
  // …the names rise into the sky and fade…
  const nameY = useTransform(p, [0, 0.3], ["0%", "-40%"]);
  const nameOpacity = useTransform(p, [0.03, 0.26], [1, 0]);
  // …and the temple dissolves into the painted arch behind it.
  const sceneOpacity = useTransform(p, [0.68, 0.98], [1, 0]);
  const cue = useTransform(p, [0, 0.06], [1, 0]);
  return (
    <section ref={ref} className="relative" style={{ height: "210svh" }}>
      <motion.div className="sticky top-0 h-[100svh] w-full overflow-hidden" style={{ opacity: sceneOpacity }}>
        <motion.div className="absolute inset-0" style={{ scale, transformOrigin: "50% 61%" }}>
          <Image src={`${art}/mandir-temple.jpg`} alt={`A temple at sunrise for ${a.first} and ${b.first}'s wedding`} fill priority sizes="(max-width: 480px) 100vw, 480px" className="object-cover" />
        </motion.div>
        <motion.div className="absolute inset-x-[14%] top-[8%]" style={{ y: nameY, opacity: nameOpacity }}>
          <Names invite={invite} show={showAfterOpen(opened)} />
        </motion.div>
        <motion.button
          type="button"
          onClick={() => window.scrollBy({ top: window.innerHeight, behavior: "smooth" })}
          className="absolute bottom-[4%] left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1 px-[6cqw] py-[2cqw] text-white [text-shadow:0_1px_8px_rgba(0,0,0,.55)]"
          initial={{ opacity: 0 }}
          animate={opened ? { opacity: 1, y: [0, 6, 0] } : {}}
          transition={{ opacity: { delay: 1.8, duration: 0.6 }, y: { delay: 1.8, duration: 1.8, repeat: Infinity } }}
          style={{ opacity: cue }}
          aria-label="Scroll to walk in"
        >
          <span className="inv-label text-[2.3cqw]">Scroll to walk in</span>
          <svg viewBox="0 0 24 24" className="size-[4cqw]" fill="none" stroke="currentColor" strokeWidth={1.6}>
            <path d="M6 9l6 6 6-6" />
          </svg>
        </motion.button>
      </motion.div>
    </section>
  );
}

/* ───────── The stage: scenes that walk towards you through the arch ───────── */

// How far each scene is from the viewer, in scene steps: <0 still ahead, 0–1 here, >1 walked past.
const SceneContext = createContext<MotionValue<number> | null>(null);
const STEP = 95; // svh of scrolling per scene

function Stage({ children }: { children: ReactNode }) {
  const items = Children.toArray(children);
  const [empty, setEmpty] = useState<Record<number, boolean>>({});
  const order: number[] = [];
  let n = 0;
  items.forEach((_, i) => (order[i] = empty[i] ? -1 : n++));
  const spacer = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: spacer, offset: ["start end", "end end"] });
  const span = Math.max(n - 0.45, 0.6);
  // Scene i arrives as u goes from i-0.35 to i, rests until i+0.6, and passes the viewer by i+1.2.
  const u = useTransform(scrollYProgress, (v) => -0.35 + v * (span + 0.35));
  const [at, setAt] = useState(0);
  useMotionValueEvent(u, "change", (v) => setAt(Math.max(-1, Math.min(n - 1, Math.round(v - 0.1)))));
  return (
    <>
      <div ref={spacer} style={{ height: `${(span + 0.35) * STEP}svh` }} aria-hidden />
      <div className="pointer-events-none fixed inset-y-0 left-1/2 z-20 w-full max-w-[480px] -translate-x-1/2 @container">
        {items.map((child, i) => (
          <Slot key={i} index={order[i]} u={u} onEmpty={(e) => setEmpty((p) => (p[i] === e ? p : { ...p, [i]: e }))}>
            {child}
          </Slot>
        ))}
        {/* Where you are on the walk */}
        <motion.div className="absolute top-1/2 right-[2.5%] flex -translate-y-1/2 flex-col gap-[1.6cqw]" animate={{ opacity: at >= 0 ? 1 : 0 }} aria-hidden>
          {Array.from({ length: n }, (_, i) => (
            <span key={i} className="block w-[1.4cqw] rounded-full transition-all duration-500" style={{ height: i === at ? "4.5cqw" : "1.4cqw", background: i === at ? c.name : `${c.gold}88` }} />
          ))}
        </motion.div>
      </div>
    </>
  );
}

function Slot({ index, u, onEmpty, children }: { index: number; u: MotionValue<number>; onEmpty: (empty: boolean) => void; children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(1);
  const [live, setLive] = useState(false);
  const report = useRef(onEmpty);
  useEffect(() => {
    report.current = onEmpty;
  });

  // Shrink a scene that is taller than the arch's opening so nothing hides behind the frame.
  useEffect(() => {
    const el = inner.current;
    const area = box.current;
    if (!el || !area) return;
    const ro = new ResizeObserver(() => {
      const h = el.offsetHeight;
      report.current(h < 4);
      setFit(Math.min(1, area.clientHeight / Math.max(h, 1)));
    });
    ro.observe(el);
    ro.observe(area);
    return () => ro.disconnect();
  }, []);

  const s = useTransform(u, (v) => (index < 0 ? -9 : v - index));
  const scale = useTransform(s, [-0.35, 0, 0.6, 1.2], [0.42, 1, 1, 2.1]);
  const opacity = useTransform(s, [-0.35, -0.08, 0.68, 1.08], [0, 1, 1, 0]);
  const blur = useTransform(s, [-0.35, -0.05, 0.7, 1.15], ["blur(3px)", "blur(0px)", "blur(0px)", "blur(4px)"]);
  // A gold arch you pass under on the way to the next scene.
  const archScale = useTransform(s, [0.55, 1.25], [1, 2.6]);
  const archOpacity = useTransform(s, [0.5, 0.7, 1.2], [0, 0.55, 0]);
  useMotionValueEvent(s, "change", (v) => setLive(v > -0.12 && v < 0.75));

  return (
    <div ref={box} className="absolute inset-x-0 top-[17%] bottom-[20%] flex items-center justify-center" style={{ pointerEvents: live ? "auto" : "none", visibility: index < 0 ? "hidden" : undefined }}>
      <motion.svg viewBox="0 -1 100 131" className="pointer-events-none absolute w-[86%]" style={{ scale: archScale, opacity: archOpacity }} aria-hidden>
        <path d={`M0.5,130 L0.5,20 ${CUSP} L99.5,130`} fill="none" stroke={c.gold} strokeWidth={0.6} />
      </motion.svg>
      <motion.div className="w-full" style={{ scale, opacity, filter: blur }}>
        <div ref={inner} style={{ transform: `scale(${fit})` }}>
          <SceneContext.Provider value={s}>{children}</SceneContext.Provider>
        </div>
      </motion.div>
    </div>
  );
}

/* ───────── The invitation: each name with their parents above it ───────── */

function Blessing({ invite }: { invite: Invite }) {
  const [a, b] = couple(invite);
  const person = (p: typeof a) => (
    <div>
      {p.parents && (
        <p className="mx-auto max-w-[62cqw] text-[3.2cqw] leading-snug font-semibold" style={{ color: c.name }}>
          {p.parents}
        </p>
      )}
      <p className="inv-script mt-[1.5cqw] text-[12.5cqw] leading-[0.95]" style={{ color: c.name }}>
        {p.full || p.first}
      </p>
    </div>
  );
  return (
    <section className="px-[13cqw] text-center">
      <p className="inv-label text-[2.6cqw] leading-relaxed" style={{ color: c.gold }}>
        {invite.hosts || "Together with their families"}
      </p>
      <p className="inv-serif mt-[2.5cqw] text-[4.4cqw] leading-snug" style={{ color: c.ink }}>
        {invite.message}
      </p>
      <Divider className="my-[5cqw]" />
      {person(a)}
      <p className="my-[2.5cqw] text-[7.5cqw] leading-none" style={{ color: c.ink, fontFamily: HAND }}>
        and
      </p>
      {person(b)}
    </section>
  );
}

/* ───────── Functions: a row of arch cards to swipe through ───────── */

function Events({ invite }: { invite: Invite }) {
  const [at, setAt] = useState(0);
  const row = useRef<HTMLDivElement>(null);
  const go = (i: number) => row.current?.scrollTo({ left: i * row.current.clientWidth, behavior: "smooth" });
  const many = invite.events.length > 1;
  return (
    <section>
      <div className="px-[12cqw]">
        <Title kicker="Mark your calendar">On the following events</Title>
      </div>
      <div
        ref={row}
        onScroll={(e) => setAt(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        className="mt-[5cqw] flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {invite.events.map((e, i) => (
          <div key={e.name + i} className="w-full shrink-0 snap-center px-[14cqw]">
            <ArchCard>
              <div className="-mt-[8cqw] px-[5cqw] pb-[5cqw] text-center">
                <p className="inv-label text-[2.4cqw]" style={{ color: c.gold }}>
                  {many ? `${i + 1} of ${invite.events.length}` : " "}
                </p>
                <h3 className="inv-script mt-[1.5cqw] text-[8.5cqw] leading-none" style={{ color: c.name }}>
                  {e.name}
                </h3>
                <p className="inv-label mt-[2.5cqw] text-[2.5cqw]" style={{ color: c.ink }}>
                  {weekday(e.start)} · {fmtDate(e.start, { day: "numeric", month: "short", year: "numeric" })}
                </p>
                <p className="inv-serif mt-[1cqw] text-[4cqw] italic" style={{ color: c.soft }}>
                  {time(e.start)} onwards
                </p>
                <p className="inv-serif mt-[2.5cqw] text-[4.4cqw] leading-tight" style={{ color: c.ink }}>
                  {e.venue}
                </p>
                {e.address && (
                  <p className="mt-[1cqw] text-[3cqw]" style={{ color: c.soft }}>
                    {e.address}
                  </p>
                )}
                {(e.dress || e.note) && (
                  <p className="inv-serif mt-[1.5cqw] text-[3.6cqw] italic" style={{ color: c.name }}>
                    {[e.dress && `Dress: ${e.dress}`, e.note].filter(Boolean).join(" · ")}
                  </p>
                )}
                <EventActions event={e} invite={invite} theme={mandir} />
              </div>
            </ArchCard>
          </div>
        ))}
      </div>
      {many && (
        <div className="mt-[4cqw] flex items-center justify-center gap-[3cqw]">
          <button type="button" onClick={() => go(Math.max(0, at - 1))} disabled={at === 0} aria-label="Previous function" className="grid size-[8cqw] place-items-center rounded-full border disabled:opacity-30" style={{ borderColor: c.gold, color: c.name }}>
            ‹
          </button>
          <div className="flex gap-[1.5cqw]">
            {invite.events.map((e, i) => (
              <button key={e.name + i} type="button" onClick={() => go(i)} aria-label={`Show ${e.name}`} className="h-[1.6cqw] rounded-full transition-all" style={{ width: i === at ? "5cqw" : "1.6cqw", background: i === at ? c.name : `${c.gold}88` }} />
            ))}
          </div>
          <button type="button" onClick={() => go(Math.min(invite.events.length - 1, at + 1))} disabled={at === invite.events.length - 1} aria-label="Next function" className="grid size-[8cqw] place-items-center rounded-full border disabled:opacity-30" style={{ borderColor: c.gold, color: c.name }}>
            ›
          </button>
        </div>
      )}
    </section>
  );
}

/* ───────── Photos: an arc that gathers as the scene arrives ───────── */

function ArcPhoto({ src, i, n, p, onOpen }: { src: string; i: number; n: number; p: MotionValue<number>; onOpen: () => void }) {
  const angle = n > 1 ? -70 + (140 * i) / (n - 1) : 0;
  const r = 31;
  const rad = (angle * Math.PI) / 180;
  const x = useTransform(p, [0, 1], ["0cqw", `${(Math.sin(rad) * r).toFixed(1)}cqw`]);
  const y = useTransform(p, [0, 1], ["10cqw", `${(-Math.cos(rad) * r).toFixed(1)}cqw`]);
  const rotate = useTransform(p, [0, 1], [(i % 2 ? 1 : -1) * 6, angle * 0.4]);
  const scale = useTransform(p, [0, 1], [0.7, 1]);
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      aria-label={`Open photo ${i + 1}`}
      className="absolute top-1/2 left-1/2 -mt-[9.5cqw] -ml-[9.5cqw] size-[19cqw] overflow-hidden rounded-[2.5cqw] border-[0.9cqw] border-white shadow-[0_10px_24px_-10px_rgba(60,25,10,.55)]"
      style={{ x, y, rotate, scale, zIndex: i }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="h-full w-full object-cover" />
    </motion.button>
  );
}

function Moments({ invite }: { invite: Invite }) {
  const photos = (invite.gallery ?? []).slice(0, 7);
  const s = useContext(SceneContext);
  const fallback = useRef<HTMLDivElement>(null);
  const own = useScroll({ target: s ? undefined : fallback, offset: ["start end", "center center"] }).scrollYProgress;
  const gather = useTransform(s ?? own, s ? [-0.3, 0.25] : [0, 1], [0, 1]);
  const [open, setOpen] = useState<number | null>(null);
  if (!photos.length) return null;
  return (
    <section className="px-[11cqw]">
      <Title kicker="Our moments">Before the big day</Title>
      <div ref={fallback} className="relative h-[72cqw] w-full">
        <div className="absolute inset-x-0 top-[62%]">
          {photos.map((src, i) => (
            <ArcPhoto key={src + i} src={src} i={i} n={photos.length} p={gather} onOpen={() => setOpen(i)} />
          ))}
        </div>
        <p className="inv-script absolute inset-x-0 top-[66%] text-center text-[7.5cqw] leading-[1.1]" style={{ color: c.ink }}>
          Almost time
          <br />
          to celebrate
        </p>
      </div>
      <AnimatePresence>
        {open !== null && (
          <motion.div className="fixed inset-0 z-[70] grid place-items-center bg-black/85 p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(null)} role="dialog" aria-label="Photo">
            <motion.img src={photos[open]} alt="" className="max-h-[85svh] max-w-full rounded-lg" initial={{ scale: 0.92 }} animate={{ scale: 1 }} />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ───────── The last scene ───────── */

function Closing({ invite }: { invite: Invite }) {
  const [a, b] = couple(invite);
  return (
    <section className="px-[13cqw] text-center">
      <Divider />
      <p className="inv-serif mt-[5cqw] text-[5cqw] leading-snug italic" style={{ color: c.ink }}>
        {invite.closing}
      </p>
      <p className="inv-script mt-[4cqw] text-[11cqw] leading-none" style={{ color: c.name }}>
        {a.first} &amp; {b.first}
      </p>
      {invite.hashtag && (
        <p className="inv-label mt-[3cqw] text-[2.8cqw]" style={{ color: c.gold }}>
          {invite.hashtag}
        </p>
      )}
      <Link href="/" className="inv-label mt-[8cqw] inline-block text-[2.2cqw] opacity-60" style={{ color: c.ink }}>
        Crafted with love by {site.name}
      </Link>
    </section>
  );
}

export const mandir: InviteTheme = {
  ...base,
  id: "mandir",
  vars: { ...base.vars, "--inv-accent": c.name } as CSSProperties,
  accent: c.name,
  ui: { ...base.ui, section: "relative px-[12cqw] py-[2cqw]" },
  Hero,
  Blessing,
  Events,
  Gallery: Moments,
  Closing,
  Frame: undefined,
  Stage,
  Divider,
  Title,
};
