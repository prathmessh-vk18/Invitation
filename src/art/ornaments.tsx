import { useId, type CSSProperties } from "react";
import { cleanId, jharokhaPath, petalPath, r2, scallopPath } from "./geometry";

type Svg = { className?: string; style?: CSSProperties };

/* ───────────────────────── Mandala ───────────────────────── */

type Ring = { r: number; count: number; len: number; width: number; kind?: "petal" | "dot" | "line"; fill?: boolean };

const defaultRings: Ring[] = [
  { r: 6, count: 8, len: 10, width: 4, fill: true },
  { r: 18, count: 16, len: 2, width: 2, kind: "dot" },
  { r: 22, count: 12, len: 16, width: 7 },
  { r: 40, count: 24, len: 3, width: 1.4, kind: "dot" },
  { r: 44, count: 16, len: 18, width: 8, fill: true },
  { r: 64, count: 32, len: 6, width: 1, kind: "line" },
  { r: 72, count: 24, len: 16, width: 6 },
  { r: 90, count: 48, len: 2, width: 1.2, kind: "dot" },
];

export function Mandala({
  className,
  style,
  color = "currentColor",
  rings = defaultRings,
  stroke = 1,
}: Svg & { color?: string; rings?: Ring[]; stroke?: number }) {
  return (
    <svg viewBox="-100 -100 200 200" className={className} style={style} aria-hidden>
      <g fill="none" stroke={color} strokeWidth={stroke} strokeLinejoin="round">
        {rings.map((ring, ri) => (
          <g key={ri}>
            {ring.kind !== "dot" && ring.kind !== "line" && (
              <circle r={ring.r} strokeOpacity={0.55} strokeWidth={stroke * 0.6} />
            )}
            {Array.from({ length: ring.count }, (_, i) => {
              const angle = (360 / ring.count) * i + (ri % 2 ? 180 / ring.count : 0);
              if (ring.kind === "dot")
                return <circle key={i} cx={0} cy={-ring.r} r={ring.width} fill={color} stroke="none" transform={`rotate(${r2(angle)})`} />;
              if (ring.kind === "line")
                return <line key={i} x1={0} y1={-ring.r} x2={0} y2={-ring.r - ring.len} transform={`rotate(${r2(angle)})`} />;
              return (
                <path
                  key={i}
                  d={petalPath(ring.r, ring.len, ring.width)}
                  transform={`rotate(${r2(angle)})`}
                  fill={ring.fill ? color : "none"}
                  fillOpacity={ring.fill ? 0.18 : 0}
                />
              );
            })}
          </g>
        ))}
      </g>
    </svg>
  );
}

/* ───────────────────────── Marigold ───────────────────────── */

export function MarigoldHead({ cx = 0, cy = 0, r = 10, hue = "orange" }: { cx?: number; cy?: number; r?: number; hue?: "orange" | "yellow" }) {
  const c = hue === "orange" ? ["#d9620b", "#f08419", "#f9a531"] : ["#e59a07", "#f6b819", "#fdd54a"];
  return (
    <g transform={`translate(${r2(cx)} ${r2(cy)})`}>
      <path d={scallopPath(r * 0.85, 14, r * 0.22)} fill={c[0]} />
      <path d={scallopPath(r * 0.62, 12, r * 0.2)} fill={c[1]} transform="rotate(12)" />
      <path d={scallopPath(r * 0.38, 9, r * 0.16)} fill={c[2]} transform="rotate(5)" />
      <circle r={r * 0.14} fill={c[0]} opacity={0.6} />
    </g>
  );
}

function MangoLeaf({ x, y, rot, s = 1 }: { x: number; y: number; rot: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d="M0 0 C6 6 6 20 0 30 C-6 20 -6 6 0 0 Z" fill="#3f7a3a" />
      <path d="M0 2 L0 28" stroke="#9bc27a" strokeWidth={0.8} />
    </g>
  );
}

/** A hanging string of marigolds, drawn top-down from (0,0). */
export function MarigoldStrand({ count = 6, r = 7, tassel = true }: { count?: number; r?: number; tassel?: boolean }) {
  return (
    <g>
      <line x1={0} y1={0} x2={0} y2={count * r * 1.7} stroke="#8a5a1c" strokeWidth={0.8} />
      {Array.from({ length: count }, (_, i) => (
        <MarigoldHead key={i} cy={r + i * r * 1.7} r={r} hue={i % 2 ? "yellow" : "orange"} />
      ))}
      {tassel && <MangoLeaf x={0} y={count * r * 1.7 + r * 0.4} rot={0} s={0.55} />}
    </g>
  );
}

