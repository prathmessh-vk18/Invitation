"use client";

import { motion } from "framer-motion";
import { useId, useMemo } from "react";
import { cleanId, jharokhaPath, r2, seeded } from "./geometry";
import { MarigoldHead } from "./ornaments";

// Original, code-drawn artwork for the Bagh (palace garden) design.

export const BAGH = {
  cream: "#f4ecdd",
  wall: "#ebe0cc",
  plum: "#3d1633",
  terracotta: "#c4622d",
  ochre: "#d99a3e",
  leaf: "#2f6b3a",
  leafLight: "#5c9a4d",
  pool: "#4fbfcf",
  gold: "#c9a24a",
};

/* ───────── Painted arch frame ───────── */

function BandPattern({ id }: { id: string }) {
  return (
    <pattern id={id} width="44" height="44" patternUnits="userSpaceOnUse">
      <rect width="44" height="44" fill="#d47a3c" />
      <path d="M8 34 C14 26 20 26 24 30 M30 12 C36 6 40 8 42 12" stroke="#2f6b3a" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <ellipse cx="18" cy="30" rx="5" ry="2.4" fill="#3f7d3f" transform="rotate(-30 18 30)" />
      <ellipse cx="36" cy="10" rx="5" ry="2.4" fill="#3f7d3f" transform="rotate(25 36 10)" />
      <g transform="translate(12 12) scale(0.8)">
        <MarigoldHead r={8} hue="orange" />
      </g>
      <g transform="translate(33 31) scale(0.7)">
        <MarigoldHead r={8} hue="yellow" />
      </g>
      <circle cx="40" cy="40" r="2" fill="#fbe3b0" />
    </pattern>
  );
}

/** The floral band on its own, to fill any space around the arch. */
export function PaintedBand({ className }: { className?: string }) {
  const id = cleanId(useId());
  return (
    <svg className={className} aria-hidden>
      <defs>
        <BandPattern id={`${id}b`} />
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id}b)`} />
    </svg>
  );
}

/** A cusped arch cut out of a painted floral band. Fills a 360×640 stage. */
export function PaintedArch({ className }: { className?: string }) {
  const id = cleanId(useId());
  const arch = jharokhaPath(300, 600, 190, 5, 0.3);
  return (
    <svg viewBox="0 0 360 640" className={className} preserveAspectRatio="xMidYMid meet" aria-hidden>
      <defs>
        <BandPattern id={`${id}f`} />
        <mask id={`${id}m`}>
          <rect width="360" height="640" fill="white" />
          <path d={arch} transform="translate(30 70)" fill="black" />
        </mask>
        <linearGradient id={`${id}g`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#5a2a10" stopOpacity="0.25" />
        </linearGradient>
      </defs>
      <g mask={`url(#${id}m)`}>
        <rect width="360" height="640" fill={`url(#${id}f)`} />
        <rect width="360" height="640" fill={`url(#${id}g)`} />
      </g>
      <path d={arch} transform="translate(30 70)" fill="none" stroke="#f3d18a" strokeWidth="5" />
      <path d={arch} transform="translate(30 70)" fill="none" stroke="#7a3a14" strokeWidth="1.2" />
      <path d={jharokhaPath(286, 592, 182, 5, 0.3)} transform="translate(37 78)" fill="none" stroke="#f3d18a" strokeWidth="0.8" strokeDasharray="2 3" opacity="0.8" />
      {/* keystone ornament */}
      <g transform="translate(180 54)">
        <path d="M-16 0 C-10 -14 10 -14 16 0 C10 6 -10 6 -16 0 Z" fill="#f3d18a" />
        <circle r="5" fill="#c4622d" />
      </g>
    </svg>
  );
}

/* ───────── Garden scene ───────── */

