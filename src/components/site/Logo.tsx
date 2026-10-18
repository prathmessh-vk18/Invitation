import { site } from "@/config/site";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <defs>
        <linearGradient id="logo-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4a81d" />
          <stop offset="1" stopColor="#e8582a" />
        </linearGradient>
      </defs>
      <path d="M6 38 V18 C6 9 12 3 20 2 C28 3 34 9 34 18 V38 Z" fill="#5b0f22" />
      <path d="M11 38 V20 C11 13 15 8.5 20 7.5 C25 8.5 29 13 29 20 V38" fill="none" stroke="#e9bf62" strokeWidth="1.2" />
      <path d="M20 14 C23.5 19 24.5 23 22.8 26.2 C21.8 28 18.2 28 17.2 26.2 C15.5 23 16.5 19 20 14 Z" fill="url(#logo-g)" />
      <path d="M13 31 C16 33 24 33 27 31" stroke="#e9bf62" strokeWidth="1.6" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ className, light }: { className?: string; light?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <LogoMark className="size-8" />
      <span className={`font-display text-[22px] font-semibold tracking-tight ${light ? "text-cream" : "text-ink"}`} style={{ fontVariationSettings: '"SOFT" 100, "WONK" 1' }}>
        {site.name}
      </span>
    </span>
  );
}
