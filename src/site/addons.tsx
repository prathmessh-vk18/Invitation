"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { addons } from "@/config/addons";
import { formatINR, site, whatsappLink } from "@/config/site";
import type { TemplateMeta } from "@/data/templates";
import { WaIcon } from "@/invites/shared";
import { buttonClass } from "@/ui";

function reserveMessage(t: TemplateMeta, picked: string[], total: number) {
  const lines = [`Hi ${site.name}! I'd like to reserve the ${t.name} design (${formatINR(t.price)}).`];
  const chosen = addons.filter((a) => picked.includes(a.id));
  if (chosen.length) {
    lines.push("", "Add-ons:", ...chosen.map((a) => `• ${a.name} (${formatINR(a.price)})`));
  }
  lines.push("", `Total: ${formatINR(total)}`);
  return lines.join("\n");
}

/** Add-on cards with a running total and a reserve button that carries the selection to WhatsApp. */
export function AddonPicker({ t }: { t: TemplateMeta }) {
  const [picked, setPicked] = useState<string[]>([]);
  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const extras = addons.filter((a) => picked.includes(a.id)).reduce((s, a) => s + a.price, 0);
  const total = t.price + extras;

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {addons.map((a) => {
          const on = picked.includes(a.id);
          return (
            <button
              key={a.id}
              onClick={() => toggle(a.id)}
              aria-pressed={on}
              className={`flex flex-col rounded-tile p-6 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                on ? "bg-ink text-white" : "bg-panel text-ink hover:bg-panel-strong"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-title text-current">{a.name}</p>
                <span className={`grid size-6 shrink-0 place-items-center rounded-full text-[13px] ${on ? "bg-white text-ink" : "bg-surface"}`}>{on ? "✓" : "+"}</span>
              </div>
              <p className={`mt-2 text-body ${on ? "text-white/70" : "text-muted"}`}>{a.body}</p>
              <div className="mt-auto flex items-center gap-2 pt-5">
                <span className="text-[17px] font-semibold">{formatINR(a.price)}</span>
                {a.tag && <span className={`rounded-full px-2 py-0.5 text-[12px] font-medium ${on ? "bg-white/15" : "bg-surface"}`}>{a.tag}</span>}
              </div>
            </button>
          );
        })}
      </div>

      <div className="sticky bottom-4 z-30 mt-6">
        <div className="flex flex-col items-start justify-between gap-4 rounded-card bg-surface p-5 shadow-[0_20px_50px_-25px_rgb(0_0_0/.45),0_0_0_1px_rgb(0_0_0/.05)] sm:flex-row sm:items-center">
          <div>
            <p className="text-caption text-subtle">
              {t.name} {formatINR(t.price)}
              {picked.length > 0 && ` + ${picked.length} add-on${picked.length > 1 ? "s" : ""}`}
            </p>
            <AnimatePresence mode="popLayout">
              <motion.p key={total} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-[28px] font-semibold tracking-[-0.03em]">
                {formatINR(total)}
              </motion.p>
            </AnimatePresence>
          </div>
          <a href={whatsappLink(reserveMessage(t, picked, total))} target="_blank" rel="noreferrer" className={buttonClass("primary", "lg", "w-full sm:w-auto")}>
            <WaIcon /> Reserve on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
