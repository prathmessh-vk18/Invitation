const TZ = "Asia/Kolkata";

export function fmtDate(iso: string, opts: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-IN", { timeZone: TZ, ...opts }).format(new Date(iso));
}

export const longDate = (iso: string) =>
  fmtDate(iso, { weekday: "long", day: "numeric", month: "long", year: "numeric" });

export const shortDate = (iso: string) => fmtDate(iso, { day: "numeric", month: "short" });

export const time = (iso: string) =>
  fmtDate(iso, { hour: "numeric", minute: "2-digit", hour12: true }).toLowerCase();

export const dayNum = (iso: string) => fmtDate(iso, { day: "2-digit" });
export const monthName = (iso: string) => fmtDate(iso, { month: "long" });
export const yearNum = (iso: string) => fmtDate(iso, { year: "numeric" });
export const weekday = (iso: string) => fmtDate(iso, { weekday: "long" });

export function mapsLink(address: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

// Links people copy from Google Maps' Share button (and older desktop links).
const MAP_URL = /https?:\/\/(?:maps\.app\.goo\.gl|goo\.gl\/maps|share\.google|maps\.google\.[a-z.]+|(?:www\.)?google\.[a-z.]+\/maps)[^\s]*/i;

/** Whether `v` is a Google Maps link. */
export const isMapUrl = (v: string) => MAP_URL.test(v) && v.trim().match(MAP_URL)?.index === 0;

/** Pulls a Google Maps link out of a typed address: the link, and the address without it. */
export function splitMapLink(address: string) {
  const m = address.match(MAP_URL);
  if (!m || m.index === undefined) return { url: "", rest: address };
  const rest = `${address.slice(0, m.index)} ${address.slice(m.index + m[0].length)}`.replace(/\s+/g, " ").trim();
  return { url: m[0], rest };
}

/** Where a function is, in words: the venue plus its address, or the wedding city when there's no address. */
export function placeOf(e: { venue: string; address?: string }, city?: string) {
  return [e.venue, e.address || city].filter(Boolean).join(", ");
}

/** Where a function's Directions button goes: the couple's own map link, else a search for the venue. */
export function directionsLink(e: { venue: string; address?: string; mapUrl?: string }, city?: string) {
  return e.mapUrl || mapsLink(placeOf(e, city));
}

/** Moves map links pasted into addresses into `mapUrl`, so cards show a clean address. */
export function withMapLinks<T extends { events: { address: string; mapUrl?: string }[] }>(invite: T): T {
  return {
    ...invite,
    events: invite.events.map((e) => {
      const { url, rest } = splitMapLink(e.address ?? "");
      return url ? { ...e, address: rest, mapUrl: e.mapUrl || url } : e;
    }),
  };
}

function gcalStamp(iso: string) {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function calendarLink(title: string, start: string, end: string | undefined, location: string) {
  const s = new Date(start);
  const e = end ? new Date(end) : new Date(s.getTime() + 3 * 3600_000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${gcalStamp(s.toISOString())}/${gcalStamp(e.toISOString())}`,
    location,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}