/** Toran — a festive garland across the top, with swaying strands. */
export function Toran({ className, style, strands = 9, width = 400 }: Svg & { strands?: number; width?: number }) {
  const step = width / (strands - 1);
  return (
    <svg viewBox={`0 0 ${width} 120`} className={className} style={style} preserveAspectRatio="xMidYMin slice" aria-hidden>
      {/* swags */}
      {Array.from({ length: strands - 1 }, (_, i) => {
        const x0 = i * step;
        const x1 = x0 + step;
        const n = 6;
        return (
          <g key={`s${i}`}>
            {Array.from({ length: n }, (_, k) => {
              const t = (k + 0.5) / n;
              const x = x0 + (x1 - x0) * t;
              const y = 8 + Math.sin(Math.PI * t) * 18;
              return <MarigoldHead key={k} cx={x} cy={y} r={6.2} hue={k % 2 ? "orange" : "yellow"} />;
            })}
          </g>
        );
      })}
      {/* rope */}
      <rect x={0} y={0} width={width} height={6} fill="#b8324a" />
      <rect x={0} y={5} width={width} height={1.5} fill="#e9bf62" />
      {Array.from({ length: strands }, (_, i) => (
        <g key={i} transform={`translate(${r2(i * step)} 6)`}>
          <g className="animate-sway" style={{ transformOrigin: "0px 0px", transformBox: "view-box", animationDelay: `${-i * 0.37}s` }}>
            <MarigoldStrand count={i % 2 ? 5 : 7} r={6.5} />
          </g>
          <MangoLeaf x={-3} y={-2} rot={25} s={0.45} />
          <MangoLeaf x={3} y={-2} rot={-25} s={0.45} />
        </g>
      ))}
    </svg>
  );
}

/* ───────────────────────── Diya ───────────────────────── */

export function Diya({ className, style, glow = true }: Svg & { glow?: boolean }) {
  const id = cleanId(useId());
  return (
    <svg viewBox="0 0 100 100" className={className} style={style} aria-hidden>
      <defs>
        <radialGradient id={`${id}g`} cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#ffe9a8" stopOpacity={0.9} />
          <stop offset="60%" stopColor="#ffb347" stopOpacity={0.25} />
          <stop offset="100%" stopColor="#ff9a2e" stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${id}f`} cx="50%" cy="75%" r="70%">
          <stop offset="0%" stopColor="#fffbe6" />
          <stop offset="35%" stopColor="#ffd54a" />
          <stop offset="75%" stopColor="#ff8a1e" />
          <stop offset="100%" stopColor="#e8521a" />
        </radialGradient>
        <linearGradient id={`${id}b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e7a44a" />
          <stop offset="100%" stopColor="#8f3d14" />
        </linearGradient>
      </defs>
      {glow && <circle cx={50} cy={40} r={40} fill={`url(#${id}g)`} />}
      <g className="animate-flicker" style={{ transformOrigin: "50px 62px", transformBox: "view-box" }}>
        <path d="M50 26 C58 38 60 48 56 56 C54 61 46 61 44 56 C40 48 42 38 50 26 Z" fill={`url(#${id}f)`} />
        <path d="M50 42 C53 48 53 53 51 57 C50 59 49 59 48.5 57 C47 53 47.5 48 50 42 Z" fill="#fffef5" opacity={0.85} />
      </g>
      <path d="M14 62 C22 60 78 60 88 58 L96 54 C92 66 82 80 50 80 C22 80 12 70 14 62 Z" fill={`url(#${id}b)`} />
      <path d="M18 64 C30 63 74 63 86 61" stroke="#ffd58a" strokeWidth={1.4} fill="none" opacity={0.8} />
      <g fill="#ffd58a" opacity={0.85}>
        {[30, 40, 50, 60, 70].map((x) => (
          <circle key={x} cx={x} cy={71} r={1.6} />
        ))}
      </g>
    </svg>
  );
}

