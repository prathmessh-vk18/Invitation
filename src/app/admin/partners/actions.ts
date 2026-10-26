"use server";

import { revalidatePath } from "next/cache";
import { cleanPartnerCode, isPartnerCode, partners } from "@/config/partners";
import { requireAdmin } from "@/lib/admin-auth";
import { cleanPhone } from "@/lib/orders";
import { db } from "@/lib/supabase";

const refresh = () => revalidatePath("/admin/partners");

export async function createPartner(_: unknown, form: FormData): Promise<{ error?: string; ok?: string }> {
  await requireAdmin();
  const name = String(form.get("name") ?? "").trim().slice(0, 80);
  const code = cleanPartnerCode(form.get("code"));
  const phone = cleanPhone(form.get("phone"));
  const upi = String(form.get("upi") ?? "").trim().slice(0, 80);
  const commission = Number(form.get("commission") || partners.commission);

  if (!name) return { error: "Add the partner's name." };
  if (!isPartnerCode(code)) return { error: "The code needs 3–20 letters or numbers, e.g. PRIYA." };
  if (phone.length !== 12) return { error: "Add their 10-digit WhatsApp number." };
  if (upi && !/^[\w.-]+@[\w.-]+$/.test(upi)) return { error: "That UPI ID doesn't look right, e.g. name@okicici." };
  if (!Number.isInteger(commission) || commission < 0 || commission > 10000) return { error: "Commission should be a whole number of rupees." };

  const { error } = await db().from("partners").insert({ name, code, phone, upi_id: upi || null, commission });
  if (error) return { error: error.code === "23505" ? `${code} is already taken. Try another code.` : "Saving failed. Please try again." };
  refresh();
  return { ok: `${name} added with code ${code}.` };
}

export async function recordPayout(code: string, amount: number, note: string) {
  await requireAdmin();
  if (!Number.isInteger(amount) || amount <= 0) return;
  await db().from("partner_payouts").insert({ partner_code: code, amount, note: note.trim().slice(0, 200) || null });
  refresh();
}

export async function setPartnerActive(code: string, active: boolean) {
  await requireAdmin();
  await db().from("partners").update({ is_active: active }).eq("code", code);
  refresh();
}
