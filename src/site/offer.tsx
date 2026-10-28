"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { offer, offerEnds, percentOff } from "@/config/offer";
import { formatINR } from "@/config/site";

/** Milliseconds left in the offer, ticking every second. `null` until the browser takes over. */
function useOfferLeft() {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setLeft(Math.max(0, offerEnds - Date.now()));
    const first = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, []);
  return left;
}

/** Whether the offer is still on. Assumed on until the browser knows the time. */
export function useOfferLive() {
  const left = useOfferLeft();
  return left === null || left > 0;
}

function split(ms: number) {
  return { d: Math.floor(ms / 86_400_000), h: Math.floor((ms / 3_600_000) % 24), m: Math.floor((ms / 60_000) % 60), s: Math.floor((ms / 1000) % 60) };
}

/** "Ends in 16d 04h 12m 09s", ticking. */
export function OfferCountdown({ className }: { className?: string }) {
  if (!offer.endsAt) return null;
  return <Countdown className={className} />;
}

function Countdown({ className }: { className?: string }) {
  const left = useOfferLeft();
  if (left === 0) return null;
  const t = split(left ?? 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <span className={`tabular-nums ${className ?? ""}`}>
      Ends in {left === null ? "…" : `${t.d}d ${pad(t.h)}h ${pad(t.m)}m ${pad(t.s)}s`}
    </span>
  );
}

function Sparkle({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.svg
      viewBox="0 0 20 20"
      className={className}
      animate={{ scale: [0.6, 1, 0.6], opacity: [0.4, 1, 0.4], rotate: [0, 45, 0] }}
      transition={{ duration: 2.4, repeat: Infinity, delay }}
      aria-hidden
    >
      <path d="M10 0 C11 6 14 9 20 10 C14 11 11 14 10 20 C9 14 6 11 0 10 C6 9 9 6 10 0 Z" fill="currentColor" />
    </motion.svg>
  );
}

/** Festive strip at the very top of every page. Hides itself once the offer ends. */
export function OfferBar() {
  const live = useOfferLive();
  if (!live) return null;
  return (
    <Link
      href="/designs"
      className="group relative block overflow-hidden bg-[linear-gradient(90deg,#5b0f22,#9c1650_35%,#e8582a_70%,#f4a81d)] px-4 py-2.5 text-center text-[13.5px] font-medium text-white sm:text-[14px]"
    >
      <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_30%,rgb(255_255_255/.25)_50%,transparent_70%)] bg-[length:250%_100%] [animation:shimmer_4s_linear_infinite]" />
      <Sparkle className="absolute top-1.5 left-[8%] size-3 text-[#ffe08a]" />
      <Sparkle className="absolute bottom-1 left-[22%] hidden size-2.5 text-white sm:block" delay={0.8} />
      <Sparkle className="absolute top-1 right-[18%] hidden size-3 text-[#ffe08a] sm:block" delay={1.4} />
      <Sparkle className="absolute right-[6%] bottom-1.5 size-2.5 text-white" delay={0.4} />
      <span className="relative inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5">
        <span aria-hidden>{offer.emoji}</span>
        <span className="font-semibold">{offer.headline}</span>
        <span className="hidden text-white/80 sm:inline">· up to 75% off ·</span>
        <OfferCountdown className="rounded-full bg-black/20 px-2 py-0.5 text-[12.5px]" />
        <span className="hidden underline-offset-4 group-hover:underline sm:inline">Choose a design →</span>
      </span>
    </Link>
  );
}

/**
 * Offer price: the price, the original struck through, and the % off.
 * After the offer ends only the price shows.
 */
export function PriceTag({
  price,
  mrp,
  size = "md",
  tone = "light",
  className,
}: {
  price: number;
  mrp: number;
  size?: "sm" | "md" | "lg";
  tone?: "light" | "dark";
  className?: string;
}) {
  const live = useOfferLive();
  const off = percentOff(price, mrp);
  const big = { sm: "text-[15px]", md: "text-[20px]", lg: "text-[44px] tracking-[-0.04em]" }[size];
  const small = { sm: "text-[12px]", md: "text-[14px]", lg: "text-lead" }[size];
  return (
    <span className={`inline-flex flex-wrap items-baseline gap-x-2 gap-y-1 ${className ?? ""}`}>
      <span className={`font-semibold ${big}`}>{formatINR(price)}</span>
      {live && mrp > price && (
        <>
          <span className={`line-through decoration-[1.5px] ${small} ${tone === "dark" ? "text-white/55" : "text-faint"}`}>{formatINR(mrp)}</span>
          <span className={`self-center rounded-full bg-[#e8582a] px-2 py-0.5 font-semibold text-white ${size === "lg" ? "text-[13px]" : "text-[11px]"}`}>{off}% off</span>
        </>
      )}
    </span>
  );
}

/** "New" pill for designs marked isNew in data/templates. */
export function NewBadge({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-[#fff1e6] px-2.5 py-1 font-sans text-[12px] font-semibold text-[#b4410f] ${className ?? ""}`}>
      <span className="size-1.5 animate-pulse rounded-full bg-[#e8590c]" aria-hidden />
      New
    </span>
  );
}

/** A design's badge, if it has one: "Top seller" first, else "New". */
export function DesignBadge({ t, className }: { t: { topSeller?: boolean; isNew?: boolean }; className?: string }) {
  if (t.topSeller) return <TopSeller className={className} />;
  if (t.isNew) return <NewBadge className={className} />;
  return null;
}

/** "Top seller" pill for designs marked topSeller in data/templates. */
export function TopSeller({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-ink px-2.5 py-1 font-sans text-[12px] font-semibold text-white ${className ?? ""}`}>
      <svg viewBox="0 0 20 20" className="size-3 text-[#f4a81d]" fill="currentColor" aria-hidden>
        <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
      </svg>
      Top seller
    </span>
  );
}