/** A diya hanging from a chain, gently swinging. */
export function HangingDiya({ className, style, chain = 60, delay = 0 }: Svg & { chain?: number; delay?: number }) {
  return (
    <div className={className} style={style}>
      <div className="animate-sway" style={{ transformOrigin: "top center", animationDelay: `${delay}s` }}>
        <div className="mx-auto w-px bg-gradient-to-b from-transparent via-[#e9bf62] to-[#e9bf62]" style={{ height: chain }} />
        <Diya className="-mt-3 w-full" />
      </div>
    </div>
  );
}

/* ───────────────────────── Jharokha ───────────────────────── */

export function JharokhaFrame({
  className,
  style,
  stroke = "#e9bf62",
  fill = "none",
  w = 300,
  h = 420,
}: Svg & { stroke?: string; fill?: string; w?: number; h?: number }) {
  const spring = w * 0.62;
  return (
    <svg viewBox={`-12 -40 ${w + 24} ${h + 52}`} className={className} style={style} preserveAspectRatio="xMidYMid meet" aria-hidden>
      {/* finial */}
      <g transform={`translate(${w / 2} -10)`} fill={stroke}>
        <path d="M0 -28 C4 -20 6 -14 0 -6 C-6 -14 -4 -20 0 -28 Z" />
        <circle cy={-2} r={4} />
      </g>
      <path d={jharokhaPath(w, h, spring, 5)} fill={fill} stroke={stroke} strokeWidth={2.2} />
      <g transform={`translate(${w * 0.04} ${w * 0.04}) scale(0.92)`}>
        <path d={jharokhaPath(w, h - w * 0.02, spring, 5)} fill="none" stroke={stroke} strokeWidth={1} strokeOpacity={0.7} strokeDasharray="1 5" strokeLinecap="round" />
      </g>
      {/* pillars */}
      {[0, w].map((x) => (
        <g key={x} transform={`translate(${x} ${spring})`} fill={stroke}>
          <rect x={-6} y={0} width={12} height={4} rx={1} />
          <rect x={-3} y={4} width={6} height={h - spring - 8} opacity={0.35} />
          <rect x={-6} y={h - spring - 4} width={12} height={4} rx={1} />
        </g>
      ))}
    </svg>
  );
}

/* ───────────────────────── Florals ───────────────────────── */

export function Blossom({
  x = 0,
  y = 0,
  r = 20,
  rot = 0,
  petals = 5,
  tone = "rose",
  gid,
}: {
  x?: number;
  y?: number;
  r?: number;
  rot?: number;
  petals?: number;
  tone?: "rose" | "blush" | "peach" | "white";
  gid: string;
}) {
  const centers: Record<string, string> = { rose: "#d98aa0", blush: "#e7aab4", peach: "#eda98a", white: "#e9d8cc" };
  return (
    <g transform={`translate(${r2(x)} ${r2(y)}) rotate(${rot})`}>
      {Array.from({ length: petals }, (_, i) => (
        <path
          key={i}
          d={`M0 0 C ${r2(r * 0.55)} ${r2(-r * 0.2)} ${r2(r * 0.7)} ${r2(-r * 0.85)} ${r2(r * 0.18)} ${r2(-r)} Q0 ${r2(-r * 0.86)} ${r2(-r * 0.18)} ${r2(-r)} C ${r2(-r * 0.7)} ${r2(-r * 0.85)} ${r2(-r * 0.55)} ${r2(-r * 0.2)} 0 0 Z`}
          fill={`url(#${gid}-${tone})`}
          stroke="#ffffff"
          strokeOpacity={0.5}
          strokeWidth={0.6}
          transform={`rotate(${(360 / petals) * i})`}
        />
      ))}
      <circle r={r * 0.2} fill={centers[tone]} />
      {Array.from({ length: 7 }, (_, i) => {
        const a = (i / 7) * Math.PI * 2;
        return <circle key={i} cx={r2(Math.cos(a) * r * 0.28)} cy={r2(Math.sin(a) * r * 0.28)} r={r * 0.045} fill="#b9873f" />;
      })}
    </g>
  );
}

export function FloralDefs({ gid }: { gid: string }) {
  const tones: Record<string, [string, string]> = {
    rose: ["#c45a7a", "#f5c6cf"],
    blush: ["#e59aa8", "#fde8e6"],
    peach: ["#ee9b78", "#fde3d3"],
    white: ["#e8d3c8", "#fffdfa"],
  };
  return (
    <defs>
      {Object.entries(tones).map(([k, [a, b]]) => (
        <radialGradient key={k} id={`${gid}-${k}`} cx="0.5" cy="1" r="1" gradientUnits="objectBoundingBox" fx="0.5" fy="1">
          <stop offset="0%" stopColor={a} />
          <stop offset="100%" stopColor={b} />
        </radialGradient>
      ))}
    </defs>
  );
}

