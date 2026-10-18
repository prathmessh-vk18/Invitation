"use client";

import { AnimatePresence, motion, type HTMLMotionProps } from "framer-motion";
import { useState, type ReactNode } from "react";

export const ease = [0.22, 1, 0.36, 1] as const;

/** Fades content up once as it scrolls into view. Content is never hidden if JS is slow. */
export function Reveal({ delay = 0, ...rest }: { delay?: number } & HTMLMotionProps<"div">) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, delay, ease }}
      {...rest}
    />
  );
}

/** Horizontal row of filter pills. The active pill is ink; the rest sit on panel grey. */
export function FilterPills<T extends string>({ options, value, onChange }: { options: readonly T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1" role="tablist">
      {options.map((o) => (
        <button
          key={o}
          role="tab"
          aria-selected={value === o}
          onClick={() => onChange(o)}
          className={`shrink-0 rounded-full px-4 py-2 text-[14px] font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
            value === o ? "bg-ink text-white" : "bg-panel text-ink hover:bg-panel-strong"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

/** Underlined text tabs with an optional count on the right. */
export function Tabs<T extends string>({
  options,
  value,
  onChange,
  aside,
}: {
  options: readonly { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  aside?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b border-line text-caption">
      <div className="flex gap-5" role="tablist">
        {options.map((o) => (
          <button
            key={o.id}
            role="tab"
            aria-selected={value === o.id}
            onClick={() => onChange(o.id)}
            className={`-mb-px border-b pb-2.5 transition ${value === o.id ? "border-ink font-medium text-ink" : "border-transparent text-subtle hover:text-ink"}`}
          >
            {o.label}
          </button>
        ))}
      </div>
      {aside && <span className="pb-2.5 text-subtle">{aside}</span>}
    </div>
  );
}

/** Question-and-answer list; one item open at a time. Each item is a panel card. */
export function Accordion({ items, defaultOpen = 0 }: { items: { q: string; a: ReactNode }[]; defaultOpen?: number | null }) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <div key={it.q} className="rounded-tile bg-panel">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
            className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left focus-visible:outline-2 focus-visible:outline-ink"
          >
            <span className="text-title">{it.q}</span>
            <motion.svg animate={{ rotate: open === i ? 45 : 0 }} viewBox="0 0 24 24" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path d="M12 5v14M5 12h14" />
            </motion.svg>
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="max-w-xl px-6 pb-6 text-body text-muted">{it.a}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
