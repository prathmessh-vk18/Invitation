import { getFontStyle } from "@/config/customise";
import type { Invite, InviteEvent } from "@/data/invites";

/**
 * The printable PDF of an invite (the ₹99 add-on): a phone-shaped document in the design's own
 * art, colours and typefaces, with large, dark, upright text for older relatives. This builds its
 * HTML; render.ts prints it. Signed off on the samples in Downloads/Aavjoo PDF samples.
 */

export type Skin = {
  cover?: string; // the design's cover painting; designs without one use their paper
  paper: string;
  dark?: boolean; // light text on a dark paper
  ink: string;
  accent: string;
  soft: string;
  script: string; // Google Fonts family names matching the invite's own
  label: string;
  scriptScale?: number;
  coverTop?: number;
};

const I = (f: string) => `/art/illus/${f}`;
const P = (id: string) => `/art/pdf/${id}-paper.jpg`;

const mandirSkin: Skin = { cover: I("mandir-temple.jpg"), paper: I("mandir-card.jpg"), ink: "#5b2615", accent: "#a8573a", soft: "#86553f", script: "Bodoni Moda", label: "Marcellus", scriptScale: 0.8 };
const khatSkin: Skin = { cover: I("khat-hero.jpg"), paper: I("khat-card.jpg"), ink: "#5b2a3a", accent: "#b2566c", soft: "#7e5a62", script: "Pinyon Script", label: "Manrope" };
const rajwadaSkin: Skin = { paper: P("rajwada"), dark: true, ink: "#fbf1dc", accent: "#e9bf62", soft: "#f3dfb6", script: "Parisienne", label: "Cinzel" };

export const skins: Record<string, Skin> = {
  sarovar: { cover: I("sarovar-hero.jpg"), paper: P("sarovar"), ink: "#3a1d20", accent: "#8a1c2b", soft: "#6b4a4c", script: "Dancing Script", label: "Cinzel" },
  gaurishankar: { cover: I("shiv-kailash.jpg"), paper: I("shiv-card.webp"), ink: "#36101c", accent: "#9a1d45", soft: "#55303b", script: "Pinyon Script", label: "Cinzel", coverTop: 6 },
  haveli: { cover: I("haveli-gate.jpg"), paper: I("haveli-card.jpg"), ink: "#5a1f2b", accent: "#9c4a3c", soft: "#6e564a", script: "Pinyon Script", label: "Cinzel" },
  mandir: mandirSkin,
  khat: khatSkin,
  khatred: { cover: I("khat-red-hero.jpg"), paper: I("khat-red-card.jpg"), ink: "#6e1320", accent: "#a3192b", soft: "#7a4741", script: "Pinyon Script", label: "Manrope" },
  bagh: { cover: I("bagh-hero.jpg"), paper: I("bagh-card.jpg"), ink: "#3d1633", accent: "#b5603a", soft: "#6a4a4a", script: "Dancing Script", label: "Cinzel" },
  gulmohar: { paper: P("gulmohar"), ink: "#5a2236", accent: "#a2405f", soft: "#7a5a62", script: "Pinyon Script", label: "Manrope" },
  rajwada: rajwadaSkin,
  rajwadasagai: rajwadaSkin,
  mahal: { cover: I("mahal-hero.jpg"), paper: I("mahal-card.jpg"), ink: "#4a1426", accent: "#a8462c", soft: "#6e4a3a", script: "Parisienne", label: "Cinzel" },
  gopuram: { cover: I("gopuram-hero.jpg"), paper: I("gopuram-card.jpg"), ink: "#5a0d2b", accent: "#a6175a", soft: "#6b4a3a", script: "Yeseva One", label: "Marcellus", scriptScale: 0.75 },
  agni: { paper: P("agni"), ink: "#2a1c15", accent: "#c0502a", soft: "#6b5a50", script: "Bodoni Moda", label: "Manrope", scriptScale: 0.8 },
  noor: { paper: P("noor"), dark: true, ink: "#f4efe2", accent: "#e3b964", soft: "#e9e1cc", script: "Amiri", label: "Marcellus", scriptScale: 0.85 },
  phulkari: { paper: P("phulkari"), dark: true, ink: "#fff4e0", accent: "#f6c445", soft: "#ffe7c4", script: "Rozha One", label: "Manrope", scriptScale: 0.75 },
  kolam: { paper: P("kolam"), ink: "#3b0a1f", accent: "#9c1650", soft: "#6b4a4a", script: "Yeseva One", label: "Marcellus", scriptScale: 0.75 },
  chandni: { cover: I("chandni-hero.jpg"), paper: I("chandni-card.jpg"), ink: "#3d2b4f", accent: "#9a4f7c", soft: "#6d5a73", script: "Parisienne", label: "Manrope" },
  angoothi: { cover: I("angoothi-hero.jpg"), paper: I("angoothi-card.jpg"), ink: "#5a2414", accent: "#b5482a", soft: "#7a4b36", script: "Pinyon Script", label: "Cinzel" },
  roka: { cover: I("roka-hero.jpg"), paper: I("roka-card.jpg"), ink: "#6e1320", accent: "#b3261e", soft: "#7a4741", script: "Yeseva One", label: "Marcellus", scriptScale: 0.75 },
  vachan: mandirSkin,
  mudrika: khatSkin,
};

