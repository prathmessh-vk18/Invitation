"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { DesignBadge, PriceTag } from "./offer";
import { categories } from "@/data/categories";
import { templates, type CategoryId, type TemplateMeta } from "@/data/templates";
import { InvitePreview } from "@/invites/InvitePreview";
import { AppIcon, FilterPills, Frame, PhoneFrame, Tabs, TileCaption, ease } from "@/ui";

/** The design's own monogram: its name's first letter in its native script, on its icon colours. */
export function TemplateIcon({ t }: { t: TemplateMeta }) {
  return (
    <AppIcon bg={t.icon.bg}>
      <span className="text-[17px] leading-none" style={{ color: t.icon.fg, fontFamily: t.nativeFont }}>
        {Array.from(t.native)[0]}
      </span>
    </AppIcon>
  );
}

/** A design on its tint, with the phone rising slightly on hover, and its caption. */
export function TemplateTile({ t, index = 0, price }: { t: TemplateMeta; index?: number; price?: boolean }) {
  return (
    <Link href={`/templates/${t.id}`} target="_blank" rel="noopener" className="group block">
      <div
        className="relative flex aspect-[4/3.6] items-end justify-center overflow-hidden rounded-tile transition duration-500 group-hover:shadow-lift"
        style={{ background: t.tint }}
      >
        <div className="w-[46%] translate-y-[18%] transition duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:translate-y-[10%]">
          <PhoneFrame>
            <InvitePreview slug={t.demoSlug} offset={index * 700} />
          </PhoneFrame>
        </div>
        {price && (
          <span className="absolute top-4 right-4 rounded-full bg-surface px-3 py-1 text-ink"><PriceTag price={t.price} mrp={t.mrp} size="sm" /></span>
        )}
        <DesignBadge t={t} className="absolute top-4 left-4" />
      </div>
      <TileCaption icon={<TemplateIcon t={t} />} name={t.name} sub={t.mood} />
    </Link>
  );
}

const ALL = "All";
type Filter = typeof ALL | CategoryId;

/** The full gallery: category pills, sort tabs and a tile grid, inside the grey frame. */
export function Gallery({ initial = ALL }: { initial?: Filter }) {
  const [cat, setCat] = useState<Filter>(initial);
  const [sort, setSort] = useState<"featured" | "latest" | "price">("featured");
  const labels = [ALL, ...categories.map((c) => c.label)] as const;
  const labelToId = (l: string): Filter => (l === ALL ? ALL : categories.find((c) => c.label === l)!.id);
  const idToLabel = (id: Filter) => (id === ALL ? ALL : categories.find((c) => c.id === id)!.label);

  const items = templates
    .filter((t) => cat === ALL || t.category === cat)
    // Featured keeps the order designs are listed in data/templates.
    .sort((a, b) => (sort === "featured" ? 0 : sort === "latest" ? b.addedOn.localeCompare(a.addedOn) : a.price - b.price));

  return (
    <Frame>
      <FilterPills options={labels} value={idToLabel(cat)} onChange={(l) => setCat(labelToId(l))} />
      <div className="mt-6">
        <Tabs
          options={[
            { id: "featured", label: "Featured" },
            { id: "latest", label: "Latest" },
            { id: "price", label: "Price" },
          ]}
          value={sort}
          onChange={setSort}
          aside={`${items.length} ${items.length === 1 ? "design" : "designs"}`}
        />
      </div>
      <div className="mt-6 grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {items.map((t, i) => (
            <motion.div key={t.id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.5, ease }}>
              <TemplateTile t={t} index={i} price />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Frame>
  );
}
