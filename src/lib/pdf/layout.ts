import { getFontStyle } from "@/config/customise";
import type { Invite, InviteEvent } from "@/data/invites";

/**
 * The printable PDF of an invite (the ₹99 add-on): a phone-shaped document in the design's own
 * art, colours and typefaces, with large, dark, upright text for older relatives. This builds its
 * HTML; render.ts prints it, on Vercel in a Chrome with no fonts of its own, so every character
 * must come from a font loaded here (see FALLBACK) or be drawn (the arrow and star).
 */

export type Skin = {
  cover?: string; // the design's cover painting; designs without one use their paper
  paper: string;
  // The paper's open space for text, as % of the page from the top, bottom and each side, so
  // text sits inside the arch or between the flowers rather than over them.
  safe: [top: number, bottom: number, side: number];
  dark?: boolean; // light text on a dark paper
  ink: string;
  accent: string;
  soft: string;
  script: string; // Google Fonts family names matching the invite's own
  label: string;
  scriptScale?: number;
  coverTop?: number;
  // The design's own script when the couple picked another style: wider faces shrink to it.
  ownScript?: string;
  // Florals that reach in from the corners: a soft, edgeless glow of the paper behind the text
  // keeps it readable where a petal comes close, without a box over the art.
  mist?: string;
};

const I = (f: string) => `/art/illus/${f}`;
const P = (id: string) => `/art/pdf/${id}-paper.jpg`;

const mandirSkin: Skin = { cover: I("mandir-temple.jpg"), paper: I("mandir-card.jpg"), safe: [14, 18, 11], ink: "#5b2615", accent: "#a8573a", soft: "#86553f", script: "Bodoni Moda", label: "Marcellus", scriptScale: 0.8 };
const khatSkin: Skin = { cover: I("khat-hero.jpg"), paper: I("khat-card.jpg"), safe: [23, 30, 14], mist: "#fbf3ef", ink: "#5b2a3a", accent: "#b2566c", soft: "#7e5a62", script: "Pinyon Script", label: "Manrope" };
const rajwadaSkin: Skin = { paper: P("rajwada"), safe: [12, 12, 9], dark: true, ink: "#fbf1dc", accent: "#e9bf62", soft: "#f3dfb6", script: "Parisienne", label: "Cinzel" };
const chameliSkin: Skin = { cover: I("chameli-cover.jpg"), paper: I("chameli-paper.jpg"), safe: [10, 10, 9], ink: "#4f4020", accent: "#b19254", soft: "#6a5b38", script: "Pinyon Script", label: "Cinzel" };

