"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import { db } from "@/lib/supabase";

/** Marks a question answered (or reopens it). */
export async function setLeadStatus(form: FormData) {
  await requireAdmin();
  const id = String(form.get("id") ?? "");
  const status = form.get("status") === "done" ? "done" : "new";
  await db().from("leads").update({ status }).eq("id", id);
  revalidatePath("/admin/leads");
}
