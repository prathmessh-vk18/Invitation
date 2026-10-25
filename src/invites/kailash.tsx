"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, type CSSProperties, type ReactNode } from "react";
import type { Invite, InviteEvent } from "@/data/invites";
import { fmtDate, monthName, time, weekday, yearNum } from "@/lib/format";
import { makeIllustrated } from "./illustrated";
import { useOpened, usePreview } from "./opened";
import { couple, EventActions, Reveal } from "./shared";
import type { InviteTheme } from "./types";

/**
 * Kailash: a gold seal over the clouds opens onto the couple praying at a Shivling before a
 * Himalayan temple. Guests scroll into the scene, which dissolves as the invitation zooms in.
 * Each function then has its own painted scene: arches for most, the mandap for the wedding,
 * a night stage for the reception. Art: public/art/illus/kailash-*.
 */

const art = "/art/illus";
const c = {
  paper: "#f8efe4",
  ink: "#4a1a28",
  rose: "#b2385a",
  gold: "#b8862f",
  soft: "#7a5a50",
};
const HAND = "var(--font-parisienne), cursive";
const ease = [0.22, 1, 0.36, 1] as const;

const base = makeIllustrated({
  id: "kailash",
  images: { opening: `${art}/kailash-seal.jpg`, hero: `${art}/kailash-temple.jpg`, card: `${art}/kailash-arches.jpg` },
  opening: "envelope",
  sealAt: { x: 50, y: 46 },
  heroTextTop: 6,
  frame: { top: 0, bottom: 0, side: 0 },
  colors: { ink: c.ink, accent: c.rose, soft: c.soft, paper: c.paper, onAccent: "#fff" },
  fonts: { script: "var(--font-cormorant), serif", serif: "var(--font-cormorant), serif", label: "var(--font-cinzel), serif" },
});

function Art({ src, alt = "", priority }: { src: string; alt?: string; priority?: boolean }) {
  return <Image src={src} alt={alt} fill priority={priority} sizes="(max-width: 480px) 100vw, 480px" className="object-cover" />;
}