export const skins: Record<string, Skin> = {
  sarovar: { cover: I("sarovar-hero.jpg"), paper: P("sarovar"), safe: [14, 14, 9], ink: "#3a1d20", accent: "#8a1c2b", soft: "#6b4a4c", script: "Dancing Script", label: "Cinzel" },
  gaurishankar: { cover: I("shiv-kailash.jpg"), paper: I("shiv-card.webp"), safe: [22, 8, 12], ink: "#36101c", accent: "#9a1d45", soft: "#55303b", script: "Pinyon Script", label: "Cinzel", coverTop: 6 },
  haveli: { cover: I("haveli-gate.jpg"), paper: I("haveli-card.jpg"), safe: [22, 14, 18], ink: "#5a1f2b", accent: "#9c4a3c", soft: "#6e564a", script: "Pinyon Script", label: "Cinzel" },
  mandir: mandirSkin,
  khat: khatSkin,
  khatred: { cover: I("khat-red-hero.jpg"), paper: I("khat-red-card.jpg"), safe: [23, 31, 14], mist: "#fbf3ea", ink: "#6e1320", accent: "#a3192b", soft: "#7a4741", script: "Pinyon Script", label: "Manrope" },
  bagh: { cover: I("bagh-hero.jpg"), paper: I("bagh-card.jpg"), safe: [15, 27, 8], ink: "#3d1633", accent: "#b5603a", soft: "#6a4a4a", script: "Dancing Script", label: "Cinzel" },
  gulmohar: { paper: P("gulmohar"), safe: [18, 18, 9], ink: "#5a2236", accent: "#a2405f", soft: "#7a5a62", script: "Pinyon Script", label: "Manrope" },
  rajwada: rajwadaSkin,
  rajwadasagai: rajwadaSkin,
  mahal: { cover: I("mahal-hero.jpg"), paper: I("mahal-card.jpg"), safe: [12, 13, 9], ink: "#4a1426", accent: "#a8462c", soft: "#6e4a3a", script: "Parisienne", label: "Cinzel" },
  gopuram: { cover: I("gopuram-hero.jpg"), paper: I("gopuram-card.jpg"), safe: [16, 12, 12], ink: "#5a0d2b", accent: "#a6175a", soft: "#6b4a3a", script: "Yeseva One", label: "Marcellus", scriptScale: 0.75 },
  agni: { paper: P("agni"), safe: [12, 10, 9], ink: "#2a1c15", accent: "#c0502a", soft: "#6b5a50", script: "Bodoni Moda", label: "Manrope", scriptScale: 0.8 },
  noor: { paper: P("noor"), safe: [14, 9, 9], dark: true, ink: "#f4efe2", accent: "#e3b964", soft: "#e9e1cc", script: "Amiri", label: "Marcellus", scriptScale: 0.85 },
  phulkari: { paper: P("phulkari"), safe: [19, 15, 8], dark: true, ink: "#fff4e0", accent: "#f6c445", soft: "#ffe7c4", script: "Rozha One", label: "Manrope", scriptScale: 0.75 },
  kolam: { paper: P("kolam"), safe: [16, 16, 9], ink: "#3b0a1f", accent: "#9c1650", soft: "#6b4a4a", script: "Yeseva One", label: "Marcellus", scriptScale: 0.75 },
  chandni: { cover: I("chandni-hero.jpg"), paper: I("chandni-card.jpg"), safe: [16, 16, 9], ink: "#3d2b4f", accent: "#9a4f7c", soft: "#6d5a73", script: "Parisienne", label: "Manrope" },
  angoothi: { cover: I("angoothi-hero.jpg"), paper: I("angoothi-card.jpg"), safe: [14, 16, 9], ink: "#5a2414", accent: "#b5482a", soft: "#7a4b36", script: "Pinyon Script", label: "Cinzel" },
  roka: { cover: I("roka-hero.jpg"), paper: I("roka-card.jpg"), safe: [14, 16, 9], ink: "#6e1320", accent: "#b3261e", soft: "#7a4741", script: "Yeseva One", label: "Marcellus", scriptScale: 0.75 },
  chameli: chameliSkin,
  chamelisagai: chameliSkin,
  vachan: mandirSkin,
  mudrika: khatSkin,
};

/** The design's skin, with the couple's own font style if they picked one in the form. */
export function skinFor(invite: Invite): Skin {
  const base = skins[invite.template] ?? khatSkin;
  const style = getFontStyle(invite.font);
  if (!style) return base;
  const family = (cssVar: string) => FONT_FAMILIES[/--font-[a-z-]+/.exec(cssVar)?.[0] ?? ""];
  const script = family(style.script) ?? base.script;
  // The design's sizes were set for its own script (and its scriptScale); a wider style shrinks to it.
  return { ...base, script, label: family(style.label) ?? base.label, ...(script !== base.script ? { ownScript: base.script } : {}) };
}

// Every character the couple might type needs a loaded font: Indian scripts, Arabic, general
// punctuation (₹, –, •) and emoji. Chrome on Vercel has none to fall back on. Google sends only
// the parts of each font a page uses, so listing them all costs nothing.
const SCRIPTS = ["Noto Serif Devanagari", "Noto Sans Gurmukhi", "Noto Serif Bengali", "Noto Serif Gujarati", "Noto Serif Oriya", "Noto Serif Tamil", "Noto Serif Telugu", "Noto Serif Kannada", "Noto Serif Malayalam"];
const FALLBACK = `${SCRIPTS.map((x) => `'${x}'`).join(",")},'Amiri','Noto Sans','Noto Color Emoji',serif`;
const stack = (family: string) => `'${family}',${FALLBACK}`;

