"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * On phones, keeps a page's main action within reach: a bar at the bottom of the screen that
 * appears once the page's own button (`watchId`) has scrolled out of view above.
 */
export function StickyCta({ href, label, watchId }: { href: string; label: string; watchId: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = document.getElementById(watchId);
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setShow(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, [watchId]);

  return (
    <div
      data-sticky-cta={show ? "on" : "off"}
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/90 p-3 backdrop-blur transition duration-300 lg:hidden ${show ? "translate-y-0" : "pointer-events-none translate-y-full"}`}
    >
      <Link href={href} className="btn-shine flex w-full items-center justify-center gap-1.5 rounded-full bg-ink py-3.5 text-[16px] font-medium text-white">
        {label} <span aria-hidden>→</span>
      </Link>
    </div>
  );
}
