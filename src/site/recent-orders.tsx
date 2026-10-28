"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { recentOrders, type RecentOrder } from "@/data/recent-orders";
import { getTemplate } from "@/data/templates";

// Shown only on localhost while the list is empty, to see the layout. Never on the live site.
const layoutExamples: RecentOrder[] = [
  { name: "Example", city: "City", template: "khat" },
  { name: "Example", city: "City", template: "mandir" },
];

/** "today", "yesterday", "3 days ago", or the date for anything older than a week. */
function ago(date: string | undefined, today: Date) {
  if (!date) return "";
  const d = new Date(`${date}T12:00:00+05:30`);
  if (Number.isNaN(d.getTime())) return "";
  const days = Math.round((today.getTime() - d.getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

/** A pill above the hero heading that cycles through recent orders; it opens the design shown. */
export function RecentOrders() {
  const list = recentOrders.length ? recentOrders : process.env.NODE_ENV === "development" ? layoutExamples : [];
  const [i, setI] = useState(0);
  // Relative dates depend on today, so they're filled in after load to match server and browser.
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const first = window.setTimeout(() => setNow(new Date()), 0);
    if (list.length < 2) return () => window.clearTimeout(first);
    const t = window.setInterval(() => setI((n) => (n + 1) % list.length), 3200);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(t);
    };
  }, [list.length]);

  if (!list.length) return null;
  const o = list[i];
  const t = getTemplate(o.template);
  if (!t) return null;
  const when = now ? ago(o.date, now) : "";

  return (
    <Link
      href={`/templates/${t.id}`}
      aria-live="polite"
      className="mb-7 inline-flex max-w-full items-center gap-2 overflow-hidden rounded-full bg-[#fff1e6] py-1.5 pr-4 pl-1.5 text-[14px] font-medium text-[#b4410f] transition hover:bg-[#ffe6d2]"
    >
      <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#e8582a] px-2.5 py-0.5 text-[12px] font-semibold whitespace-nowrap text-white">
        <span className="size-1.5 animate-pulse rounded-full bg-white" aria-hidden />
        Just ordered
      </span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35 }}
          className="truncate whitespace-nowrap"
        >
          {o.name}
          {/* Phones drop the city so the design's name always fits. */}
          {o.city && <span className="max-sm:hidden"> from {o.city}</span>} ordered {t.name}
          {when ? ` · ${when}` : ""} →
        </motion.span>
      </AnimatePresence>
    </Link>
  );
}
