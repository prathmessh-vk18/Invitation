"use client";

import Image from "next/image";
import type { ReactNode } from "react";

/**
 * A static mock of the Marathi design with real wording on the painted art, so the whole look can
 * be judged before the opening is animated: opening frame, cover, families, functions, closing.
 */

const C = { maroon: "#6a0f1e", ink: "#4a1a14", gold: "#b8862e", goldLight: "#f3d68a", green: "#1f4d2b", paper: "#f6ead3" };
const deva = "var(--font-deva)";
const rozha = "var(--font-rozha)";
const label = "var(--font-cinzel)";
const serif = "var(--font-cormorant)";
const script = "var(--font-pinyon)";

function Page({ art, children, priority }: { art: string; children: ReactNode; priority?: boolean }) {
  return (
    <section className="relative w-full overflow-hidden" style={{ aspectRatio: "864 / 1536" }}>
      <Image src={`/art/illus/${art}.jpg`} alt="" fill priority={priority} sizes="480px" className="object-cover" />
      {children}
    </section>
  );
}

const Small = ({ children, className = "", color = C.ink }: { children: ReactNode; className?: string; color?: string }) => (
  <p className={`text-[2.6cqw] tracking-[0.28em] uppercase ${className}`} style={{ fontFamily: label, color }}>
    {children}
  </p>
);

