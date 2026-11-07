"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { shows } from "@/config/customise";
import { site } from "@/config/site";
import type { Invite, InviteEvent } from "@/data/invites";
import { fmtDate } from "@/lib/format";
import { INVITE_ART_SIZES, PREVIEW_ART_SIZES, useOpened, usePreview } from "./opened";
import { couple, EventActions, Reveal } from "./shared";
import type { InviteTheme, OpeningProps } from "./types";

/**
 * Sarovar: an Anand Karaj in ivory, crimson and gold. Guests tap a gold solitaire holding the
 * couple's initials; the ring opens onto the couple at the edge of a Gurudwara's sarovar at
 * sunset. Then the Mool Mantar and a shabad, the families, every function with its own painting
 * and timed programme, the Four Laavan with their meaning on deep maroon, and the families'
 * invitation. Art: public/art/illus/sarovar-*.
 */

const art = "/art/illus";
const c = {
  paper: "#faf7f1",
  ink: "#3a1d20",
  maroon: "#8a1c2b",
  deep: "#5c0f1c",
  gold: "#b0873a",
  soft: "#6b4a4c",
  line: "#dcc2c4",
};
const GURMUKHI = "var(--font-gurmukhi), sans-serif";
const ease = [0.22, 1, 0.36, 1] as const;

const ist = (iso: string, o: Intl.DateTimeFormatOptions) => fmtDate(iso, o);
const two = (n: string) => n.padStart(2, "0");

function Art({ src, alt = "", priority, className = "object-cover" }: { src: string; alt?: string; priority?: boolean; className?: string }) {
  const preview = usePreview();
  return <Image src={src} alt={alt} fill priority={priority && !preview} sizes={preview ? PREVIEW_ART_SIZES : INVITE_ART_SIZES} className={className} />;
}

/** Two interlocked rings, one crimson and one silver with a small diamond: the design's divider. */
function Rings({ light }: { light?: boolean }) {
  return (
    <svg viewBox="0 0 44 30" className="w-[9cqw]" fill="none" aria-hidden>
      <circle cx="16" cy="18" r="9" stroke={light ? "#f3dfe0" : c.maroon} strokeWidth="2" />
      <circle cx="28" cy="18" r="9" stroke={light ? "#d9d6d2" : "#b9b5b0"} strokeWidth="2" />
      <path d="M28 4.5l2.6 2.6L28 9.7l-2.6-2.6z" stroke={light ? "#d9d6d2" : "#b9b5b0"} strokeWidth="1.2" />
    </svg>
  );
}

function Divider({ className, light }: { className?: string; light?: boolean }) {
  const line = light ? "rgba(255,240,240,.35)" : c.line;
  return (
    <div className={`flex items-center justify-center gap-[3cqw] ${className ?? "my-[8cqw]"}`}>
      <span className="h-px w-[18cqw]" style={{ background: line }} />
      <Rings light={light} />
      <span className="h-px w-[18cqw]" style={{ background: line }} />
    </div>
  );
}

function Title({ kicker, children }: { kicker?: string; children: ReactNode }) {
  return (
    <div className="text-center">
      {kicker && <p className="inv-label text-[2.9cqw] tracking-[0.3em] uppercase" style={{ color: c.maroon }}>{kicker}</p>}
      <h2 className="inv-script mt-[1cqw] text-[12cqw] leading-[1.15]" style={{ color: c.maroon }}>
        {children}
      </h2>
    </div>
  );
}

/* ───────── Opening: the ring ───────── */