// Drawn rather than typed, so they never depend on a font.
const ARROW = `<svg class="arr" viewBox="0 0 16 10" aria-hidden="true"><path d="M1 5h13M10 1l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const STAR = (fill: string) => `<svg class="star" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 0C11 7 13 9 20 10 13 11 11 13 10 20 9 13 7 11 0 10 7 9 9 7 10 0Z" fill="${fill}"/></svg>`;
const PHONE = `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" fill="none" stroke="currentColor" stroke-width="2"/></svg>`;
const WA = `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.1 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.4-.3Z"/></svg>`;

/** "+91 97714 27915" from 919771427915, "+1 (516) 853-5789" from 15168535789, as on the invite. */
const showPhone = (p: string) =>
  p.length === 12 && p.startsWith("91") ? `+91 ${p.slice(2, 7)} ${p.slice(7)}` : p.length === 11 && p.startsWith("1") ? `+1 (${p.slice(1, 4)}) ${p.slice(4, 7)}-${p.slice(7)}` : `+${p}`;

const FONT_FAMILIES: Record<string, string> = {
  "--font-pinyon": "Pinyon Script",
  "--font-parisienne": "Parisienne",
  "--font-dancing": "Dancing Script",
  "--font-yeseva": "Yeseva One",
  "--font-bodoni": "Bodoni Moda",
  "--font-alex-brush": "Alex Brush",
  "--font-italiana": "Italiana",
  "--font-fraunces": "Fraunces",
  "--font-rozha": "Rozha One",
  "--font-amiri": "Amiri",
  "--font-cinzel": "Cinzel",
  "--font-marcellus": "Marcellus",
  "--font-manrope": "Manrope",
  "--font-cormorant": "Cormorant Garamond",
};

