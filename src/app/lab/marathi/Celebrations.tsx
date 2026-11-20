"use client";

import { motion } from "framer-motion";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

/**
 * The Marathi design's celebrations, muhurta reveal and countdown. They borrow the frame's own
 * language (the mandap's arch, gilded gold, cream paper, maroon script) rather than adding new
 * pictures:
 * - each function sits in an arched niche with a double gold rule;
 * - the muhurta hides under gold leaf etched with a wada's jaali, rubbed away to rose petals and
 *   jasmine falling;
 * - the countdown is lettering alone: gilded numbers between gold hairlines.
 * Everything is in English.
 */

const C = {
  maroon: "#7a1424",
  ink: "#4a1d14",
  gold: "#b88a2e",
  goldLight: "#f6d98c",
  green: "#2d6a35",
  paper: "#fbf0d6",
};
const label = "var(--font-cinzel)";
const serif = "var(--font-cormorant)";
const script = "var(--font-great-vibes)";
const ease = [0.22, 1, 0.36, 1] as const;
/** Gold for text and rules, solid. */
const gilt = C.gold;
const giltText: CSSProperties = { color: C.gold };

function seeded(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

const when = (iso: string, o: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", ...o }).format(
    new Date(iso),
  );

/* ───────── Shared pieces ───────── */

/** An arched niche: a double gold rule in the mandap's arch, on warm paper. */
function Niche({
  children,
  rise = "24cqw",
  className = "",
  style,
}: {
  children: ReactNode;
  rise?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const r = `50% 50% 1.2cqw 1.2cqw / ${rise} ${rise} 1.2cqw 1.2cqw`;
  return (
    <div
      className={`relative ${className}`}
      style={{
        borderRadius: r,
        padding: "0.45cqw",
        background: gilt,
        boxShadow: "0 3cqw 6cqw -3.5cqw rgba(74,29,20,.45)",
        ...style,
      }}
    >
      <div
        className="relative"
        style={{ borderRadius: r, padding: "1.1cqw", background: C.paper }}
      >
        <div
          className="relative h-full overflow-hidden"
          style={{
            borderRadius: r,
            boxShadow: `inset 0 0 0 0.25cqw ${C.gold}`,
            background: "#fdf5e2",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/** A small gold rule with a lotus bud in the middle. */
function Rule({ width = "46%" }: { width?: string }) {
  return (
    <div
      className="mx-auto my-[3cqw] flex items-center gap-[2cqw]"
      style={{ width }}
    >
      <span className="h-[0.3cqw] flex-1" style={{ background: C.gold }} />
      <svg viewBox="0 0 24 14" className="w-[5cqw]" aria-hidden>
        <path
          d="M12 1 C 15 4, 15 9, 12 13 C 9 9, 9 4, 12 1 Z M12 13 C 7 12, 3 9, 1 6 C 5 6, 9 8, 12 13 Z M12 13 C 17 12, 21 9, 23 6 C 19 6, 15 8, 12 13 Z"
          fill={C.gold}
        />
      </svg>
      <span
        className="h-[0.3cqw] flex-1"
        style={{
          background: C.gold,
        }}
      />
    </div>
  );
}

function Heading({ kicker, title }: { kicker: string; title: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.9, ease }}
    >
      <p
        className="text-[2.6cqw] tracking-[0.28em] uppercase"
        style={{ fontFamily: label, color: C.gold }}
      >
        {kicker}
      </p>
      <p
        className="text-[11cqw] leading-tight"
        style={{ fontFamily: script, color: C.maroon }}
      >
        {title}
      </p>
    </motion.div>
  );
}

/* ───────── Functions ───────── */

type Fn = {
  name: string;
  meaning: string;
  iso: string;
  venue: string;
  dress: string;
  muhurta?: boolean;
};

const FUNCTIONS: Fn[] = [
  {
    name: "Haldi",
    meaning: "The turmeric ceremony",
    iso: "2027-02-19T10:00:00+05:30",
    venue: "Kulkarni Wada, Sadashiv Peth, Pune",
    dress: "Shades of yellow",
  },
  {
    name: "Sangeet",
    meaning: "An evening of song and dance",
    iso: "2027-02-19T19:00:00+05:30",
    venue: "Kulkarni Wada, Sadashiv Peth, Pune",
    dress: "Festive and bright",
  },
  {
    name: "Lagna",
    meaning: "The wedding",
    iso: "2027-02-20T11:45:00+05:30",
    venue: "Shree Ganesh Mangal Karyalay, Kothrud, Pune",
    dress: "Paithani & pheta",
    muhurta: true,
  },
  {
    name: "Swagat Samarambh",
    meaning: "The reception",
    iso: "2027-02-20T19:30:00+05:30",
    venue: "The Orchid, Balewadi, Pune",
    dress: "Indo-western",
  },
];

function FunctionNiche({ f }: { f: Fn }) {
  const time = when(f.iso, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).toLowerCase();
  return (
    <motion.div
      initial={{ opacity: 0, y: 36, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 1, ease }}
      className="w-full"
    >
      <Niche>
        <div className="flex flex-col items-center px-[6cqw] pt-[13cqw] pb-[7cqw] text-center">
          <p
            className="text-[2.4cqw] tracking-[0.3em] uppercase"
            style={{ fontFamily: label, color: C.green }}
          >
            {when(f.iso, { weekday: "long" })}
          </p>
          {/* the date, gilded, between two hairlines */}
          <div className="mt-[1.5cqw] flex items-center gap-[3cqw]">
            <span className="h-px w-[8cqw]" style={{ background: C.gold }} />
            <p
              className="text-[9cqw] leading-none font-semibold"
              style={{ fontFamily: label, ...giltText }}
            >
              {when(f.iso, { day: "numeric" })}
            </p>
            <span className="h-px w-[8cqw]" style={{ background: C.gold }} />
          </div>
          <p
            className="mt-[1cqw] text-[2.6cqw] tracking-[0.34em] uppercase"
            style={{ fontFamily: label, color: C.ink }}
          >
            {when(f.iso, { month: "long", year: "numeric" })}
          </p>

          <p
            className="mt-[4cqw] leading-[1.1]"
            style={{
              fontFamily: script,
              color: C.maroon,
              fontSize: f.name.length > 10 ? "9cqw" : "12.5cqw",
            }}
          >
            {f.name}
          </p>
          <p
            className="mt-[0.5cqw] text-[3.6cqw] italic"
            style={{ fontFamily: serif, color: C.ink }}
          >
            {f.meaning}
          </p>
          <Rule width="40%" />
          <p
            className="text-[4.6cqw] font-semibold"
            style={{ fontFamily: serif, color: C.ink }}
          >
            {f.muhurta ? <>Shubh muhurta · {time}</> : <>{time} onwards</>}
          </p>
          <p
            className="mt-[1.5cqw] text-[4cqw] leading-snug"
            style={{ fontFamily: serif, color: C.ink }}
          >
            {f.venue}
          </p>
          <p
            className="mt-[1.5cqw] text-[3.5cqw] italic"
            style={{ fontFamily: serif, color: C.green }}
          >
            Dress · {f.dress}
          </p>
          <span
            className="mt-[4cqw] border-b pb-[0.5cqw] text-[2.6cqw] tracking-[0.26em] uppercase"
            style={{ fontFamily: label, color: C.maroon, borderColor: C.gold }}
          >
            Get directions
          </span>
        </div>
      </Niche>
    </motion.div>
  );
}

export function Functions() {
  return (
    <section className="relative flex w-full flex-col items-center px-[16%] pt-[50cqw] pb-[10cqw] text-center">
      <Heading kicker="Join us for" title="The celebrations" />
      <div className="mt-[6cqw] flex w-full flex-col gap-[9cqw]">
        {FUNCTIONS.map((f) => (
          <FunctionNiche key={f.name} f={f} />
        ))}
      </div>
    </section>
  );
}

/* ───────── The muhurta, under gold leaf ───────── */

/** Gold leaf with a wada window's jaali pressed into it. */
function paintGold(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, "#f7dc8e");
  g.addColorStop(0.3, "#d6a845");
  g.addColorStop(0.5, "#fbe7a6");
  g.addColorStop(0.72, "#b98a2c");
  g.addColorStop(1, "#e8c56a");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // the jaali: a lattice of diamonds with a quatrefoil at each crossing, pressed in (a dark line
  // with a light one beside it)
  const step = w / 6;
  const press = (dx: number, dy: number, colour: string) => {
    ctx.save();
    ctx.translate(dx, dy);
    ctx.strokeStyle = colour;
    ctx.lineWidth = 1;
    for (let k = -h; k < w + h; k += step) {
      ctx.beginPath();
      ctx.moveTo(k, 0);
      ctx.lineTo(k + h, h);
      ctx.moveTo(k, 0);
      ctx.lineTo(k - h, h);
      ctx.stroke();
    }
    for (let y = 0; y <= h + step; y += step / 2) {
      const row = Math.round(y / (step / 2));
      for (let x = row % 2 ? step / 2 : 0; x <= w + step; x += step) {
        for (let q = 0; q < 4; q++) {
          const a = (q * Math.PI) / 2;
          ctx.beginPath();
          ctx.arc(
            x + Math.cos(a) * step * 0.09,
            y + Math.sin(a) * step * 0.09,
            step * 0.08,
            0,
            Math.PI * 2,
          );
          ctx.stroke();
        }
      }
    }
    ctx.restore();
  };
  press(0.8, 0.8, "rgba(255,246,210,.55)");
  press(0, 0, "rgba(110,70,10,.45)");

  // a soft sheen across it
  const sheen = ctx.createLinearGradient(0, 0, w, 0);
  sheen.addColorStop(0.35, "rgba(255,255,255,0)");
  sheen.addColorStop(0.5, "rgba(255,250,225,.35)");
  sheen.addColorStop(0.65, "rgba(255,255,255,0)");
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, w, h);

  // the words, on a paper cartouche
  const cw = w * 0.62;
  const ch = h * 0.19;
  const cx = (w - cw) / 2;
  const cy = h * 0.46 - ch / 2;
  ctx.fillStyle = "rgba(251,240,214,.95)";
  ctx.strokeStyle = "#9a6a1c";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.roundRect(cx, cy, cw, ch, ch / 2);
  ctx.fill();
  ctx.stroke();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#7a1424";
  ctx.font = `600 ${Math.round(w * 0.045)}px Cinzel, serif`;
  ctx.fillText("RUB THE GOLD", w / 2, cy + ch * 0.37);
  ctx.fillStyle = "#4a1d14";
  ctx.font = `italic ${Math.round(w * 0.05)}px "Cormorant Garamond", serif`;
  ctx.fillText("to reveal the muhurta", w / 2, cy + ch * 0.7);
}

/** Rose petals, jasmine buds and a little gold dust, falling as on the cover. */
function PetalShower({ go }: { go: boolean }) {
  const bits = useMemo(() => {
    const r = seeded(93);
    return Array.from({ length: 44 }, (_, i) => ({
      x: r() * 100,
      d: r() * 0.9,
      t: 2.4 + r() * 1.6,
      rot: r() * 360,
      sway: (r() - 0.5) * 14,
      kind: i % 3 === 0 ? "jasmine" : i % 7 === 0 ? "gold" : "rose",
    }));
  }, []);
  if (!go) return null;
  return (
    <div className="pointer-events-none absolute inset-x-0 -top-[20cqw] bottom-0 overflow-hidden">
      {bits.map((b, i) => (
        <motion.span
          key={i}
          className="absolute top-0"
          style={{
            left: `${b.x}%`,
            width:
              b.kind === "rose"
                ? "3cqw"
                : b.kind === "jasmine"
                  ? "1.6cqw"
                  : "1cqw",
            height:
              b.kind === "rose"
                ? "3.6cqw"
                : b.kind === "jasmine"
                  ? "2.6cqw"
                  : "1cqw",
            borderRadius:
              b.kind === "rose"
                ? "70% 30% 70% 30%"
                : b.kind === "jasmine"
                  ? "50% 50% 50% 50% / 70% 70% 30% 30%"
                  : 999,
            background:
              b.kind === "rose"
                ? "#e0587a"
                : b.kind === "jasmine"
                  ? "#fffdf6"
                  : gilt,
            boxShadow:
              b.kind === "jasmine"
                ? "0 0 0.4cqw rgba(120,90,40,.4)"
                : undefined,
          }}
          initial={{ y: 0, rotate: b.rot, opacity: 0 }}
          animate={{
            y: "130cqw",
            x: ["0cqw", `${b.sway}cqw`, `${-b.sway / 2}cqw`],
            rotate: b.rot + 300,
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: b.t,
            delay: b.d,
            ease: "linear",
            times: [0, 0.1, 0.85, 1],
          }}
        />
      ))}
    </div>
  );
}

/** A heart, in a 0–1 box (for clipping) and a 0–100 box (for its gold rule). */
const HEART_BOX =
  "M0.5,0.97 C0.36,0.86 0.02,0.64 0.02,0.33 C0.02,0.14 0.16,0.02 0.3,0.02 C0.4,0.02 0.47,0.08 0.5,0.17 C0.53,0.08 0.6,0.02 0.7,0.02 C0.84,0.02 0.98,0.14 0.98,0.33 C0.98,0.64 0.64,0.86 0.5,0.97 Z";
const HEART = HEART_BOX.replace(/\d*\.?\d+/g, (n) => String(+n * 100));

export function RubTheGold({
  iso = "2027-02-20T11:45:00+05:30",
}: {
  iso?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [done, setDone] = useState(false);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const paint = () => {
      const r = c.getBoundingClientRect();
      c.width = Math.round(r.width * 2);
      c.height = Math.round(r.height * 2);
      const ctx = c.getContext("2d");
      if (!ctx) return;
      ctx.scale(2, 2);
      paintGold(ctx, r.width, r.height);
    };
    paint();
    document.fonts?.ready.then(paint);
  }, []);

  const rub = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || done) return;
    const c = ref.current!;
    const r = c.getBoundingClientRect();
    const ctx = c.getContext("2d")!;
    const p = { x: e.clientX - r.left, y: e.clientY - r.top };
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineWidth = r.width * 0.16;
    ctx.beginPath();
    ctx.moveTo(last.current?.x ?? p.x, last.current?.y ?? p.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    ctx.globalCompositeOperation = "source-over";
    last.current = p;
  };
  const stop = () => {
    drawing.current = false;
    last.current = null;
    const c = ref.current;
    if (!c || done) return;
    const px = c.getContext("2d")!.getImageData(0, 0, c.width, c.height).data;
    let clear = 0;
    let n = 0;
    for (let i = 3; i < px.length; i += 4 * 40) {
      n++;
      if (px[i] < 40) clear++;
    }
    if (clear / n > 0.4) setDone(true);
  };

  return (
    <section className="relative flex w-full flex-col items-center px-[12%] pt-[16cqw] pb-[6cqw] text-center">
      <Heading kicker="A little surprise" title="The muhurta" />
      <div className="relative mt-[5cqw] w-full">
        <div className="relative mx-auto aspect-[1/0.92] w-[86%]">
          {/* the heart: the date under it and the gold over it, clipped to the heart */}
          <div
            className="absolute inset-0"
            style={{ clipPath: "url(#rub-heart)" }}
          >
            <div
              className="absolute inset-0"
              style={{ background: "#fdf5e2" }}
            />
            <div className="absolute inset-x-0 top-[22%] flex flex-col items-center">
              <p
                className="text-[2.6cqw] tracking-[0.3em] uppercase"
                style={{ fontFamily: label, color: C.ink }}
              >
                {when(iso, { weekday: "long" })}
              </p>
              <p
                className="text-[14cqw] leading-none font-semibold"
                style={{ fontFamily: label, ...giltText }}
              >
                {when(iso, { day: "numeric" })}
              </p>
              <p
                className="text-[2.5cqw] tracking-[0.2em] uppercase"
                style={{ fontFamily: label, color: C.ink }}
              >
                {when(iso, { month: "long", year: "numeric" })}
              </p>
            </div>
            <motion.canvas
              ref={ref}
              className="absolute inset-0 size-full touch-none"
              animate={{ opacity: done ? 0 : 1 }}
              transition={{ duration: 0.9 }}
              style={{ pointerEvents: done ? "none" : "auto", cursor: "grab" }}
              onPointerDown={(e) => {
                drawing.current = true;
                e.currentTarget.setPointerCapture(e.pointerId);
                rub(e);
              }}
              onPointerMove={rub}
              onPointerUp={stop}
              onPointerCancel={stop}
            />
          </div>
          {/* the heart's double gold rule */}
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 size-full overflow-visible"
            aria-hidden
          >
            <defs>
              <clipPath id="rub-heart" clipPathUnits="objectBoundingBox">
                <path d={HEART_BOX} />
              </clipPath>
            </defs>
            <path
              d={HEART}
              fill="none"
              stroke={C.gold}
              strokeWidth="2.4"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={HEART}
              fill="none"
              stroke={C.gold}
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
              transform="translate(50 50) scale(0.93) translate(-50 -48)"
            />
          </svg>
        </div>

        {/* the muhurta's hour, once the gold is off */}
        <motion.div
          className="mt-[3cqw] flex flex-col items-center"
          initial={false}
          animate={{ opacity: done ? 1 : 0, y: done ? 0 : 8 }}
          transition={{ duration: 0.9, delay: done ? 0.4 : 0 }}
        >
          <p
            className="text-[3.6cqw] italic"
            style={{ fontFamily: serif, color: C.ink }}
          >
            at the auspicious hour of
          </p>
          <p
            className="text-[9cqw] leading-tight"
            style={{ fontFamily: script, color: C.maroon }}
          >
            {when(iso, {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            }).toLowerCase()}
          </p>
        </motion.div>
        <PetalShower go={done} />
      </div>
      <div className="mt-[4cqw] h-[9cqw]">
        {done ? (
          <motion.p
            className="text-[7cqw]"
            style={{ fontFamily: script, color: C.maroon }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            Shubh Mangal Saavdhan
          </motion.p>
        ) : (
          <button
            type="button"
            onClick={() => setDone(true)}
            className="text-[3.4cqw] italic underline underline-offset-4"
            style={{
              fontFamily: serif,
              color: C.ink,
              textDecorationColor: C.gold,
            }}
          >
            or tap here to reveal
          </button>
        )}
      </div>
    </section>
  );
}

/* ───────── Countdown ───────── */

function useLeft(iso: string) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const tick = () =>
      setLeft(Math.max(0, new Date(iso).getTime() - Date.now()));
    const t0 = window.setTimeout(tick, 0);
    const t = window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(t0);
      window.clearInterval(t);
    };
  }, [iso]);
  return left;
}