function Opening({ invite, opened, onOpen }: OpeningProps) {
  const [a, b] = couple(invite);
  const d = invite.date;
  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center text-center [perspective:220cqw]"
      style={{ background: `radial-gradient(90% 60% at 50% 50%, #fffdf9, ${c.paper} 70%, #f1ebe2)`, color: c.maroon }}
      animate={opened ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 0.6, delay: opened ? 1.2 : 0, ease }}
    >
      <span className="absolute inset-x-0 top-[2%] h-px" style={{ background: c.line }} />
      <span className="absolute inset-x-0 bottom-[2%] h-px" style={{ background: c.line }} />
      <motion.p className="inv-label text-[3.2cqw] tracking-[0.35em] uppercase" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }}>
        Save the date
      </motion.p>
      <motion.p className="inv-script mt-[2cqw] text-[13cqw] leading-tight" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.4 }}>
        Wedding Invitation
      </motion.p>
      <motion.button
        type="button"
        onClick={onOpen}
        aria-label="Open the invitation"
        className="relative mt-[6cqw] aspect-square w-[74cqw] [transform-style:preserve-3d]"
        initial={{ opacity: 0, scale: 0.9 }}
        // Before it opens the ring turns slowly on its axis; tapped, it spins twice and you pass through it.
        animate={opened ? { rotateY: [0, 720, 720], scale: [1, 1.05, 3.2], opacity: [1, 1, 0] } : { opacity: 1, scale: 1, rotateY: [-18, 18, -18] }}
        transition={
          opened
            ? { duration: 1.8, times: [0, 0.62, 1], ease: "easeInOut" }
            : { opacity: { duration: 1, delay: 0.6 }, scale: { duration: 1, delay: 0.6 }, rotateY: { duration: 5, repeat: Infinity, ease: "easeInOut" } }
        }
      >
        <Art src={`${art}/sarovar-ring.webp`} alt="A gold solitaire ring" priority className="object-contain" />
        {/* The couple's initials and date sit inside the band. */}
        <span className="absolute top-[58.5%] left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
          <span className="h-px w-[16cqw]" style={{ background: c.line }} />
          <span className="flex items-center gap-[2.5cqw] py-[2cqw]">
            <span className="inv-label text-[13cqw] leading-none" style={{ color: c.maroon }}>{a.first[0]}</span>
            <span className="inv-script text-[6cqw]" style={{ color: c.soft }}>&amp;</span>
            <span className="inv-label text-[13cqw] leading-none" style={{ color: c.maroon }}>{b.first[0]}</span>
          </span>
          <span className="inv-label text-[3cqw] tracking-[0.3em]" style={{ color: c.soft }}>
            {two(ist(d, { day: "numeric" }))} · {two(ist(d, { month: "numeric" }))} · {ist(d, { year: "2-digit" })}
          </span>
          <span className="mt-[2cqw] h-px w-[16cqw]" style={{ background: c.line }} />
        </span>
      </motion.button>
      <motion.p
        className="inv-label mt-[8cqw] text-[3.2cqw] tracking-[0.3em]"
        style={{ color: "#b4636e" }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2.4, repeat: Infinity }}
      >
        Tap the ring
      </motion.p>
    </motion.div>
  );
}

/* ───────── Cover: the couple at the sarovar ───────── */

