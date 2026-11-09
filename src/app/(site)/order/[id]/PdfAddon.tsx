"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { formatINR, site } from "@/config/site";
import { confirmAddon, startAddon } from "@/lib/order-actions";
import { loadCheckout, type RazorpayResponse } from "./checkout";

/**
 * The printable PDF on the order page: a download once bought, otherwise a ₹99 Razorpay purchase.
 * With `autoOpen` (the ?pdf=1 link in our emails) the checkout opens straight away.
 */
export function PdfAddon({ orderId, owned, autoOpen }: { orderId: string; owned: boolean; autoOpen?: boolean }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "opening" | "verifying" | "done">("idle");
  const [error, setError] = useState("");
  const opened = useRef(false);
  const price = formatINR(site.pdfAddon.price);

  async function buy() {
    setError("");
    setState("opening");
    const [ready, start] = await Promise.all([loadCheckout(), startAddon(orderId, "pdf")]);
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
      notes: { order: start.code, kind: "addon_pdf" },
      theme: { color: "#141414" },
      handler: async (r: RazorpayResponse) => {
        setState("verifying");
        const res = await confirmAddon(orderId, r);
        if ("error" in res) {
          setState("idle");
          return setError(res.error);
        }
        setState("done");
        router.refresh();
      },
      modal: { ondismiss: () => setState("idle") },
    });
    rzp.on("payment.failed", (r) => setError(r.error?.description ? `Payment failed: ${r.error.description}. You can try again.` : "Payment failed. You can try again."));
    rzp.open();
  }

  useEffect(() => {
    if (!autoOpen || owned || opened.current) return;
    opened.current = true;
    window.history.replaceState(null, "", window.location.pathname);
    const t = window.setTimeout(buy, 0);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpen, owned]);

  if (owned || state === "done")
    return (
      <div className="mt-4">
        <a href={`/order/${orderId}/pdf`} className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-[16px] font-medium text-white">
          Download your PDF
        </a>
        <p className="mt-2 text-caption text-subtle">It always matches your latest invite: download it again after any edit. The first download takes a few seconds.</p>
      </div>
    );
  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={buy}
        disabled={state !== "idle"}
        className="btn-shine inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-[16px] font-medium text-white transition disabled:opacity-60"
      >
        {state === "opening" ? "Opening payment…" : state === "verifying" ? "Confirming payment…" : `Get the PDF · ${price}`}
      </button>
      {error && (
        <p role="alert" className="mt-3 text-[14px] text-[#b42318]">
          {error}
        </p>
      )}
    </div>
  );
}