export function MarathiSections() {
  return (
    <div className="flex min-h-svh justify-center bg-[#1b1412]">
      <div className="@container w-full max-w-[480px]">
        {/* 1 · The opening frame (animated later): the antarpat between them. */}
        <Page art="marathi-antarpat" priority>
          <div className="absolute inset-x-[22%] top-[33%] text-center">
            <p className="text-[6.6cqw] leading-tight" style={{ fontFamily: rozha, color: C.goldLight, textShadow: "0 2px 12px rgba(0,0,0,.55)" }}>
              ॥ शुभमंगल सावधान ॥
            </p>
          </div>
          <div className="absolute bottom-[6%] left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[rgba(24,14,10,.74)] px-5 py-3 text-[clamp(14px,3.9cqw,17px)] font-semibold whitespace-nowrap text-white ring-1 ring-white/25 backdrop-blur-md">
            👆 Tap for Shubhamangal Saavdhaan
          </div>
        </Page>

        {/* 2 · Cover: the first look, names in the light above them. */}
        <Page art="marathi-cover">
          <div className="absolute inset-x-[6%] top-[3.5%] flex flex-col items-center text-center">
            <p className="text-[4.4cqw]" style={{ fontFamily: deva, color: C.maroon }}>
              ॥ श्री गणेशाय नमः ॥
            </p>
            <p className="mt-[1.5cqw] text-[10.5cqw] leading-none" style={{ fontFamily: rozha, color: C.maroon }}>
              शुभविवाह
            </p>
            <p className="mt-[3cqw] text-[12.5cqw] leading-[0.95]" style={{ fontFamily: script, color: C.ink }}>
              Aditi <span className="text-[7cqw]" style={{ color: C.gold }}>&amp;</span> Sameer
            </p>
            <Small className="mt-[2.5cqw] rounded-full bg-[rgba(255,246,228,.7)] px-[3cqw] py-[1cqw]">Saturday · 20 February 2027 · Pune</Small>
          </div>
        </Page>

        {/* 3 · Families, as on a printed patrika: चि. सौ. कां. for the bride, चि. for the groom. */}
        <Page art="marathi-card">
          <div className="absolute inset-x-[14%] top-[13%] bottom-[13%] flex flex-col items-center justify-center text-center">
            <p className="text-[3.8cqw]" style={{ fontFamily: deva, color: C.gold }}>
              ॥ वक्रतुंड महाकाय सूर्यकोटि समप्रभ ॥
            </p>
            <Small className="mt-[4cqw]">With the blessings of our elders</Small>
            <p className="mt-[4cqw] text-[4.6cqw] leading-snug" style={{ fontFamily: serif, color: C.ink, fontWeight: 600 }}>
              Mr. Vijay &amp; Mrs. Sunanda Kulkarni and Mr. Prakash &amp; Mrs. Meera Deshpande request the pleasure of your company at the wedding of their children
            </p>
            <Divider />
            <p className="text-[4cqw]" style={{ fontFamily: deva, color: C.gold }}>चि. सौ. कां.</p>
            <p className="text-[11cqw] leading-none" style={{ fontFamily: script, color: C.maroon }}>Aditi</p>
            <p className="mt-[1cqw] text-[3.6cqw] italic" style={{ fontFamily: serif, color: C.ink }}>daughter of Mr. Vijay &amp; Mrs. Sunanda Kulkarni</p>
            <p className="my-[3cqw] text-[6cqw]" style={{ fontFamily: script, color: C.gold }}>&amp;</p>
            <p className="text-[4cqw]" style={{ fontFamily: deva, color: C.gold }}>चि.</p>
            <p className="text-[11cqw] leading-none" style={{ fontFamily: script, color: C.maroon }}>Sameer</p>
            <p className="mt-[1cqw] text-[3.6cqw] italic" style={{ fontFamily: serif, color: C.ink }}>son of Mr. Prakash &amp; Mrs. Meera Deshpande</p>
          </div>
        </Page>

        {/* 4 · Functions, two to a card. */}
        <Page art="marathi-card">
          <div className="absolute inset-x-[14%] top-[13%] bottom-[15%] flex flex-col items-center justify-center text-center">
            <Small color={C.gold}>Join us for</Small>
            <p className="text-[9cqw] leading-tight" style={{ fontFamily: script, color: C.maroon }}>The celebrations</p>
            <Event mr="हळद" en="Haldi" when="Friday, 19 Feb · 10:00 am" venue="Kulkarni Wada, Sadashiv Peth, Pune" dress="Shades of yellow" />
            <Divider />
            <Event mr="शुभमुहूर्त · लग्न" en="Lagna · Muhurta 11:45 am" when="Saturday, 20 Feb · 11:45 am" venue="Shree Ganesh Mangal Karyalay, Kothrud, Pune" dress="Paithani & pheta" />
          </div>
        </Page>

        {/* 5 · Closing: the wedding knot, walking home to the wada. */}
        <Page art="marathi-closing">
          <div className="absolute inset-x-[8%] top-[6%] flex flex-col items-center text-center">
            <p className="text-[5cqw] leading-snug" style={{ fontFamily: serif, color: C.ink, fontWeight: 600, fontStyle: "italic" }}>
              Two families, one new home. Come, bless the beginning.
            </p>
            <p className="mt-[3cqw] text-[12cqw] leading-none" style={{ fontFamily: script, color: C.maroon }}>
              Aditi &amp; Sameer
            </p>
            <p className="mt-[3cqw] text-[4.2cqw]" style={{ fontFamily: deva, color: C.maroon }}>
              आपली उपस्थिती प्रार्थनीय
            </p>
          </div>
        </Page>
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div className="my-[4cqw] flex w-[50%] items-center gap-[2cqw]">
      <span className="h-px flex-1" style={{ background: C.gold }} />
      <span className="text-[3cqw]" style={{ color: C.gold }}>✦</span>
      <span className="h-px flex-1" style={{ background: C.gold }} />
    </div>
  );
}

function Event({ mr, en, when, venue, dress }: { mr: string; en: string; when: string; venue: string; dress: string }) {
  return (
    <div className="mt-[3cqw] flex flex-col items-center">
      <p className="text-[6.6cqw] leading-tight" style={{ fontFamily: rozha, color: C.maroon }}>{mr}</p>
      <Small className="mt-[1cqw]" color={C.gold}>{en}</Small>
      <p className="mt-[2.5cqw] text-[4.4cqw]" style={{ fontFamily: serif, color: C.ink, fontWeight: 600 }}>{when}</p>
      <p className="mt-[0.5cqw] text-[3.8cqw] leading-snug" style={{ fontFamily: serif, color: C.ink }}>{venue}</p>
      <p className="mt-[1.5cqw] text-[3.6cqw] italic" style={{ fontFamily: serif, color: C.green }}>Dress: {dress}</p>
      <span className="mt-[2.5cqw] rounded-full px-[4cqw] py-[1.5cqw] text-[3cqw] text-white" style={{ background: C.maroon, fontFamily: label, letterSpacing: "0.12em" }}>
        DIRECTIONS →
      </span>
    </div>
  );
}
