"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Three ideas for the Marathi design's scratch-to-reveal, shown still so the user can pick one:
 * an antarpat, a kunku seal, and Paithani silk. Solid colours only. Temporary (lab only).
 */

const C = { maroon: "#7a1424", ink: "#4a1d14", gold: "#b88a2e", green: "#2d6a35", paper: "#fbf0d6", kunku: "#b5121b", cream: "#fbf0d6" };
const label = "var(--font-cinzel)";
const serif = "var(--font-cormorant)";
const script = "var(--font-great-vibes)";

type Paint = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;

function Cover({ paint, className, style }: { paint: Paint; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    // Draws once the canvas has a size, and again whenever it changes (a browser can lay the page out
    // after this first runs).
    const draw = () => {
      const r = c.getBoundingClientRect();
      if (!r.width || !r.height) return;
      c.width = Math.round(r.width * 2);
      c.height = Math.round(r.height * 2);
      const ctx = c.getContext("2d");
      if (!ctx) return;
      ctx.scale(2, 2);
      paint(ctx, r.width, r.height);
    };
    draw();
    document.fonts?.ready.then(draw);
    const ro = new ResizeObserver(draw);
    ro.observe(c);
    return () => ro.disconnect();
  }, [paint]);
  return <canvas ref={ref} className={className} style={style} />;
}

/** The arch's outline, inset, so borders follow the arch. */
function arch(ctx: CanvasRenderingContext2D, w: number, h: number, ry: number, inset: number) {
  ctx.beginPath();
  ctx.moveTo(inset, h - inset);
  ctx.lineTo(inset, ry);
  ctx.ellipse(w / 2, ry, w / 2 - inset, ry - inset, 0, Math.PI, Math.PI * 2);
  ctx.lineTo(w - inset, h - inset);
  ctx.closePath();
}

function words(ctx: CanvasRenderingContext2D, w: number, y: number, big: string, small: string, colour: string) {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = colour;
  ctx.font = `600 ${Math.round(w * 0.048)}px Cinzel, serif`;
  ctx.fillText(big, w / 2, y);
  ctx.font = `italic ${Math.round(w * 0.052)}px "Cormorant Garamond", serif`;
  ctx.fillText(small, w / 2, y + w * 0.075);
}