export function Chhatri({ x, y, s = 1, tone = "#f7f3ea" }: { x: number; y: number; s?: number; tone?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-34 0 C-34 -28 -18 -44 0 -46 C18 -44 34 -28 34 0 Z" fill={tone} stroke="#b9b2a2" strokeWidth="0.8" />
      {[-24, -12, 0, 12, 24].map((dx) => (
        <path key={dx} d={`M${dx} -2 C${dx * 0.9} -20 ${dx * 0.5} -36 0 -45`} stroke="#d5cfc0" strokeWidth="0.7" fill="none" />
      ))}
      <path d="M0 -46 V-56 M-3 -52 H3" stroke="#c9a24a" strokeWidth="1.6" />
      <circle cy="-57" r="2" fill="#c9a24a" />
      <rect x="-38" y="0" width="76" height="5" fill={tone} stroke="#b9b2a2" strokeWidth="0.6" />
      {[-30, -15, 0, 15, 30].map((dx) => (
        <rect key={dx} x={dx - 2} y="5" width="4" height="30" fill={tone} stroke="#c8c1b1" strokeWidth="0.5" />
      ))}
      <rect x="-40" y="35" width="80" height="5" fill={tone} stroke="#b9b2a2" strokeWidth="0.6" />
    </g>
  );
}

function Balustrade({ y, width }: { y: number; width: number }) {
  const n = Math.floor(width / 9);
  return (
    <g>
      <rect x="0" y={y} width={width} height="4" fill="#eee7d8" />
      {Array.from({ length: n }, (_, i) => (
        <path key={i} d={`M${i * 9 + 4.5} ${y + 4} c-3 3 -3 7 0 9 c3 2 3 6 0 9`} stroke="#d8cfbd" strokeWidth="2.2" fill="none" />
      ))}
      <rect x="0" y={y + 22} width={width} height="5" fill="#e6ddcb" />
    </g>
  );
}

export function Peacock({ x, y, s = 1, flip }: { x: number; y: number; s?: number; flip?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <path d="M-6 0 C-30 4 -58 10 -78 22 C-56 20 -30 14 -4 8 Z" fill="#2f7d4a" />
      {[-30, -48, -66].map((tx, i) => (
        <g key={tx}>
          <ellipse cx={tx} cy={6 + i * 4.5} rx="4" ry="3" fill="#1d5aa6" />
          <circle cx={tx} cy={6 + i * 4.5} r="1.4" fill="#e8b33a" />
        </g>
      ))}
      <path d="M-8 4 C-10 -8 -2 -14 6 -10 C10 -8 10 -2 6 4 Z" fill="#1f5fb0" />
      <path d="M4 -8 C6 -18 4 -24 8 -28 C12 -26 11 -20 9 -10 Z" fill="#1f5fb0" />
      <circle cx="9" cy="-28" r="3" fill="#2366bf" />
      <path d="M11 -28 L15 -27 L11 -26 Z" fill="#e0a23a" />
      {[-3, 0, 3].map((dx) => (
        <g key={dx}>
          <line x1={9} y1={-31} x2={9 + dx} y2={-37} stroke="#1f5fb0" strokeWidth="0.6" />
          <circle cx={9 + dx} cy={-37.5} r="1" fill="#1f5fb0" />
        </g>
      ))}
      <path d="M-2 4 V12 M3 4 V12" stroke="#8a6a3a" strokeWidth="1" />
    </g>
  );
}

export function BananaLeaves({ className, flip }: { className?: string; flip?: boolean }) {
  const leaves = [
    { r: -28, l: 150, w: 26, c: BAGH.leaf },
    { r: 6, l: 130, w: 24, c: BAGH.leafLight },
    { r: 38, l: 110, w: 20, c: "#3d7f40" },
  ];
  return (
    <svg viewBox="0 0 200 180" className={className} style={{ transform: flip ? "scaleX(-1)" : undefined }} aria-hidden>
      {leaves.map((L, i) => (
        <motion.g
          key={i}
          style={{ transformOrigin: "0px 0px", transformBox: "view-box" }}
          animate={{ rotate: [L.r, L.r + 3, L.r] }}
          transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut" }}
        >
          <path d={`M0 0 C${L.l * 0.3} ${-L.w} ${L.l * 0.75} ${-L.w * 0.8} ${L.l} 0 C${L.l * 0.75} ${L.w * 0.9} ${L.l * 0.3} ${L.w} 0 0 Z`} fill={L.c} />
          <path d={`M0 0 L${L.l} 0`} stroke="#bfe0a0" strokeWidth="1.4" />
          {Array.from({ length: 7 }, (_, k) => {
            const t = (k + 1) / 8;
            return <path key={k} d={`M${r2(L.l * t)} ${r2(-L.w * 0.75 * Math.sin(Math.PI * t))} L${r2(L.l * t + 6)} ${r2(-L.w * 0.3 * Math.sin(Math.PI * t))}`} stroke="#1f4f28" strokeWidth="1" opacity="0.6" />;
          })}
        </motion.g>
      ))}
      <g transform="translate(18 18)">
        <MarigoldHead r={9} hue="orange" />
      </g>
      <g transform="translate(36 8) scale(0.7)">
        <MarigoldHead r={9} hue="yellow" />
      </g>
    </svg>
  );
}

