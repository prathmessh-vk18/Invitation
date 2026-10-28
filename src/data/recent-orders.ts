import type { TemplateId } from "./templates";

/**
 * "Recently ordered" on the home page. List the orders to show, newest first: a first name,
 * a city (optional), the design and the date it was ordered (optional). With a date the card
 * says "today", "yesterday" or "3 days ago" on its own; without one it shows just the city.
 *
 * Example:
 *   { name: "Pooja", city: "Jaipur", template: "khat", date: "2026-10-28" },
 *
 * While the list is empty the section is hidden on the live site (and shows a few examples
 * locally so you can see the layout).
 */
export type RecentOrder = { name: string; city?: string; template: TemplateId; date?: string };

export const recentOrders: RecentOrder[] = [
  { name: "Pooja", city: "Jaipur", template: "khat" },
  { name: "Divyanshi", city: "Nashik", template: "mahal" },
  { name: "Ayushi", city: "Lucknow", template: "mandir" },
  { name: "Parth", city: "Nagpur", template: "mandir" },
  { name: "Tanvi", city: "Kolkata", template: "bagh" },
  { name: "Iqra", city: "Kashmir", template: "noor" },
  { name: "Aman", city: "Jaipur", template: "rajwada" },
  { name: "Nishant", city: "Gangtok", template: "khat" },
  { name: "Komal", city: "Jaunpur", template: "mandir" },
];