function Hero({ invite }: { invite: Invite }) {
  const opened = useOpened();
  const [a, b] = couple(invite);
  const d = invite.date;
  const show = (delay: number) => ({ initial: { opacity: 0, y: 14 }, animate: opened ? { opacity: 1, y: 0 } : {}, transition: { duration: 1, delay, ease } });
  return (
    <section className="relative w-full overflow-hidden" style={{ aspectRatio: "864 / 1536", background: c.paper }}>
      <Art src={`${art}/sarovar-hero.jpg`} alt={`${a.first} and ${b.first} at the edge of a Gurudwara's sarovar at sunset`} priority />
      <div className="absolute inset-x-[12%] top-[3.5%] flex flex-col items-center text-center [text-shadow:0_0_18px_rgba(255,246,236,.9)]">
        <motion.p {...show(0.3)} className="text-[11cqw] leading-none" style={{ color: c.gold, fontFamily: GURMUKHI }}>
          ੴ
        </motion.p>
        {invite.invocation && (
          <motion.p {...show(0.45)} className="mt-[1cqw] text-[3.4cqw] whitespace-pre-line" style={{ color: c.gold, fontFamily: GURMUKHI }}>
            {invite.invocation}
          </motion.p>
        )}
        <motion.h1 {...show(0.7)} className="mt-[3cqw] flex flex-col items-center" style={{ color: c.deep }}>
          <span className="inv-script text-[9.5cqw] leading-[1.05]">{a.full || a.first}</span>
          <span className="inv-serif text-[4.4cqw]">&amp;</span>
          <span className="inv-script text-[9.5cqw] leading-[1.05]">{b.full || b.first}</span>
        </motion.h1>
        <motion.p {...show(1)} className="inv-label mt-[2cqw] flex items-center gap-[3cqw] text-[4.4cqw] font-semibold tracking-[0.12em]" style={{ color: c.deep }}>
          <span className="h-px w-[6cqw]" style={{ background: c.maroon }} />
          {two(ist(d, { day: "numeric" }))} · {two(ist(d, { month: "numeric" }))} · {ist(d, { year: "numeric" })}
          <span className="h-px w-[6cqw]" style={{ background: c.maroon }} />
        </motion.p>
        <motion.p {...show(1.15)} className="inv-serif mt-[1cqw] text-[3.8cqw] font-medium italic" style={{ color: c.ink }}>
          {invite.city}
        </motion.p>
      </div>
      <motion.p {...show(1.6)} className="inv-label absolute bottom-[2.5%] left-1/2 -translate-x-1/2 text-[2.6cqw] tracking-[0.3em] text-white [text-shadow:0_1px_8px_rgba(0,0,0,.5)]">
        Scroll
      </motion.p>
    </section>
  );
}

/* ───────── Blessing and the families ───────── */

// Printed on Anand Karaj cards: the Guru arranges the wedding and completes it.
const SHABAD = ["ਸਤਿਗੁਰ ਦਾਤੇ ਕਾਜ ਰਚਾਇਆ ਆਪਣੀ ਮੇਹਰ ਕਰਾਈ ॥", "ਦਾਸਾਂ ਕਾਰਜ ਆਪ ਸਵਾਰੇ ਇਹ ਉਸਦੀ ਵਡਿਆਈ ॥"];

function Blessing({ invite }: { invite: Invite }) {
  const [a, b] = couple(invite);
  const elders = a.elders || b.elders;
  const person = (p: typeof a) => (
    <>
      <p className="inv-script text-[12cqw] leading-[1.1]" style={{ color: c.deep }}>
        {p.full || p.first}
      </p>
      {p.parents && (
        <p className="inv-serif mt-[1cqw] text-[3.8cqw] whitespace-pre-line italic" style={{ color: c.soft }}>
          {p.parents}
        </p>
      )}
    </>
  );
  return (
    <section className="relative px-[8cqw] pt-[14cqw] text-center">
      <Reveal>
        <p className="text-[6.4cqw]" style={{ color: c.maroon, fontFamily: GURMUKHI }}>
          ੴ ਸਤਿਗੁਰ ਪ੍ਰਸਾਦਿ
        </p>
        <div className="mt-[4cqw] space-y-[1cqw] text-[4cqw]" style={{ color: c.maroon, fontFamily: GURMUKHI }}>
          {SHABAD.map((l) => (
            <p key={l}>{l}</p>
          ))}
        </div>
      </Reveal>
      {elders && (
        <Reveal>
          <p className="inv-label mt-[9cqw] text-[2.8cqw] tracking-[0.3em] uppercase" style={{ color: c.maroon }}>
            With the blessings of
          </p>
          <p className="inv-serif mt-[3cqw] text-[4.6cqw] whitespace-pre-line italic" style={{ color: c.ink }}>
            {elders}
          </p>
        </Reveal>
      )}
      <Divider />
      <Reveal>
        <p className="inv-label text-[4.2cqw] tracking-[0.06em]" style={{ color: c.maroon }}>
          {invite.hosts}
        </p>
        <p className="inv-serif mt-[2cqw] text-[4.4cqw] leading-snug" style={{ color: c.ink }}>
          {invite.message}
        </p>
      </Reveal>
      <Divider />
      <Reveal>
        {person(a)}
        <p className="inv-label my-[4cqw] text-[2.8cqw] tracking-[0.35em] uppercase" style={{ color: c.ink }}>
          with
        </p>
        {person(b)}
      </Reveal>
    </section>
  );
}

