"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { site } from "@/config/site";
import type { Invite } from "@/data/invites";
import type { TemplateId } from "@/data/templates";
import { dayNum, fmtDate, monthName, time, weekday, yearNum } from "@/lib/format";
import { couple, EventActions, initials, Reveal } from "./shared";
import { useT } from "./i18n";
import { useOpened } from "./opened";
import type { InviteTheme, OpeningProps } from "./types";

/**
 * Builds a template around three painted illustrations:
 *  - `opening`: what guests see before they tap (doors or a sealed envelope)
 *  - `hero`: the couple's scene, with empty sky at the top for names
 *  - `card`: a bordered paper page that frames the rest of the invite
 * Images live in public/art/illus (generated for Aavjoo, see CREDITS.md there).
 */
export type IllustratedSpec = {
  id: TemplateId;
  // `frame` (optional): the card with its plain middle cut out, so the whole ornament, curves
  // and all, sits above the scrolling invite. Without it the frame is the card's straight edges.
  images: { opening: string; hero: string; card: string; frame?: string };
  opening: "doors" | "envelope";
  // Where the wax seal sits in the envelope image, as % of width/height.
  sealAt?: { x: number; y: number };
  // Where the names start in the hero image (top, as % of its height).
  heroTextTop: number;
  heroGlow?: boolean;
  colors: { ink: string; accent: string; soft: string; paper: string; onAccent: string };
  fonts: { script: string; serif: string; label: string };
  nativeInvocation?: string;
  // How much of each edge of the card image is ornament (in %), so the frame can sit above the content.
  frame: { top: number; bottom: number; side: number };
  // Shrinks the script face for wide display fonts (1 = default).
  scriptScale?: number;
  // The couple's own monogram on the seal, in place of their initials.
  sealImage?: string;
  // Only these invites (by link name) get sealImage; everyone else gets their own initials.
  sealImageFor?: string[];
  // Doors only: "You're invited" and the names across the top, like a card's cover.
  openingTitle?: boolean;
  // Where that title sits, as % from the top (default 8).
  openingTitleTop?: number;
  // The frame surrounds the couple's scene too, from the moment the invite opens, instead of
  // fading in once that scene has scrolled past.
  frameOverHero?: boolean;
  // Extra plain paper above the couple's scene, as % of the art's height, for a title that
  // has to clear a frame drawn over the top of the scene.
  heroLead?: number;
  // Doors only: false drops the shadow along the inner edges, for art with its own seam.
  doorShade?: boolean;
};

const ease = [0.22, 1, 0.36, 1] as const;
const ART_RATIO = "864 / 1536";

function Art({ src, alt = "", pos, priority, className, style }: { src: string; alt?: string; pos?: string; priority?: boolean; className?: string; style?: CSSProperties }) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes="(max-width: 480px) 100vw, 480px"
      className={`object-cover ${className ?? ""}`}
      style={{ objectPosition: pos ?? "50% 50%", ...style }}
    />
  );
}

// Outfit paintings shown above a function in the Wardrobe section, for the couples who asked for them.
const wardrobeArt: Record<string, Record<string, string>> = {
  "akshay-weds-vidhi": {
    Myra: "wardrobe-myra",
    "Sagai & Sangeet": "wardrobe-sangeet",
    Nikashi: "wardrobe-traditional",
    Pheras: "wardrobe-traditional",
    Reception: "wardrobe-reception",
  },
  "akshay-weds-vidhi-reception": { Reception: "wardrobe-reception" },
};

function ordinal(iso: string) {
  const d = Number(fmtDate(iso, { day: "numeric" }));
  const s = d % 10 === 1 && d !== 11 ? "st" : d % 10 === 2 && d !== 12 ? "nd" : d % 10 === 3 && d !== 13 ? "rd" : "th";
  return { d, s, m: fmtDate(iso, { month: "short" }) };
}

