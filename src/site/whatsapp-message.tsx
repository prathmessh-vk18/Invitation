import type { ReactNode } from "react";

/** What a couple sends with their link, the same everywhere they share it. */
export function shareText(names: string, occasion: string, url: string) {
  return `You're invited to ${names}'s ${occasion} 💛\n${url}`;
}

/** The link preview's title, as /i/[slug] sets it for WhatsApp. */
export function shareTitle(names: string, occasion: string) {
  return `${names} · ${occasion === "engagement" ? "Engagement" : occasion === "reception" ? "Wedding Reception" : "Wedding"} Invitation`;
}

/**
 * Their invite as guests get it on WhatsApp: a sent message with the link's preview card (the
 * share card), the title and the address. `card` is the 1200×630 picture, drawn or real.
 */
export function WhatsAppMessage({ card, names, occasion, url }: { card: ReactNode; names: string; occasion: string; url: string }) {
  return (
    <div className="rounded-[16px] bg-[#efeae2] p-3">
      <div className="ml-auto w-[92%] max-w-[420px] rounded-[12px] rounded-tr-[4px] bg-[#d9fdd3] p-1.5 text-left shadow-[0_1px_1px_rgba(0,0,0,.08)]">
        <div className="overflow-hidden rounded-[9px] bg-[#cfe9c7]">
          <div className="relative aspect-[1200/630] overflow-hidden">{card}</div>
          <div className="px-2.5 py-2">
            <p className="truncate text-[13px] font-semibold text-[#111b21]">{shareTitle(names, occasion)}</p>
            <p className="text-[12px] text-[#667781]">aavjoo.in</p>
          </div>
        </div>
        <p className="px-1.5 pt-1.5 text-[14px] leading-snug text-[#111b21]">
          You&rsquo;re invited to {names}&rsquo;s {occasion} 💛
        </p>
        <p className="px-1.5 text-[14px] leading-snug break-all text-[#027eb5] underline">{url}</p>
        <p className="px-1.5 pt-0.5 text-right text-[11px] text-[#667781]">
          now <span className="text-[#53bdeb]">✓✓</span>
        </p>
      </div>
    </div>
  );
}