export function Countdown({
  iso = "2027-02-20T11:45:00+05:30",
}: {
  iso?: string;
}) {
  const left = useLeft(iso);
  const s = left === null ? null : Math.floor(left / 1000);
  const parts: [number | null, string][] = [
    [s === null ? null : Math.floor(s / 86400), "Days"],
    [s === null ? null : Math.floor((s % 86400) / 3600), "Hours"],
    [s === null ? null : Math.floor((s % 3600) / 60), "Minutes"],
    [s === null ? null : s % 60, "Seconds"],
  ];
  return (
    <section className="relative flex w-full flex-col items-center px-[14%] pt-[14cqw] pb-[30cqw] text-center">
      <Heading kicker="Counting down" title="Till the muhurta" />
      <p
        className="mx-auto mt-[1cqw] max-w-[60cqw] text-[3.6cqw] leading-snug italic"
        style={{ fontFamily: serif, color: C.ink }}
      >
        Until we meet you under the mandap.
      </p>
      <div className="mt-[7cqw] flex w-full items-start justify-center">
        {parts.map(([n, u], i) => (
          <div key={u} className="flex items-start">
            {i > 0 && (
              <span
                className="mx-[3.5cqw] mt-[1.5cqw] h-[9cqw] w-px"
                style={{ background: C.gold }}
              />
            )}
            <div className="flex w-[13cqw] flex-col items-center">
              <motion.span
                key={n ?? "x"}
                initial={{ opacity: 0.35 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="text-[10cqw] leading-none font-semibold tabular-nums"
                style={{ fontFamily: label, ...giltText }}
              >
                {n === null ? "··" : String(n).padStart(2, "0")}
              </motion.span>
              <span
                className="mt-[2cqw] text-[2.1cqw] tracking-[0.22em] uppercase"
                style={{ fontFamily: label, color: C.ink }}
              >
                {u}
              </span>
            </div>
          </div>
        ))}
      </div>
      <Rule width="40%" />
      <p
        className="text-[3.4cqw] tracking-[0.2em] uppercase"
        style={{ fontFamily: label, color: C.maroon }}
      >
        {when(iso, { weekday: "long", day: "numeric", month: "long" })}
      </p>
    </section>
  );
}