export function makeIllustrated(spec: IllustratedSpec): InviteTheme {
  const c = spec.colors;
  const k = spec.scriptScale ?? 1;
  const sz = (cqw: number) => ({ fontSize: `${(cqw * k).toFixed(2)}cqw` });

  /* ───────── Opening ───────── */

  function Doors({ invite, opened, onOpen }: OpeningProps) {
    return (
      <div
        className="absolute inset-0 overflow-hidden"
        // Seamless art: paper behind the doors, so no dark hairline shows where the halves meet.
        // When the frame surrounds the couple's scene, the doors open straight onto the page itself
        // (scene, frame and names already in place), so nothing behind them; otherwise a picture of the scene.
        style={{ pointerEvents: opened ? "none" : "auto", perspective: "140cqw", background: spec.frameOverHero ? "transparent" : spec.doorShade === false ? c.paper : "#000" }}
      >
        {!spec.frameOverHero && (
          <motion.div className="absolute inset-0" initial={{ scale: 1.15 }} animate={{ scale: opened ? 1 : 1.15 }} transition={{ duration: 1.6, ease }}>
            <Art src={invite.memorial ? spec.images.card : spec.images.hero} priority />
          </motion.div>
        )}
        <motion.div className="absolute inset-0" animate={{ opacity: opened ? 0 : 1 }} transition={{ delay: opened ? 0.9 : 0, duration: 0.7 }}>
          {(["left", "right"] as const).map((side) => (
            <motion.div
              key={side}
              // A pixel wider than half, so the two doors overlap instead of leaving a gap between them.
              className={`absolute inset-y-0 w-[calc(50%+1px)] overflow-hidden ${side === "left" ? "left-0" : "right-0"}`}
              style={{ transformOrigin: side === "left" ? "left center" : "right center", transformStyle: "preserve-3d" }}
              animate={{ rotateY: opened ? (side === "left" ? -95 : 95) : 0 }}
              transition={{ duration: 1.25, ease: [0.7, 0, 0.3, 1] }}
            >
              <div className="absolute inset-y-0 w-[calc(200%-2px)]" style={{ left: side === "left" ? 0 : "calc(-100% + 2px)" }}>
                <Art src={spec.images.opening} priority />
              </div>
              {spec.doorShade !== false && (
                <div className={`absolute inset-y-0 w-[6%] ${side === "left" ? "right-0 bg-gradient-to-l" : "left-0 bg-gradient-to-r"} from-black/35 to-transparent`} />
              )}
            </motion.div>
          ))}
        </motion.div>
        {invite.tapAnywhere && !opened && (
          // The whole screen opens the invite, not only the seal.
          <button type="button" onClick={onOpen} aria-label="Open invitation" className="absolute inset-0 z-[5] cursor-pointer" />
        )}
        {spec.openingTitle && (
          <motion.div className="pointer-events-none absolute inset-x-0 z-10 text-center" style={{ top: `${spec.openingTitleTop ?? 8}%` }} animate={{ opacity: opened ? 0 : 1, y: opened ? -20 : 0 }} transition={{ duration: 0.4 }}>
            <p className="inv-script text-[11cqw] leading-none" style={{ color: c.ink }}>
              You&rsquo;re invited
            </p>
            <p className="inv-label mt-[2.5cqw] text-[2.7cqw]" style={{ color: c.ink }}>
              {couple(invite)[0].first} &amp; {couple(invite)[1].first}
            </p>
          </motion.div>
        )}
        <Seal invite={invite} opened={opened} onOpen={onOpen} className="top-1/2 left-1/2" />
        <Hint opened={opened} text={invite.openHint} />
      </div>
    );
  }

  function Envelope({ invite, opened, onOpen }: OpeningProps) {
    const at = spec.sealAt ?? { x: 50, y: 50 };
    return (
      <div className="absolute inset-0 overflow-hidden bg-[#fbf3e8]" style={{ pointerEvents: opened ? "none" : "auto" }}>
        <motion.div
          className="absolute inset-0"
          style={{ transformOrigin: `${at.x}% ${at.y}%` }}
          animate={opened ? { scale: 2.6, opacity: 0 } : { scale: [1, 1.025, 1], opacity: 1 }}
          transition={opened ? { duration: 1.2, ease: [0.6, 0, 0.3, 1] } : { duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <Art src={spec.images.opening} priority />
        </motion.div>
        <motion.div
          className="pointer-events-none absolute inset-x-0 top-[9%] text-center"
          animate={{ opacity: opened ? 0 : 1, y: opened ? -20 : 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="inv-script text-[10cqw] leading-none" style={{ color: c.ink }}>
            You&rsquo;re invited
          </p>
          <p className="inv-label mt-[2cqw] text-[2.6cqw]" style={{ color: c.ink }}>
            {couple(invite)[0].first} &amp; {couple(invite)[1].first}
          </p>
        </motion.div>
        <motion.button
          onClick={onOpen}
          aria-label="Open invitation"
          className="absolute size-[22cqw] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ left: `${at.x}%`, top: `${at.y}%` }}
          animate={{ opacity: opened ? 0 : 1 }}
        >
          <span className="absolute inset-0 animate-ping rounded-full bg-white/40 [animation-duration:2.2s]" />
        </motion.button>
        <Hint opened={opened} text={invite.openHint ?? "Tap the seal to open"} />
      </div>
    );
  }

  function Seal({ invite, opened, onOpen, className }: OpeningProps & { className: string }) {
    return (
      <motion.button
        onClick={onOpen}
        aria-label="Open invitation"
        className={`absolute z-10 grid size-[26cqw] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full ${className}`}
        animate={{ scale: opened ? 0.6 : [1, 1.05, 1], opacity: opened ? 0 : 1 }}
        transition={opened ? { duration: 0.3 } : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-[#f3d98a]/30 [animation-duration:2.4s]" />
        {invite.seal && invite.sealFull ? (
          // The couple's own seal, whole: it replaces the gold one entirely.
          <span className="absolute -inset-[3cqw] drop-shadow-[0_10px_18px_rgba(0,0,0,.45)]">
            <Image src={invite.seal} alt={initials(invite)} fill sizes="160px" className="object-contain" />
          </span>
        ) : (
          <>
          <span
            className="absolute inset-0 rounded-full shadow-[0_10px_30px_-6px_rgba(0,0,0,.6)]"
            style={{ background: `radial-gradient(circle at 35% 30%, #f9e7ad, #d9aa4c 50%, #946a1f)` }}
          />
          <span className="absolute inset-[2cqw] rounded-full border border-[#7a5414]/40" />
          {invite.seal ? (
            // The couple's own monogram, already ink on transparent.
            <span className="absolute inset-[3.6cqw]">
              <Image src={invite.seal} alt={initials(invite)} fill sizes="120px" className="object-contain" />
            </span>
          ) : spec.sealImage && (!spec.sealImageFor || spec.sealImageFor.includes(invite.slug)) ? (
            // The monogram's paper ground multiplies into the gold, leaving just the lettering.
            <span className="absolute inset-[3.2cqw] overflow-hidden rounded-full">
              <Image src={spec.sealImage} alt={initials(invite)} fill sizes="120px" className="object-cover mix-blend-multiply" />
            </span>
          ) : (
            <span className="inv-script relative text-[9cqw] leading-none text-[#4a2c08]">{initials(invite)}</span>
          )}
          </>
        )}
      </motion.button>
    );
  }

  function Hint({ opened, text }: { opened: boolean; text?: string }) {
    const { t } = useT();
    return (
      <motion.p
        className="inv-label absolute inset-x-[16%] bottom-[7%] rounded-full bg-black/35 py-[1.8cqw] text-center text-[2.8cqw] text-white backdrop-blur-sm"
        animate={{ opacity: opened ? 0 : [0.7, 1, 0.7] }}
        transition={{ duration: 2.4, repeat: opened ? 0 : Infinity }}
      >
        {text ?? t.tapToOpen}
      </motion.p>
    );
  }

  const Opening = spec.opening === "doors" ? Doors : Envelope;

  /* ───────── Hero ───────── */

  /** A late parent's photo in a plain square gold frame. */
  function MemorialPhoto({ photo, alt, className }: { photo: string; alt: string; className: string }) {
    return (
      <span className={`block rounded-[1cqw] bg-[linear-gradient(135deg,#f6e3a1,#c99a3c_35%,#f3d98a_60%,#a9782a)] p-[1.2cqw] shadow-[0_1.5cqw_4cqw_-1.5cqw_rgba(60,35,10,.45)] ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- the family's own upload, shown as is */}
        <img src={photo} alt={alt} className="block aspect-square w-full object-cover" />
      </span>
    );
  }

  /**
   * The first page after the doors, for a couple honouring a late parent: her photo and blessing
   * inside the card's arch, before the couple's scene.
   */
  function MemorialPage({ invite }: { invite: Invite }) {
    const opened = useOpened();
    const ref = useRef<HTMLElement>(null);
    const m = invite.memorial;
    if (!m) return null;
    const [a, b] = couple(invite);
    const show = (delay: number) => ({ initial: { opacity: 0, y: 14 }, animate: opened ? { opacity: 1, y: 0 } : {}, transition: { duration: 1, delay, ease } });
    return (
      <section ref={ref} className="relative w-full overflow-hidden" style={{ aspectRatio: ART_RATIO, background: c.paper }}>
        <Art src={spec.images.card} />
        <div className="absolute inset-x-[12%] top-[21%] flex flex-col items-center text-center">
          <motion.p {...show(0.4)} className="inv-script leading-tight whitespace-nowrap" style={{ color: c.ink, ...sz(8.6) }}>
            In her loving presence
          </motion.p>
          <motion.div {...show(0.5)} className="mt-[2cqw] w-full">
            <Divider />
          </motion.div>
          <motion.div {...show(0.6)} className="mt-[5cqw]">
            <MemorialPhoto photo={m.photo} alt={m.name ?? ""} className="w-[38cqw]" />
          </motion.div>
          <motion.p {...show(0.9)} className="inv-serif mt-[5cqw] text-[4.2cqw] leading-snug italic" style={{ color: c.ink }}>
            With the blessings of our beloved
          </motion.p>
          {m.name && (
            <motion.p {...show(1)} className="inv-script mt-[1.5cqw] leading-tight" style={{ color: c.ink, ...sz(7.4) }}>
              {m.name}
            </motion.p>
          )}
          <motion.p {...show(1.1)} className="inv-serif mt-[1.5cqw] text-[4.2cqw] leading-snug italic" style={{ color: c.ink }}>
            we invite you to bless {a.first} &amp; {b.first}.
          </motion.p>
        </div>
        <motion.button
          type="button"
          onClick={() => ref.current?.nextElementSibling?.scrollIntoView({ behavior: "smooth", block: "start" })}
          className="absolute bottom-[19%] left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1 px-[6cqw] py-[2cqw]"
          style={{ color: c.accent }}
          initial={{ opacity: 0 }}
          animate={opened ? { opacity: 1, y: [0, 6, 0] } : {}}
          transition={{ opacity: { delay: 1.8, duration: 0.6 }, y: { delay: 1.8, duration: 1.8, repeat: Infinity } }}
          aria-label="Scroll to the invitation"
        >
          <span className="inv-label text-[2.3cqw]">Scroll</span>
          <svg viewBox="0 0 24 24" className="size-[4cqw]" fill="none" stroke="currentColor" strokeWidth={1.6}>
            <path d="M6 9l6 6 6-6" />
          </svg>
        </motion.button>
      </section>
    );
  }

  function Hero({ invite }: { invite: Invite }) {
    const opened = useOpened();
    const [a, b] = couple(invite);
    const lead = (spec.heroLead ?? 0) / 100;
    const ref = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
    const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);
    const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.04]);
    const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
    const textFade = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
    const show = (delay: number) => ({ initial: { opacity: 0, y: 14 }, animate: opened ? { opacity: 1, y: 0 } : {}, transition: { duration: 1, delay, ease } });
    return (
      <>
      <MemorialPage invite={invite} />
      <section ref={ref} data-hero className="relative w-full overflow-hidden" style={{ aspectRatio: lead ? `864 / ${1536 * (1 + lead)}` : ART_RATIO, background: c.paper }}>
        <motion.div className="absolute inset-x-0 bottom-0" style={{ y: imgY, scale: imgScale, height: `${100 / (1 + lead)}%` }}>
          <Art src={spec.images.hero} alt={`Illustration of a couple for ${a.first} and ${b.first}'s wedding`} priority />
          {lead > 0 && <div className="absolute inset-x-0 top-0 h-[12%]" style={{ background: `linear-gradient(${c.paper}, transparent)` }} />}
        </motion.div>
        <motion.div className="absolute inset-x-[10%] flex flex-col items-center text-center" style={{ top: `${spec.heroTextTop}%`, y: textY, opacity: textFade }}>
          {spec.heroGlow && <div className="absolute -inset-x-[8%] -inset-y-[18%] -z-0 rounded-[50%] bg-[radial-gradient(closest-side,rgba(255,250,240,.85),rgba(255,250,240,0))]" />}
          <motion.p {...show(0.3)} className="relative text-[3.2cqw]" style={{ color: c.accent, fontFamily: invite.template === "gopuram" ? "var(--font-tamil)" : "var(--font-deva)" }}>
            {invite.invocation}
          </motion.p>
          <motion.p {...show(0.45)} className="inv-label relative mt-[2cqw] text-[2.5cqw]" style={{ color: c.ink }}>
            The wedding of
          </motion.p>
          <motion.h1 {...show(0.7)} className="inv-script relative mt-[1cqw] leading-[1] [text-shadow:0_1px_14px_rgba(255,250,240,.7)]" style={{ color: c.ink, ...sz(14) }}>
            {a.first}
            <span className="mx-[2cqw] text-[8cqw]" style={{ color: c.accent }}>
              &amp;
            </span>
            {b.first}
          </motion.h1>
          <motion.div {...show(1)} className="relative mt-[3cqw] flex items-center gap-[3cqw]" style={{ color: c.ink }}>
            <span className="inv-label border-y px-[1cqw] py-[1cqw] text-[2.6cqw]" style={{ borderColor: `${c.ink}66` }}>
              {weekday(invite.date)}
            </span>
            <span className="inv-serif text-[9cqw] leading-none">{dayNum(invite.date).replace(/^0/, "")}</span>
            <span className="inv-label border-y px-[1cqw] py-[1cqw] text-[2.6cqw]" style={{ borderColor: `${c.ink}66` }}>
              {monthName(invite.date)} {yearNum(invite.date)}
            </span>
          </motion.div>
          <motion.p {...show(1.15)} className="inv-serif relative mt-[2cqw] text-[3.8cqw] italic" style={{ color: c.ink }}>
            {invite.city}
          </motion.p>
        </motion.div>
        <motion.button
          type="button"
          onClick={() => ref.current?.nextElementSibling?.scrollIntoView({ behavior: "smooth", block: "start" })}
          className="absolute bottom-[3%] left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1 px-[6cqw] py-[2cqw] text-white [text-shadow:0_1px_8px_rgba(0,0,0,.5)]"
          initial={{ opacity: 0 }}
          animate={opened ? { opacity: 1, y: [0, 6, 0] } : {}}
          transition={{ opacity: { delay: 1.8, duration: 0.6 }, y: { delay: 1.8, duration: 1.8, repeat: Infinity } }}
          style={{ opacity: textFade }}
          aria-label="Scroll to the invitation"
        >
          <span className="inv-label text-[2.3cqw]">Scroll</span>
          <svg viewBox="0 0 24 24" className="size-[4cqw]" fill="none" stroke="currentColor" strokeWidth={1.6}>
            <path d="M6 9l6 6 6-6" />
          </svg>
        </motion.button>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[10%] bg-gradient-to-b from-transparent" style={{ backgroundImage: `linear-gradient(to bottom, transparent, ${c.paper})` }} />
      </section>
      </>
    );
  }

  /* ───────── Card sections ───────── */

  function Title({ kicker, children }: { kicker?: string; children: ReactNode }) {
    return (
      <div className="text-center">
        {kicker && (
          <p className="inv-label text-[2.6cqw]" style={{ color: c.accent }}>
            {kicker}
          </p>
        )}
        <h2 className="inv-script mt-[1cqw] leading-tight" style={{ color: c.ink, ...sz(11) }}>
          {children}
        </h2>
        <Divider className="mt-[1cqw]" />
      </div>
    );
  }

  function Divider({ className }: { className?: string }) {
    return (
      <div className={`flex items-center justify-center gap-[2.5cqw] ${className ?? ""}`}>
        <span className="h-px w-[18cqw]" style={{ background: `linear-gradient(to right, transparent, ${c.accent})` }} />
        <svg viewBox="0 0 20 20" className="w-[4cqw]" aria-hidden>
          <path d="M10 1 C11.5 6.5 13.5 8.5 19 10 C13.5 11.5 11.5 13.5 10 19 C8.5 13.5 6.5 11.5 1 10 C6.5 8.5 8.5 6.5 10 1 Z" fill={c.accent} />
        </svg>
        <span className="h-px w-[18cqw]" style={{ background: `linear-gradient(to left, transparent, ${c.accent})` }} />
      </div>
    );
  }

  function Blessing({ invite }: { invite: Invite }) {
    const L = invite.largeText;
    const [a, b] = couple(invite);
    return (
      <section className="relative px-[14cqw] pt-[16cqw] pb-[14cqw] text-center">
        <Reveal>
          {/* With elders printed above each name, the families' line moves there and the wording leads. */}
          {!(a.elders || b.elders) || invite.hosts ? (
            <div className={`inv-label mb-[4cqw] space-y-[1.8cqw] leading-relaxed ${L ? "text-[3.4cqw] font-semibold" : "text-[2.8cqw]"}`} style={{ color: c.accent }}>
              {(invite.hosts || "Together with their families").split("\n").map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          ) : null}
          <p className={`inv-serif mx-auto leading-snug italic ${L ? "text-[5.4cqw] font-medium" : "text-[4.8cqw]"}`} style={{ color: c.ink }}>
            {invite.message}
          </p>
        </Reveal>
        <div className="mt-[8cqw] space-y-[6cqw]">
          {[a, b].map((p, i) => (
            <Reveal key={p === invite.bride ? "bride" : "groom"} delay={0.1 + i * 0.12}>
              {p.elders && !p.eldersBelow && (
                <p className={`inv-label mb-[3cqw] leading-relaxed ${L ? "text-[3.4cqw] font-semibold" : "text-[2.8cqw]"}`} style={{ color: c.accent }}>
                  {p.elders}
                </p>
              )}
              <p className="inv-script leading-none" style={{ color: c.ink, ...sz(10) }}>
                {p.full || p.first}
              </p>
              {p.parents && (
                <p className={`inv-serif mt-[1.5cqw] whitespace-pre-line italic ${L ? "text-[4.4cqw] font-semibold" : "text-[3.6cqw] font-medium"}`} style={{ color: L ? c.ink : c.soft }}>
                  {p.parents}
                </p>
              )}
              {p.elders && p.eldersBelow && (
                <p className={`inv-label mt-[3cqw] leading-relaxed ${L ? "text-[3.4cqw] font-semibold" : "text-[2.8cqw]"}`} style={{ color: c.accent }}>
                  {p.elders}
                </p>
              )}
            </Reveal>
          ))}
        </div>
      </section>
    );
  }

  function Events({ invite }: { invite: Invite }) {
    const L = invite.largeText;
    return (
      <section className="relative px-[12cqw] py-[14cqw]">
        <Reveal>
          <Title kicker="Join us for">The celebrations</Title>
        </Reveal>
        <ol className="mt-[8cqw] space-y-[5cqw]">
          {invite.events.map((e, i) => {
            const o = ordinal(e.start);
            return (
              <motion.li
                key={e.name + i}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.8, delay: 0.05 * i, ease }}
                className="rounded-[4cqw] border px-[5cqw] py-[5cqw] text-center backdrop-blur-[2px]"
                style={{ borderColor: `${c.accent}55`, background: `${c.paper}d9` }}
              >
                <p className={`inv-label ${L ? "text-[3.2cqw] font-semibold" : "text-[2.6cqw]"}`} style={{ color: c.accent, ...(L ? { letterSpacing: "0.08em" } : {}) }}>
                  {weekday(e.start)} · {o.d}
                  <sup>{o.s}</sup> {o.m} · {time(e.start)}
                </p>
                <h3 className="inv-script mt-[1.5cqw] leading-none" style={{ color: c.ink, ...sz(9) }}>
                  {e.name}
                </h3>
                <p className={`inv-serif mt-[2.5cqw] leading-tight ${L ? "text-[5cqw] font-semibold" : "text-[4.2cqw]"}`} style={{ color: c.ink }}>
                  {e.venue}
                </p>
                {e.address && (
                  <p className={`mt-[1cqw] ${L ? "text-[3.8cqw] font-medium" : "text-[3cqw]"}`} style={{ color: L ? c.ink : c.soft }}>
                    {e.address}
                  </p>
                )}
                {((e.dress && !invite.wardrobe) || e.note) && (
                  <p className={`inv-serif mt-[2cqw] italic ${L ? "text-[4.4cqw] font-semibold" : "text-[3.4cqw]"}`} style={{ color: L ? c.ink : c.accent }}>
                    {[!invite.wardrobe && e.dress && `Dress: ${e.dress}`, e.note].filter(Boolean).join(" · ")}
                  </p>
                )}
                <EventActions event={e} invite={invite} theme={theme} />
              </motion.li>
            );
          })}
        </ol>
        {invite.wardrobe && invite.events.some((e) => e.dress) && (
          <div className="mt-[16cqw]">
            <Reveal>
              <Title kicker="What to wear">Wardrobe</Title>
            </Reveal>
            <ul className="mt-[7cqw] space-y-[4cqw]">
              {invite.events
                .filter((e) => e.dress)
                .map((e, i) => (
                  <Reveal key={e.name + i} delay={0.05 * i}>
                    <li className="text-center">
                      {wardrobeArt[invite.slug]?.[e.name] && (
                        <Image
                          src={`/art/illus/${wardrobeArt[invite.slug][e.name]}.webp`}
                          alt={`${e.name} outfits`}
                          width={500}
                          height={720}
                          sizes="60vw"
                          className="mx-auto mb-[3cqw] h-auto w-[40cqw]"
                        />
                      )}
                      <p className="inv-script leading-none" style={{ color: c.ink, ...sz(7.5) }}>
                        {e.name}
                      </p>
                      <p className={`inv-serif mt-[1.5cqw] italic ${L ? "text-[4.8cqw] font-semibold" : "text-[4.2cqw]"}`} style={{ color: L ? c.ink : c.accent }}>
                        {e.dress}
                      </p>
                    </li>
                  </Reveal>
                ))}
            </ul>
          </div>
        )}
      </section>
    );
  }

  function Closing({ invite }: { invite: Invite }) {
    const L = invite.largeText;
    const [a, b] = couple(invite);
    return (
      <section className="relative px-[14cqw] pt-[12cqw] text-center" style={{ paddingBottom: `calc(${spec.frame.bottom}vh + 18cqw)` }}>
        {invite.memorial && (
          <Reveal className="mb-[14cqw] flex flex-col items-center">
            <MemorialPhoto photo={invite.memorial.photo} alt={invite.memorial.name ?? ""} className={invite.memorial.large ? "w-[38cqw]" : "w-[24cqw]"} />
            {invite.memorial.name && (
              <p className={`inv-script mt-[4cqw] leading-tight ${invite.memorial.large ? "text-[7.4cqw]" : "text-[6.4cqw]"}`} style={{ color: c.ink }}>
                {invite.memorial.name}
              </p>
            )}
            <p
              className={`inv-serif mt-[2cqw] italic ${invite.memorial.large ? "text-[4.6cqw] font-semibold" : "text-[3.8cqw]"}`}
              style={{ color: invite.memorial.large ? c.ink : c.soft }}
            >
              Her blessings are always with us.
            </p>
          </Reveal>
        )}
        {invite.extras?.length ? (
          <div className="mb-[14cqw] space-y-[9cqw]">
            {invite.extras.map((g, i) => (
              <Reveal key={g.title + i}>
                <p className="text-[4.6cqw] font-semibold" style={{ color: c.accent, fontFamily: "var(--inv-serif), var(--font-deva)" }}>
                  {g.title}
                </p>
                <div className="mt-[2.5cqw] space-y-[1.2cqw]">
                  {g.lines.map((l, j) => {
                    const phone = l.match(/(\+?\d[\d\s-]{8,}\d)/)?.[1];
                    const text = <span className="text-[4cqw] leading-snug" style={{ color: c.ink, fontFamily: "var(--inv-serif), var(--font-deva)" }}>{l}</span>;
                    return (
                      <p key={j}>
                        {phone ? (
                          <a href={`tel:+91${phone.replace(/\D/g, "").slice(-10)}`} className="underline decoration-1 underline-offset-4" style={{ textDecorationColor: `${c.accent}66` }}>
                            {text}
                          </a>
                        ) : (
                          text
                        )}
                      </p>
                    );
                  })}
                </div>
              </Reveal>
            ))}
            {invite.welcome && (
              <Reveal>
                <p className="text-[4.4cqw] font-medium" style={{ color: c.ink, fontFamily: "var(--inv-serif), var(--font-deva)" }}>
                  {invite.welcome}
                </p>
              </Reveal>
            )}
          </div>
        ) : null}
        <Reveal>
          <Divider />
          <p className={`inv-serif mt-[6cqw] leading-snug italic ${L ? "text-[5.6cqw] font-medium" : "text-[5cqw]"}`} style={{ color: c.ink }}>
            {invite.closing}
          </p>
          <p className="inv-script mt-[4cqw] leading-none" style={{ color: c.ink, ...sz(12) }}>
            {a.first} &amp; {b.first}
          </p>
          {invite.hashtag && (
            <p className={`inv-label mt-[3cqw] ${L ? "text-[3.4cqw] font-semibold" : "text-[2.8cqw]"}`} style={{ color: c.accent }}>
              {invite.hashtag}
            </p>
          )}
          <Link href="/" className="inv-label mt-[10cqw] inline-block text-[2.2cqw] opacity-60" style={{ color: c.ink }}>
            Crafted with love by {site.name}
          </Link>
        </Reveal>
      </section>
    );
  }

  /**
   * The ornamental edges of the card, drawn above the content. Only the borders show (the middle is
   * masked away), so the invite scrolls underneath like a page behind a painted mount. It fades in
   * once the couple's scene has scrolled past.
   */
  function Frame() {
    const { scrollY } = useScroll();
    const [heroH, setHeroH] = useState(800);
    const [heroTop, setHeroTop] = useState(0);
    useEffect(() => {
      const measure = () => {
        setHeroH((Math.min(window.innerWidth, 480) * 1536) / 864);
        setHeroTop((document.querySelector("[data-hero]") as HTMLElement | null)?.offsetTop ?? 0);
      };
      measure();
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }, []);
    const fade = useTransform(scrollY, [heroTop + heroH * 0.35, heroTop + heroH * 0.75], [0, 1]);
    const opacity = spec.frameOverHero ? 1 : fade;
    const f = spec.frame;
    const soft = 4;
    const mask = [
      `linear-gradient(to bottom, #000 0%, #000 ${f.top}%, transparent ${f.top + soft}%, transparent ${100 - f.bottom - soft}%, #000 ${100 - f.bottom}%, #000 100%)`,
      `linear-gradient(to right, #000 0%, #000 ${f.side}%, transparent ${f.side + soft / 2}%, transparent ${100 - f.side - soft / 2}%, #000 ${100 - f.side}%, #000 100%)`,
    ].join(", ");
    // In-app browsers (WhatsApp, Instagram) draw the page behind their toolbars too, beyond this
    // fixed layer, so paper strips above and below keep the scrolling invite from showing there.
    return (
      <motion.div className="absolute inset-0" style={{ opacity }} aria-hidden>
        <div className="absolute inset-x-0 bottom-full h-[50vh]" style={{ background: c.paper }} />
        {spec.images.frame ? (
          <div className="absolute inset-0">
            <Art src={spec.images.frame} />
          </div>
        ) : (
          <div className="absolute inset-0" style={{ WebkitMaskImage: mask, maskImage: mask }}>
            <Art src={spec.images.card} />
          </div>
        )}
        <div className="absolute inset-x-0 top-full h-[50vh]" style={{ background: c.paper }} />
      </motion.div>
    );
  }

  /** The bordered card stays put while the invite scrolls over it, like a printed card frame. */
  function Backdrop() {
    return (
      <div className="pointer-events-none absolute inset-0" style={{ background: c.paper }}>
        <div className="sticky top-0 h-[var(--screen-h,100svh)] w-full">
          <Art src={spec.images.card} />
        </div>
      </div>
    );
  }

  const theme: InviteTheme = {
    id: spec.id,
    root: "",
    vars: {
      "--inv-script": spec.fonts.script,
      "--inv-serif": spec.fonts.serif,
      "--inv-label": spec.fonts.label,
      background: c.paper,
      color: c.ink,
    } as CSSProperties,
    accent: c.accent,
    ui: {
      section: "relative px-[12cqw] py-[14cqw]",
      card: "rounded-[4cqw] border border-black/10 bg-white/80 backdrop-blur-sm",
      input: "w-full rounded-[2.5cqw] border border-black/15 bg-white/90 px-[4cqw] py-[3cqw] text-[3.8cqw] outline-none placeholder:opacity-40",
      chip: "rounded-full border border-black/15 bg-white/70 transition",
      chipOn: "rounded-full border border-transparent font-semibold text-white transition [background:var(--inv-accent)]",
      button: "inline-flex items-center gap-[1.5cqw] rounded-full px-[4.5cqw] py-[2.4cqw] text-[3.2cqw] font-semibold text-white active:scale-95 transition [background:var(--inv-accent)]",
      ghost: "inline-flex items-center gap-[1.5cqw] rounded-full border border-current/30 px-[4.5cqw] py-[2.4cqw] text-[3.2cqw] active:scale-95 transition",
      muted: "opacity-70",
      tile: "rounded-[3cqw] border border-black/10 bg-white/80 backdrop-blur-sm",
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
  (theme.vars as Record<string, string>)["--inv-accent"] = c.accent;
  return theme;
}