/** Rows of rounded garden shrubs with a cypress or two. Fills its box from the bottom. */
export function Shrubs({ className, seed = 4 }: { className?: string; seed?: number }) {
  const bushes = useMemo(() => {
    const rnd = seeded(seed);
    const rows = [
      { y: 40, n: 9, r: 20, c: ["#2f6b3a", "#3c7d42"] },
      { y: 62, n: 11, r: 18, c: ["#24563a", "#33713e"] },
      { y: 82, n: 13, r: 16, c: ["#1f4d30", "#2b6338"] },
    ];
    return rows.flatMap((row) => Array.from({ length: row.n }, (_, i) => ({ x: (i + rnd() * 0.6) * (360 / (row.n - 1)) - 10, y: row.y + rnd() * 6, r: row.r * (0.8 + rnd() * 0.4), c: row.c[i % 2] })));
  }, [seed]);
  return (
    <svg viewBox="0 0 360 100" preserveAspectRatio="xMidYMax slice" className={className} aria-hidden>
      {[70, 300].map((x) => (
        <path key={x} d={`M${x} 60 C${x - 9} 40 ${x - 6} 10 ${x} -6 C${x + 6} 10 ${x + 9} 40 ${x} 60 Z`} fill="#24533a" />
      ))}
      {bushes.map((b, i) => (
        <g key={i}>
          <circle cx={b.x} cy={b.y} r={b.r} fill={b.c} />
          <path d={`M${b.x - b.r * 0.6} ${b.y - b.r * 0.2} q${b.r * 0.3} -${b.r * 0.4} ${b.r * 0.6} 0 q${b.r * 0.3} -${b.r * 0.4} ${b.r * 0.6} 0`} stroke="#8fc07a" strokeWidth="1" fill="none" opacity="0.5" />
        </g>
      ))}
      <rect y="92" width="360" height="10" fill="#1d4a2e" />
    </svg>
  );
}