export function SageLeaf({ x, y, rot, s = 1, tone = "#869d7a" }: { x: number; y: number; rot: number; s?: number; tone?: string }) {
  return (
    <g transform={`translate(${r2(x)} ${r2(y)}) rotate(${rot}) scale(${s})`}>
      <path d="M0 0 C10 -8 26 -8 40 0 C26 8 10 8 0 0 Z" fill={tone} opacity={0.9} />
      <path d="M2 0 L38 0" stroke="#ffffff" strokeOpacity={0.45} strokeWidth={0.8} />
    </g>
  );
}

function Sprig({ x, y, rot, s = 1 }: { x: number; y: number; rot: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path d="M0 0 C20 -10 40 -12 70 -6" stroke="#869d7a" strokeWidth={1.2} fill="none" />
      {[12, 26, 40, 54].map((t, i) => (
        <g key={t}>
          <ellipse cx={t} cy={-6 - i * 0.5} rx={5} ry={2.6} fill="#a9bb98" transform={`rotate(-35 ${t} ${-6 - i * 0.5})`} />
          <ellipse cx={t + 4} cy={-2 - i} rx={5} ry={2.6} fill="#97ad88" transform={`rotate(30 ${t + 4} ${-2 - i})`} />
        </g>
      ))}
    </g>
  );
}

/** Corner floral cluster for the top-left; mirror with CSS scale for other corners. */
export function FloralCorner({ className, style }: Svg) {
  const gid = cleanId(useId());
  return (
    <svg viewBox="0 0 220 220" className={className} style={style} aria-hidden>
      <FloralDefs gid={gid} />
      <Sprig x={10} y={120} rot={-35} s={1.4} />
      <Sprig x={120} y={12} rot={10} s={1.2} />
      <SageLeaf x={20} y={70} rot={-20} s={1.4} />
      <SageLeaf x={70} y={22} rot={-60} s={1.3} tone="#9aae8c" />
      <SageLeaf x={95} y={95} rot={40} s={1.1} />
      <Blossom gid={gid} x={52} y={52} r={38} rot={10} tone="rose" />
      <Blossom gid={gid} x={112} y={40} r={24} rot={30} tone="blush" />
      <Blossom gid={gid} x={36} y={118} r={22} rot={-15} tone="peach" />
      <Blossom gid={gid} x={150} y={20} r={12} rot={0} tone="white" />
      <Blossom gid={gid} x={14} y={160} r={12} rot={0} tone="blush" />
      <circle cx={92} cy={74} r={4} fill="#c45a7a" />
      <circle cx={130} cy={70} r={3} fill="#e59aa8" />
      <circle cx={70} cy={140} r={3} fill="#e59aa8" />
    </svg>
  );
}

/** A soft falling petal shape. */
export function PetalShape({ className, style, color = "#f2b8c0" }: Svg & { color?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} style={style} aria-hidden>
      <path d="M10 1 C16 4 18 12 10 19 C2 12 4 4 10 1 Z" fill={color} />
      <path d="M10 3 C11 8 11 13 10 17" stroke="#ffffff" strokeOpacity={0.5} strokeWidth={0.6} fill="none" />
    </svg>
  );
}

/* ───────────────────────── Dividers ───────────────────────── */

export function LotusDivider({ className, color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 240 24" className={className} aria-hidden>
      <g fill="none" stroke={color} strokeWidth={1} strokeLinecap="round">
        <path d="M4 12 H92" />
        <path d="M148 12 H236" />
        <circle cx={98} cy={12} r={1.6} fill={color} />
        <circle cx={142} cy={12} r={1.6} fill={color} />
        <path d="M120 3 C126 8 126 14 120 20 C114 14 114 8 120 3 Z" fill={color} fillOpacity={0.2} />
        <path d="M120 20 C112 18 106 14 104 8 C111 9 116 13 120 20 Z" />
        <path d="M120 20 C128 18 134 14 136 8 C129 9 124 13 120 20 Z" />
      </g>
    </svg>
  );
}
