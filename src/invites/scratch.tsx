"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MarigoldHead, PetalShape } from "@/art/ornaments";
import { seeded } from "@/art/geometry";
import type { Invite } from "@/data/invites";
import { useT } from "./i18n";
import { Reveal } from "./shared";
import type { InviteTheme } from "./types";

const REVEAL_AT = 0.5; // share of the foil scratched before it clears itself

/** Paints a gold foil with sparkle and a hint, sized to the canvas. */
function paintFoil(ctx: CanvasRenderingContext2D, w: number, h: number, dpr: number, hint: string) {
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, "#b8862e");
  g.addColorStop(0.3, "#f3d98a");
  g.addColorStop(0.5, "#c99a3c");
  g.addColorStop(0.72, "#f7e3a3");
  g.addColorStop(1, "#a9782a");
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  const rnd = seeded(7);
  for (let i = 0; i < 260; i++) {
    ctx.fillStyle = `rgba(255,255,255,${0.15 + rnd() * 0.45})`;
    ctx.fillRect(rnd() * w, rnd() * h, dpr * (0.6 + rnd()), dpr * (0.6 + rnd()));
  }
  ctx.strokeStyle = "rgba(120,80,20,.35)";
  ctx.lineWidth = dpr;
  ctx.setLineDash([4 * dpr, 4 * dpr]);
  ctx.strokeRect(8 * dpr, 8 * dpr, w - 16 * dpr, h - 16 * dpr);
  ctx.setLineDash([]);
  ctx.fillStyle = "rgba(90,55,10,.85)";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `600 ${Math.round(13 * dpr)}px Georgia, serif`;
  ctx.fillText(hint, w / 2, h / 2);
}

type Bloom = { kind: "marigold" | "petal" | "jasmine"; color: string; size: number; x0: number; y0: number; burstX: number; burstY: number; fallX: number; spin: number; delay: number; dur: number };

const petalColors = ["#f2b8c0", "#e98aa3", "#fbe1dc", "#f4a6a0", "#c2456b"];

function Flower({ kind, color }: { kind: Bloom["kind"]; color: string }) {
  if (kind === "marigold")
    return (
      <svg viewBox="-12 -12 24 24" className="h-full w-full drop-shadow-[0_2px_3px_rgba(0,0,0,.2)]">
        <MarigoldHead r={11} hue={color === "yellow" ? "yellow" : "orange"} />
      </svg>
    );
  if (kind === "jasmine")
    return (
      <svg viewBox="-12 -12 24 24" className="h-full w-full drop-shadow-[0_2px_3px_rgba(0,0,0,.18)]">
        {[0, 72, 144, 216, 288].map((r) => (
          <ellipse key={r} cx="0" cy="-6" rx="3.6" ry="6" fill="#fffdf6" transform={`rotate(${r})`} />
        ))}
        <circle r="2.4" fill="#f1d77a" />
      </svg>
    );
  return <PetalShape color={color} className="h-full w-full drop-shadow-[0_2px_3px_rgba(0,0,0,.15)]" />;
}

/**
 * A full-screen shower of marigolds, petals and jasmine: it bursts out of the card,
 * then drifts down past the bottom of the screen. Rendered on <body> so nothing clips it.
 */
