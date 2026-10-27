import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import type { Order } from "@/lib/orders";
import { db } from "@/lib/supabase";
import { AdminForm } from "../../../AdminForm";

export const instant = false;

export default async function AdminEditOrder({ params }: PageProps<"/admin/orders/[id]/edit">) {
  await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const { data } = await db().from("orders").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  return <AdminForm order={data as Order} back={`/admin/orders/${id}`} title="Edit details" />;
}
