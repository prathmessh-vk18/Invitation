"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatINR, site } from "@/config/site";
import { confirmEditPack, startEditPack } from "@/lib/order-actions";
import { loadCheckout, type RazorpayResponse } from "./checkout";

/**
 * Buys a pack of edits through Razorpay once a couple has used theirs. `onPaid` runs after the
 * payment is verified and the edits added: the change form uses it to send the waiting change.
 */
export function EditPackButton({ orderId, onPaid, className = "" }: { orderId: string; onPaid: () => void; className?: string }) {
  const [state, setState] = useState<"idle" | "opening" | "verifying" | "done">("idle");
  const [error, setError] = useState("");
  const { price, edits } = site.editPack;

  async function buy() {
    setError("");
    setState("opening");
    const [ready, start] = await Promise.all([loadCheckout(), startEditPack(orderId)]);
    if ("error" in start) {
      setState("idle");
      return setError(start.error);
    }
    if (!ready || !window.Razorpay) {
      setState("idle");
      return setError("The payment window didn't load. Check your connection and try again.");
    }
    const rzp = new window.Razorpay({
      key: start.keyId,
      order_id: start.razorpayOrderId,
      amount: start.amount * 100,
      currency: "INR",
      name: "Aavjoo",
      description: start.label,
      prefill: { name: start.name, contact: `+${start.phone}`, email: start.email || undefined },
      notes: { order: start.code, kind: "edit_pack" },
      theme: { color: "#141414" },
      handler: async (r: RazorpayResponse) => {
        setState("verifying");
        const res = await confirmEditPack(orderId, r);
        if ("error" in res) {
          setState("idle");
          return setError(res.error);
        }
        setState("done");
        onPaid();
      },
      modal: { ondismiss: () => setState("idle") },
    });
    rzp.on("payment.failed", (r) => setError(r.error?.description ? `Payment failed: ${r.error.description}. You can try again.` : "Payment failed. You can try again."));
    rzp.open();
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={buy}
        disabled={state !== "idle"}
        className="btn-shine inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-[16px] font-medium text-white transition disabled:opacity-60"
      >
        {state === "opening" ? "Opening payment…" : state === "verifying" ? "Confirming payment…" : state === "done" ? "Edits added ✓" : `Pay ${formatINR(price)} for ${edits} more edits`}
      </button>
      {error && (
        <p role="alert" className="mt-3 text-[14px] text-[#b42318]">
          {error}
        </p>
      )}
    </div>
  );
}

/** The pack button on the order page: shows the new count once paid. */
export function EditPackOnPage({ orderId }: { orderId: string }) {
  const router = useRouter();
  return <EditPackButton orderId={orderId} className="mt-4" onPaid={() => router.refresh()} />;
}
