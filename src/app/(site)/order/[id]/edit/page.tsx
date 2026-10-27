import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getTemplate } from "@/data/templates";
import { changeSummary } from "@/lib/change-requests";
import type { Order } from "@/lib/orders";
import { db } from "@/lib/supabase";
import { Container, Eyebrow, Heading, Lead } from "@/ui";
import { OrderForm } from "@/app/(site)/start/[template]/OrderForm";

export const metadata: Metadata = { title: "Change your invite", robots: { index: false } };
export const instant = false;

async function EditView({ params }: { params: PageProps<"/order/[id]/edit">["params"] }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const { data } = await db().from("orders").select("*").eq("id", id).maybeSingle();
  const order = data as Order | null;
  if (!order || order.status === "cancelled") notFound();
  const t = getTemplate(order.template)!;
  const prepaid = order.status === "awaiting_payment" || order.status === "payment_submitted";

  // A request still waiting is what they edit: sending again replaces it.
  const c = prepaid ? null : await changeSummary(order.id);
  const waiting = c?.latest?.status === "pending" ? c.latest : null;
  const source = waiting ? { details: waiting.details, songPath: waiting.song_path, photoPaths: waiting.photo_paths } : { details: order.details, songPath: order.song_path, photoPaths: order.photo_paths ?? [] };

  return (
    <>
      <Eyebrow>
        <Link href={`/order/${order.id}`} className="hover:text-ink">
          ← Back to order {order.code}
        </Link>
      </Eyebrow>
      <Heading as="h2" className="mt-4">
        {prepaid ? "Edit your details." : waiting ? "Edit your change request." : "Ask for changes."}
      </Heading>
      <Lead className="mt-3 max-w-[640px]">
        {prepaid
          ? "Change anything below. Your invite isn't published yet, so it saves straight away."
          : `Change anything below, then send it to us on the last step. We check every change before it goes live.${c ? ` You've used ${c.used} of ${c.free} free change rounds.` : ""}`}
      </Lead>
      <div className="mt-10">
        <OrderForm
          t={t}
          mode={{ kind: "change", orderId: order.id, prepaid }}
          start={{ ...source, customer: { name: order.customer_name, phone: order.customer_phone, email: order.customer_email ?? "" } }}
        />
      </div>
    </>
  );
}

export default function EditOrderPage({ params }: PageProps<"/order/[id]/edit">) {
  return (
    <section className="pt-10 pb-24">
      <Container wide>
        <Suspense fallback={<div className="h-[60vh] rounded-card bg-panel" />}>
          <EditView params={params} />
        </Suspense>
      </Container>
    </section>
  );
}
