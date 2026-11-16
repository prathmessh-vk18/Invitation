"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/**
 * A name centred by its ink rather than its box. Script capitals swing far out to one side (a "D"'s
 * swash, a "P"'s loop), so a centred box can look shifted when names are stacked. This measures the
 * drawn letters in the element's own font and nudges the text so the ink sits in the middle.
 * `nudge` (in em) moves it further by eye, for a name a couple feels still leans. `vertical` also
 * centres it top to bottom, for letters set in a round space (a wax seal's monogram).
 */
export function InkCentered({ children, className, style, nudge = 0, vertical = false }: { children: ReactNode; className?: string; style?: CSSProperties; nudge?: number; vertical?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shift, setShift] = useState(0);
  const [lift, setLift] = useState(0);
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
      if (vertical) {
        // The font's own ascent and descent sit centred in the line, so the baseline is half the
        // leftover space plus the ascent down from the top; the ink spans its own ascent/descent.
        const line = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize);
        const baseline = (line - m.fontBoundingBoxAscent - m.fontBoundingBoxDescent) / 2 + m.fontBoundingBoxAscent;
        const inkMidY = baseline - (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2;
        const up = line / 2 - inkMidY;
        setLift(Math.abs(up) < 0.5 ? 0 : up);
      }
    };
    measure();
    document.fonts?.ready.then(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      gone = true;
      ro.disconnect();
    };
  }, [text, vertical]);

  return (
    <span
      ref={ref}
      className={className}
      style={{ ...style, display: style?.display ?? "inline-block", transform: shift || nudge || lift ? `translate(calc(${shift.toFixed(1)}px + ${nudge}em), ${lift.toFixed(1)}px)` : undefined }}
    >
      {children}
    </span>
  );
}
