"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { site } from "@/config/site";
import type { Invite, InviteEvent } from "@/data/invites";
import { fmtDate, time as clock } from "@/lib/format";
import { INVITE_ART_SIZES, PREVIEW_ART_SIZES, useOpened, usePreview } from "./opened";
import { couple, Reveal } from "./shared";
import type { InviteTheme, OpeningProps } from "./types";

/**
 * Rang Mahal, made for one client from her Lovable site: painted palace doors with a heart to
 * open them, a palace balcony that fades into a cream cover, a save-the-date photo, a gold
 * timeline, photo carousels, the venue on a map, and a video (or moving painting) per function.
 */

const c = {
  paper: "#f8f3ee",
  ink: "#3e3530",
  soft: "#7d726b",
  gold: "#c9993a",
  goldSoft: "#e2c27c",
  line: "#e6d8c4",
};
const art = "/art/illus/rangmahal";
const ease = [0.22, 1, 0.36, 1] as const;

const SCRIPT: CSSProperties = { fontFamily: "var(--font-parisienne), cursive", color: c.gold };
const HEAD: CSSProperties = { fontFamily: "var(--font-bodoni), serif", color: c.ink };

/**
 * Each function's scene: a short video when we have one, otherwise its painting, gently moving.
 * Matched by the function's name first (so "Haldi Ceremony" finds Haldi), then by its type.
 */
type Scene = { img: string; video?: string };
const SCENES: Record<string, Scene> = {
  sangeet: { img: `${art}-sangeet.jpg` },
  haldi: { img: `${art}-haldi.jpg` },
  engagement: { img: `${art}-engagement.jpg` },
  wedding: { img: `${art}-wedding.jpg` },
};
const sceneFor = (e: InviteEvent): [string, Scene] | null => {
  const n = e.name.toLowerCase();
  const key = /sangeet|cocktail/.test(n) ? "sangeet" : /haldi|maiyan/.test(n) ? "haldi" : /ring|engage|sagai|roka/.test(n) ? "engagement" : /phere|wedding|vivah|shaadi/.test(n) ? "wedding"
    : e.kind === "sangeet" ? "sangeet" : e.kind === "haldi" ? "haldi" : e.kind === "engagement" ? "engagement" : e.kind === "phere" ? "wedding" : null;
  return key ? [key, SCENES[key]] : null;
};

const ICONS: Record<string, string> = { sangeet: "💃", haldi: "🌼", mehndi: "🌿", engagement: "💍", phere: "🔥", reception: "🥂", baraat: "🐎", other: "✨" };
const iconFor = (e: InviteEvent) => {
  const n = e.name.toLowerCase();
  if (/tea/.test(n)) return "🫖";
  if (/dinner|lunch|brunch/.test(n)) return "🍽️";
  if (/photo/.test(n)) return "📸";
  if (/vida/.test(n)) return "🚗";
  return ICONS[e.kind] ?? "✨";
};

function Art({ src, alt = "", className, style, priority }: { src: string; alt?: string; className?: string; style?: CSSProperties; priority?: boolean }) {
  const preview = usePreview();
  return <Image src={src} alt={alt} fill sizes={preview ? PREVIEW_ART_SIZES : INVITE_ART_SIZES} priority={priority && !preview} className={`object-cover ${className ?? ""}`} style={style} />;
}

/* ───────── Opening: painted doors, a heart to open them ───────── */