const TZ = { timeZone: "Asia/Kolkata" } as const;
const f = (iso: string, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-IN", { ...TZ, ...o }).format(new Date(iso));
const time = (iso: string) => f(iso, { hour: "numeric", minute: "2-digit", hour12: true }).toUpperCase();
const esc = (s: unknown = "") => String(s ?? "").replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]!);
const mapOf = (e: InviteEvent) => e.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([e.venue, e.address].filter(Boolean).join(", "))}`;

/**
 * The PDF's HTML. `per` is functions per page; render.ts drops to one when a page overflows.
 * Text sits straight on the paper inside its open space, as on the invite, with no boxes over the art.
 */
export function pdfHtml(invite: Invite, opts: { siteUrl: string; inviteUrl: string; per?: number }) {
  const d = invite;
  const s = skinFor(invite);
  const art = (p: string) => `${opts.siteUrl}${p}`;
  const per = opts.per ?? 2;
  const [A, B] = d.lead === "groom" ? [d.groom, d.bride] : [d.bride, d.groom];
  const occ = d.occasion === "engagement" ? "engagement" : d.occasion === "reception" ? "wedding reception" : "wedding";
  const k = s.scriptScale ?? 1;
  const [top, bottom, side] = s.safe;
  // The glow is painted on the page behind the text's open space, so it never takes up room.
  const mist = s.mist ? `radial-gradient(${50 - side + 6}% ${(100 - top - bottom) / 2 + 4}% at 50% ${top + (100 - top - bottom) / 2}%,${s.mist}e6 55%,${s.mist}00),` : "";
  const paperBg = `${mist}url(${art(s.paper)}) center/cover`;
  const page = (inner: string) => `<section class="page" style="background:${paperBg}"><div class="in">${inner}</div></section>`;
  const sep = `<div class="sep"><i></i>${STAR(s.accent)}<i></i></div>`;
  const events = [...d.events].sort((x, y) => x.start.localeCompare(y.start));
  const chunks: InviteEvent[][] = [];
  for (let i = 0; i < events.length; i += per) chunks.push(events.slice(i, i + per));
  // A card holding several functions lists each time with what happens then, under the day.
  const ev = (e: InviteEvent) => `<div class="ev">
    <p class="lab">${esc(f(e.start, { weekday: "long" }))} · ${esc(f(e.start, { day: "numeric", month: "short" }))}${e.schedule?.length ? "" : ` · ${time(e.start)}`}</p>
    <p class="evn script">${esc(e.name)}</p>
    ${(e.schedule ?? []).map((x) => `<p class="ven"><b>${time(x.at)}</b> · ${esc(x.text)}</p>`).join("")}
    <p class="ven">${esc(e.venue)}${e.address ? `<br><span>${esc(e.address)}</span>` : ""}</p>
    ${e.dress ? `<p class="dress">Dress: ${esc(e.dress)}</p>` : ""}${e.note ? `<p class="dress">${esc(e.note)}</p>` : ""}
    <a class="btn" href="${esc(mapOf(e))}">Directions ${ARROW}</a></div>`;
  const coverInner = `<p class="inv">${esc(d.invocation)}</p>
    <p class="lab" style="margin-top:12px">${esc(d.heroKicker ?? `The ${occ} of`)}</p>
    <p class="script names">${esc(A.first)} <span class="amp">&amp;</span> ${esc(B.first)}</p>
    ${d.hideHeroDate ? "" : `<div class="dl"><span class="lab rule">${esc(f(d.date, { weekday: "long" }))}</span><span class="big">${esc(f(d.date, { day: "numeric" }))}</span><span class="lab rule">${esc(f(d.date, { month: "long", year: "numeric" }))}</span></div>`}
    ${d.hideHeroCity ? "" : `<p class="serif" style="font-size:22px;font-weight:600;margin-top:12px">${esc(d.city)}</p>`}`;
  const cover = s.cover
    ? `<section class="page" style="background:url(${art(s.cover)}) center/cover"><div class="glow"></div><div class="top" style="top:${s.coverTop ?? 9}%">${coverInner}</div></section>`
    : page(coverInner);
  const m = d.memorial;
  const memorial = m ? page(`<p class="lab">In loving memory</p><img class="mem" src="${esc(m.photo)}" alt="">${m.name ? `<p class="script title">${esc(m.name)}</p>` : ""}`) : "";
  const phone = (name: string, p: string, wa?: boolean) =>
    `<a class="btn" href="${wa ? `https://wa.me/${p}` : `tel:+${p}`}" aria-label="${wa ? "WhatsApp" : "Call"} ${esc(name)}">${wa ? WA : PHONE} ${esc(showPhone(p))}</a>`;
  const contacts = d.contacts?.length
    ? page(`<p class="lab">For any queries</p><p class="script title">Get in touch</p>${d.contacts.map((c, i) => `${i ? sep : ""}<div class="ev"><p class="ven" style="font-size:calc(24px * var(--k,1))">${esc(c.name)}</p>${c.phones.map((p) => phone(c.name, p, c.whatsapp)).join(" ")}</div>`).join("")}`)
    : "";
  const fonts = [
    s.script,
    ...(s.ownScript ? [s.ownScript] : []),
    `${s.label}:wght@400;500;600;700`,
    "Cormorant Garamond:ital,wght@0,500;0,600;1,500",
    ...SCRIPTS.map((x) => `${x}:wght@500;600`),
    "Amiri",
    "Noto Sans:wght@500;600",
    "Noto Color Emoji",
  ]
    .map((x) => `family=${x.replace(/ /g, "+")}`)
    .join("&");
  return `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?${fonts}&display=block" rel="stylesheet">
