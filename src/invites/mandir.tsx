"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { site } from "@/config/site";
import type { Invite } from "@/data/invites";
import { useT } from "./i18n";
import { makeIllustrated } from "./illustrated";
import { useOpened, usePreview } from "./opened";
import { couple, EventActions, Reveal } from "./shared";
import type { InviteTheme } from "./types";

/**
 * Mandir: a walk into a temple. Guests open carved doors, then scroll up the carpet towards the
 * temple until it dissolves into a painted arch and the invitation zooms in. From there the arch
 * stays fixed and the rest scrolls inside it, like the other illustrated designs. Art: public/art/illus/mandir-*.
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

// How much of each edge of the arch painting is ornament (%), so content can scroll underneath it.
const FRAME = { top: 16, bottom: 22, side: 6 };

// Doors and seal, and the painted arch as the page backdrop, come from the shared illustrated engine.
const base = makeIllustrated({
  id: "mandir",
  images: { opening: `${art}/mandir-gate.jpg`, hero: `${art}/mandir-temple.jpg`, card: `${art}/mandir-card.jpg` },
  opening: "doors",
  heroTextTop: 8,
  frame: FRAME,
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
  const { t, d, lang } = useT();
  return (
    <div className="flex flex-col items-center text-center [text-shadow:0_0_16px_rgba(255,240,228,.9)]">
      <motion.p {...show(0.3)} className="text-[3.4cqw]" style={{ color: c.name, fontFamily: "var(--font-deva)" }}>
        {invite.invocation}
      </motion.p>
      <motion.h1 {...show(0.6)} className="mt-[3cqw] flex flex-col items-center">
        <span className="inv-script text-[15cqw] leading-[0.95]" style={{ color: c.name }}>
          {a.first}
        </span>
        <span className={`text-[8.5cqw] leading-none ${lang === "hi" ? "my-[2cqw]" : "-my-[1cqw]"}`} style={{ color: c.ink, fontFamily: lang === "hi" ? "var(--inv-script)" : HAND }}>
          {t.weds}
        </span>
        <span className="inv-script text-[15cqw] leading-[0.95]" style={{ color: c.name }}>
          {b.first}
        </span>
      </motion.h1>
      <motion.p {...show(1)} className="inv-label mt-[3cqw] text-[2.6cqw]" style={{ color: c.ink }}>
        {d.weekday(invite.date)} · {d.day(invite.date)} {d.month(invite.date)} {d.year(invite.date)}
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
  const { t } = useT();
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
          aria-label={t.scrollToWalkIn}
        >
          <span className="inv-label text-[2.3cqw]">{t.scrollToWalkIn}</span>
          <svg viewBox="0 0 24 24" className="size-[4cqw]" fill="none" stroke="currentColor" strokeWidth={1.6}>
            <path d="M6 9l6 6 6-6" />
          </svg>
        </motion.button>
      </motion.div>
    </section>
  );
}

/* ───────── The invitation: zooms in as the walk ends ───────── */

