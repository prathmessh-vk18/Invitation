"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useT } from "./i18n";
import type { InviteTheme } from "./types";

/**
 * The two instructions every design shows, the same everywhere so guests always find them:
 * a "tap to open" pill on the opening screen, and a "scroll" pill once the invite is open.
 * Dark glass with bold white text, readable on any painting (many guests didn't realise they
 * had to tap the seal, and the faint per-design hints were easy to miss).
 */
const pill =
  "pointer-events-auto flex items-center gap-2 whitespace-nowrap rounded-full bg-[rgba(24,14,10,.74)] px-5 py-3 text-[clamp(14px,3.9cqw,17px)] font-semibold tracking-[0.01em] text-white shadow-[0_6px_24px_rgba(0,0,0,.35)] ring-1 ring-white/25 backdrop-blur-md";

/** On the opening screen. Tapping the pill itself opens the invite too. */
export function TapHint({ theme, text, opened, onOpen }: { theme: InviteTheme; text?: string; opened: boolean; onOpen: () => void }) {
  const { t } = useT();
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-[max(7%,calc(env(safe-area-inset-bottom)+20px))] z-20 flex justify-center px-4">
      <motion.button
        type="button"
        onClick={onOpen}
        className={pill}
        initial={{ opacity: 0, y: 12 }}
        animate={opened ? { opacity: 0, y: 12 } : { opacity: 1, y: [0, -4, 0] }}
        transition={opened ? { duration: 0.25 } : { opacity: { delay: theme.tapHintDelay ?? 0.6, duration: 0.5 }, y: { delay: (theme.tapHintDelay ?? 0.6) + 0.4, duration: 1.8, repeat: Infinity, ease: "easeInOut" } }}
      >
        <motion.span aria-hidden className="text-[1.15em] leading-none" animate={{ scale: [1, 0.82, 1] }} transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}>
          👆
        </motion.span>
        {text ?? t[theme.tapHint ?? "tapToOpen"]}
      </motion.button>
    </div>
  );
}

/** After opening: shows until the guest scrolls a little, then goes for good. Tapping it scrolls a screen. */
export function ScrollHint({ theme, ready }: { theme: InviteTheme; ready: boolean }) {
  const { t } = useT();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    if (scrolled) return;
    const onScroll = () => window.scrollY > 80 && setScrolled(true);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [scrolled]);
  const show = ready && !scrolled;
  return (
    <motion.button
      type="button"
      onClick={() => window.scrollBy({ top: window.innerHeight * 0.85, behavior: "smooth" })}
      className={`${pill} absolute bottom-[calc(env(safe-area-inset-bottom)+18px)] left-1/2 -translate-x-1/2 ${show ? "" : "pointer-events-none"}`}
      initial={{ opacity: 0 }}
      animate={show ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.5, delay: show ? 0.4 : 0 }}
      aria-hidden={!show}
      tabIndex={show ? 0 : -1}
    >
      {t[theme.scrollHint ?? "scrollToSeeMore"]}
      <motion.svg viewBox="0 0 24 24" className="size-[1.2em]" fill="none" stroke="currentColor" strokeWidth={2.4} animate={{ y: [0, 4, 0] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }} aria-hidden>
        <path d="M6 9l6 6 6-6" />
      </motion.svg>
    </motion.button>
  );
}
