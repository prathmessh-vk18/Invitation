// Small helpers for generating ornamental SVG paths.

export const r2 = (n: number) => Math.round(n * 100) / 100;

export function cleanId(id: string) {
  return id.replace(/[^a-zA-Z0-9_-]/g, "");
}

/** A petal pointing up (negative y) whose base sits at distance `r` from origin. */
export function petalPath(r: number, length: number, width: number, tip = 1) {
  const b = -r;
  const t = -r - length;
  return [
    `M0 ${r2(b)}`,
    `C ${r2(width)} ${r2(b - length * 0.25)} ${r2(width * 0.7 * tip)} ${r2(b - length * 0.8)} 0 ${r2(t)}`,
    `C ${r2(-width * 0.7 * tip)} ${r2(b - length * 0.8)} ${r2(-width)} ${r2(b - length * 0.25)} 0 ${r2(b)}`,
    "Z",
  ].join(" ");
}

/** Closed scalloped circle — n bumps around radius r. */
export function scallopPath(r: number, n: number, depth: number) {
  let d = "";
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2;
    const a1 = ((i + 1) / n) * Math.PI * 2;
    const am = (a0 + a1) / 2;
    const p0 = [Math.cos(a0) * r, Math.sin(a0) * r];
    const p1 = [Math.cos(a1) * r, Math.sin(a1) * r];
    const c = [Math.cos(am) * (r + depth), Math.sin(am) * (r + depth)];
    if (i === 0) d += `M${r2(p0[0])} ${r2(p0[1])}`;
    d += ` Q${r2(c[0])} ${r2(c[1])} ${r2(p1[0])} ${r2(p1[1])}`;
  }
  return d + " Z";
}

function bez(p0: number[], p1: number[], p2: number[], p3: number[], t: number) {
  const u = 1 - t;
  return [0, 1].map(
    (k) => u * u * u * p0[k] + 3 * u * u * t * p1[k] + 3 * u * t * t * p2[k] + t * t * t * p3[k],
  );
}

/**
 * Cusped (multifoil) jharokha arch. The shape spans 0..w horizontally and 0..h vertically,
 * with the arch springing at y = spring. Foils bulge outward away from the opening.
 */
export function jharokhaPath(w: number, h: number, spring: number, foilsPerSide = 4, bulge = 0.35) {
  const left = [
    [0, spring],
    [0, spring * 0.42],
    [w * 0.24, spring * 0.06],
    [w / 2, 0],
  ];
  const right = [
    [w / 2, 0],
    [w * 0.76, spring * 0.06],
    [w, spring * 0.42],
    [w, spring],
  ];
  const center = [w / 2, spring];
  const pts: number[][] = [];
  for (let i = 0; i <= foilsPerSide; i++) pts.push(bez(left[0], left[1], left[2], left[3], i / foilsPerSide));
  for (let i = 1; i <= foilsPerSide; i++) pts.push(bez(right[0], right[1], right[2], right[3], i / foilsPerSide));

  let d = `M0 ${h} L${pts[0][0]} ${r2(pts[0][1])}`;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const dx = m[0] - center[0];
    const dy = m[1] - center[1];
    const len = Math.hypot(dx, dy) || 1;
    const chord = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const c = [m[0] + (dx / len) * chord * bulge, m[1] + (dy / len) * chord * bulge];
    d += ` Q${r2(c[0])} ${r2(c[1])} ${r2(b[0])} ${r2(b[1])}`;
  }
  d += ` L${w} ${h} Z`;
  return d;
}

/** Simple rounded-top (temple door) arch. */
export function domeArchPath(w: number, h: number) {
  const rx = w / 2;
  return `M0 ${h} L0 ${rx} A${rx} ${rx} 0 0 1 ${w} ${rx} L${w} ${h} Z`;
}

/** Deterministic pseudo-random so server and client render identical art. */
export function seeded(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