/* ───────── The programme ───────── */

// The painting for a function, by its name first and its kind second.
const VIGNETTES: [RegExp, string][] = [
  [/arambh|palki|parkash|prakash|aagman/i, "palki"],
  [/akhand|path|sehaj|bhog|kirtan|ardas/i, "path"],
  [/jaggo|jago/i, "jaggo"],
  [/anand karaj|laav|phere|wedding ceremony|^wedding$/i, "anandkaraj"],
  [/reception|party|dinner|cocktail|walima/i, "reception"],
  [/mehndi|mehendi|sangeet|ladies|giddha|haldi|vatna|maiyan|chunni|shagun|roka|choora|chura/i, "mehndi"],
];
const BY_KIND: Record<string, string> = { phere: "anandkaraj", reception: "reception", mehndi: "mehndi", sangeet: "mehndi", haldi: "mehndi" };
const vignetteOf = (e: InviteEvent) => VIGNETTES.find(([re]) => re.test(e.name))?.[1] ?? BY_KIND[e.kind];

// A function's note may list its own timings, one per line: "8:30 AM Sehra Bandi at our residence".
const TIMED = /^\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm|a\.m\.|p\.m\.|noon))\s*[-–:·]?\s*(.+)$/i;
function splitNote(note?: string) {
  const lines = (note ?? "").split("\n").map((l) => l.trim()).filter(Boolean);
  return { schedule: lines.filter((l) => TIMED.test(l)).map((l) => l.match(TIMED)!.slice(1, 3)), rest: lines.filter((l) => !TIMED.test(l)) };
}
const clock = (iso: string) => ist(iso, { hour: "numeric", minute: "2-digit", hour12: true }).toUpperCase();

function Pin() {
  return (
    <svg viewBox="0 0 24 24" className="mt-[0.6cqw] size-[4cqw] shrink-0" fill="#b4636e" aria-hidden>
      <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
    </svg>
  );
}

// Velvet folds for the curtains that part over each function's painting.
const VELVET = `repeating-linear-gradient(90deg, #5e0d1a 0, #9a1d31 2.2cqw, #74111f 3.6cqw, #5e0d1a 5cqw)`;

function Curtained({ src }: { src: string }) {
  const side = (left: boolean) => (
    <motion.span
      className="absolute inset-y-0 block w-1/2 shadow-[inset_0_-1.5cqw_0_#b0873a]"
      style={{ [left ? "left" : "right"]: 0, background: VELVET, transformOrigin: left ? "left top" : "right top" } as CSSProperties}
      variants={{ shut: { x: "0%", scaleX: 1 }, open: { x: left ? "-78%" : "78%", scaleX: 0.55 } }}
      transition={{ duration: 1.6, delay: 0.25, ease }}
    />
  );
  return (
    // The wrapper is what's watched, so the curtains start opening as the painting scrolls in.
    <motion.div
      className="relative mx-auto aspect-[4/5] w-[56cqw] overflow-hidden rounded-[50%] border-[0.6cqw] shadow-[0_2cqw_6cqw_-3cqw_rgba(90,20,30,.35)]"
      style={{ borderColor: c.gold }}
      initial="shut"
      whileInView="open"
      viewport={{ once: true, amount: 0.55 }}
    >
      <Art src={src} alt="" />
      {side(true)}
      {side(false)}
    </motion.div>
  );
}

/** The curtain's pull cord down the side of a function, with its tassel, pulled as the curtains open. */
function Cord() {
  return (
    <motion.div
      className="pointer-events-none absolute top-0 left-[5cqw] flex flex-col items-center"
      initial={{ y: "-6cqw" }}
      whileInView={{ y: "0cqw" }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 1.4, delay: 0.2, ease }}
      aria-hidden
    >
      <span className="block h-[62cqw] w-[1.1cqw] rounded-full" style={{ background: "repeating-linear-gradient(160deg, #8a1c2b 0 1.2cqw, #b3243a 1.2cqw 2.2cqw)" }} />
      <span className="block h-[2cqw] w-[2.6cqw] rounded-t-full" style={{ background: c.gold }} />
      <span className="block h-[7cqw] w-[4cqw]" style={{ background: "repeating-linear-gradient(90deg, #8a1c2b 0 0.6cqw, #b3243a 0.6cqw 1cqw)", clipPath: "polygon(15% 0, 85% 0, 100% 100%, 0 100%)" }} />
    </motion.div>
  );
}

