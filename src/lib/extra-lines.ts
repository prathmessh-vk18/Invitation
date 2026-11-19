/**
 * The lines of an invite's end-of-invite lists (`extras`) can carry a little shape, for cards like
 * a family's printed one:
 *   "## Didi & Jijaji"   a small heading inside the list
 *   "# Vehaan & Shanaya" names set large
 *   "&"                  a small "&" between two names
 *   "~"                  a little space (between two pairs of names)
 * Anything else is an ordinary line.
 */
export type ExtraLine = { kind: "line" | "sub" | "big" | "and" | "gap"; text: string };

export function extraLine(line: string): ExtraLine {
  const t = line.trim();
  if (t === "&") return { kind: "and", text: "&" };
  if (t === "~") return { kind: "gap", text: "" };
  if (t.startsWith("## ")) return { kind: "sub", text: t.slice(3).trim() };
  if (t.startsWith("# ")) return { kind: "big", text: t.slice(2).trim() };
  return { kind: "line", text: t };
}