/** The design's skin, with the couple's own font style if they picked one in the form. */
export function skinFor(invite: Invite): Skin {
  const base = skins[invite.template] ?? khatSkin;
  const style = getFontStyle(invite.font);
  if (!style) return base;
  const family = (cssVar: string) => FONT_FAMILIES[/--font-[a-z-]+/.exec(cssVar)?.[0] ?? ""];
  return { ...base, script: family(style.script) ?? base.script, label: family(style.label) ?? base.label, scriptScale: undefined };
}

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

/** The PDF's HTML. `per` is functions per page; render.ts drops to one when a page overflows. */
export function pdfHtml(invite: Invite, opts: { siteUrl: string; inviteUrl: string; per?: number }) {
  const d = invite;
  const s = skinFor(invite);
  const art = (p: string) => `${opts.siteUrl}${p}`;
  const per = opts.per ?? 2;
  const [A, B] = d.lead === "groom" ? [d.groom, d.bride] : [d.bride, d.groom];
  const occ = d.occasion === "engagement" ? "engagement" : d.occasion === "reception" ? "wedding reception" : "wedding";
  const k = s.scriptScale ?? 1;
  const paperBg = `url(${art(s.paper)}) center/cover`;
  const page = (inner: string, panel = false) => `<section class="page" style="background:${paperBg}"><div class="in">${panel ? `<div class="panel">${inner}</div>` : inner}</div></section>`;
  const events = [...d.events].sort((x, y) => x.start.localeCompare(y.start));
  const chunks: InviteEvent[][] = [];
  for (let i = 0; i < events.length; i += per) chunks.push(events.slice(i, i + per));
  const ev = (e: InviteEvent) => `<div class="ev">
    <p class="lab">${esc(f(e.start, { weekday: "long" }))} · ${esc(f(e.start, { day: "numeric", month: "short" }))} · ${time(e.start)}</p>
    <p class="evn">${esc(e.name)}</p>
    <p class="ven">${esc(e.venue)}${e.address ? `<br><span>${esc(e.address)}</span>` : ""}</p>
    ${e.dress ? `<p class="dress">Dress: ${esc(e.dress)}</p>` : ""}${e.note ? `<p class="dress">${esc(e.note)}</p>` : ""}
    <a class="btn" href="${esc(mapOf(e))}">Directions →</a></div>`;
  const coverInner = `<p class="inv">${esc(d.invocation)}</p>
    <p class="lab" style="margin-top:12px">${esc(d.heroKicker ?? `The ${occ} of`)}</p>
    <p class="script names">${esc(A.first)} <span class="amp">&amp;</span> ${esc(B.first)}</p>
    <div class="dl"><span class="lab rule">${esc(f(d.date, { weekday: "long" }))}</span><span class="big">${esc(f(d.date, { day: "numeric" }))}</span><span class="lab rule">${esc(f(d.date, { month: "long", year: "numeric" }))}</span></div>
    <p class="serif" style="font-size:22px;font-weight:600;margin-top:12px">${esc(d.city)}</p>`;
  const cover = s.cover
    ? `<section class="page" style="background:url(${art(s.cover)}) center/cover"><div class="glow"></div><div class="top" style="top:${s.coverTop ?? 9}%">${coverInner}</div></section>`
    : `<section class="page" style="background:${paperBg}"><div class="in">${coverInner}</div></section>`;
  const fonts = [s.script, `${s.label}:wght@400;500;600;700`, "Cormorant Garamond:ital,wght@0,500;0,600;1,500", "Noto Serif Devanagari:wght@500;600", "Noto Sans Gurmukhi:wght@500;600", "Noto Serif Tamil:wght@500;600", "Amiri"]
    .map((x) => `family=${x.replace(/ /g, "+")}`)
    .join("&");
  return `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?${fonts}&display=block" rel="stylesheet">
<style>
@page{size:540px 960px;margin:0}
*{box-sizing:border-box;margin:0;font-variant-numeric:lining-nums}
body{color:${s.ink};-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{position:relative;width:540px;height:960px;overflow:hidden;break-after:page}
.in{position:absolute;inset:140px 44px 120px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
.top{position:absolute;left:40px;right:40px;text-align:center}
.glow{position:absolute;inset:0 0 45% 0;background:linear-gradient(180deg,rgba(255,250,242,.72),rgba(255,250,242,.35) 60%,transparent)}
.panel{width:100%;padding:26px 22px;border-radius:22px;border:1.5px solid ${s.accent}55;background:${s.dark ? "rgba(0,0,0,.24)" : "rgba(255,251,246,.86)"}}
.script{font-family:'${s.script}',serif;color:${s.dark ? s.accent : s.ink}}
.lab{font-family:'${s.label}',sans-serif;font-size:calc(14px * var(--k,1));font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:${s.ink}}
.serif{font-family:'Cormorant Garamond',serif}
.inv{font-family:'Noto Serif Devanagari','Noto Sans Gurmukhi','Noto Serif Tamil',Amiri,serif;color:${s.accent};font-size:21px;font-weight:600}
.names{font-size:${Math.round(70 * k)}px;line-height:1.08;margin-top:12px}
.names .amp{font-size:${Math.round(40 * k)}px;color:${s.accent}}
.dl{display:flex;align-items:center;justify-content:center;gap:14px;margin-top:16px}
.dl .rule{border-top:1.5px solid ${s.ink};border-bottom:1.5px solid ${s.ink};padding:6px 10px}
.dl .big{font-family:'Cormorant Garamond',serif;font-size:48px;font-weight:600;line-height:1}
.msg{font-family:'Cormorant Garamond',serif;font-size:calc(24px * var(--k,1));font-weight:600;line-height:1.45;white-space:pre-line;margin-top:18px}
.who{margin-top:30px}.who .n{font-size:calc(${Math.round(48 * k)}px * var(--k,1));line-height:1.1}
.who .p{font-family:'Cormorant Garamond',serif;font-size:calc(21px * var(--k,1));font-weight:600;margin-top:6px;white-space:pre-line;line-height:1.35}
.orn{color:${s.accent};margin:16px 0;font-size:14px;letter-spacing:.4em}
.title{font-size:${Math.round(56 * k)}px;line-height:1.1;margin-top:6px}
.day{font-family:'Cormorant Garamond',serif;font-weight:600;font-size:150px;line-height:.9;color:${s.accent};margin-top:18px}
.mon{font-family:'${s.label}',sans-serif;font-weight:600;letter-spacing:.18em;font-size:22px;margin-top:12px}
.ev{width:100%;border:1.5px solid ${s.accent}88;background:${s.dark ? "rgba(0,0,0,.22)" : "rgba(255,251,246,.8)"};border-radius:18px;padding:20px;margin-top:16px}
.evn{font-family:'${s.script}',serif;font-size:calc(${Math.round(46 * k)}px * var(--k,1));line-height:1.15;margin-top:6px;color:${s.dark ? s.accent : s.ink}}
.ven{font-family:'Cormorant Garamond',serif;font-size:calc(22px * var(--k,1));font-weight:600;margin-top:8px;line-height:1.3}.ven span{font-size:calc(18px * var(--k,1))}
.dress{font-family:'Cormorant Garamond',serif;font-size:calc(19px * var(--k,1));font-weight:600;color:${s.accent};margin-top:8px}
.btn{display:inline-block;margin-top:14px;background:${s.accent};color:${s.dark ? "#2a0d10" : "#fff"};text-decoration:none;font-family:'${s.label}',sans-serif;font-size:16px;font-weight:700;padding:10px 24px;border-radius:999px;letter-spacing:.03em}
.link{font-family:'${s.label}',sans-serif;font-size:16px;font-weight:600;margin-top:26px;line-height:1.6}.link a{color:${s.accent}}
</style></head><body>
${cover}
${page(`${d.invocationMeaning ? `<p class="lab">${esc(d.invocationMeaning)}</p>` : ""}<p class="lab" style="margin-top:10px">${esc(d.hosts)}</p><p class="msg">${esc(d.message)}</p>
<div class="who"><p class="script n">${esc(A.full || A.first)}</p><p class="p">${esc(A.parents)}</p></div><p class="orn">✦</p>
<div class="who" style="margin-top:0"><p class="script n">${esc(B.full || B.first)}</p><p class="p">${esc(B.parents)}</p></div>`, true)}
${page(`<p class="lab">A little surprise</p><p class="script title">Save the date</p><p class="day">${esc(f(d.date, { day: "numeric" }))}</p><p class="mon">${esc(f(d.date, { month: "long", year: "numeric" }).toUpperCase())}</p><p class="lab" style="margin-top:14px">${esc(f(d.date, { weekday: "long" }))} · ${time(d.date)}</p><p class="serif" style="font-size:24px;font-weight:600;margin-top:12px">${esc(d.city)}</p>`, true)}
${chunks.map((ch, i) => page(`${i === 0 ? `<p class="lab">Join us for</p><p class="script title">The celebrations</p>` : ""}${ch.map(ev).join("")}`)).join("")}
${page(`${d.closing ? `<p class="msg">${esc(d.closing)}</p>` : ""}<p class="script title" style="margin-top:26px">${esc(A.first)} &amp; ${esc(B.first)}</p>${d.hashtag ? `<p class="lab" style="margin-top:10px;text-transform:none;font-size:17px;letter-spacing:.06em;color:${s.accent}">${esc(d.hashtag)}</p>` : ""}<p class="link">See the full invite with music and maps:<br><a href="${esc(opts.inviteUrl)}">${esc(opts.inviteUrl.replace(/^https?:\/\//, ""))}</a></p>`, true)}
<script>
for (const el of document.querySelectorAll(".in")) { let k = 1; while (el.scrollHeight > el.clientHeight + 1 && k > 0.82) { k -= 0.03; el.style.setProperty("--k", k); } }
</script></body></html>`;
}
