import "server-only";
import { cleanPartnerCode, isPartnerCode } from "@/config/partners";
import type { OrderStatus } from "@/lib/orders";
import { db } from "@/lib/supabase";

export type Partner = {
  code: string;
  name: string;
  phone: string;
  upi_id: string | null;
  commission: number;
  token: string;
  is_active: boolean;
  created_at: string;
};

export type Payout = { id: string; partner_code: string; amount: number; note: string | null; paid_at: string };

export type PartnerOrder = { id: string; code: string; template: string; status: OrderStatus; partner_code: string; partner_commission: number | null; created_at: string };

/** Commission counts once the couple has paid. */
export const earns = (status: OrderStatus) => status === "paid" || status === "live";

export async function findActivePartner(input: unknown) {
  const code = cleanPartnerCode(input);
  if (!isPartnerCode(code)) return null;
  const { data } = await db().from("partners").select("*").eq("code", code).eq("is_active", true).maybeSingle();
  return (data as Partner | null) ?? null;
}

/** Earned, pending, paid and still owed, from one partner's orders and payouts. */
export function tally(orders: PartnerOrder[], payouts: Payout[]) {
  const sum = (xs: { amount: number }[]) => xs.reduce((n, x) => n + x.amount, 0);
  const earned = sum(orders.filter((o) => earns(o.status)).map((o) => ({ amount: o.partner_commission ?? 0 })));
  const pending = sum(orders.filter((o) => o.status === "awaiting_payment" || o.status === "payment_submitted").map((o) => ({ amount: o.partner_commission ?? 0 })));
  const paid = sum(payouts);
  return { earned, pending, paid, due: Math.max(0, earned - paid), sales: orders.filter((o) => earns(o.status)).length };
}
