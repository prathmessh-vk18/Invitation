"use client";

import { useEffect, useState, useTransition } from "react";
import { cancelOrders } from "./actions";

/** The form the orders list's tick boxes belong to (they point at it with form="…"). */
export const BULK_FORM = "bulk-cancel";

const boxes = () => [...document.querySelectorAll<HTMLInputElement>(`input[form="${BULK_FORM}"][name="ids"]`)];

/** Ticks or clears every row on the list. */
export function SelectAll() {
  const [all, setAll] = useState(false);
  useEffect(() => {
    const sync = () => setAll(boxes().length > 0 && boxes().every((b) => b.checked));
    document.addEventListener("change", sync);
    return () => document.removeEventListener("change", sync);
  }, []);
  return (
    <input
      type="checkbox"
      aria-label="Select all orders"
      checked={all}
      onChange={(e) => {
        boxes().forEach((b) => (b.checked = e.target.checked));
        document.dispatchEvent(new Event("change"));
      }}
      className="size-4 accent-ink"
    />
  );
}

/** A bar that appears once any order is ticked, to cancel them together. */
export function BulkCancel() {
  const [ticked, setTicked] = useState<{ n: number; live: number }>({ n: 0, live: 0 });
  const [done, setDone] = useState("");
  const [pending, start] = useTransition();

  useEffect(() => {
    const sync = () => {
      const on = boxes().filter((b) => b.checked);
      setTicked({ n: on.length, live: on.filter((b) => b.dataset.live === "1").length });
    };
    document.addEventListener("change", sync);
    return () => document.removeEventListener("change", sync);
  }, []);

  function submit(form: FormData) {
    const warn = ticked.live ? `\n\n${ticked.live} of them ${ticked.live === 1 ? "is" : "are"} live: ${ticked.live === 1 ? "its invite link stops" : "their invite links stop"} working straight away.` : "";
    if (!window.confirm(`Cancel ${ticked.n} order${ticked.n === 1 ? "" : "s"}? This can't be undone.${warn}`)) return;
    start(async () => {
      const { cancelled } = await cancelOrders(form);
      boxes().forEach((b) => (b.checked = false));
      document.dispatchEvent(new Event("change"));
      setDone(`${cancelled} order${cancelled === 1 ? "" : "s"} cancelled.`);
    });
  }

  return (
    <form id={BULK_FORM} action={submit}>
      {done && !ticked.n && <p className="mt-4 text-body font-medium text-[#1d6b35]">✓ {done}</p>}
      {ticked.n > 0 && (
        <div className="fixed inset-x-0 bottom-5 z-50 mx-auto flex w-fit items-center gap-4 rounded-full bg-ink py-2 pr-2 pl-5 text-[15px] text-white shadow-[0_16px_40px_-12px_rgb(0_0_0/.5)]">
          <span className="tabular-nums">
            {ticked.n} selected{ticked.live ? ` · ${ticked.live} live` : ""}
          </span>
          <button
            type="button"
            onClick={() => {
              boxes().forEach((b) => (b.checked = false));
              document.dispatchEvent(new Event("change"));
            }}
            className="text-white/70 hover:text-white"
          >
            Clear
          </button>
          <button type="submit" disabled={pending} className="rounded-full bg-[#d64545] px-4 py-2 font-medium disabled:opacity-60">
            {pending ? "Cancelling…" : "Cancel orders"}
          </button>
        </div>
      )}
    </form>
  );
}