function FlowerShower({ from }: { from: { x: number; y: number } }) {
  // Only ever mounted in the browser, after a guest scratches.
  const [vh] = useState(() => window.innerHeight);
  const blooms = useMemo<Bloom[]>(() => {
    const rnd = seeded(23);
    return Array.from({ length: 70 }, (_, i) => {
      const kind: Bloom["kind"] = i % 5 === 0 ? "marigold" : i % 7 === 0 ? "jasmine" : "petal";
      const a = rnd() * Math.PI * 2;
      const power = 90 + rnd() * 220;
      return {
        kind,
        color: kind === "marigold" ? (rnd() > 0.5 ? "yellow" : "orange") : petalColors[i % petalColors.length],
        size: kind === "petal" ? 12 + rnd() * 12 : 18 + rnd() * 12,
        x0: from.x,
        y0: from.y,
        burstX: Math.cos(a) * power,
        burstY: Math.sin(a) * power * 0.7 - 160 - rnd() * 140,
        fallX: (rnd() - 0.5) * 160,
        spin: (rnd() > 0.5 ? 1 : -1) * (240 + rnd() * 480),
        delay: rnd() * 0.25,
        dur: 3.4 + rnd() * 2.4,
      };
    });
  }, [from]);

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[80] overflow-hidden" aria-hidden>
      {blooms.map((f, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: f.x0 - f.size / 2, top: f.y0 - f.size / 2, width: f.size, height: f.size }}
          initial={{ x: 0, y: 0, scale: 0.3, opacity: 0, rotate: 0 }}
          animate={{
            x: [0, f.burstX, f.burstX + f.fallX],
            y: [0, f.burstY, vh - f.y0 + 80],
            scale: [0.3, 1, 1],
            opacity: [0, 1, 1],
            rotate: [0, f.spin * 0.3, f.spin],
          }}
          transition={{ duration: f.dur, delay: f.delay, times: [0, 0.18, 1], ease: ["easeOut", "easeIn"] }}
        >
          <Flower kind={f.kind} color={f.color} />
        </motion.div>
      ))}
    </div>,
    document.body,
  );
}

/**
 * Scratch card that hides the wedding date under gold foil. Works with finger or mouse;
 * a button reveals it for anyone who can't scratch.
 */
export function ScratchDate({ invite, theme }: { invite: Invite; theme: InviteTheme }) {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [burst, setBurst] = useState<{ x: number; y: number } | null>(null);
  const { t, d } = useT();
  const hint = t.scratchFoil;

  // Reveal and celebrate: flowers burst from the middle of the card.
  function reveal() {
    const r = box.current?.getBoundingClientRect();
    setBurst(r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : { x: window.innerWidth / 2, y: window.innerHeight / 2 });
    setRevealed(true);
    window.setTimeout(() => setBurst(null), 6500);
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
      if (ctx) paintFoil(ctx, cv.width, cv.height, dpr, hint);
    };
    setup();
    const ro = new ResizeObserver(() => !revealed && setup());
    ro.observe(el);
    return () => ro.disconnect();
  }, [revealed, hint]);

  function scratched() {
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
    ctx.strokeStyle = "#000"; // any fully opaque colour: it sets how much is erased
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
    if (!revealed && scratched() > REVEAL_AT) reveal();
  }

  return (
    <section className={theme.ui.section}>
      <Reveal>
        <theme.Title kicker={t.scratchKicker}>{t.scratchTitle}</theme.Title>
      </Reveal>
      <Reveal delay={0.1}>
        <div ref={box} className={`${theme.ui.card} relative mt-[8cqw] overflow-visible`}>
          <div className="flex flex-col items-center px-[6cqw] py-[9cqw] text-center">
            <p className="inv-label text-[2.8cqw] opacity-70">{d.weekday(invite.date)}</p>
            <p className="inv-serif mt-[2cqw] text-[18cqw] leading-none">{d.day(invite.date)}</p>
            <p className="inv-label mt-[2cqw] text-[3.4cqw]">
              {d.month(invite.date)} · {d.year(invite.date)}
            </p>
            <p className="inv-serif mt-[3cqw] text-[3.8cqw] italic opacity-80">{invite.city}</p>
          </div>
          <AnimatePresence>
            {!revealed && (
              <motion.canvas
                key="foil"
                ref={canvas}
                exit={{ opacity: 0, scale: 1.04 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 h-full w-full cursor-grab touch-none rounded-[inherit] active:cursor-grabbing"
                onPointerDown={(e) => {
                  drawing.current = true;
                  e.currentTarget.setPointerCapture(e.pointerId);
                  scratch(e);
                }}
                onPointerMove={scratch}
                onPointerUp={end}
                onPointerCancel={end}
                aria-label={t.scratchAria}
                role="img"
              />
            )}
          </AnimatePresence>
        </div>
        {!revealed && (
          <button type="button" onClick={reveal} className={`mx-auto mt-[4cqw] block text-[3.2cqw] underline underline-offset-4 ${theme.ui.muted}`}>
            {t.revealInstead}
          </button>
        )}
      </Reveal>
      {burst && <FlowerShower from={burst} />}
    </section>
  );
}
