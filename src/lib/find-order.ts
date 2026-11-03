"use server";

import { cleanPhone } from "@/lib/orders";
import { db, isSupabaseConfigured } from "@/lib/supabase";

const notFound = { error: "We couldn't find an order with those details. Check the link, the order number and the phone number you ordered with." };

/** "aavjoo.in/i/rahul-weds-shalini", a full URL or just the slug. */
const slugOf = (link: string) => {
  const s = link.trim().toLowerCase().replace(/[?#].*$/, "").replace(/\/+$/, "");
  return (s.match(/\/i\/([a-z0-9-]+)$/)?.[1] ?? s.split("/").pop() ?? "").replace(/[^a-z0-9-]/g, "");
};

/** "AAV-1203", "aav1203" or "1203". */
const codeOf = (code: string) => {
  const n = code.replace(/\D/g, "");
  return n ? `AAV-${n}` : "";
};

/**
 * Finds a couple's order from their invite link, order number and the phone number they ordered
 * with. All three must match. Changes to a live invite still wait for approval in admin.
 */
export async function findMyOrder(link: string, code: string, phone: string): Promise<{ id: string } | { error: string }> {
  const slug = slugOf(String(link));
  const c = codeOf(String(code));
  const p = cleanPhone(phone);
  if (!slug) return { error: "Paste your invite link." };
  if (!c) return { error: "Add your order number, e.g. AAV-1203." };
  if (p.length < 10) return { error: "Add the phone number you ordered with." };
  if (!isSupabaseConfigured()) return notFound;

  const { data } = await db().from("orders").select("id").eq("code", c).eq("customer_phone", p).eq("invite_slug", slug).neq("status", "cancelled").maybeSingle();
  return data ? { id: data.id as string } : notFound;
}