/* 1 · Antarpat: maroon silk, a plain gold border, the swastik in the middle. */
const antarpat: Paint = (ctx, w, h) => {
  const ry = w * 0.46;
  const b = w * 0.055;
  ctx.fillStyle = C.gold;
  arch(ctx, w, h, ry, 0);
  ctx.fill();
  ctx.fillStyle = C.maroon;
  arch(ctx, w, h, ry, b);
  ctx.fill();
  ctx.strokeStyle = C.gold;
  ctx.lineWidth = 1;
  arch(ctx, w, h, ry, b + 5);
  ctx.stroke();
  // small maroon diamonds along the gold border's foot
  ctx.fillStyle = C.maroon;
  for (let x = b * 0.9; x < w - b * 0.5; x += b * 0.9) {
    const y = h - b / 2;
    ctx.beginPath();
    ctx.moveTo(x, y - b * 0.25);
    ctx.lineTo(x + b * 0.18, y);
    ctx.lineTo(x, y + b * 0.25);
    ctx.lineTo(x - b * 0.18, y);
    ctx.fill();
  }
  // the swastik
  const cx = w / 2;
  const cy = h * 0.42;
  const s = w * 0.11;
  ctx.strokeStyle = C.gold;
  ctx.lineWidth = s * 0.16;
  ctx.lineCap = "square";
  ctx.beginPath();
  ctx.moveTo(cx, cy - s);
  ctx.lineTo(cx, cy + s);
  ctx.moveTo(cx - s, cy);
  ctx.lineTo(cx + s, cy);
  ctx.moveTo(cx, cy - s);
  ctx.lineTo(cx + s, cy - s);
  ctx.moveTo(cx + s, cy);
  ctx.lineTo(cx + s, cy + s);
  ctx.moveTo(cx, cy + s);
  ctx.lineTo(cx - s, cy + s);
  ctx.moveTo(cx - s, cy);
  ctx.lineTo(cx - s, cy - s);
  ctx.stroke();
  ctx.fillStyle = C.gold;
  for (const [dx, dy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    ctx.beginPath();
    ctx.arc(cx + dx * s * 0.5, cy + dy * s * 0.5, s * 0.11, 0, Math.PI * 2);
    ctx.fill();
  }
  words(ctx, w, h * 0.66, "RUB THE ANTARPAT", "to reveal the muhurta", C.cream);
};

/* 2 · Kunku: one red disc with a gold ring. */
const kunku: Paint = (ctx, w, h) => {
  const r = Math.min(w, h) / 2;
  ctx.fillStyle = C.kunku;
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = C.gold;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, r * 0.88, 0, Math.PI * 2);
  ctx.stroke();
  // a ring of rice grains
  ctx.fillStyle = C.cream;
  for (let k = 0; k < 24; k++) {
    const a = (k / 24) * Math.PI * 2;
    ctx.save();
    ctx.translate(w / 2 + Math.cos(a) * r * 0.78, h / 2 + Math.sin(a) * r * 0.78);
    ctx.rotate(a + Math.PI / 2);
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.035, r * 0.015, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = C.gold;
  ctx.beginPath();
  ctx.arc(w / 2, h * 0.36, r * 0.06, 0, Math.PI * 2);
  ctx.fill();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = C.cream;
  ctx.font = `600 ${Math.round(r * 0.13)}px Cinzel, serif`;
  ctx.fillText("RUB THE KUNKU", w / 2, h * 0.55);
  ctx.font = `italic ${Math.round(r * 0.13)}px "Cormorant Garamond", serif`;
  ctx.fillText("to see the date", w / 2, h * 0.65);
};

/* 3 · Paithani: green silk, a gold border, a flat gold peacock, and the pallu's band of triangles. */
const PEACOCK_BODY = "M50 72 C 41 72, 38 62, 43 54 C 46 49, 47 42, 45 36 C 43 30, 45 25, 49 25 C 53 25, 54 29, 52 33 C 50 38, 53 44, 57 50 C 62 58, 60 72, 50 72 Z";
const paithani: Paint = (ctx, w, h) => {
  const ry = w * 0.46;
  const b = w * 0.05;
  const pallu = h * 0.14;
  ctx.fillStyle = C.gold;
  arch(ctx, w, h, ry, 0);
  ctx.fill();
  ctx.fillStyle = C.green;
  arch(ctx, w, h - pallu + b, ry, b);
  ctx.fill();
  // the pallu: a gold band with a row of green triangles
  const y0 = h - pallu;
  ctx.fillStyle = C.green;
  const tw = w / 12;
  for (let k = 0; k < 12; k++) {
    ctx.beginPath();
    ctx.moveTo(k * tw + tw * 0.15, h - b);
    ctx.lineTo(k * tw + tw / 2, y0 + b * 1.2);
    ctx.lineTo(k * tw + tw * 0.85, h - b);
    ctx.fill();
  }
  ctx.fillStyle = C.maroon;
  ctx.fillRect(b, y0 + b * 0.35, w - 2 * b, 2);
  // the peacock, in a 100-unit box
  const s = (w * 0.5) / 100;
  ctx.save();
  ctx.translate(w / 2 - 50 * s, h * 0.38 - 50 * s);
  ctx.scale(s, s);
  // the tail, fanned out behind
  for (let k = 0; k < 9; k++) {
    const a = Math.PI * (1.05 + (k / 8) * 0.9);
    const x = 50 + Math.cos(a) * 36;
    const y = 62 + Math.sin(a) * 36;
    ctx.strokeStyle = C.gold;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(50, 62);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(x, y, 5.5, 7.5, a + Math.PI / 2, 0, Math.PI * 2);
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.fillStyle = C.gold;
    ctx.beginPath();
    ctx.arc(x, y, 2.3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = C.gold;
  ctx.fill(new Path2D(PEACOCK_BODY));
  // crest and eye
  ctx.strokeStyle = C.gold;
  ctx.lineWidth = 1;
  for (const [x, y] of [[45, 17], [49, 15], [53, 17]]) {
    ctx.beginPath();
    ctx.moveTo(49, 25);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x, y, 1.6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = C.green;
  ctx.beginPath();
  ctx.arc(50, 28.5, 1.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  words(ctx, w, h * 0.7, "RUB THE PAITHANI", "to reveal the muhurta", C.cream);
};

function Idea({ n, name, note, children }: { n: number; name: string; note: string; children: ReactNode }) {
  return (
    <section className="flex flex-col items-center px-[14%] py-[12cqw] text-center">
      <p className="text-[2.6cqw] tracking-[0.28em] uppercase" style={{ fontFamily: label, color: C.gold }}>
        Idea {n}
      </p>
      <p className="text-[11cqw] leading-tight" style={{ fontFamily: script, color: C.maroon }}>
        {name}
      </p>
      <p className="mt-[1cqw] mb-[6cqw] text-[3.6cqw] italic" style={{ fontFamily: serif, color: C.ink }}>
        {note}
      </p>
      {children}
    </section>
  );
}

export function Ideas() {
  return (
    <div className="flex min-h-svh justify-center bg-[#1b1412]">
      <div className="@container w-full max-w-[480px]" style={{ background: C.paper }}>
        <Idea n={1} name="Antarpat" note="Rub away the silk held between the couple.">
          <Cover paint={antarpat} className="aspect-[3/4] w-full" />
        </Idea>
        <Idea n={2} name="Kunku" note="Rub away the kumkum to see the date.">
          <div className="flex w-full flex-col items-center rounded-[2cqw] py-[8cqw]" style={{ border: `0.4cqw solid ${C.gold}` }}>
            <p className="text-[2.4cqw] tracking-[0.3em] uppercase" style={{ fontFamily: label, color: C.green }}>
              Shubh vivah
            </p>
            <div className="mt-[4cqw] rounded-full p-[1.2cqw]" style={{ border: `0.4cqw solid ${C.gold}` }}>
              <Cover paint={kunku} className="block size-[50cqw] rounded-full" />
            </div>
            <p className="mt-[4cqw] text-[3.6cqw] italic" style={{ fontFamily: serif, color: C.ink }}>
              at the auspicious hour of
            </p>
            <p className="text-[9cqw] leading-tight" style={{ fontFamily: script, color: C.maroon }}>
              11:45 am
            </p>
          </div>
        </Idea>
        <Idea n={3} name="Paithani" note="Rub away the silk to see the date woven beneath.">
          <Cover paint={paithani} className="aspect-[3/4] w-full" />
        </Idea>
      </div>
    </div>
  );
}