function Event({ e, invite, n }: { e: InviteEvent; invite: Invite; n: number }) {
  const v = vignetteOf(e);
  const { schedule, rest } = splitNote(e.note);
  return (
    <div className="relative overflow-hidden border-t px-[8cqw] py-[12cqw] text-center" style={{ borderColor: c.line }}>
      <Cord />
      <span className="inv-script pointer-events-none absolute top-[18cqw] right-[3cqw] text-[40cqw] leading-none opacity-[0.06]" style={{ color: c.maroon }} aria-hidden>
        {n}
      </span>
      <Reveal>
        {v ? <Curtained src={`${art}/sarovar-${v}.jpg`} /> : <Rings />}
        <p className="inv-label mt-[6cqw] text-[3.2cqw] tracking-[0.25em] uppercase" style={{ color: c.maroon }}>
          {ist(e.start, { weekday: "long" })} {ist(e.start, { day: "numeric" })} {ist(e.start, { month: "long" })} {ist(e.start, { year: "numeric" })}
        </p>
        <h3 className="inv-script mt-[1cqw] text-[12cqw] leading-[1.12]" style={{ color: c.deep }}>
          {e.name}
        </h3>
        <p className="inv-serif mt-[3cqw] text-[4.6cqw] font-semibold" style={{ color: c.deep }}>
          {clock(e.start)}
        </p>
        {schedule.length > 0 && (
          <div className="mx-auto mt-[2cqw] grid w-fit grid-cols-[auto_1fr] gap-x-[3cqw] gap-y-[1.5cqw] text-left">
            {schedule.map(([t, what], i) => (
              <p key={i} className="contents">
                <span className="inv-serif text-right text-[4.2cqw] font-semibold" style={{ color: c.deep }}>
                  {t.toUpperCase()}
                </span>
                <span className="inv-serif text-[4.2cqw]" style={{ color: c.ink }}>
                  {what}
                </span>
              </p>
            ))}
          </div>
        )}
        <p className="inv-serif mx-auto mt-[4cqw] flex max-w-[68cqw] justify-center gap-[3cqw] text-[4.2cqw] italic" style={{ color: c.soft }}>
          <Pin />
          <span>
            {e.venue}
            {e.address && (
              <>
                , <br />
                {e.address}
              </>
            )}
          </span>
        </p>
        {(e.dress || rest.length > 0) && (
          <p className="inv-label mx-auto mt-[4cqw] max-w-[62cqw] text-[3cqw] leading-relaxed tracking-[0.14em] uppercase" style={{ color: c.maroon }}>
            {[...rest, e.dress && `Dress: ${e.dress}`].filter(Boolean).join(" · ")}
          </p>
        )}
        <EventActions event={e} invite={invite} theme={sarovar} />
      </Reveal>
    </div>
  );
}

function Events({ invite }: { invite: Invite }) {
  return (
    <section className="relative pt-[10cqw]">
      <Reveal>
        <Divider className="mb-[6cqw]" />
        <Title kicker="Celebrations">Wedding Programme</Title>
      </Reveal>
      <div className="mt-[6cqw]">
        {invite.events.map((e, i) => (
          <Event key={e.name + i} e={e} invite={invite} n={i + 1} />
        ))}
      </div>
    </section>
  );
}

/* ───────── The Four Laavan ───────── */

