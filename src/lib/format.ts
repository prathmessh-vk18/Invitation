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