function Blessing({ invite }: { invite: Invite }) {
  const [a, b] = couple(invite);
  const ref = useRef<HTMLElement>(null);
  // From far inside the temple to full size, as the walk finishes; ordinary scrolling after that.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 15%"] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.4, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.45], [0, 1]);
  const blur = useTransform(scrollYProgress, [0, 0.7], ["blur(4px)", "blur(0px)"]);
  // In a phone preview there's no walk to rise out of: show it still, at full size.
  const still = usePreview();
  const { t, lang } = useT();
  const person = (p: typeof a) => (
    <div>
      {p.parents && (
        <p className="mx-auto max-w-[62cqw] text-[3.3cqw] leading-snug font-semibold" style={{ color: c.name }}>
          {p.parents}
        </p>
      )}
      <p className="inv-script mt-[2cqw] text-[13.5cqw] leading-[0.95]" style={{ color: c.name }}>
        {p.full || p.first}
      </p>
    </div>
  );
  return (
    // Starts while the walk is still pinned, so it rises out of the dissolving temple.
    <section ref={ref} className={`relative z-10 px-[13cqw] pt-[24cqw] pb-[12cqw] text-center ${still ? "" : "-mt-[55svh]"}`}>
      <motion.div style={still ? undefined : { scale, opacity, filter: blur, transformOrigin: "50% 30%" }}>
        <Divider />
        <p className="inv-label mt-[4cqw] text-[2.7cqw] leading-relaxed" style={{ color: c.gold }}>
          {invite.hosts || t.togetherWithFamilies}
        </p>
        <p className="inv-serif mt-[3cqw] text-[4.6cqw] leading-snug" style={{ color: c.ink }}>
          {invite.message}
        </p>
        <Divider className="my-[6cqw]" />
        {person(a)}
        <p className="my-[3cqw] text-[8cqw] leading-none" style={{ color: c.ink, fontFamily: lang === "hi" ? "var(--inv-script)" : HAND }}>
          {t.and}
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

/* ───────── Functions on arch cards ───────── */

function Events({ invite }: { invite: Invite }) {
  const { t, d } = useT();
  return (
    <section className="relative px-[11cqw] py-[12cqw]">
      <Reveal>
        <Title kicker={t.eventsKicker}>{t.eventsTitle}</Title>
      </Reveal>
      <ol className="mt-[8cqw] space-y-[7cqw]">
        {invite.events.map((e, i) => (
          <motion.li key={e.name + i} initial={{ opacity: 0, y: 30, scale: 0.96 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.9, ease }}>
            <ArchCard>
              <div className="-mt-[9cqw] px-[5cqw] pb-[6cqw] text-center">
                <Sunburst className="mx-auto block w-[16cqw]" />
                <h3 className="inv-script mt-[2cqw] text-[8.5cqw] leading-none" style={{ color: c.name }}>
                  {e.name}
                </h3>
                <p className="inv-label mt-[2.5cqw] text-[2.5cqw]" style={{ color: c.ink }}>
                  {d.weekday(e.start)} · {d.shortMonthDate(e.start)}
                </p>
                <p className="inv-serif mt-[1cqw] text-[4cqw] italic" style={{ color: c.soft }}>
                  {t.onwards(d.time(e.start))}
                </p>
                <p className="inv-serif mt-[3cqw] text-[4.4cqw] leading-tight" style={{ color: c.ink }}>
                  {e.venue}
                </p>
                {e.address && (
                  <p className="mt-[1cqw] text-[3cqw]" style={{ color: c.soft }}>
                    {e.address}
                  </p>
                )}
                {(e.dress || e.note) && (
                  <p className="inv-serif mt-[2cqw] text-[3.6cqw] italic" style={{ color: c.name }}>
                    {[e.dress && t.dress(e.dress), e.note].filter(Boolean).join(" · ")}
                  </p>
                )}
                <EventActions event={e} invite={invite} theme={mandir} />
              </div>
            </ArchCard>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}

/* ───────── Closing ───────── */

function Closing({ invite }: { invite: Invite }) {
  const [a, b] = couple(invite);
  const { t, lang } = useT();
  return (
    <section className="relative px-[13cqw] pt-[10cqw] text-center" style={{ paddingBottom: `calc(${FRAME.bottom}vh + 16cqw)` }}>
      <Reveal>
        <Divider />
        <p className="inv-serif mt-[5cqw] text-[5cqw] leading-snug italic" style={{ color: c.ink }}>
          {invite.closing}
        </p>
        <p className="inv-script mt-[4cqw] text-[11cqw] leading-none" style={{ color: c.name }}>
          {a.first} {lang === "hi" ? t.and : "&"} {b.first}
        </p>
        {invite.hashtag && (
          <p className="inv-label mt-[3cqw] text-[2.8cqw]" style={{ color: c.gold }}>
            {invite.hashtag}
          </p>
        )}
        <Link href="/" className="inv-label mt-[8cqw] inline-block text-[2.2cqw] opacity-60" style={{ color: c.ink }}>
          Crafted with love by {site.name}
        </Link>
      </Reveal>
    </section>
  );
}

/* ───────── The arch frame the invite scrolls inside ───────── */

/** The painted arch's edges above the content, fading in as the temple dissolves at the end of the walk. */
function Frame() {
  const { scrollY } = useScroll();
  const [vh, setVh] = useState(800);
  useEffect(() => {
    const measure = () => setVh(window.innerHeight);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  const opacity = useTransform(scrollY, [vh * 0.8, vh * 1.08], [0, 1]);
  const f = FRAME;
  const soft = 4;
  const mask = [
    `linear-gradient(to bottom, #000 0%, #000 ${f.top}%, transparent ${f.top + soft}%, transparent ${100 - f.bottom - soft}%, #000 ${100 - f.bottom}%, #000 100%)`,
    `linear-gradient(to right, #000 0%, #000 ${f.side}%, transparent ${f.side + soft / 2}%, transparent ${100 - f.side - soft / 2}%, #000 ${100 - f.side}%, #000 100%)`,
  ].join(", ");
  return (
    <motion.div className="absolute inset-0" style={{ opacity }} aria-hidden>
      <div className="absolute inset-x-0 bottom-full h-[50vh]" style={{ background: c.paper }} />
      <div className="absolute inset-0" style={{ WebkitMaskImage: mask, maskImage: mask }}>
        <Image src={`${art}/mandir-card.jpg`} alt="" fill sizes="(max-width: 480px) 100vw, 480px" className="object-cover" />
      </div>
      <div className="absolute inset-x-0 top-full h-[50vh]" style={{ background: c.paper }} />
    </motion.div>
  );
}

export const mandir: InviteTheme = {
  ...base,
  id: "mandir",
  vars: { ...base.vars, "--inv-accent": c.name } as CSSProperties,
  accent: c.name,
  Hero,
  Blessing,
  Events,
  Closing,
  Frame,
  Divider,
  Title,
};