function Divider({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-[2.5cqw] ${className ?? ""}`}>
      <span className="h-px w-[16cqw]" style={{ background: `linear-gradient(to right, transparent, ${c.gold})` }} />
      <svg viewBox="0 0 24 24" className="w-[4.5cqw]" fill="none" stroke={c.gold} strokeWidth={1.4} aria-hidden>
        <path d="M12 3v18M8 6c0 3 1.6 5 4 5s4-2 4-5M8 6V4M16 6V4" />
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
      <h2 className="mt-[1cqw] text-[11cqw] leading-[1.1]" style={{ color: c.rose, fontFamily: HAND }}>
        {children}
      </h2>
      <Divider className="mt-[1.5cqw]" />
    </div>
  );
}

/* ───────── Cover: walking into the temple ───────── */

const showAfterOpen = (opened: boolean) => (delay: number) => ({ initial: { opacity: 0, y: 12 }, animate: opened ? { opacity: 1, y: 0 } : {}, transition: { duration: 1, delay, ease } });

function Names({ invite, show }: { invite: Invite; show: (d: number) => object }) {
  const [a, b] = couple(invite);
  return (
    <div className="relative flex flex-col items-center text-center">
      <div className="absolute -inset-x-[10%] -inset-y-[25%] rounded-[50%] bg-[radial-gradient(closest-side,rgba(255,255,255,.85),rgba(255,255,255,0))]" />
      <motion.p {...show(0.3)} className="relative text-[3.2cqw]" style={{ color: c.ink, fontFamily: "var(--font-deva)" }}>
        {invite.invocation}
      </motion.p>
      <motion.p {...show(0.45)} className="relative mt-[1cqw] text-[9cqw] leading-[1.1]" style={{ color: c.rose, fontFamily: HAND }}>
        Wedding Invitation
      </motion.p>
      <motion.h1 {...show(0.7)} className="inv-script relative mt-[1cqw] text-[10.5cqw] leading-none font-semibold" style={{ color: c.ink }}>
        {a.first} <span style={{ color: c.rose, fontFamily: HAND, fontWeight: 400 }}>&amp;</span> {b.first}
      </motion.h1>
      <motion.p {...show(1)} className="inv-serif relative mt-[1.5cqw] text-[4.6cqw] font-semibold" style={{ color: c.ink }}>
        {weekday(invite.date)}, {fmtDate(invite.date, { day: "numeric" })} {monthName(invite.date)} {yearNum(invite.date)}
      </motion.p>
    </div>
  );
}

function Hero({ invite }: { invite: Invite }) {
  const opened = useOpened();
  if (usePreview()) {
    return (
      <section className="relative h-full w-full overflow-hidden">
        <Art src={`${art}/kailash-temple.jpg`} priority />
        <div className="absolute inset-x-[8%] top-[5%]">
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
  // Step towards the Shivling…
  const scale = useTransform(p, [0, 0.95], [1, 2.2]);
  // …the names rise and fade…
  const nameY = useTransform(p, [0, 0.3], ["0%", "-40%"]);
  const nameOpacity = useTransform(p, [0.03, 0.26], [1, 0]);
  // …and the scene gives way to the invitation.
  const sceneOpacity = useTransform(p, [0.68, 0.98], [1, 0]);
  const cue = useTransform(p, [0, 0.06], [1, 0]);
  return (
    <section ref={ref} className="relative" style={{ height: "210svh" }}>
      <motion.div className="sticky top-0 h-[100svh] w-full overflow-hidden" style={{ opacity: sceneOpacity }}>
        <motion.div className="absolute inset-0" style={{ scale, transformOrigin: "50% 58%" }}>
          <Art src={`${art}/kailash-temple.jpg`} alt={`${a.first} and ${b.first} praying at a Himalayan temple`} priority />
        </motion.div>
        <Mist />
        <motion.div className="absolute inset-x-[6%] top-[5%]" style={{ y: nameY, opacity: nameOpacity }}>
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
      className="pointer-events-none absolute inset-x-[-20%] bottom-0 h-[22%]"
      style={{ background: "radial-gradient(60% 70% at 30% 100%, rgba(255,255,255,.8), transparent 70%), radial-gradient(60% 70% at 75% 100%, rgba(255,255,255,.7), transparent 70%)" }}
      animate={{ x: ["-4%", "4%", "-4%"] }}
      transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

/* ───────── The invitation: zooms in as the walk ends ───────── */

function Blessing({ invite }: { invite: Invite }) {
  const [a, b] = couple(invite);
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 15%"] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.4, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.45], [0, 1]);
  const blur = useTransform(scrollYProgress, [0, 0.7], ["blur(4px)", "blur(0px)"]);
  const person = (p: typeof a) => (
    <div>
      {p.parents && (
        <p className="mx-auto max-w-[66cqw] text-[3.3cqw] leading-snug font-semibold" style={{ color: c.soft }}>
          {p.parents}
        </p>
      )}
      <p className="inv-script mt-[1.5cqw] text-[12.5cqw] leading-[0.95] font-semibold" style={{ color: c.ink }}>
        {p.full || p.first}
      </p>
    </div>
  );
  return (
    <section ref={ref} className="relative z-10 -mt-[55svh] px-[11cqw] pt-[20cqw] pb-[12cqw] text-center">
      <motion.div style={{ scale, opacity, filter: blur, transformOrigin: "50% 30%" }}>
        <p className="text-[9cqw] leading-none" style={{ color: c.gold, fontFamily: "var(--font-deva)" }}>
          ॐ
        </p>
        <p className="mt-[2cqw] text-[3.4cqw]" style={{ color: c.rose, fontFamily: "var(--font-deva)" }}>
          {invite.invocation}
        </p>
        <p className="mt-[3cqw] text-[11cqw] leading-none" style={{ color: c.rose, fontFamily: HAND }}>
          We cordially invite you
        </p>
        <p className="inv-label mt-[4cqw] text-[2.7cqw] leading-relaxed" style={{ color: c.gold }}>
          {invite.hosts || "Together with their families"}
        </p>
        <p className="inv-serif mt-[2.5cqw] text-[4.6cqw] leading-snug italic" style={{ color: c.ink }}>
          {invite.message}
        </p>
        <Divider className="my-[6cqw]" />
        {person(a)}
        <p className="my-[3cqw] text-[9cqw] leading-none" style={{ color: c.rose, fontFamily: HAND }}>
          with
        </p>
        {person(b)}
        {invite.invocationMeaning && (
          <p className="inv-serif mt-[7cqw] text-[3.6cqw] italic" style={{ color: c.soft }}>
            {invite.invocationMeaning}
          </p>
        )}
      </motion.div>
    </section>
  );
}

/* ───────── Functions: a painted scene each ───────── */

const WEDDING = new Set(["phere", "anandkaraj", "muhurtham", "nikah"]);

function sceneFor(e: InviteEvent) {
  if (WEDDING.has(e.kind)) return { src: `${art}/kailash-mandap.jpg`, top: "7%", dark: false };
  if (e.kind === "reception") return { src: `${art}/kailash-night.jpg`, top: "17%", dark: true };
  return { src: `${art}/kailash-arches.jpg`, top: "13%", dark: false };
}

function EventScene({ e, invite, i }: { e: InviteEvent; invite: Invite; i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);
  const s = sceneFor(e);
  const ink = s.dark ? "#fbf3e6" : c.ink;
  const accent = s.dark ? "#f1dca8" : c.rose;
  return (
    <div ref={ref} className="relative w-full overflow-hidden" style={{ aspectRatio: "864 / 1536" }}>
      <motion.div className="absolute -inset-y-[5%] inset-x-0" style={{ y }}>
        <Art src={s.src} alt="" />
      </motion.div>
      {!s.dark && <div className="absolute inset-x-0 top-0 h-[55%]" style={{ background: "radial-gradient(70% 60% at 50% 35%, rgba(255,250,244,.7), transparent 75%)" }} />}
      <Mist />
      <motion.div
        className="absolute inset-x-[12%] text-center"
        style={{ top: s.top }}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 1, ease, delay: 0.05 * i }}
      >
        <h3 className="text-[12cqw] leading-[1.05]" style={{ color: accent, fontFamily: HAND }}>
          {e.name}
        </h3>
        {e.note && (
          <p className="inv-serif mt-[1cqw] text-[3.8cqw] italic" style={{ color: ink }}>
            {e.note}
          </p>
        )}
        <p className="inv-label mt-[3cqw] text-[5.2cqw] leading-snug" style={{ color: accent, letterSpacing: "0.08em" }}>
          {weekday(e.start).slice(0, 3)} · {fmtDate(e.start, { day: "numeric", month: "short", year: "numeric" })}
          <br />
          {time(e.start)}
        </p>
        <p className="inv-serif mt-[2.5cqw] text-[4.4cqw] leading-tight font-semibold" style={{ color: ink }}>
          {e.venue}
        </p>
        {e.address && (
          <p className="inv-serif mt-[0.5cqw] text-[3.6cqw]" style={{ color: ink, opacity: 0.85 }}>
            {e.address}
          </p>
        )}
        {e.dress && (
          <p className="inv-serif mt-[1.5cqw] text-[3.6cqw] italic" style={{ color: accent }}>
            Dress: {e.dress}
          </p>
        )}
        <EventActions event={e} invite={invite} theme={kailash} />
      </motion.div>
    </div>
  );
}

function Events({ invite }: { invite: Invite }) {
  return (
    <section className="relative pt-[10cqw]">
      <div className="px-[10cqw] pb-[8cqw]">
        <Reveal>
          <Title kicker="Join us for">The celebrations</Title>
        </Reveal>
      </div>
      {invite.events.map((e, i) => (
        <EventScene key={e.name + i} e={e} invite={invite} i={i} />
      ))}
    </section>
  );
}

function Backdrop() {
  return <div className="pointer-events-none absolute inset-0" style={{ background: `linear-gradient(${c.paper}, #f4e6d6)` }} />;
}

export const kailash: InviteTheme = {
  ...base,
  id: "kailash",
  vars: { ...base.vars, "--inv-accent": c.rose } as CSSProperties,
  accent: c.rose,
  Hero,
  Blessing,
  Events,
  Backdrop,
  Frame: undefined,
  Divider,
  Title,
};
