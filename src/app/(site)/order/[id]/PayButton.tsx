"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { formatINR } from "@/config/site";
import { confirmPayment, startPayment } from "@/lib/order-actions";

type RazorpayResponse = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
type RazorpayInstance = { open: () => void; on: (event: string, cb: (r: { error?: { description?: string } }) => void) => void };
declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

const SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

function loadCheckout(): Promise<boolean> {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT}"]`);
    const s = existing ?? document.createElement("script");
    s.addEventListener("load", () => resolve(true));
    s.addEventListener("error", () => resolve(false));
    if (!existing) {
      s.src = SCRIPT;
      s.async = true;
      document.body.appendChild(s);
    }
  });
}

/**
 * Pays an order through Razorpay Checkout (UPI, cards, netbanking, wallets). With `autoOpen`, the
 * checkout opens as soon as the page loads, straight after the order form.
 */
export function PayButton({ orderId, amount, autoOpen }: { orderId: string; amount: number; autoOpen?: boolean }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "opening" | "verifying" | "done">("idle");
  const [error, setError] = useState("");
  const opened = useRef(false);

  async function pay() {
    setError("");
    setState("opening");
    const [ready, start] = await Promise.all([loadCheckout(), startPayment(orderId)]);
    if ("error" in start) {
      setState("idle");
      setError(start.error);
      return;
    }
    if (!ready || !window.Razorpay) {
      setState("idle");
      setError("The payment window didn't load. Check your connection and try again.");
      return;
    }
    const rzp = new window.Razorpay({
      key: start.keyId,
      order_id: start.razorpayOrderId,
      amount: start.amount * 100,
      currency: "INR",
      name: "Aavjoo",
      description: start.label,
      prefill: { name: start.name, contact: `+${start.phone}`, email: start.email || undefined },
      notes: { order: start.code },
      theme: { color: "#141414" },
      handler: async (r: RazorpayResponse) => {
        setState("verifying");
        const res = await confirmPayment(orderId, r);
        if ("error" in res) {
          setState("idle");
          setError(res.error);
          return;
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
    if (!autoOpen || opened.current) return;
    opened.current = true;
    // Strip ?pay=1 so a refresh doesn't reopen the checkout.
    window.history.replaceState(null, "", window.location.pathname);
    const t = window.setTimeout(pay, 0);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpen]);

  return (
    <div>
      <button
        type="button"
        onClick={pay}
        disabled={state !== "idle"}
        className="btn-shine flex w-full items-center justify-center gap-2 rounded-full bg-ink py-4 text-[17px] font-medium text-white transition disabled:opacity-60 sm:w-auto sm:px-10"
      >
        {state === "opening" ? "Opening payment…" : state === "verifying" ? "Confirming payment…" : state === "done" ? "Paid ✓" : `Pay ${formatINR(amount)}`}
      </button>
      <p className="mt-2.5 text-caption text-subtle">UPI, cards, netbanking and wallets · secured by Razorpay</p>
      {error && (
        <p role="alert" className="mt-3 text-[14px] text-[#b42318]">
          {error}
        </p>
      )}
    </div>
  );
}