// Guru Ram Das Ji, Raag Suhi, Mahalla 4: the opening line of each laav, with its meaning in our words.
const LAAVAN = [
  { n: "First", line: "ਹਰਿ ਪਹਿਲੜੀ ਲਾਵ ਪਰਵਿਰਤੀ ਕਰਮ ਦ੍ਰਿੜਾਇਆ ਬਲਿ ਰਾਮ ਜੀਉ ॥", meaning: "The first round sets the couple on a life of honest work and duty, rooted in the Guru's word." },
  { n: "Second", line: "ਹਰਿ ਦੂਜੜੀ ਲਾਵ ਸਤਿਗੁਰੁ ਪੁਰਖੁ ਮਿਲਾਇਆ ਬਲਿ ਰਾਮ ਜੀਉ ॥", meaning: "The second round brings them to the True Guru, letting go of fear and ego." },
  { n: "Third", line: "ਹਰਿ ਤੀਜੜੀ ਲਾਵ ਮਨਿ ਚਾਉ ਭਇਆ ਬੈਰਾਗੀਆ ਬਲਿ ਰਾਮ ਜੀਉ ॥", meaning: "The third round fills their hearts with longing for the Divine, in the company of the holy." },
  { n: "Fourth", line: "ਹਰਿ ਚਉਥੜੀ ਲਾਵ ਮਨਿ ਸਹਜੁ ਭਇਆ ਹਰਿ ਪਾਇਆ ਬਲਿ ਰਾਮ ਜੀਉ ॥", meaning: "The fourth round brings peace and union: two souls become one light." },
];

function Laavan() {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((en) => en.isIntersecting && setActive(Number((en.target as HTMLElement).dataset.i))), { rootMargin: "-45% 0px -45% 0px" });
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);
  return (
    <section className="relative pt-[14cqw] pb-[8cqw] text-center text-white" style={{ background: `linear-gradient(180deg, ${c.maroon}, ${c.deep})` }}>
      <Reveal>
        <p className="inv-label text-[2.9cqw] tracking-[0.35em] uppercase opacity-90">The Four Laavan</p>
        <h2 className="inv-script mt-[1cqw] text-[14cqw] leading-tight">Anand Karaj</h2>
        <p className="inv-serif mx-auto mt-[2cqw] max-w-[78cqw] text-[4cqw] opacity-90">The sacred Sikh wedding: four rounds around Sri Guru Granth Sahib Ji.</p>
      </Reveal>
      {/* The tabs stay in reach while the laavan scroll past. */}
      <div className="sticky top-[3cqw] z-10 mx-auto mt-[6cqw] flex w-fit gap-[3cqw] rounded-full bg-black/25 px-[4cqw] py-[2cqw] backdrop-blur-sm">
        {LAAVAN.map((l, i) => (
          <button
            key={l.n}
            type="button"
            onClick={() => refs.current[i]?.scrollIntoView({ behavior: "smooth", block: "center" })}
            className={`inv-serif grid size-[9cqw] place-items-center rounded-full border text-[4cqw] transition ${active === i ? "border-white border-2" : "border-white/40"}`}
            aria-label={`${l.n} laav`}
          >
            {i + 1}
          </button>
        ))}
      </div>
      {LAAVAN.map((l, i) => (
        <div key={l.n} ref={(el) => void (refs.current[i] = el)} data-i={i} className="border-t border-white/15 px-[6cqw] py-[10cqw] first:mt-[6cqw]">
          <p className="inv-label flex items-center justify-center gap-[3cqw] text-[3.2cqw] tracking-[0.3em] uppercase">
            <span className="inv-serif grid size-[8cqw] place-items-center rounded-full border border-white/50 text-[3.6cqw] tracking-normal">{i + 1}</span>
            {l.n} Laav
          </p>
          <p className="mt-[4cqw] text-[4.4cqw] leading-relaxed" style={{ fontFamily: GURMUKHI }}>
            {l.line}
          </p>
          <p className="inv-serif mx-auto mt-[3cqw] max-w-[80cqw] text-[3.9cqw] italic opacity-85">{l.meaning}</p>
        </div>
      ))}
      <p className="inv-serif mt-[2cqw] text-[3.2cqw] opacity-75">Guru Ram Das Ji · Raag Suhi, Mahalla 4</p>
    </section>
  );
}

