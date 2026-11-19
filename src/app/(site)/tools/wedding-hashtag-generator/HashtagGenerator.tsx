"use client";

import Link from "next/link";
import { useState } from "react";

/** Letters only, each word capitalised: "aarav singh" → "AaravSingh". */
const word = (s: string) =>
  s
    .normalize("NFKD")
    .replace(/[^\p{L}\s]/gu, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join("");

/** Name blends: the start of one name and the end of the other (Aarav + Meera → "Aareera", "Meerav"), only the readable lengths. */
function blends(a: string, b: string) {
  const out = new Set<string>();
  const cuts = (s: string) => [Math.ceil(s.length / 2), Math.max(2, Math.floor(s.length / 2))];
  for (const i of cuts(a)) for (const j of cuts(b)) {
    const x = a.slice(0, i) + b.slice(j).toLowerCase();
    const y = b.slice(0, i) + a.slice(j).toLowerCase();
    for (const v of [x, y]) if (v.length >= 4 && v.length <= 10 && v !== a && v !== b) out.add(v);
  }
  return [...out].slice(0, 3);
}

export function generateHashtags(input: { bride: string; groom: string; brideSurname?: string; groomSurname?: string; year?: string; city?: string }) {
  const b = word(input.bride);
  const g = word(input.groom);
  if (!b || !g) return [];
  const bs = word(input.brideSurname ?? "");
  const gs = word(input.groomSurname ?? "");
  const yr = (input.year ?? "").replace(/\D/g, "").slice(-4);
  const city = word(input.city ?? "");
  const tags = [
    `${g}Weds${b}`,
    `${b}Weds${g}`,
    `${g}Ki${b}`,
    `${b}Ka${g}`,
    `${b}And${g}`,
    ...blends(g, b).map((x) => `${x}Forever`),
    ...blends(b, g),
    `${g}${b}KiShaadi`,
    gs && `${gs}KiShaadi`,
    gs && bs && gs !== bs && `${gs}Weds${bs}`,
    gs && `BigFat${gs}Wedding`,
    bs && `${b}Becomes${gs || g}`,
    `${b}Got${g}`,
    `HappilyEver${g}${b}`,
    `${g}And${b}SayYes`,
    yr && `${g}${b}${yr}`,
    yr && `Shaadi${yr}${g}${b}`,
    city && `${g}${b}In${city}`,
    `${b}KiHaldi`,
    `${b}KiMehndi`,
    `${g}${b}KaSangeet`,
    `${g}KiBaraat`,
  ];
  return [...new Set(tags.filter((t): t is string => Boolean(t)).map((t) => `#${t}`))];
}

export function HashtagGenerator() {
  const [v, setV] = useState({ bride: "", groom: "", brideSurname: "", groomSurname: "", year: "", city: "" });
  const [copied, setCopied] = useState("");
  const tags = generateHashtags(v);
  const copy = (t: string) =>
    navigator.clipboard?.writeText(t).then(() => {
      setCopied(t);
      window.setTimeout(() => setCopied(""), 1500);
    });
  const field = (k: keyof typeof v, label: string, placeholder: string) => (
    <label className="min-w-0">
      <span className="text-caption font-semibold text-ink">{label}</span>
      <input
        value={v[k]}
        onChange={(e) => setV({ ...v, [k]: e.target.value })}
        placeholder={placeholder}
        className="mt-1 block h-11 w-full min-w-0 rounded-[12px] border border-line bg-surface px-3 text-[15px] text-ink outline-none placeholder:text-faint focus:border-ink"
      />
    </label>
  );
  return (
    <div>
      <div className="grid grid-cols-2 gap-3 rounded-card bg-panel p-5 sm:p-7">
        {field("bride", "Bride's name", "Meera")}
        {field("groom", "Groom's name", "Aarav")}
        {field("brideSurname", "Bride's surname · optional", "Sharma")}
        {field("groomSurname", "Groom's surname · optional", "Rathore")}
        {field("year", "Year · optional", "2026")}
        {field("city", "City · optional", "Udaipur")}
      </div>

      {tags.length ? (
        <div className="mt-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-title">{tags.length} hashtags</p>
            <button type="button" onClick={() => copy(tags.join(" "))} className="text-caption font-medium text-ink underline underline-offset-4">
              {copied === tags.join(" ") ? "Copied all ✓" : "Copy all"}
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((t) => (
              <button key={t} type="button" onClick={() => copy(t)} className={`rounded-full px-4 py-2.5 text-[15px] font-semibold transition ${copied === t ? "bg-ink text-white" : "bg-panel text-ink hover:bg-panel-strong"}`}>
                {copied === t ? "Copied ✓" : t}
              </button>
            ))}
          </div>
          <p className="mt-4 text-caption text-subtle">Search your favourite on Instagram before you use it, so it&rsquo;s yours alone.</p>
        </div>
      ) : (
        <p className="mt-8 rounded-tile bg-panel p-6 text-body text-muted">Type both names to see your hashtags.</p>
      )}

      <div className="mt-10 rounded-card bg-ink p-8 text-white">
        <p className="text-title text-white">Put your hashtag on your invitation</p>
        <p className="mt-2 text-body text-white/70">Every Aavjoo invite shows your hashtag at the end, with your functions, maps, song and RSVP, in one link for WhatsApp.</p>
        <Link href="/designs" className="mt-5 inline-flex h-12 items-center rounded-full bg-white px-6 text-[15px] font-semibold text-ink">
          See the designs →
        </Link>
      </div>
    </div>
  );
}
