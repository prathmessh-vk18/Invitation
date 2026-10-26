import type { EventKind } from "@/data/invites";

// Fine line glyphs for each ceremony, drawn on a 48×48 grid with currentColor.
const paths: Record<EventKind, React.ReactNode> = {
  haldi: (
    <>
      <path d="M8 24 H40 C40 33 33 39 24 39 C15 39 8 33 8 24 Z" />
      <path d="M14 24 C16 19 20 17 24 17 C28 17 32 19 34 24" />
      <circle cx="20" cy="21" r="1.4" />
      <circle cx="27" cy="20" r="1.4" />
      <path d="M30 14 L38 6 M36 16 L42 12" />
      <path d="M17 43 H31" />
    </>
  ),
  mehndi: (
    <>
      <path d="M24 42 C14 42 8 35 8 27 C8 17 17 10 27 10 C34 10 40 15 40 21 C40 26 36 29 31 29 C27 29 24 26 25 22" />
      <path d="M18 31 C20 26 24 25 27 26" />
      <circle cx="31" cy="20" r="1.6" />
      <path d="M14 22 C15 19 17 17 20 16" strokeDasharray="1 3" />
    </>
  ),
  sangeet: (
    <>
      <ellipse cx="12" cy="24" rx="5" ry="10" />
      <ellipse cx="36" cy="24" rx="5" ry="10" />
      <path d="M12 14 C20 11 28 11 36 14 M12 34 C20 37 28 37 36 34" />
      <path d="M16 15 L32 33 M32 15 L16 33" strokeOpacity={0.6} />
    </>
  ),
  baraat: (
    <>
      <path d="M6 22 L30 16 L30 32 L6 26 Z" />
      <path d="M30 16 C36 12 42 14 42 24 C42 34 36 36 30 32" />
      <path d="M10 22 V26 M16 20.6 V27.4 M22 19.2 V28.8" strokeOpacity={0.6} />
      <path d="M2 24 H6" />
    </>
  ),
  phere: (
    <>
      <path d="M24 6 C28 13 34 17 33 25 C32 31 28 34 24 34 C20 34 16 31 15 25 C14 19 19 17 20 12 C22 16 24 16 24 13 Z" />
      <path d="M24 22 C26 25 26 28 24 31 C22 28 22 25 24 22 Z" />
      <path d="M8 38 H40 M12 42 H36" />
      <path d="M14 38 L22 34 M34 38 L26 34" />
    </>
  ),
  reception: (
    <>
      <path d="M14 8 H22 L21 18 C20.5 21 19.5 22 18 22 C16.5 22 15.5 21 15 18 Z" />
      <path d="M26 8 H34 L33 18 C32.5 21 31.5 22 30 22 C28.5 22 27.5 21 27 18 Z" />
      <path d="M18 22 V38 M30 22 V38 M13 38 H23 M25 38 H35" />
      <path d="M24 4 L24 7 M19 3 L20 5 M29 3 L28 5" />
    </>
  ),
  nikah: (
    <>
      <circle cx="18" cy="28" r="10" />
      <circle cx="30" cy="28" r="10" />
      <path d="M28 8 C22 9 19 14 20 19 C24 15 30 14 34 16 C33 11 31 9 28 8 Z" />
      <path d="M36 6 l1 2.2 2.2 .6 -2.2 .6 -1 2.2 -1 -2.2 -2.2 -.6 2.2 -.6 Z" />
    </>
  ),
  walima: (
    <>
      <path d="M8 32 C8 22 15 15 24 15 C33 15 40 22 40 32 Z" />
      <path d="M5 32 H43 M24 15 V11 M21 11 H27" />
      <path d="M12 38 H36" />
      <path d="M16 26 C17 22 20 20 23 19" strokeOpacity={0.6} />
    </>
  ),
  jaggo: (
    <>
      <path d="M14 22 C14 32 18 40 24 40 C30 40 34 32 34 22 Z" />
      <path d="M12 22 H36" />
      <path d="M17 18 C18 15 18 13 17 11 M24 17 C25 13 25 10 24 7 M31 18 C30 15 30 13 31 11" />
      <path d="M18 28 L22 32 L26 28 L30 32" strokeOpacity={0.6} />
    </>
  ),
  anandkaraj: (
    <>
      <path d="M12 40 V24 H36 V40" />
      <path d="M14 24 C14 16 19 11 24 11 C29 11 34 16 34 24" />
      <path d="M24 11 V6 M22 7 H26" />
      <path d="M21 40 V32 C21 30 22.5 29 24 29 C25.5 29 27 30 27 32 V40" />
      <path d="M8 40 H40" />
    </>
  ),
  muhurtham: (
    <>
      <path d="M16 22 C12 26 12 34 16 38 H32 C36 34 36 26 32 22 Z" />
      <path d="M18 22 H30" />
      <circle cx="24" cy="15" r="5" />
      <path d="M19 16 C14 13 10 14 8 17 M29 16 C34 13 38 14 40 17" />
      <path d="M18 30 H30" strokeOpacity={0.6} />
    </>
  ),
  // Any function the couple names themselves: a small diya with a spark.
  other: (
    <>
      <path d="M10 30 C10 37 16 41 24 41 C32 41 38 37 38 30 Z" />
      <path d="M24 30 C20 26 20 21 24 15 C28 21 28 26 24 30 Z" />
      <path d="M24 6 V9 M15 10 L17 12 M33 10 L31 12" />
      <path d="M18 45 H30" />
    </>
  ),
};

export function EventGlyph({ kind, className }: { kind: EventKind; className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {paths[kind]}
    </svg>
  );
}
