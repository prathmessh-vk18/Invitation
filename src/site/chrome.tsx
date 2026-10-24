"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { site, whatsappLink } from "@/config/site";
import { categories } from "@/data/categories";
import { WaIcon } from "@/invites/shared";
import { buttonClass } from "@/ui";

const hello = `Hi ${site.name}! I'd like to know more about your wedding invitations.`;

/** The Aavjoo logo. `light` gives the white version for dark backgrounds. */
export function Wordmark({ light, className }: { light?: boolean; className?: string }) {
  return (
    <Image
      src={light ? "/brand/aavjoo-logo-white.png" : "/brand/aavjoo-logo.png"}
      alt={site.name}
      width={1099}
      height={337}
      priority
      className={`h-8 w-auto ${className ?? ""}`}
    />
  );
}

const nav = [
  { href: "/designs", label: "Designs" },
  { href: "/#how", label: "How it works" },
  { href: "/guides", label: "Guides" },
  { href: "/#faq", label: "FAQ" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 bg-surface/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-page items-center justify-between px-5">
        <div className="flex items-center gap-8">
          <Link href="/" aria-label={`${site.name} home`}>
            <Wordmark />
          </Link>
          <nav className="hidden gap-6 text-[15px] font-medium md:flex">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="text-ink transition hover:text-muted">
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <a href={whatsappLink(hello)} target="_blank" rel="noreferrer" className={buttonClass("ghost", "md", "max-sm:hidden")}>
            WhatsApp us
          </a>
          <Link href="/designs" className={buttonClass("primary", "md")}>
            Choose a design
          </Link>
          <button onClick={() => setOpen((o) => !o)} aria-label="Menu" aria-expanded={open} className="grid size-10 place-items-center rounded-full bg-panel md:hidden">
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
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mx-3 mb-3 rounded-card bg-panel p-3 md:hidden"
          >
            {nav.map((n) => (
              <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="block rounded-tile px-4 py-3 text-title">
                {n.label}
              </Link>
            ))}
            <a href={whatsappLink(hello)} target="_blank" rel="noreferrer" className={buttonClass("primary", "lg", "mt-2 w-full")}>
              <WaIcon /> Chat on WhatsApp
            </a>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

export function WhatsAppFab() {
  return (
    <motion.a
      href={whatsappLink(hello)}
      target="_blank"
      rel="noreferrer"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, type: "spring", stiffness: 200, damping: 20 }}
      className="fixed right-4 bottom-4 z-40 flex items-center gap-2 rounded-full bg-surface py-2 pr-4 pl-2 text-[15px] font-medium text-ink shadow-[0_12px_32px_-12px_rgb(0_0_0/.35),0_0_0_1px_rgb(0_0_0/.05)] sm:right-6 sm:bottom-6"
    >
      <span className="grid size-9 place-items-center rounded-full bg-whatsapp text-lg text-white">
        <WaIcon />
      </span>
      Let&rsquo;s talk
    </motion.a>
  );
}

export function Footer() {
  const cols: { h: string; l: { href: string; label: string }[] }[] = [
    { h: "Designs", l: [...categories.map((c) => ({ href: `/${c.slug}`, label: c.label })), { href: "/designs", label: "All designs" }] },
    {
      h: "Company",
      l: [
        { href: "/about", label: "About" },
        { href: "/guides", label: "Wedding guides" },
        { href: "/#how", label: "How it works" },
        { href: "/design-system", label: "Design system" },
      ],
    },
    {
      h: "Legal",
      l: [
        { href: "/privacy", label: "Privacy" },
        { href: "/refunds", label: "Refunds" },
        { href: "/terms", label: "Terms" },
      ],
    },
  ];
  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-page gap-10 px-5 py-14 text-[15px] sm:grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Wordmark />
          <p className="mt-4 max-w-xs text-muted">Invitation websites for Indian weddings, designed by hand and shared on WhatsApp.</p>
          <p className="mt-6 text-ink">{site.whatsappDisplay}</p>
          <p className="text-ink">{site.email}</p>
          <p className="mt-1 text-caption text-subtle">Every day, {site.hours}</p>
        </div>
        {cols.map((c) => (
          <div key={c.h}>
            <p className="font-semibold text-ink">{c.h}</p>
            <ul className="mt-4 space-y-2.5">
              {c.l.map((x) => (
                <li key={x.href}>
                  <Link href={x.href} className="text-muted transition hover:text-ink">
                    {x.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-page px-5 py-6 text-caption text-subtle">© {site.name} · Made in India</p>
      </div>
    </footer>
  );
}
