"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { site, whatsappLink } from "@/config/site";
import { categories } from "@/data/categories";
import { templates } from "@/data/templates";
import { guides } from "@/data/guides";
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
      className="wa-fab fixed right-4 bottom-4 z-40 flex items-center gap-2 rounded-full bg-surface py-2 pr-4 pl-2 text-[15px] font-medium text-ink shadow-[0_12px_32px_-12px_rgb(0_0_0/.35),0_0_0_1px_rgb(0_0_0/.05)] sm:right-6 sm:bottom-6"
    >
      <span className="grid size-9 place-items-center rounded-full bg-whatsapp text-lg text-white">
        <WaIcon />
      </span>
      Let&rsquo;s talk
    </motion.a>
  );
}

const guideLabel: Record<string, string> = {
  "haldi-invitation-wording": "Haldi invitation wording",
  "mehndi-invitation-wording": "Mehndi invitation wording",
  "sangeet-invitation-wording": "Sangeet invitation wording",
  "marathi-lagna-patrika-format": "Marathi lagna patrika format",
  "nikah-invitation-wording": "Nikah invitation wording",
  "anand-karaj-invitation-wording": "Anand Karaj invitation",
  "south-indian-wedding-invitation-wording": "South Indian wedding invitation",
  "when-to-send-wedding-invitations": "When to send invitations",
  "digital-vs-printed-wedding-invitations": "Digital vs printed cards",
  "wedding-invitation-wording-guide": "Wedding invitation wording",
};

const categoryLabel: Record<string, string> = {
  hindu: "Hindu wedding invitation",
  muslim: "Muslim & Nikah invitation",
  sikh: "Sikh Anand Karaj invitation",
  "south-indian": "South Indian wedding invitation",
};

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <nav aria-label={title}>
      <p className="text-[13px] font-semibold tracking-[0.08em] text-[#f3d18a] uppercase">{title}</p>
      <ul className="mt-5 space-y-3">
        {links.map((x) => (
          <li key={x.href}>
            <Link href={x.href} className="text-[15px] text-white/65 transition hover:text-white">
              {x.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#2a0f1c] text-white">
      {/* soft glow + a faint arch motif for warmth */}
      <div className="pointer-events-none absolute -top-40 left-1/2 size-[720px] -translate-x-1/2 rounded-full bg-[#66223f] opacity-40 blur-[140px]" />
      <svg className="pointer-events-none absolute -right-24 -bottom-24 w-[420px] opacity-[0.06]" viewBox="0 0 200 240" aria-hidden>
        <path d="M10 240 V110 C10 50 50 12 100 6 C150 12 190 50 190 110 V240" fill="none" stroke="#f3d18a" strokeWidth="3" />
        <path d="M34 240 V118 C34 72 64 40 100 34 C136 40 166 72 166 118 V240" fill="none" stroke="#f3d18a" strokeWidth="1.5" />
      </svg>

      <div className="relative mx-auto max-w-wide px-5">
        {/* call to action */}
        <div className="flex flex-col items-start justify-between gap-6 border-b border-white/10 py-14 md:flex-row md:items-center">
          <div>
            <p className="text-[clamp(28px,3.4vw,40px)] leading-tight font-semibold tracking-[-0.03em]">Planning a wedding?</p>
            <p className="mt-2 max-w-md text-[16px] text-white/65">Pick a design, add your functions and song, and share one beautiful link with everyone.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/designs" className={buttonClass("inverse", "lg")}>
              Choose a design
            </Link>
            <a href={whatsappLink(hello)} target="_blank" rel="noreferrer" className={buttonClass("secondary", "lg", "bg-white/10 text-white hover:bg-white/15")}>
              <WaIcon /> Chat on WhatsApp
            </a>
          </div>
        </div>

        {/* links */}
        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr_0.8fr]">
          <div>
            <Wordmark light className="h-9" />
            <p className="mt-5 max-w-xs text-[15px] leading-relaxed text-white/60">
              {site.name} makes animated wedding invitation websites for Indian weddings: every function, venue, song and RSVP in one link, shared on WhatsApp.
            </p>
            <div className="mt-6 space-y-1.5 text-[15px]">
              <a href={whatsappLink(hello)} target="_blank" rel="noreferrer" className="block text-white hover:text-[#f3d18a]">
                WhatsApp {site.whatsappDisplay}
              </a>
              <a href={`mailto:${site.email}`} className="block break-all text-white/80 hover:text-[#f3d18a]">
                {site.email}
              </a>
              <p className="text-[13px] text-white/45">Every day, {site.hours}</p>
            </div>
          </div>
          <FooterCol
            title="Wedding invitations"
            links={[...categories.map((c) => ({ href: `/${c.slug}`, label: categoryLabel[c.id] ?? c.title })), { href: "/designs", label: "All invitation designs" }]}
          />
          <FooterCol title="Designs" links={templates.map((t) => ({ href: `/templates/${t.id}`, label: `${t.name} · ${t.mood.split(" · ").pop()}` }))} />
          <FooterCol title="Wedding guides" links={[...guides.map((g) => ({ href: `/guides/${g.slug}`, label: guideLabel[g.slug] ?? g.title })), { href: "/guides", label: "All guides" }]} />
          <FooterCol
            title="Aavjoo"
            links={[
              { href: "/about", label: "About us" },
              { href: "/#how", label: "How it works" },
              { href: "/#faq", label: "FAQ" },
              { href: "/privacy", label: "Privacy" },
              { href: "/refunds", label: "Refunds" },
              { href: "/terms", label: "Terms" },
            ]}
          />
        </div>

        <div className="flex flex-col justify-between gap-3 border-t border-white/10 py-7 text-[13px] text-white/45 sm:flex-row">
          <p>© {site.name} · Digital wedding invitations, made with love in India</p>
          <p>Hindu · Muslim · Sikh · South Indian weddings</p>
        </div>
      </div>
    </footer>
  );
}