function Opening({ opened, onOpen }: OpeningProps) {
  const leaf = (side: "left" | "right") => (
    <motion.div
      className="absolute inset-y-0 w-1/2 overflow-hidden"
      style={{ [side]: 0, transformOrigin: side === "left" ? "left center" : "right center" } as CSSProperties}
      animate={opened ? { rotateY: side === "left" ? -105 : 105 } : { rotateY: 0 }}
      transition={{ duration: 1.5, ease: [0.6, 0, 0.3, 1] }}
    >
      <div className="absolute inset-y-0 w-[200%]" style={{ [side]: 0 } as CSSProperties}>
        <Art src={`${art}-doors.jpg`} priority />
      </div>
      <div className={`absolute inset-y-0 w-[6%] ${side === "left" ? "right-0 bg-gradient-to-l" : "left-0 bg-gradient-to-r"} from-black/20 to-transparent`} />
    </motion.div>
  );
  return (
    <motion.div className="absolute inset-0 overflow-hidden" style={{ background: c.paper }} animate={{ opacity: opened ? 0 : 1 }} transition={{ delay: opened ? 1.35 : 0, duration: 0.5 }}>
      <div className="absolute inset-0 [perspective:1600px]">
        <Art src={`${art}-balcony.jpg`} priority />
        {leaf("left")}
        {leaf("right")}
      </div>
      {/* A soft shade at the foot of the doors, so the white "Open the invitation" reads on cream. */}
      <motion.div className="pointer-events-none absolute inset-x-0 bottom-0 h-[34%] bg-gradient-to-t from-[rgba(60,35,20,.55)] to-transparent" animate={{ opacity: opened ? 0 : 1 }} transition={{ duration: 0.3 }} />
      {/* "You are invited" in the doors' empty cartouche */}
      <motion.div className="pointer-events-none absolute inset-x-0 top-[41%] text-center" animate={{ opacity: opened ? 0 : 1 }} transition={{ duration: 0.3 }}>
        <p className="text-[8.2cqw] leading-[1.15] tracking-[0.06em]" style={{ ...HEAD, color: "#a7834a" }}>
          YOU ARE
          <br />
          INVITED
        </p>
      </motion.div>
      <motion.button
        type="button"
        onClick={onOpen}
        aria-label="Open the invitation"
        className="absolute inset-x-0 bottom-[7%] flex flex-col items-center gap-[4cqw]"
        animate={{ opacity: opened ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.span
          className="grid size-[17cqw] place-items-center rounded-full bg-white shadow-[0_10px_30px_rgba(0,0,0,.25)]"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg viewBox="0 0 24 24" className="size-[8cqw]" fill="#e0559b" aria-hidden>
            <path d="M12 21s-7.5-4.6-10-9.3C.4 8.3 2.3 4.5 6 4.5c2.1 0 3.5 1.1 4.3 2.4h3.4c.8-1.3 2.2-2.4 4.3-2.4 3.7 0 5.6 3.8 4 7.2C19.5 16.4 12 21 12 21z" />
          </svg>
        </motion.span>
        <span className="text-[4.4cqw] tracking-[0.32em] text-white [text-shadow:0_2px_12px_rgba(0,0,0,.45)]" style={{ fontFamily: "var(--font-cormorant), serif" }}>
          OPEN THE INVITATION
        </span>
      </motion.button>
    </motion.div>
  );
}

/* ───────── Cover: the balcony fades into cream ───────── */

function Hero({ invite }: { invite: Invite }) {
  const opened = useOpened();
  const preview = usePreview();
  const [a, b] = couple(invite);
  const show = (delay: number) => ({ initial: { opacity: 0, y: 16 }, animate: opened ? { opacity: 1, y: 0 } : {}, transition: { duration: 1, delay, ease } });
  return (
    <section className="relative flex min-h-[var(--screen-h,100svh)] flex-col items-center justify-center overflow-hidden px-[10cqw] text-center" style={{ background: c.paper }}>
      {/* The balcony the doors opened onto, dissolving into the cover. */}
      {!preview && (
        <motion.div className="pointer-events-none absolute inset-0" initial={{ opacity: 1 }} animate={opened ? { opacity: 0, scale: 1.08 } : {}} transition={{ delay: 0.6, duration: 2.6, ease: "easeInOut" }}>
          <Art src={`${art}-balcony.jpg`} />
        </motion.div>
      )}
      <motion.p {...show(1.8)} className="relative text-[2.7cqw] tracking-[0.3em]" style={{ fontFamily: "var(--font-manrope), sans-serif", color: c.soft }}>
        YOU ARE INVITED TO THE
        <br />
        {invite.occasion === "engagement" ? "ENGAGEMENT" : invite.occasion === "reception" ? "WEDDING RECEPTION" : "WEDDING"} OF
      </motion.p>
      <motion.h1 {...show(2.1)} className="relative mt-[6cqw] flex flex-col items-center leading-none">
        <span className="text-[15cqw]" style={SCRIPT}>{a.first}</span>
        <span className="my-[3cqw] text-[5cqw] italic" style={{ fontFamily: "var(--font-cormorant), serif", color: c.soft }}>&amp;</span>
        <span className="text-[15cqw]" style={SCRIPT}>{b.first}</span>
      </motion.h1>
      <motion.div {...show(2.4)} className="relative mt-[8cqw] h-px w-[30cqw]" style={{ background: c.goldSoft }} />
      <motion.p {...show(2.5)} className="relative mt-[6cqw] text-[4.2cqw]" style={{ fontFamily: "var(--font-cormorant), serif", color: c.soft }}>
        {invite.hosts || "Together with their families"}
      </motion.p>
      <motion.button
        {...show(2.8)}
        type="button"
        onClick={() => window.scrollBy({ top: window.innerHeight, behavior: "smooth" })}
        className="relative mt-[10cqw] flex flex-col items-center gap-[1cqw] text-[2.4cqw] tracking-[0.28em]"
        style={{ fontFamily: "var(--font-manrope), sans-serif", color: c.soft }}
      >
        SCROLL DOWN
        <motion.svg viewBox="0 0 24 24" className="size-[4.5cqw]" fill="none" stroke={c.gold} strokeWidth={1.8} animate={{ y: [0, 5, 0] }} transition={{ duration: 1.6, repeat: Infinity }} aria-hidden>
          <path d="M6 7l6 6 6-6M6 12l6 6 6-6" />
        </motion.svg>
      </motion.button>
    </section>
  );
}

/* ───────── Save the date: their photo ───────── */

function Blessing({ invite }: { invite: Invite }) {
  const [a, b] = couple(invite);
  const photo = invite.gallery?.[0] ?? `${art}-savedate.jpg`;
  return (
    <section className="relative flex min-h-[110cqw] flex-col items-center justify-end overflow-hidden pb-[12cqw] text-center">
      <Art src={photo} alt={`${a.first} and ${b.first}`} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 to-black/70" />
      <Reveal className="relative">
        <p className="text-[3cqw] tracking-[0.34em] text-white/90" style={{ fontFamily: "var(--font-bodoni), serif" }}>SAVE THE DATE</p>
        <p className="mt-[2cqw] text-[10cqw] leading-none text-white [text-shadow:0_2px_18px_rgba(0,0,0,.4)]" style={{ fontFamily: "var(--font-parisienne), cursive" }}>
          {a.first} &amp; {b.first}
        </p>
      </Reveal>
    </section>
  );
}

/* ───────── Timeline, photos, venue and the functions ───────── */

const dayLabel = (iso: string) => fmtDate(iso, { month: "short", day: "numeric" });

function Timeline({ invite }: { invite: Invite }) {
  const ev = [...invite.events].sort((x, y) => x.start.localeCompare(y.start));
  const first = ev[0]?.start ?? invite.date;
  const last = ev[ev.length - 1]?.start ?? invite.date;
  const range = fmtDate(first, { day: "numeric" }) === fmtDate(last, { day: "numeric" }) && dayLabel(first) === dayLabel(last)
    ? fmtDate(first, { day: "numeric", month: "long", year: "numeric" })
    : `${fmtDate(first, { day: "numeric" })}–${fmtDate(last, { day: "numeric", month: "long", year: "numeric" })}`;
  return (
    <section className="relative px-[7cqw] py-[16cqw]" style={{ background: c.paper }}>
      <Reveal className="text-center">
        <h2 className="text-[7.4cqw] leading-tight tracking-[0.12em]" style={HEAD}>
          {invite.occasion === "engagement" ? "ENGAGEMENT" : "WEDDING"}
          <br />
          TIMELINE
        </h2>
        <p className="mt-[2cqw] text-[6cqw]" style={SCRIPT}>{range}</p>
        <div className="mx-auto mt-[4cqw] h-px w-[24cqw]" style={{ background: c.goldSoft }} />
      </Reveal>
      <div className="relative mt-[12cqw]">
        <div className="absolute top-0 bottom-[3cqw] left-1/2 w-px -translate-x-1/2" style={{ background: c.line }} />
        <ol className="space-y-[9cqw]">
          {ev.map((e, i) => {
            const left = i % 2 === 0;
            return (
              <motion.li
                key={e.name + i}
                className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-[4cqw]"
                initial={{ opacity: 0, x: left ? -24 : 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.7, ease }}
              >
                <div className={left ? "text-right" : "col-start-3 row-start-1 text-left"}>
                  <p className="text-[4.6cqw] font-semibold" style={{ fontFamily: "var(--font-cormorant), serif", color: c.ink }}>{e.name}</p>
                  <p className="mt-[0.5cqw] text-[3cqw] leading-snug" style={{ fontFamily: "var(--font-cormorant), serif", color: c.soft }}>
                    {dayLabel(e.start)} | {clock(e.start)}
                    <br />
                    Onwards
                  </p>
                </div>
                <span className="col-start-2 row-start-1 grid size-[9cqw] place-items-center rounded-full border text-[4.2cqw]" style={{ background: c.paper, borderColor: c.gold }}>
                  {iconFor(e)}
                </span>
              </motion.li>
            );
          })}
        </ol>
        <span className="absolute bottom-0 left-1/2 size-[2.4cqw] -translate-x-1/2 rounded-full" style={{ background: c.gold }} />
      </div>
      <p className="mt-[10cqw] text-center text-[7cqw]" style={SCRIPT}>{couple(invite)[0].first} &amp; {couple(invite)[1].first}</p>
    </section>
  );
}

/** A swipeable row of photos with dots, like the original's carousels. */
function Carousel({ photos, title }: { photos: string[]; title?: ReactNode }) {
  const row = useRef<HTMLDivElement>(null);
  const [at, setAt] = useState(0);
  useEffect(() => {
    const el = row.current;
    if (!el) return;
    const onScroll = () => setAt(Math.round(el.scrollLeft / (el.clientWidth * 0.78)));
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);
  if (!photos.length) return null;
  return (
    <section className="py-[12cqw]" style={{ background: c.paper }}>
      {title}
      <div ref={row} className="no-scrollbar flex snap-x snap-mandatory gap-[4cqw] overflow-x-auto px-[11cqw]">
        {photos.map((p, i) => (
          <div key={p + i} className="relative aspect-[3/4] w-[78%] shrink-0 snap-center overflow-hidden rounded-[4cqw] shadow-[0_12px_30px_-12px_rgba(60,40,20,.35)]">
            <Art src={p} />
          </div>
        ))}
      </div>
      <div className="mt-[5cqw] flex justify-center gap-[1.6cqw]">
        {photos.map((p, i) => (
          <span key={p + i} className="h-[1.6cqw] rounded-full transition-all" style={{ width: i === at ? "6cqw" : "1.6cqw", background: i === at ? c.gold : c.line }} />
        ))}
      </div>
    </section>
  );
}

function Venue({ invite }: { invite: Invite }) {
  const main = invite.events.find((e) => e.kind === "phere") ?? invite.events[0];
  if (!main) return null;
  const query = encodeURIComponent([main.venue, main.address || invite.city].filter(Boolean).join(", "));
  const directions = main.mapUrl || `https://www.google.com/maps/search/?api=1&query=${query}`;
  return (
    <section className="px-[8cqw] py-[12cqw] text-center" style={{ background: c.paper }}>
      <Reveal>
        <div className="mx-auto h-px w-[24cqw]" style={{ background: c.goldSoft }} />
        <p className="mx-auto mt-[6cqw] max-w-[70cqw] text-[4.4cqw] leading-snug" style={{ fontFamily: "var(--font-cormorant), serif", color: c.soft }}>
          Pack your bags and join us for the celebration
        </p>
        <p className="mt-[3cqw] text-[5cqw] font-semibold" style={{ fontFamily: "var(--font-cormorant), serif", color: c.ink }}>{main.venue}</p>
        <div className="relative mt-[6cqw] aspect-square overflow-hidden rounded-[4cqw] border" style={{ borderColor: c.line }}>
          <iframe title={`Map of ${main.venue}`} src={`https://maps.google.com/maps?q=${query}&z=15&output=embed`} className="absolute inset-0 h-full w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </div>
        <a
          href={directions}
          target="_blank"
          rel="noreferrer"
          className="mt-[6cqw] inline-flex items-center gap-[2cqw] rounded-full px-[7cqw] py-[3cqw] text-[3.2cqw] tracking-[0.2em] text-white"
          style={{ background: c.gold, fontFamily: "var(--font-manrope), sans-serif" }}
        >
          GET DIRECTIONS
        </a>
      </Reveal>
    </section>
  );
}

/** One function's scene: its video, or its painting with a slow push-in and drifting sparkles. */
function FunctionScene({ event }: { event: InviteEvent }) {
  const found = sceneFor(event);
  if (!found) return null;
  const [, scene] = found;
  return (
    <motion.div className="relative aspect-[9/14] overflow-hidden" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.9 }}>
      {scene.video ? (
        <video src={scene.video} poster={scene.img} className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline preload="metadata" />
      ) : (
        <motion.div className="absolute inset-0" animate={{ scale: [1, 1.1] }} transition={{ duration: 14, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}>
          <Art src={scene.img} alt={event.name} />
        </motion.div>
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[35%] bg-gradient-to-t from-black/65 to-transparent" />
      <p className="absolute inset-x-0 bottom-[6cqw] text-center text-[9cqw] leading-none [text-shadow:0_2px_14px_rgba(0,0,0,.5)]" style={{ fontFamily: "var(--font-parisienne), cursive", color: "#f2d38d" }}>
        {event.name.toLowerCase()}
      </p>
    </motion.div>
  );
}

function Events({ invite }: { invite: Invite }) {
  const photos = invite.gallery ?? [];
  const functions = invite.events.filter((e) => sceneFor(e));
  return (
    <>
      <Timeline invite={invite} />
      <Carousel photos={photos.slice(1)} />
      <Venue invite={invite} />
      <Carousel
        photos={[...photos].reverse()}
        title={
          <Reveal className="mb-[8cqw] text-center">
            <h2 className="text-[11cqw] leading-none" style={SCRIPT}>Moments Together</h2>
            <div className="mx-auto mt-[4cqw] h-px w-[24cqw]" style={{ background: c.goldSoft }} />
          </Reveal>
        }
      />
      {functions.length > 0 && (
        <section style={{ background: c.paper }}>
          <Reveal className="px-[8cqw] pt-[14cqw] pb-[10cqw] text-center">
            <p className="text-[2.6cqw] tracking-[0.3em]" style={{ fontFamily: "var(--font-manrope), sans-serif", color: c.soft }}>CELEBRATE WITH US</p>
            <h2 className="mt-[2cqw] text-[11cqw] leading-none" style={SCRIPT}>The Functions</h2>
            <div className="mx-auto mt-[4cqw] h-px w-[24cqw]" style={{ background: c.goldSoft }} />
          </Reveal>
          {functions.map((e, i) => (
            <FunctionScene key={e.name + i} event={e} />
          ))}
        </section>
      )}
    </>
  );
}

/* ───────── Closing ───────── */

function Closing({ invite }: { invite: Invite }) {
  const [a, b] = couple(invite);
  return (
    <section className="px-[8cqw] pt-[10cqw] pb-[14cqw] text-center" style={{ background: c.paper }}>
      {invite.closing && <p className="mx-auto max-w-[72cqw] text-[4.4cqw] italic" style={{ fontFamily: "var(--font-cormorant), serif", color: c.soft }}>{invite.closing}</p>}
      <p className="mt-[5cqw] text-[10cqw] leading-none" style={SCRIPT}>{a.first} &amp; {b.first}</p>
      {invite.hashtag && <p className="mt-[3cqw] text-[3cqw] tracking-[0.2em]" style={{ fontFamily: "var(--font-manrope), sans-serif", color: c.gold }}>{invite.hashtag}</p>}
      <Link href="/" className="mt-[10cqw] block text-[2.6cqw]" style={{ fontFamily: "var(--font-manrope), sans-serif", color: c.soft }}>
        created with <span style={{ color: "#e0559b" }}>♥</span> by {site.name}
      </Link>
    </section>
  );
}

function Backdrop() {
  return <div className="pointer-events-none absolute inset-0" style={{ background: c.paper }} />;
}

function Divider() {
  return null;
}

function Title({ kicker, children }: { kicker?: string; children: ReactNode }) {
  return (
    <div className="text-center">
      {kicker && <p className="text-[2.6cqw] tracking-[0.3em] uppercase" style={{ fontFamily: "var(--font-manrope), sans-serif", color: c.soft }}>{kicker}</p>}
      <h2 className="mt-[2cqw] text-[11cqw] leading-none" style={SCRIPT}>{children}</h2>
      <div className="mx-auto mt-[4cqw] h-px w-[24cqw]" style={{ background: c.goldSoft }} />
    </div>
  );
}

export const rangmahal: InviteTheme = {
  id: "rangmahal",
  ownHints: true,
  root: "text-[#3e3530]",
  vars: {
    "--inv-script": "var(--font-parisienne), cursive",
    "--inv-serif": "var(--font-cormorant), serif",
    "--inv-label": "var(--font-manrope), sans-serif",
    "--inv-accent": c.gold,
  } as CSSProperties,
  accent: c.gold,
  ui: {
    section: "relative px-[8cqw] py-[14cqw] bg-[#f8f3ee]",
    card: "rounded-[4cqw] border border-[#e6d8c4] bg-[#fbf8f4]",
    input: "w-full rounded-[2.5cqw] border border-[#e6d8c4] bg-white/70 px-[4cqw] py-[3cqw] text-[3.8cqw] text-[#3e3530] placeholder:text-[#3e3530]/40 outline-none focus:border-[#c9993a]",
    chip: "rounded-[2.5cqw] border border-[#e6d8c4] bg-white/70 text-[#3e3530] transition",
    chipOn: "rounded-[2.5cqw] border border-[#c9993a] bg-[#c9993a] text-white transition",
    button: "inline-flex items-center justify-center gap-[1.5cqw] rounded-[2.5cqw] bg-[#e2c27c] px-[5cqw] py-[3cqw] text-[3.2cqw] tracking-[0.18em] text-white uppercase active:scale-95 transition",
    ghost: "inline-flex items-center gap-[1.5cqw] rounded-full border border-[#c9993a]/60 px-[5cqw] py-[2.6cqw] text-[3.4cqw] text-[#c9993a] active:scale-95 transition",
    muted: "text-[#7d726b]",
    tile: "rounded-full bg-white/80 text-[#c9993a]",
  },
  Opening,
  Hero,
  Blessing,
  Events,
  Closing,
  Backdrop,
  Divider,
  Title,
};
