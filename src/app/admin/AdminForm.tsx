import Link from "next/link";
import { getTemplate } from "@/data/templates";
import type { Order } from "@/lib/orders";
import type { ChangeRequest } from "@/lib/change-requests";
import { OrderForm } from "@/app/(site)/start/[template]/OrderForm";
import { AdminHeader } from "./AdminHeader";

/** The couple's own order form, for an admin: editing an order, or a change request before approving it. */
export function AdminForm({ order, request, back, title }: { order: Order; request?: ChangeRequest; back: string; title: string }) {
  const t = getTemplate(order.template)!;
  const source = request ? { details: request.details, songPath: request.song_path, photoPaths: request.photo_paths } : { details: order.details, songPath: order.song_path, photoPaths: order.photo_paths ?? [] };
  return (
    <>
      <AdminHeader />
      <main className="mx-auto max-w-wide px-5 py-10">
        <Link href={back} className="text-caption text-subtle hover:text-ink">
          ← Back
        </Link>
        <h1 className="mt-3 text-heading">{title}</h1>
        <p className="mt-2 text-lead text-muted">
          {order.code} · {order.details.groom.first} &amp; {order.details.bride.first} · {t.name}. Jump to any step, change what you need, and save on the last step.
        </p>
        <div className="mt-8">
          <OrderForm
            t={t}
            mode={{ kind: "admin", orderId: order.id, requestId: request?.id, back }}
            start={{ ...source, customer: { name: order.customer_name, phone: order.customer_phone, email: order.customer_email ?? "" } }}
          />
        </div>
      </main>
    </>
  );
}
