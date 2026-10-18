"use client";

import Link from "next/link";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useState } from "react";
import { site, whatsappLink } from "@/config/site";
import { WaIcon } from "@/invites/shared";
import { Logo } from "./Logo";

const nav = [
  { href: "/templates", label: "Designs" },
  { href: "/#inside", label: "What's inside" },
  { href: "/#process", label: "How it works" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
];

export function Header() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5">
      <div
        className={`mx-auto flex max-w-6xl items-center justify-between rounded-full px-4 py-2.5 transition-all duration-500 sm:px-5 ${
          scrolled ? "border border-line/80 bg-paper/80 shadow-[0_10px_40px_-20px_rgba(60,30,10,.35)] backdrop-blur-xl" : "border border-transparent"
        }`}
      >
        <Link href="/" aria-label={`${site.name} home`}>
          <Logo />
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="rounded-full px-3.5 py-2 text-sm font-medium text-ink/75 transition hover:bg-ink/5 hover:text-ink">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a
            href={whatsappLink(`Hi ${site.name}! I'd like to know more about your wedding invitations.`)}
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-cream transition hover:-translate-y-0.5 hover:shadow-lg sm:inline-flex"
          >
            <WaIcon /> Chat with us
          </a>
          <button onClick={() => setOpen((o) => !o)} className="grid size-10 place-items-center rounded-full border border-line bg-paper md:hidden" aria-label="Menu" aria-expanded={open}>
            <span className="relative block h-3 w-4">
              <span className={`absolute left-0 h-0.5 w-4 rounded bg-ink transition ${open ? "top-1.5 rotate-45" : "top-0"}`} />
              <span className={`absolute left-0 h-0.5 w-4 rounded bg-ink transition ${open ? "top-1.5 -rotate-45" : "top-2.5"}`} />
            </span>
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-auto mt-2 max-w-6xl rounded-3xl border border-line bg-paper/95 p-3 shadow-xl backdrop-blur-xl md:hidden"
          >
            {nav.map((n) => (
              <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="block rounded-2xl px-4 py-3 font-display text-lg">
                {n.label}
              </Link>
            ))}
            <a
              href={whatsappLink(`Hi ${site.name}! I'd like to know more about your wedding invitations.`)}
              target="_blank"
              rel="noreferrer"
              className="mt-2 flex items-center justify-center gap-2 rounded-2xl bg-ink px-4 py-3 font-semibold text-cream"
            >
              <WaIcon /> Chat on WhatsApp
            </a>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
