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

/**
 * Name blends that read well: the start of one name joined to the end of the other only where a
 * consonant meets a vowel (Meer + av → "Meerav"), so we never get "Aarra". The best two, longest
 * halves first.
 */
const vowel = (c: string) => /[aeiouy]/i.test(c);
function blends(a: string, b: string) {
  // The best blend each way round: a's start with b's end, then b's start with a's end.
  return [blendOne(a, b), blendOne(b, a)].filter((v): v is string => Boolean(v));
}

function blendOne(x: string, y: string) {
  const out: { v: string; score: number }[] = [];
  {
    for (let i = 2; i < x.length; i++)
      for (let j = 1; j < y.length - 1; j++) {
        const head = x.slice(0, i);
        const tail = y.slice(j).toLowerCase();
        const v = head + tail;
        if (v.length < 5 || v.length > 9 || v.toLowerCase() === x.toLowerCase() || v.toLowerCase() === y.toLowerCase()) continue;
        // a clean join, and no doubled letter across it
        if (vowel(head.at(-1)!) === vowel(tail[0]) || head.at(-1)!.toLowerCase() === tail[0]) continue;
        // no syllable said twice across the join ("Aara" + "ra")
        if (head.toLowerCase().endsWith(tail.slice(0, 2))) continue;
        // both names should still be recognisable: most of the head, a real share of the tail
        if (i < Math.ceil(x.length / 2) || tail.length < 2) continue;
        out.push({ v, score: Math.abs(i - x.length * 0.7) + Math.abs(tail.length - 2.5) });
      }
  }
  return out.sort((p, q) => p.score - q.score)[0]?.v;
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
    ...blends(g, b).flatMap((x, i) => (i === 0 ? [x, `${x}Forever`] : [x])),
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
