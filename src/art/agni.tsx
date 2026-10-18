"use client";

import { motion } from "framer-motion";

const draw = (delay: number, duration = 1.6) => ({
  initial: { pathLength: 0, opacity: 0 },
  whileInView: { pathLength: 1, opacity: 1 },
  viewport: { once: true, amount: 0.3 },
  transition: { pathLength: { delay, duration, ease: [0.65, 0, 0.35, 1] as const }, opacity: { delay, duration: 0.2 } },
});

export function AgniFire({ className, color = "#c0502a", flame = "#e8973a" }: { className?: string; color?: string; flame?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden>
      <g fill="none" stroke={color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
        {/* kund — stepped basin */}
        <motion.path d="M36 146 H164 V154 H36 Z" {...draw(0.1)} />
        <motion.path d="M46 154 H154 V163 H46 Z" {...draw(0.3)} />
        <motion.path d="M56 163 H144 V172 H56 Z" {...draw(0.5)} />
        <motion.path d="M40 150 H160 M50 158.5 H150 M60 167.5 H140" strokeOpacity={0.35} {...draw(0.6)} />
        {/* samidha — crossed sticks */}
        <motion.path d="M62 146 L132 120 M138 146 L68 120 M80 146 L120 124" {...draw(0.8)} />
        {/* flames */}
        <motion.path
          d="M100 34 C112 56 136 70 132 100 C130 120 116 134 100 136 C84 134 70 120 68 100 C66 82 80 74 84 58 C90 72 96 74 98 66 C100 56 96 46 100 34 Z"
          {...draw(1.1, 2.2)}
        />
        <motion.path
          d="M100 70 C106 84 120 92 116 110 C114 122 108 128 100 129 C92 128 86 122 84 110 C82 98 92 94 94 84 C97 90 100 88 100 82 Z"
          fill={flame}
          initial={{ pathLength: 0, fillOpacity: 0 }}
          whileInView={{ pathLength: 1, fillOpacity: 0.28 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ pathLength: { delay: 1.6, duration: 1.8 }, fillOpacity: { delay: 2.8, duration: 1.2 } }}
        />
        <motion.path d="M100 100 C104 108 106 114 100 122 C94 114 96 108 100 100 Z" stroke={flame} {...draw(2.2, 1)} />
        <motion.path d="M60 112 C56 100 62 92 66 88 M140 112 C144 100 138 92 134 88" {...draw(2, 1.2)} />
        {/* rising sparks */}
        {[
          [78, 40],
          [124, 46],
          [110, 22],
          [88, 18],
        ].map(([x, y], i) => (
          <motion.circle
            key={i}
            cx={x}
            cy={y}
            r={1.6}
            fill={flame}
            stroke="none"
            animate={{ y: [0, -14, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 3 + i * 0.6, repeat: Infinity, delay: 2.5 + i * 0.7, ease: "easeInOut" }}
          />
        ))}
      </g>
    </svg>
  );
}

export function SevenRings({ className, color = "#c0502a", children }: { className?: string; color?: string; children?: React.ReactNode }) {
  const rings = Array.from({ length: 7 }, (_, i) => 56 + i * 7);
  return (
    <div className={`relative ${className ?? ""}`}>
      <svg viewBox="-110 -110 220 220" className="absolute inset-0 h-full w-full" aria-hidden>
        <g fill="none" stroke={color} strokeLinecap="round">
          {rings.map((r, i) => (
            <motion.circle
              key={r}
              r={r}
              strokeWidth={i === 6 ? 1.2 : 0.7}
              strokeOpacity={0.25 + i * 0.1}
              strokeDasharray={i % 2 ? "1 4" : undefined}
              transform="rotate(-90)"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.22, duration: 1.4, ease: [0.65, 0, 0.35, 1] }}
            />
          ))}
        </g>
        <motion.g animate={{ rotate: 360 }} transition={{ duration: 28, repeat: Infinity, ease: "linear" }}>
          <circle cx={0} cy={-98} r={3} fill={color} />
        </motion.g>
        <motion.g animate={{ rotate: -360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }}>
          <circle cx={0} cy={77} r={2} fill="#e8973a" />
        </motion.g>
      </svg>
      <div className="relative">{children}</div>
    </div>
  );
}