<style>
@page{size:540px 960px;margin:0}
*{box-sizing:border-box;margin:0;font-variant-numeric:lining-nums}
body{color:${s.ink};font-family:${stack("Cormorant Garamond")};-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{position:relative;width:540px;height:960px;overflow:hidden;break-after:page}
.in{position:absolute;top:${top}%;bottom:${bottom}%;left:${side}%;right:${side}%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
.top{position:absolute;left:40px;right:40px;text-align:center}
.glow{position:absolute;inset:0 0 45% 0;background:linear-gradient(180deg,rgba(255,250,242,.72),rgba(255,250,242,.35) 60%,transparent)}
.script{font-family:${stack(s.script)};color:${s.dark ? s.accent : s.ink}}
.lab{font-family:${stack(s.label)};font-size:calc(14px * var(--k,1));font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:${s.ink}}
.serif{font-family:${stack("Cormorant Garamond")}}
.inv{font-family:${FALLBACK};color:${s.accent};font-size:21px;font-weight:600;white-space:pre-line}
.names{font-size:calc(${Math.round(70 * k)}px * var(--f,1));line-height:1.08;margin-top:12px}
.names .amp{font-size:${Math.round(40 * k)}px;color:${s.accent}}
.dl{display:flex;align-items:center;justify-content:center;gap:14px;margin-top:16px}
.dl .rule{border-top:1.5px solid ${s.ink};border-bottom:1.5px solid ${s.ink};padding:6px 10px}
.dl .big{font-family:${stack("Cormorant Garamond")};font-size:48px;font-weight:600;line-height:1}
.msg{font-family:${stack("Cormorant Garamond")};font-size:calc(24px * var(--k,1));font-weight:600;line-height:1.45;white-space:pre-line;margin-top:18px}
.who{margin-top:30px}.who .n{font-size:calc(${Math.round(48 * k)}px * var(--k,1) * var(--f,1));line-height:1.1}
.who .p{font-family:${stack("Cormorant Garamond")};font-size:calc(21px * var(--k,1));font-weight:600;margin-top:6px;white-space:pre-line;line-height:1.35}
.orn{margin:16px 0;line-height:0}
.star{width:14px;height:14px}
.sep{display:flex;align-items:center;justify-content:center;gap:12px;width:60%;margin:calc(14px * var(--k,1)) auto}
.sep i{flex:1;height:1px;background:${s.accent};opacity:.55}
.title{font-size:calc(${Math.round(56 * k)}px * var(--f,1));line-height:1.1;margin-top:6px}.head{margin-bottom:calc(16px * var(--k,1))}
.day{font-family:${stack("Cormorant Garamond")};font-weight:600;font-size:150px;line-height:.9;color:${s.accent};margin-top:18px}
.mon{font-family:${stack(s.label)};font-weight:600;letter-spacing:.18em;font-size:22px;margin-top:12px}
.ev{width:100%;margin-top:calc(10px * var(--k,1))}
.evn{font-size:calc(${Math.round(46 * k)}px * var(--k,1) * var(--f,1));line-height:1.15;margin-top:6px}
.ven{font-family:${stack("Cormorant Garamond")};font-size:calc(22px * var(--k,1));font-weight:600;margin-top:8px;line-height:1.3}.ven span{font-size:calc(18px * var(--k,1))}
.dress{font-family:${stack("Cormorant Garamond")};font-size:calc(19px * var(--k,1));font-weight:600;color:${s.accent};margin-top:8px}
.btn{display:inline-flex;align-items:center;gap:8px;margin-top:14px;background:${s.accent};color:${s.dark ? "#2a0d10" : "#fff"};text-decoration:none;font-family:${stack(s.label)};font-size:16px;font-weight:700;padding:10px 24px;border-radius:999px;letter-spacing:.03em}
.arr{width:16px;height:10px}.ico{width:16px;height:16px}
.mem{width:220px;height:220px;object-fit:cover;margin:22px 0 18px;padding:7px;border-radius:6px;background:linear-gradient(135deg,#f6e3a1,#c99a3c 35%,#f3d98a 60%,#a9782a)}
.tag{font-family:${stack("Cormorant Garamond")};font-size:22px;font-weight:600;color:${s.accent};margin-top:10px}
.sign{font-size:calc(34px * var(--k,1));line-height:1.2;margin-top:18px;white-space:pre-line}
.link{font-family:${stack(s.label)};font-size:16px;font-weight:600;margin-top:26px;line-height:1.6}.link a{color:${s.accent}}
/* Never leave one word alone on a line ("With the blessings of Lord / Ganesha"): short lines split
   evenly, longer paragraphs keep at least two words on their last line. */
p{text-wrap:balance}
.msg,.sign{text-wrap:pretty}
</style></head><body>
${cover}
${m && !m.last ? memorial : ""}
${page(`${d.invocationMeaning ? `<p class="lab">${esc(d.invocationMeaning)}</p>` : ""}<p class="lab" style="margin-top:10px">${esc(d.hosts)}</p><p class="msg">${esc(d.message)}</p>
<div class="who"><p class="script n">${esc(A.full || A.first)}</p><p class="p">${esc(A.parents)}</p></div><p class="orn">${STAR(s.accent)}</p>
<div class="who" style="margin-top:0"><p class="script n">${esc(B.full || B.first)}</p><p class="p">${esc(B.parents)}</p></div>`)}
${page(`<p class="lab">A little surprise</p><p class="script title">Save the date</p><p class="day">${esc(f(d.date, { day: "numeric" }))}</p><p class="mon">${esc(f(d.date, { month: "long", year: "numeric" }).toUpperCase())}</p><p class="lab" style="margin-top:14px">${esc(f(d.date, { weekday: "long" }))} · ${time(d.date)}</p><p class="serif" style="font-size:24px;font-weight:600;margin-top:12px">${esc(d.city)}</p>`)}
${chunks.map((ch, i) => page(`${i === 0 ? `<p class="lab">Join us for</p><p class="script title head">The celebrations</p>` : ""}${ch.map(ev).join(sep)}`)).join("")}
${contacts}
${m?.last ? memorial : ""}
${page(`${d.closing ? `<p class="msg">${esc(d.closing)}</p>` : ""}<p class="script title" style="margin-top:26px">${esc(A.first)} &amp; ${esc(B.first)}</p>${d.hashtag ? `<p class="tag">${esc(d.hashtag)}</p>` : ""}${d.signoff ? `<p class="script sign">${esc(d.signoff)}</p>` : ""}${d.brandLine ? `<p class="lab" style="margin-top:18px">${esc(d.brandLine)}</p>` : ""}<p class="link">See the full invite with music and maps:<br><a href="${esc(opts.inviteUrl)}">${esc(opts.inviteUrl.replace(/^https?:\/\//, ""))}</a></p>`)}
<script>
// A style wider than the design's own script shrinks to it, as on the invite (fit.ts), and any
// word wider than its line shrinks to fit. Sets --f on each script line; render.ts calls it once
// fonts have loaded.
window.fitText = async () => {
  const own = ${JSON.stringify(s.ownScript ?? null)};
  if (own) await document.fonts.load("20px '" + own + "'");
  const ctx = document.createElement("canvas").getContext("2d");
  for (const el of document.querySelectorAll(".names,.who .n,.title,.evn")) {
    el.style.removeProperty("--f");
    const text = el.textContent.trim();
    if (!text) continue;
    const cs = getComputedStyle(el);
    const width = (t, family) => { ctx.font = cs.fontStyle + " " + cs.fontWeight + " " + cs.fontSize + " " + (family || cs.fontFamily); return ctx.measureText(t).width; };
    let f = 1;
    if (own) { const wider = width(text) / width(text, "'" + own + "',serif"); if (wider > 1.02) f = 1 / Math.pow(wider, 1.5); }
    const widest = Math.max(...text.split(/\\s+/).map((w) => width(w))) * f;
    const room = el.parentElement.clientWidth * 0.96;
    if (widest > room) f *= room / widest;
    if (f < 1) el.style.setProperty("--f", f);
  }
};
window.fitPages = () => {
  for (const el of document.querySelectorAll(".in")) { let k = 1; el.style.removeProperty("--k"); while (el.scrollHeight > el.clientHeight + 1 && k > 0.82) { k -= 0.03; el.style.setProperty("--k", k); } }
};
document.fonts.ready.then(async () => { await window.fitText(); window.fitPages(); });
</script></body></html>`;
}