/** Sky, chhatris, balustrade, lotus pool and fountain. viewBox 360×420. */
export function GardenScene({ className, peacocks = true, fountain = true, sky = true }: { className?: string; peacocks?: boolean; fountain?: boolean; sky?: boolean }) {
  const id = cleanId(useId());
  return (
    <svg viewBox="0 0 360 420" preserveAspectRatio="xMidYMax slice" className={className} aria-hidden>
      <defs>
        <linearGradient id={`${id}s`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fbe8cf" />
          <stop offset="1" stopColor="#f6efe2" />
        </linearGradient>
        <linearGradient id={`${id}w`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#7fd6df" />
          <stop offset="1" stopColor="#2fa4b8" />
        </linearGradient>
      </defs>
      {sky && <rect width="360" height="420" fill={`url(#${id}s)`} />}
      <Chhatri x={70} y={200} s={0.9} />
      <Chhatri x={290} y={200} s={0.9} />
      <Chhatri x={180} y={190} s={1.15} />
      {[24, 336].map((x) => (
        <g key={x}>
          <path d={`M${x} 250 V170`} stroke="#6b4a2a" strokeWidth="3" />
          {[-60, -25, 15, 55, 100].map((a) => (
            <path key={a} d={`M${x} 172 q${r2(Math.cos((a * Math.PI) / 180) * 26)} ${r2(Math.sin((a * Math.PI) / 180) * 26 - 14)} ${r2(Math.cos((a * Math.PI) / 180) * 44)} ${r2(Math.sin((a * Math.PI) / 180) * 44)}`} stroke="#3f7d3f" strokeWidth="5" fill="none" strokeLinecap="round" />
          ))}
        </g>
      ))}
      <Balustrade y={238} width={360} />
      {peacocks && (
        <>
          <Peacock x={52} y={234} s={0.8} />
          <Peacock x={308} y={234} s={0.8} flip />
        </>
      )}
      <rect y="265" width="360" height="155" fill={`url(#${id}w)`} />
      {Array.from({ length: 8 }, (_, i) => (
        <motion.path
          key={i}
          d={`M${-40 + (i % 3) * 30} ${282 + i * 17} q20 -4 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0`}
          stroke="#ffffff"
          strokeOpacity="0.45"
          strokeWidth="1.2"
          fill="none"
          animate={{ x: [0, -40] }}
          transition={{ duration: 5 + (i % 3), repeat: Infinity, ease: "linear" }}
        />
      ))}
      {fountain && (
        <g transform="translate(180 330)">
          <ellipse cx="0" cy="34" rx="46" ry="9" fill="#e9e2d2" />
          <rect x="-6" y="0" width="12" height="34" fill="#efe9dc" />
          <ellipse cx="0" cy="0" rx="26" ry="6" fill="#f3eee3" />
          <rect x="-3" y="-26" width="6" height="26" fill="#efe9dc" />
          <ellipse cx="0" cy="-26" rx="13" ry="3.5" fill="#f3eee3" />
          {[-1, 1].map((d) => (
            <motion.path
              key={d}
              d={`M0 -30 C${d * 10} -50 ${d * 22} -36 ${d * 26} -4`}
              stroke="#e8fbff"
              strokeWidth="1.6"
              fill="none"
              strokeDasharray="4 4"
              animate={{ strokeDashoffset: [0, -16] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
            />
          ))}
        </g>
      )}
      {[
        [40, 390],
        [96, 404],
        [270, 396],
        [324, 382],
      ].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <ellipse rx="14" ry="4" fill="#3f8f4a" />
          <path d="M0 -12 C5 -6 5 -2 0 0 C-5 -2 -5 -6 0 -12 Z" fill="#f2a5b8" />
          <path d="M0 0 C-8 -2 -11 -7 -10 -10 C-5 -8 -2 -5 0 0 Z M0 0 C8 -2 11 -7 10 -10 C5 -8 2 -5 0 0 Z" fill="#e88aa2" />
        </g>
      ))}
    </svg>
  );
}

/* ───────── Glass garden gate ───────── */

/** One leaf of the gate. Glass lattice with a rounded top; `side` sets which way the curve faces. */
export function GateLeaf({ side }: { side: "left" | "right" }) {
  const id = cleanId(useId());
  const d = side === "left" ? "M0 570 V160 Q0 0 150 0 V570 Z" : "M0 570 V0 Q150 0 150 160 V570 Z";
  return (
    <svg viewBox="0 0 150 570" preserveAspectRatio="none" className="h-full w-full" aria-hidden>
      <defs>
        <clipPath id={`${id}c`}>
          <path d={d} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}c)`}>
        <rect width="150" height="570" fill="#ffffff" fillOpacity="0.32" />
        {[25, 50, 75, 100, 125].map((x) => (
          <line key={x} x1={x} y1="0" x2={x} y2="570" stroke="#efe4c8" strokeWidth={x === 75 ? 2 : 1} />
        ))}
        {[160, 300, 420].map((y) => (
          <line key={y} x1="0" y1={y} x2="150" y2={y} stroke="#efe4c8" strokeWidth="2.5" />
        ))}
        {Array.from({ length: 6 }, (_, i) => (
          <path key={i} d={`M${side === "left" ? 150 : 0} ${170 + i * 22} l${side === "left" ? -22 : 22} 11 l${side === "left" ? 22 : -22} 11`} stroke="#efe4c8" strokeWidth="0.8" fill="none" />
        ))}
        <rect x="0" y="420" width="150" height="150" fill="#ffffff" fillOpacity="0.55" />
        {[30, 75, 120].map((x) => (
          <path key={x} d={`M${x} 440 c-12 18 -12 40 0 60 c12 -20 12 -42 0 -60 Z`} fill="none" stroke="#d8c89c" strokeWidth="1.2" />
        ))}
      </g>
      <path d={d} fill="none" stroke="#c9a24a" strokeWidth="4" />
      <path d={d} fill="none" stroke="#fff6dc" strokeWidth="1" />
    </svg>
  );
}

/* ───────── Elephant procession ───────── */

/** A caparisoned elephant with a rider, walking right. viewBox 130×100. */
export function Elephant({ className, delay = 0 }: { className?: string; delay?: number }) {
  const legs = [
    { x: 30, p: 0 },
    { x: 44, p: 0.5 },
    { x: 70, p: 0.5 },
    { x: 84, p: 0 },
  ];
  return (
    <svg viewBox="0 0 130 100" className={className} aria-hidden>
      {legs.map((l, i) => (
        <motion.g
          key={i}
          style={{ transformOrigin: `${l.x + 5}px 64px`, transformBox: "view-box" }}
          animate={{ rotate: [-7, 7, -7] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut", delay: delay + l.p * 1.1 }}
        >
          <rect x={l.x} y="62" width="11" height="28" rx="4" fill={i % 2 ? "#5d6f99" : "#6b7ea8"} />
          <rect x={l.x - 1} y="86" width="13" height="5" rx="2" fill="#e8d9b8" />
        </motion.g>
      ))}
      <path d="M22 56 C14 52 10 60 12 70" stroke="#5d6f99" strokeWidth="2.5" fill="none" />
      <ellipse cx="58" cy="54" rx="38" ry="24" fill="#7286b0" />
      <circle cx="98" cy="46" r="17" fill="#7286b0" />
      <path d="M110 50 C118 62 116 78 108 84 C104 87 108 90 112 87" stroke="#7286b0" strokeWidth="9" fill="none" strokeLinecap="round" />
      <path d="M106 58 C112 60 116 64 118 70" stroke="#fffaf0" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M90 34 C78 34 74 48 80 60 C86 66 94 60 94 50 Z" fill="#5d6f99" />
      <circle cx="104" cy="42" r="1.8" fill="#1d2433" />
      <path d="M96 30 C102 26 110 30 112 38 L100 44 Z" fill="#e3a83a" />
      <circle cx="105" cy="34" r="2" fill="#c0392b" />
      <path d="M30 36 C50 26 72 26 88 36 L86 64 C68 72 46 72 32 64 Z" fill="#c0392b" />
      <path d="M30 36 C50 26 72 26 88 36" stroke="#e8b33a" strokeWidth="3" fill="none" />
      <path d="M32 64 C46 72 68 72 86 64" stroke="#e8b33a" strokeWidth="3" fill="none" />
      {[42, 56, 70].map((x) => (
        <path key={x} d={`M${x} 42 l6 8 -6 8 -6 -8 Z`} fill="#1f4fa0" stroke="#e8b33a" strokeWidth="1" />
      ))}
      {[38, 48, 58, 68, 78].map((x) => (
        <circle key={x} cx={x} cy={67} r="1.6" fill="#e8b33a" />
      ))}
      <rect x="50" y="18" width="26" height="12" rx="2" fill="#e3a83a" />
      <path d="M48 18 C52 6 74 6 78 18 Z" fill="#c9862e" />
      <circle cx="63" cy="5" r="2" fill="#e8b33a" />
      <circle cx="90" cy="20" r="4.5" fill="#c98a5e" />
      <path d="M85 18 C86 12 94 12 95 18 Z" fill="#e8582a" />
      <path d="M88 24 L84 34 L96 34 L92 24 Z" fill="#f2efe6" />
    </svg>
  );
}

/** Floating golden specks. */
export function Sparkles({ count = 18, seed = 21 }: { count?: number; seed?: number }) {
  const dots = useMemo(() => {
    const rnd = seeded(seed);
    return Array.from({ length: count }, () => ({ x: rnd() * 100, y: rnd() * 100, s: 0.5 + rnd() * 1.2, d: rnd() * 5, t: 4 + rnd() * 5 }));
  }, [count, seed]);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((p, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-[#f6dc8f]"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${p.s}cqw`, height: `${p.s}cqw`, boxShadow: "0 0 6px #f6dc8f" }}
          animate={{ y: [0, -24, 0], opacity: [0, 1, 0] }}
          transition={{ duration: p.t, repeat: Infinity, delay: p.d, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/** Small kalash with mango leaves and a coconut, line-art. */
export function Kalash({ className, color = "#b5603a" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 60 70" className={className} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18 36 C10 46 12 62 30 64 C48 62 50 46 42 36 Z" />
      <path d="M16 36 H44 M22 30 H38 L36 36 H24 Z" />
      <path d="M22 50 H38" strokeDasharray="2 3" />
      <path d="M30 28 C25 18 27 10 30 6 C33 10 35 18 30 28 Z" fill={color} fillOpacity="0.15" />
      <path d="M24 30 C16 26 12 18 12 14 C18 16 22 22 24 30 Z M36 30 C44 26 48 18 48 14 C42 16 38 22 36 30 Z" />
    </svg>
  );
}
