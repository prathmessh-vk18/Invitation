"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState, type ReactNode } from "react";

/**
 * The Marathi design, storybook style, inside a carved wada frame (sanai and dhol on its balconies)
 * that stays put while the invite scrolls under it, as Haveli's arch does.
 *
 * It opens on the antarpat, hanging from behind the frame's arch between bride and groom with
 * "You're invited" on it. Tap: the words become "शुभमंगल सावधान", akshata showers down, the cloth
 * is lowered out of sight and the camera eases back onto the two of them face to face, as the cover
 * writes itself in. Then the families, the functions and the walk home to the wada.
 *
 * ?font=yatra (default) | vibes | playfair picks the face for the couple's names.
 */

const C = { maroon: "#7a1424", ink: "#4a1d14", gold: "#b88a2e", goldLight: "#f6d98c", green: "#2d6a35", paper: "#fbf0d6" };
const deva = "var(--font-yatra)";
const label = "var(--font-cinzel)";
const serif = "var(--font-cormorant)";
const art = (f: string) => `/art/illus/${f}`;
const ease = [0.65, 0, 0.35, 1] as const;

type FontId = "yatra" | "vibes" | "playfair";
const NAME_FONT: Record<FontId, { family: string; scale: number; italic?: boolean }> = {
  yatra: { family: "var(--font-yatra)", scale: 0.82 },
  vibes: { family: "var(--font-great-vibes)", scale: 1.05 },
  playfair: { family: "var(--font-playfair)", scale: 0.8, italic: true },
};

// The antarpat in the scene (% of the section): it hangs from behind the frame's arch.
const CLOTH = { left: 33, width: 34, top: 9, height: 41 };

export function MarathiInvite({ font = "yatra" }: { font?: string }) {
  const [opened, setOpened] = useState(false);
  const [run, setRun] = useState(0);
  const [fontId, setFontId] = useState<FontId>(font === "vibes" || font === "playfair" ? font : "yatra");
  useEffect(() => {
    document.documentElement.style.overflow = opened ? "" : "hidden";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [opened]);
  const replay = () => {
    window.scrollTo({ top: 0 });
    setOpened(false);
    setRun((r) => r + 1);
  };
  const nameFont = NAME_FONT[fontId];

  return (
    <div className="flex min-h-svh justify-center bg-[#1b1412]">
      <div className="@container relative w-full max-w-[480px]" style={{ background: C.paper }}>
        <Opening key={run} opened={opened} onOpen={() => setOpened(true)} nameFont={nameFont} />
        {opened && (
          <>
            <Families nameFont={nameFont} />
            <Functions />
            <Closing nameFont={nameFont} />
          </>
        )}
        {/* The wada frame stays in place over everything. */}
        <div className="pointer-events-none fixed inset-y-0 left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2">
          <Image src={art("marathi-frame.webp")} alt="" fill priority sizes="480px" className="object-fill" />
        </div>
        <div className="fixed top-2 left-1/2 z-[70] flex -translate-x-1/2 gap-1 text-[11px]">
          {(["yatra", "vibes", "playfair"] as const).map((f) => (
            <button key={f} type="button" onClick={() => setFontId(f)} className={`rounded-full px-2.5 py-1 ${fontId === f ? "bg-white text-black" : "bg-black/55 text-white"}`}>
              {f === "yatra" ? "Yatra One" : f === "vibes" ? "Great Vibes" : "Playfair"}
            </button>
          ))}
          <button type="button" onClick={replay} className="rounded-full bg-black/55 px-2.5 py-1 text-white">
            ↻
          </button>
        </div>
      </div>
    </div>
  );
}

type NameFont = (typeof NAME_FONT)[FontId];
const nameStyle = (f: NameFont, cqw: number, color: string) => ({ fontFamily: f.family, fontSize: `${cqw * f.scale}cqw`, fontStyle: f.italic ? "italic" : undefined, color });

/* ───────── Opening and cover ───────── */

function Opening({ opened, onOpen, nameFont }: { opened: boolean; onOpen: () => void; nameFont: NameFont }) {
  return (
    <section className="relative h-svh min-h-[178cqw] w-full overflow-hidden">
      {/* The camera: close on the couple and the cloth, easing back to the whole mandap. */}
      <motion.div
        className="absolute inset-0"
        style={{ transformOrigin: "50% 58%" }}
        initial={{ scale: 1.14 }}
        animate={{ scale: opened ? 1 : 1.14 }}
        transition={{ duration: 2.4, delay: opened ? 2.2 : 0, ease }}
      >
        <Image src={art("marathi-couple.jpg")} alt="A Marathi bride and groom face each other under the mandap" fill priority sizes="480px" className="object-cover" />
        <Antarpat opened={opened} nameFont={nameFont} />
      </motion.div>

      {!opened && <Petals />}
      {opened && <Akshata />}
      <Cover opened={opened} nameFont={nameFont} />

      {!opened && (
        <>
          <button type="button" onClick={onOpen} aria-label="Lower the antarpat" className="absolute inset-0 z-10 cursor-pointer" />
          <motion.button
            type="button"
            onClick={onOpen}
            className="absolute bottom-[14%] left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[rgba(24,14,10,.78)] px-5 py-3 text-[clamp(14px,3.9cqw,17px)] font-semibold whitespace-nowrap text-white shadow-[0_6px_24px_rgba(0,0,0,.35)] ring-1 ring-white/25 backdrop-blur-md"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: [0, -4, 0] }}
            transition={{ opacity: { delay: 0.8, duration: 0.5 }, y: { delay: 1.2, duration: 1.8, repeat: Infinity, ease: "easeInOut" } }}
          >
            <span aria-hidden>👆</span> Tap for Shubhamangal Saavdhaan
          </motion.button>
        </>
      )}
    </section>
  );
}

