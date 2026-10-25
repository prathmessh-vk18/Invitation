"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PriceTag, TopSeller } from "./offer";
import { templates, type TemplateMeta } from "@/data/templates";
import { InvitePreview } from "@/invites/InvitePreview";
import { themes } from "@/invites/registry";
import { PhoneFrame, ease } from "@/ui";

const back = { rest: { rotate: 7, x: "18%", y: "6%" }, hover: { rotate: 12, x: "34%", y: "2%" } };
const front = { rest: { rotate: -4, x: "-14%", y: "0%" }, hover: { rotate: -8, x: "-26%", y: "-4%" } };
const cta = { rest: { opacity: 0, y: 10 }, hover: { opacity: 1, y: 0 } };

// Designs whose world is dark get white type over a dark fade; light ones fade to white
// and take the design's own accent for the name.
const darkStage = new Set(["rajwada", "noor", "phulkari"]);
const lightGround: Record<string, string> = { kailash: "#e8eef6", mandir: "#fbeada", gulmohar: "#fdf6f2", agni: "#f5ede1", kolam: "#fbf6ea", bagh: "#ebe0cc", mahal: "#f7ecd9", khat: "#fbf3ea", gopuram: "#fbf5e8" };

/**
 * A design shown as a poster in its own world: its backdrop, its typeface, two live phones
 * (the opening animation in front, the open invite behind). The site's monochrome rules
 * deliberately stop at this tile's edge.
 */
export function PosterTile({ t, index }: { t: TemplateMeta; index: number }) {
  const theme = themes[t.id];
  const dark = darkStage.has(t.id);
  return (
    <motion.div initial="rest" animate="rest" whileHover="hover" className="h-full">
      <Link
        href={`/templates/${t.id}`}
        target="_blank"
        rel="noopener"
        className={`@container group relative block h-full overflow-hidden rounded-card ${theme.root} focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink`}
        style={theme.vars}
      >
        <theme.Backdrop />

        {/* native-script watermark */}
        <span
          aria-hidden
          className="pointer-events-none absolute -top-[4cqw] -right-[2cqw] text-[34cqw] leading-none opacity-[0.09] select-none"
          style={{ fontFamily: t.nativeFont }}
        >
          {t.native}
        </span>

        <div className="relative flex aspect-[4/4.6] flex-col sm:aspect-[4/4.2]">
          {/* price */}
          <div className="flex items-start justify-end gap-2 p-[5cqw]">
            {t.topSeller && <TopSeller className="mr-auto" />}
            <span className="rounded-full bg-white/90 px-3 py-1 font-sans text-ink backdrop-blur"><PriceTag price={t.price} mrp={t.mrp} size="sm" /></span>
          </div>

          {/* phones */}
          <div className="relative flex-1">
            <motion.div variants={back} transition={{ duration: 0.7, ease }} className="absolute top-[2%] left-1/2 w-[34cqw] -translate-x-1/2 opacity-95">
              <PhoneFrame className="shadow-phone">
                <InvitePreview slug={t.demoSlug} stage="open" loop={false} />
              </PhoneFrame>
            </motion.div>
            <motion.div variants={front} transition={{ duration: 0.7, ease }} className="absolute top-[6%] left-1/2 w-[36cqw] -translate-x-1/2">
              <PhoneFrame className="shadow-[0_40px_60px_-20px_rgb(0_0_0/.55)]">
                <InvitePreview slug={t.demoSlug} offset={index * 900} />
              </PhoneFrame>
            </motion.div>
          </div>

          {/* title block */}
          <div
            className={`relative z-10 flex items-end justify-between gap-4 p-[5cqw] pt-[16cqw] ${dark ? "bg-gradient-to-t from-black/55 via-black/25 to-transparent" : ""}`}
            style={dark ? undefined : { background: `linear-gradient(to top, ${lightGround[t.id]} 35%, ${lightGround[t.id]}cc 65%, transparent)` }}
          >
            <div className="min-w-0">
              <p className={`font-sans text-[13px] font-medium tracking-wide uppercase ${dark ? "text-white/80" : "text-ink/60"}`}>{t.mood}</p>
              <p
                className={`inv-script mt-1 text-[12cqw] leading-[0.95] ${dark ? "text-white [text-shadow:0_2px_20px_rgb(0_0_0/.35)]" : ""}`}
                style={dark ? undefined : { color: theme.accent }}
              >
                {t.name}
              </p>
            </div>
            <motion.span variants={cta} transition={{ duration: 0.4, ease }} className={`shrink-0 rounded-full px-4 py-2.5 font-sans text-[14px] font-medium ${dark ? "bg-white text-ink" : "bg-ink text-white"}`}>
              View design →
            </motion.span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/** The main design showcase: every design as a big poster, two to a row. */
export function Showcase() {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {templates.map((t, i) => (
        <motion.div
          key={t.id}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.8, delay: (i % 2) * 0.1, ease }}
        >
          <PosterTile t={t} index={i} />
        </motion.div>
      ))}
    </div>
  );
}
