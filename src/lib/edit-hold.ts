import type { InviteDetails } from "@/lib/orders";

/**
 * Why a couple's change should wait for us instead of going live on its own, or null.
 *
 * Changes apply automatically, so this catches the one pattern that isn't a correction: an invite
 * being turned into another couple's (both names replaced, or the wedding moved by months).
 * Spelling fixes, a swapped bride/groom or a nickname still go straight through.
 */
export function holdReason(before: InviteDetails, after: InviteDetails): string | null {
  const [b1, g1, b2, g2] = [before.bride?.first, before.groom?.first, after.bride?.first, after.groom?.first];
  const kept = (x?: string, y?: string) => similarName(x, y);
  const sameCouple = (kept(b1, b2) || kept(g1, g2)) || (kept(b1, g2) && kept(g1, b2));
  if (!sameCouple) return `Both names changed (${g1} & ${b1} → ${g2} & ${b2})`;

  const days = Math.abs(new Date(after.date).getTime() - new Date(before.date).getTime()) / 864e5;
  if (days > MAX_DATE_MOVE_DAYS) return `Wedding date moved by ${Math.round(days)} days`;
  return null;
}

const MAX_DATE_MOVE_DAYS = 60;

const clean = (s?: string) => (s ?? "").toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^\p{L}]/gu, "");

/** Same name give or take a spelling fix, an initial or a nickname ("Simran" ~ "Simren", "Sahil" ~ "Sahil Dhankar"). */
export function similarName(a?: string, b?: string) {
  const x = clean(a);
  const y = clean(b);
  if (!x || !y || x === y) return true;
  if (x.startsWith(y) || y.startsWith(x)) return true;
  return distance(x, y) <= Math.max(2, Math.floor(Math.max(x.length, y.length) / 3));
}

function distance(a: string, b: string) {
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[b.length];
}
