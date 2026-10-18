"use client";

import { useState } from "react";
import { site, whatsappLink } from "@/config/site";
import { categories } from "@/data/categories";
import { WaIcon } from "@/invites/shared";
import { Button } from "@/ui";

const traditions = [...categories.map((c) => c.label), "Jain", "Christian", "Fusion / other"];
const budgets = ["Not sure yet", "Under ₹7,000", "₹7,000 – ₹12,000", "₹12,000 – ₹20,000", "₹20,000+"];

const field = "mt-2 w-full rounded-field border border-line bg-surface px-4 py-3 text-[16px] text-ink outline-none transition placeholder:text-faint focus:border-ink";
const label = "text-[14px] font-semibold text-ink";

export function CustomForm() {
  const [f, setF] = useState({ name: "", tradition: "", dates: "", events: "", idea: "", links: "", budget: budgets[0] });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const lines = [
      `Hi ${site.name}! I'd like a custom wedding invitation.`,
      "",
      `Name: ${f.name}`,
      f.tradition && `Tradition: ${f.tradition}`,
      f.dates && `Dates & city: ${f.dates}`,
      f.events && `Functions: ${f.events}`,
      f.idea && `The idea: ${f.idea}`,
      f.links && `References: ${f.links}`,
      `Budget: ${f.budget}`,
    ].filter(Boolean);
    window.open(whatsappLink(lines.join("\n")), "_blank");
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <label className="block">
        <span className={label}>Your name</span>
        <input id="custom-name" required value={f.name} onChange={set("name")} placeholder="Full name" className={field} />
      </label>
      <div>
        <span className={label}>Tradition</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {traditions.map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setF({ ...f, tradition: t })}
              aria-pressed={f.tradition === t}
              className={`rounded-full px-4 py-2 text-[14px] font-medium transition ${f.tradition === t ? "bg-ink text-white" : "bg-panel hover:bg-panel-strong"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <label className="block">
        <span className={label}>
          Dates and city <span className="font-normal text-subtle">· approximate is fine</span>
        </span>
        <input id="custom-dates" value={f.dates} onChange={set("dates")} placeholder="e.g. 12–14 December 2026, Jaipur" className={field} />
      </label>
      <label className="block">
        <span className={label}>Functions on the invite</span>
        <input id="custom-events" value={f.events} onChange={set("events")} placeholder="e.g. Haldi, Mehndi, Sangeet, Wedding, Reception" className={field} />
      </label>
      <label className="block">
        <span className={label}>The idea</span>
        <textarea
          id="custom-idea"
          rows={4}
          value={f.idea}
          onChange={set("idea")}
          placeholder="An art style, colours, a painting or fabric you love, a ritual that matters to your family"
          className={`${field} resize-none`}
        />
      </label>
      <label className="block">
        <span className={label}>
          Links <span className="font-normal text-subtle">· optional</span>
        </span>
        <input id="custom-links" value={f.links} onChange={set("links")} placeholder="Pinterest or Instagram links, or say you'll send photos" className={field} />
      </label>
      <label className="block">
        <span className={label}>Budget</span>
        <select id="custom-budget" value={f.budget} onChange={set("budget")} className={field}>
          {budgets.map((b) => (
            <option key={b}>{b}</option>
          ))}
        </select>
      </label>
      <Button type="submit" className="w-full">
        <WaIcon /> Send the brief on WhatsApp
      </Button>
      <p className="text-center text-caption text-subtle">No obligation. Nothing is charged until you approve a quote.</p>
    </form>
  );
}
