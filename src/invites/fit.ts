import { useEffect, type DependencyList, type RefObject } from "react";

let ctx: CanvasRenderingContext2D | null = null;

/** Width of `text` in `el`'s font, without laying it out. */
function textWidth(el: HTMLElement, text: string) {
  ctx ??= document.createElement("canvas").getContext("2d");
  if (!ctx) return 0;
  const s = getComputedStyle(el);
  ctx.font = `${s.fontStyle} ${s.fontWeight} ${s.fontSize} ${s.fontFamily}`;
  return ctx.measureText(text).width;
}

/**
 * The width an element's text can use: the tightest box around it. Boxes that grow to fit
 * their text are never tighter than the text, so the smallest one is the real limit.
 */
function room(el: HTMLElement, root: HTMLElement) {
  let w = Infinity;
  for (let n: HTMLElement | null = el; n && n !== root.parentElement; n = n.parentElement) {
    if (!n.clientWidth) continue;
    const s = getComputedStyle(n);
    w = Math.min(w, n.clientWidth - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight));
  }
  return w;
}

/** Shrinks any `.inv-script` text (names, titles) that is too wide for its space, so long names fit in every font. */
function fit(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>(".inv-script").forEach((el) => {
    // Start from the size the design set (some set it inline), not from a previous fit.
    el.dataset.fitBase ??= el.style.fontSize;
    el.style.fontSize = el.dataset.fitBase;
    const text = el.textContent?.trim();
    if (!text) return;
    // Text that can wrap only needs its longest word to fit.
    const units = getComputedStyle(el).whiteSpace.includes("nowrap") ? [text] : text.split(/\s+/);
    const widest = Math.max(...units.map((u) => textWidth(el, u)));
    const avail = room(el, root);
    if (widest > avail && avail > 0) el.style.fontSize = `${(parseFloat(getComputedStyle(el).fontSize) * avail * 0.96) / widest}px`;
  });
}

export function useFitScript(ref: RefObject<HTMLElement | null>, deps: DependencyList) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    let frame = 0;
    const run = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => fit(root));
    };
    run();
    document.fonts?.ready.then(run);
    const ro = new ResizeObserver(run);
    ro.observe(root);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
