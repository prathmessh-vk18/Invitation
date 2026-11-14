"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/**
 * A name centred by its ink rather than its box. Script capitals swing far out to one side (a "D"'s
 * swash, a "P"'s loop), so a centred box can look shifted when names are stacked. This measures the
 * drawn letters in the element's own font and nudges the text so the ink sits in the middle.
 * `nudge` (in em) moves it further by eye, for a name a couple feels still leans.
 */
export function InkCentered({ children, className, style, nudge = 0 }: { children: ReactNode; className?: string; style?: CSSProperties; nudge?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shift, setShift] = useState(0);
  const text = typeof children === "string" ? children : "";

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !text) return;
    let gone = false;
    const measure = () => {
      if (gone) return;
      const cs = getComputedStyle(el);
      const ctx = document.createElement("canvas").getContext("2d");
      if (!ctx) return;
      ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const m = ctx.measureText(text);
      // The ink runs from -actualBoundingBoxLeft to actualBoundingBoxRight; the box from 0 to width.
      const inkMid = (m.actualBoundingBoxRight - m.actualBoundingBoxLeft) / 2;
      const next = m.width / 2 - inkMid;
      setShift(Math.abs(next) < 0.5 ? 0 : next);
    };
    measure();
    document.fonts?.ready.then(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      gone = true;
      ro.disconnect();
    };
  }, [text]);

  return (
    <span ref={ref} className={className} style={{ ...style, display: style?.display ?? "inline-block", transform: shift || nudge ? `translateX(calc(${shift.toFixed(1)}px + ${nudge}em))` : undefined }}>
      {children}
    </span>
  );
}