/**
 * The antarpat: maroon silk with Paithani borders, drawn as a border-image so it can be any length
 * without stretching its peacocks. "You're invited" on it turns into "शुभमंगल सावधान" at the tap;
 * then it is lowered out of sight.
 */
function Antarpat({ opened, nameFont }: { opened: boolean; nameFont: NameFont }) {
  return (
    <motion.div
      className="absolute origin-top"
      style={{
        left: `${CLOTH.left}%`,
        width: `${CLOTH.width}%`,
        top: `${CLOTH.top}%`,
        height: `${CLOTH.height}%`,
        borderStyle: "solid",
        borderWidth: "3.6cqw 5.9cqw 7cqw 5.9cqw",
        borderImage: `url(${art("marathi-antarpat-plain.webp")}) 6% 17.5% 12% 17.5% / 3.6cqw 5.9cqw 7cqw 5.9cqw stretch round`,
        background: `url(${art("marathi-antarpat-silk.webp")}) center / 100% 100% no-repeat padding-box`,
        filter: "drop-shadow(0 8px 12px rgba(70,30,10,.28))",
      }}
      initial={false}
      animate={opened ? { y: "190%", opacity: [1, 1, 0] } : { y: "0%", skewX: [-0.4, 0.4, -0.4] }}
      transition={
        opened
          ? { duration: 2, delay: 1.5, ease: [0.5, 0, 0.75, 0.3], opacity: { duration: 2, delay: 1.5, times: [0, 0.8, 1] } }
          : { skewX: { duration: 5, repeat: Infinity, ease: "easeInOut" } }
      }
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {/* Before the tap: the invitation. */}
        <motion.div className="absolute inset-x-0 top-[21%] flex flex-col items-center" animate={{ opacity: opened ? 0 : 1 }} transition={{ duration: 0.4 }}>
          <p className="text-[2.2cqw] tracking-[0.3em] uppercase" style={{ fontFamily: label, color: C.goldLight }}>
            You&rsquo;re invited
          </p>
          <p className="mt-[1.5cqw] leading-tight" style={nameStyle(nameFont, 7.6, C.goldLight)}>
            Aditi
          </p>
          <p className="text-[4cqw] leading-none" style={{ fontFamily: serif, color: C.goldLight }}>
            &amp;
          </p>
          <p className="leading-tight" style={nameStyle(nameFont, 7.6, C.goldLight)}>
            Sameer
          </p>
        </motion.div>
        {/* At the tap: the blessing. */}
        <motion.p
          className="absolute inset-x-0 top-[27%] text-[6cqw] leading-[1.25] whitespace-nowrap"
          style={{ fontFamily: deva, color: C.goldLight, textShadow: "0 0 14px rgba(255,214,120,.8)" }}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={opened ? { opacity: 1, scale: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
        >
          शुभमंगल
          <br />
          सावधान
        </motion.p>
        <div className="absolute top-[62%] left-1/2 w-[34%] -translate-x-1/2" style={{ aspectRatio: "1" }}>
          <Image src={art("marathi-swastik.webp")} alt="" fill sizes="80px" className="object-contain" />
        </div>
      </div>
    </motion.div>
  );
}

function Cover({ opened, nameFont }: { opened: boolean; nameFont: NameFont }) {
  const show = (d: number) => ({
    initial: { opacity: 0, y: 14, filter: "blur(6px)" },
    animate: opened ? { opacity: 1, y: 0, filter: "blur(0px)" } : {},
    transition: { duration: 1.1, delay: 4.2 + d, ease },
  });
  return (
    <div className="pointer-events-none absolute inset-x-[19%] top-[17%] flex flex-col items-center text-center">
      <motion.p {...show(0)} className="text-[3.8cqw]" style={{ fontFamily: deva, color: C.maroon }}>
        ॥ श्री गणेशाय नमः ॥
      </motion.p>
      <motion.p {...show(0.25)} className="mt-[1cqw] text-[10cqw] leading-none" style={{ fontFamily: deva, color: C.maroon }}>
        शुभविवाह
      </motion.p>
      <motion.p {...show(0.55)} className="mt-[2cqw] leading-[1.05] whitespace-nowrap" style={nameStyle(nameFont, 8.6, C.ink)}>
        Aditi <span style={{ color: C.gold }}>&amp;</span> Sameer
      </motion.p>
      <motion.p {...show(0.8)} className="mt-[2cqw] text-[2.4cqw] leading-relaxed tracking-[0.2em] uppercase" style={{ fontFamily: label, color: C.ink }}>
        Saturday · 20 February 2027
        <br />
        Pune
      </motion.p>
    </div>
  );
}

/* ───────── Akshata and petals ───────── */

const GRAIN = ["#fff6dc", "#f6e7b8", "#fffaf0", "#f1dc9f"];

function Akshata() {
  const grains = useMemo(
    () =>
      Array.from({ length: 90 }, (_, i) => ({
        x: 8 + ((i * 37) % 84),
        d: 0.9 + ((i * 13) % 100) / 70,
        t: 2.4 + ((i * 7) % 10) / 6,
        sway: ((i * 17) % 10) - 5,
        rot: (i * 61) % 360,
        red: i % 6 === 0,
      })),
    [],
  );
  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      {grains.map((g, i) => (
        <motion.span
          key={i}
          className="absolute top-[10%]"
          style={{
            left: `${g.x}%`,
            width: g.red ? "1.3cqw" : "2.4cqw",
            height: g.red ? "1.3cqw" : "1cqw",
            borderRadius: "999px",
            background: g.red ? "#d0202f" : GRAIN[i % GRAIN.length],
            border: g.red ? "none" : "1px solid #b98c3c",
          }}
          initial={{ y: 0, x: 0, rotate: g.rot, opacity: 0 }}
          animate={{ y: "170cqw", x: ["0cqw", `${g.sway}cqw`, `${-g.sway / 2}cqw`], rotate: g.rot + 420, opacity: [0, 1, 1, 0] }}
          transition={{ duration: g.t, delay: g.d, ease: "easeIn", times: [0, 0.08, 0.85, 1] }}
        />
      ))}
    </div>
  );
}

function Petals() {
  const petals = useMemo(() => Array.from({ length: 10 }, (_, i) => ({ x: 12 + ((i * 41) % 76), d: (i * 0.9) % 6, t: 7 + (i % 4), pink: i % 2 === 0 })), []);
  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      {petals.map((p, i) => (
        <motion.span
          key={i}
          className="absolute top-[12%] h-[2cqw] w-[1.4cqw] rounded-[60%_40%_60%_40%]"
          style={{ left: `${p.x}%`, background: p.pink ? "#f29bb4" : "#fff4f0", border: "1px solid rgba(160,60,80,.35)" }}
          animate={{ y: ["0cqw", "170cqw"], x: ["0cqw", "6cqw", "-4cqw"], rotate: [0, 260] }}
          transition={{ duration: p.t, delay: p.d, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </div>
  );
}

/* ───────── Families, functions, closing: plain paper under the wada frame ───────── */

function Page({ children }: { children: ReactNode }) {
  return (
    <section className="relative flex min-h-svh w-full flex-col items-center justify-center px-[19%] pt-[34cqw] pb-[34cqw] text-center">{children}</section>
  );
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

function Families({ nameFont }: { nameFont: NameFont }) {
  return (
    <Page>
      <Reveal>
        <p className="text-[3.6cqw]" style={{ fontFamily: deva, color: C.maroon }}>
          ॥ वक्रतुंड महाकाय सूर्यकोटि समप्रभ ॥
        </p>
        <Small className="mt-[4cqw]">With the blessings of our elders</Small>
        <p className="mt-[3.5cqw] text-[4.4cqw] leading-snug font-semibold" style={{ fontFamily: serif, color: C.ink }}>
          Mr. Vijay &amp; Mrs. Sunanda Kulkarni and Mr. Prakash &amp; Mrs. Meera Deshpande request the pleasure of your company at the wedding of their children
        </p>
      </Reveal>
      <Divider />
      <Reveal delay={0.15}>
        <p className="text-[4cqw]" style={{ fontFamily: deva, color: C.green }}>चि. सौ. कां.</p>
        <p className="leading-tight" style={nameStyle(nameFont, 11, C.maroon)}>Aditi</p>
        <p className="mt-[1cqw] text-[3.6cqw] italic" style={{ fontFamily: serif, color: C.ink }}>daughter of Mr. Vijay &amp; Mrs. Sunanda Kulkarni</p>
      </Reveal>
      <p className="my-[2.5cqw] text-[6cqw]" style={{ fontFamily: serif, color: C.gold }}>&amp;</p>
      <Reveal delay={0.3}>
        <p className="text-[4cqw]" style={{ fontFamily: deva, color: C.green }}>चि.</p>
        <p className="leading-tight" style={nameStyle(nameFont, 11, C.maroon)}>Sameer</p>
        <p className="mt-[1cqw] text-[3.6cqw] italic" style={{ fontFamily: serif, color: C.ink }}>son of Mr. Prakash &amp; Mrs. Meera Deshpande</p>
      </Reveal>
    </Page>
  );
}

function Event({ mr, en, when, venue, dress }: { mr: string; en: string; when: string; venue: string; dress: string }) {
  return (
    <Reveal>
      <p className="text-[7cqw] leading-tight" style={{ fontFamily: deva, color: C.maroon }}>{mr}</p>
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
        <p className="text-[8.5cqw] leading-tight" style={{ fontFamily: deva, color: C.maroon }}>सोहळे</p>
      </Reveal>
      <div className="mt-[3cqw]" />
      <Event mr="हळद" en="Haldi" when="Friday, 19 Feb · 10:00 am" venue="Kulkarni Wada, Sadashiv Peth, Pune" dress="Shades of yellow" />
      <Divider />
      <Event mr="शुभमुहूर्त · लग्न" en="Lagna · Muhurta 11:45 am" when="Saturday, 20 Feb · 11:45 am" venue="Shree Ganesh Mangal Karyalay, Kothrud, Pune" dress="Paithani & pheta" />
    </Page>
  );
}

function Closing({ nameFont }: { nameFont: NameFont }) {
  return (
    <section className="relative h-svh min-h-[178cqw] w-full overflow-hidden">
      <Image src={art("marathi-wada.jpg")} alt="The bride and groom walk home together, her pallu tied to his shela" fill sizes="480px" className="object-cover" />
      <div className="absolute inset-x-[19%] top-[16.5%] flex flex-col items-center text-center">
        <Reveal>
          <p className="text-[4cqw] leading-snug font-semibold italic" style={{ fontFamily: serif, color: C.ink }}>
            Two families, one new home. Come, bless the beginning.
          </p>
          <p className="mt-[1.5cqw] leading-tight whitespace-nowrap" style={nameStyle(nameFont, 8.6, C.maroon)}>
            Aditi &amp; Sameer
          </p>
          <p className="mt-[1.5cqw] text-[3.8cqw]" style={{ fontFamily: deva, color: C.maroon }}>
            आपली उपस्थिती प्रार्थनीय
          </p>
        </Reveal>
      </div>
    </section>
  );
}
