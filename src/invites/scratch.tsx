"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { seeded } from "@/art/geometry";
import type { Invite } from "@/data/invites";
import { dayNum, monthName, weekday, yearNum } from "@/lib/format";
import { Reveal } from "./shared";
import type { InviteTheme } from "./types";

const REVEAL_AT = 0.5; // share of the foil scratched before it clears itself

/** Paints a gold foil with sparkle and a hint, sized to the canvas. */
function paintFoil(ctx: CanvasRenderingContext2D, w: number, h: number, dpr: number) {
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
  ctx.fillText("✦  SCRATCH TO REVEAL THE DATE  ✦", w / 2, h / 2);
}

function Confetti({ colors }: { colors: string[] }) {
  const bits = useMemo(() => {
    const rnd = seeded(11);
    return Array.from({ length: 36 }, (_, i) => ({ x: (rnd() - 0.5) * 340, y: -60 - rnd() * 220, r: rnd() * 540, c: colors[i % colors.length], s: 5 + rnd() * 6, d: rnd() * 0.15 }));
  }, [colors]);
  return (
    <div className="pointer-events-none absolute top-1/2 left-1/2" aria-hidden>
      {bits.map((b, i) => (
        <motion.span
          key={i}
          className="absolute block rounded-[1px]"
          style={{ width: b.s, height: b.s * 0.6, background: b.c }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{ x: b.x, y: [0, b.y, b.y + 260], opacity: [1, 1, 0], rotate: b.r }}
          transition={{ duration: 1.8, delay: b.d, ease: "easeOut" }}
        />
      ))}
    </div>
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

  useEffect(() => {
    const el = box.current;
    const cv = canvas.current;
    if (!el || !cv) return;
    const setup = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = el.clientWidth * dpr;
      cv.height = el.clientHeight * dpr;
      const ctx = cv.getContext("2d");
      if (ctx) paintFoil(ctx, cv.width, cv.height, dpr);
    };
    setup();
    const ro = new ResizeObserver(() => !revealed && setup());
    ro.observe(el);
    return () => ro.disconnect();
  }, [revealed]);

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
    if (!revealed && scratched() > REVEAL_AT) setRevealed(true);
  }

  const colors = [theme.accent, "#f3d98a", "#ffffff", "#e8582a"];

  return (
    <section className={theme.ui.section}>
      <Reveal>
        <theme.Title kicker="A little surprise">Save the date</theme.Title>
      </Reveal>
      <Reveal delay={0.1}>
        <div ref={box} className={`${theme.ui.card} relative mt-[8cqw] overflow-visible`}>
          <div className="flex flex-col items-center px-[6cqw] py-[9cqw] text-center">
            <p className="inv-label text-[2.8cqw] opacity-70">{weekday(invite.date)}</p>
            <p className="inv-serif mt-[2cqw] text-[18cqw] leading-none">{dayNum(invite.date).replace(/^0/, "")}</p>
            <p className="inv-label mt-[2cqw] text-[3.4cqw]">
              {monthName(invite.date)} · {yearNum(invite.date)}
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
                aria-label="Scratch to reveal the wedding date"
                role="img"
              />
            )}
          </AnimatePresence>
          {revealed && <Confetti colors={colors} />}
        </div>
        {!revealed && (
          <button type="button" onClick={() => setRevealed(true)} className={`mx-auto mt-[4cqw] block text-[3.2cqw] underline underline-offset-4 ${theme.ui.muted}`}>
            Tap here to reveal instead
          </button>
        )}
      </Reveal>
    </section>
  );
}
