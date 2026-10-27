import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import type { ChangeRequest } from "@/lib/change-requests";
import type { Order } from "@/lib/orders";
import { db } from "@/lib/supabase";
import { AdminForm } from "../../../AdminForm";

export const instant = false;

export default async function AdminEditChange({ params }: PageProps<"/admin/changes/[id]/edit">) {
  await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const { data: req } = await db().from("change_requests").select("*").eq("id", id).maybeSingle();
  if (!req || req.status !== "pending") notFound();
  const { data: order } = await db().from("orders").select("*").eq("id", req.order_id).maybeSingle();
  if (!order) notFound();
  return <AdminForm order={order as Order} request={req as ChangeRequest} back={`/admin/changes/${id}`} title="Edit, then approve" />;
}
