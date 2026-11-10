"use server";

import { db, isSupabaseConfigured } from "@/lib/supabase";
import { overLimit, TOO_MANY } from "@/lib/rate-limit";

/** The chat's choices, so only known values are stored. */
const PLANNER = ["Bride", "Groom", "Family", "Wedding planner"];
const TRADITION = ["Hindu", "South Indian", "Sikh", "Muslim", "Not sure"];
const PRICE = ["Yes", "Need something custom", "Just exploring"];
const NEED = ["Choosing a design", "Customising my invite", "My existing order", "Something else"];

const pick = (v: unknown, list: string[]) => (typeof v === "string" && list.includes(v) ? v : null);
const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export type LeadAnswers = { planner: string; month: string; tradition: string; design?: string; price?: string; need?: string; page?: string };

/** Saves a chat once they pick a design or reach the end. Returns its id, so what they do next can be added. */
export async function saveLead(a: LeadAnswers, outcome?: "order"): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  if (await overLimit("lead", 20, 60)) return null;
  const month = /^\d{4}-\d{2}$|^Later$/.test(String(a.month)) ? a.month : null;
  const { data } = await db()
    .from("leads")
    .insert({
      planner: pick(a.planner, PLANNER),
      wedding_month: month,
      tradition: pick(a.tradition, TRADITION),
      design: /^[a-z]{2,20}$/.test(String(a.design ?? "")) ? a.design : null,
      price_ok: pick(a.price, PRICE),
      need: pick(a.need, NEED),
      page: text(a.page, 120) || null,
      outcome: outcome ?? null,
    })
    .select("id")
    .single();
  return (data?.id as string | undefined) ?? null;
}

/** Notes what a visitor did at the end of the chat. */
export async function setLeadOutcome(id: string, outcome: "order" | "whatsapp") {
  if (!isSupabaseConfigured() || !/^[0-9a-f-]{36}$/.test(id)) return;
  await db().from("leads").update({ outcome }).eq("id", id).is("outcome", null);
}

/** A question for us, with how they'd like a reply. Attaches to their chat when there is one. */
export async function submitTicket(id: string | null, question: string, contact: string): Promise<{ ok: true } | { error: string; failed?: true }> {
  const q = text(question, 1000);
  const c = text(contact, 120);
  if (q.length < 5) return { error: "Please write your question." };
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c);
  const phone = c.replace(/\D/g, "").length >= 10;
  if (!email && !phone) return { error: "Add an email or phone number so we can reply." };
  if (!isSupabaseConfigured()) return { error: "We couldn't send that. Please try again.", failed: true };
  if (await overLimit("ticket", 6, 60)) return { error: TOO_MANY };
  const row = { question: q, contact: c, status: "new" };
  const { error } = id && /^[0-9a-f-]{36}$/.test(id) ? await db().from("leads").update(row).eq("id", id) : await db().from("leads").insert(row);
  return error ? { error: "We couldn't send that. Please try again.", failed: true } : { ok: true };
}
