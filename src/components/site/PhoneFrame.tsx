import type { ReactNode } from "react";

export function PhoneFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative aspect-[9/19.2] rounded-[14%/6.6%] bg-[#141010] p-[3.2%] shadow-[0_40px_80px_-30px_rgba(40,15,5,.55),inset_0_0_0_1.5px_#3a3330] ${className ?? ""}`}>
      <div className="relative h-full w-full overflow-hidden rounded-[11%/5.2%] bg-black">
        {children}
        <div className="pointer-events-none absolute top-[1.6%] left-1/2 z-10 h-[3.4%] w-[30%] -translate-x-1/2 rounded-full bg-black" />
      </div>
      <span className="absolute top-[18%] -left-[1.2%] h-[7%] w-[1.2%] rounded-l bg-[#2a2421]" />
      <span className="absolute top-[27%] -left-[1.2%] h-[7%] w-[1.2%] rounded-l bg-[#2a2421]" />
      <span className="absolute top-[22%] -right-[1.2%] h-[11%] w-[1.2%] rounded-r bg-[#2a2421]" />
    </div>
  );
}