/* ───────── Closing: the families' invitation ───────── */

function Closing({ invite }: { invite: Invite }) {
  const [a, b] = couple(invite);
  return (
    <>
      {shows(invite, "laavan") && <Laavan />}
      <section className="relative overflow-hidden px-[6cqw] pt-[16cqw] pb-[24cqw] text-center text-white" style={{ background: `radial-gradient(120% 80% at 30% 20%, #8e2b35, ${c.deep} 60%, #3d0a13)` }}>
        <Reveal>
          <p className="inv-label text-[2.9cqw] tracking-[0.35em] uppercase opacity-85">Cordially invited by</p>
          <p className="inv-script mt-[3cqw] text-[10cqw] leading-[1.15] whitespace-pre-line">{invite.hosts}</p>
          {invite.closing && <p className="inv-serif mx-auto mt-[6cqw] max-w-[80cqw] text-[4.4cqw]">{invite.closing}</p>}
        </Reveal>
        <Divider light />
        <Reveal>
          <p className="inv-script text-[18cqw] leading-[1]" style={{ color: "#f4ebe6" }}>
            {a.first}
          </p>
          <motion.svg viewBox="0 0 24 22" className="mx-auto my-[2cqw] w-[11cqw]" fill="#f4ebe6" animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 1.6, repeat: Infinity }} aria-hidden>
            <path d="M12 21s-9-5.6-9-12.2A5.2 5.2 0 0 1 12 6a5.2 5.2 0 0 1 9 2.8C21 15.4 12 21 12 21z" />
          </motion.svg>
          <p className="inv-script text-[18cqw] leading-[1]" style={{ color: "#f4ebe6" }}>
            {b.first}
          </p>
          {invite.hashtag && <p className="inv-label mt-[5cqw] text-[3cqw] tracking-[0.25em] opacity-80">{invite.hashtag}</p>}
          {!invite.noBranding && (
            <Link href="/" className="inv-label mt-[10cqw] inline-block text-[2.3cqw] tracking-[0.26em] uppercase opacity-60">
              Crafted with love by {site.name}
            </Link>
          )}
        </Reveal>
      </section>
    </>
  );
}

function Backdrop() {
  return <div className="pointer-events-none absolute inset-0" style={{ background: c.paper }} />;
}

export const sarovar: InviteTheme = {
  id: "sarovar",
  root: "",
  vars: {
    "--inv-script": "var(--font-dancing), cursive",
    "--inv-serif": "var(--font-cormorant), serif",
    "--inv-label": "var(--font-cinzel), serif",
    "--inv-accent": c.maroon,
    background: c.paper,
    color: c.ink,
  } as CSSProperties,
  accent: c.maroon,
  ui: {
    section: "relative px-[10cqw] py-[12cqw]",
    card: "rounded-[2cqw] border border-[#dcc2c4] bg-white",
    input: "w-full rounded-[2cqw] border border-[#dcc2c4] bg-white px-[4cqw] py-[3cqw] text-[3.8cqw] outline-none",
    chip: "rounded-full border border-[#dcc2c4] bg-white transition",
    chipOn: "rounded-full border border-transparent font-semibold text-white transition [background:var(--inv-accent)]",
    button: "inv-label inline-flex items-center gap-[1.5cqw] rounded-full border border-[#8a1c2b] px-[4.5cqw] py-[2.4cqw] text-[3cqw] tracking-[0.14em] uppercase active:scale-95 transition text-[#8a1c2b]",
    ghost: "inv-label inline-flex items-center gap-[1.5cqw] rounded-full border border-[#8a1c2b] px-[4.5cqw] py-[2.4cqw] text-[3cqw] tracking-[0.14em] uppercase active:scale-95 transition text-[#8a1c2b]",
    muted: "opacity-80",
    tile: "rounded-[3cqw] border border-[#dcc2c4] bg-white/95",
  },
  Opening,
  Hero,
  Blessing,
  Events,
  Closing,
  Backdrop,
  Divider,
  Title,
  countdownTitle: "Anand Karaj in",
};
