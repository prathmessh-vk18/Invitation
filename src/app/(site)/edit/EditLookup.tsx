"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { findMyOrder } from "@/lib/find-order";
import { openChat } from "@/site/chat";
import { buttonClass } from "@/ui";

const input = "mt-1.5 w-full rounded-field border border-line bg-surface px-3.5 py-2.5 text-[16px] text-ink outline-none transition placeholder:text-faint focus:border-ink focus:shadow-[0_0_0_3px_rgb(0_0_0/.06)]";

export function EditLookup() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setError("");
    setBusy(true);
    const res = await findMyOrder(String(f.get("link") ?? ""), String(f.get("code") ?? ""), String(f.get("phone") ?? ""));
    if ("error" in res) {
      setBusy(false);
      return setError(res.error);
    }
    router.push(`/order/${res.id}/edit`);
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <label className="block text-[15px] font-medium">
        Your invite link
        <input name="link" required placeholder="aavjoo.in/i/rahul-weds-shalini" autoComplete="off" autoCapitalize="none" className={input} />
      </label>
      <label className="block text-[15px] font-medium">
        Order number
        <input name="code" required placeholder="AAV-1203" autoComplete="off" autoCapitalize="characters" className={input} />
        <span className="mt-1 block text-[13px] font-normal text-subtle">It&rsquo;s on your order page and in our WhatsApp messages.</span>
      </label>
      <label className="block text-[15px] font-medium">
        Phone number you ordered with
        <input name="phone" required type="tel" inputMode="tel" placeholder="98765 43210" autoComplete="tel" className={input} />
      </label>
      {error && (
        <p role="alert" className="text-[14px] text-[#b42318]">
          {error}
        </p>
      )}
      <button type="submit" disabled={busy} className={buttonClass("primary", "lg", "w-full disabled:opacity-60")}>
        {busy ? "Finding your order…" : "Edit my order"}
      </button>
      <p className="text-center text-[14px] text-muted">
        Can&rsquo;t find these?{" "}
        <button type="button" onClick={openChat} className="font-medium text-ink underline underline-offset-4">
          Raise a support ticket
        </button>
      </p>
    </form>
  );
}
