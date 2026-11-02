"use client";

import Link from "next/link";
import { useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";

/**
 * Orders placed or opened on this phone, so a couple can get back to their order page without
 * the link (the header, the home page and /edit offer it). Kept in this browser only.
 */
type SavedOrder = { id: string; code: string; names: string };

const KEY = "aavjoo:orders";
const CHANGED = "aavjoo:orders";

const raw = () => {
  try {
    return window.localStorage.getItem(KEY) ?? "[]";
  } catch {
    return "[]";
  }
};

const parse = (s: string): SavedOrder[] => {
  try {
    const v: unknown = JSON.parse(s);
    return Array.isArray(v) ? v.filter((o) => typeof o?.id === "string" && typeof o?.code === "string" && typeof o?.names === "string") : [];
  } catch {
    return [];
  }
};

const subscribe = (cb: () => void) => {
  window.addEventListener(CHANGED, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(CHANGED, cb);
    window.removeEventListener("storage", cb);
  };
};

/** The orders saved on this phone, newest first. Empty on the server and on first paint. */
export function useSavedOrders() {
  const s = useSyncExternalStore(subscribe, raw, () => "[]");
  return useMemo(() => parse(s), [s]);
}

/** Notes this order on the phone, or forgets it once cancelled. Renders nothing. */
export function RememberOrder({ id, code, names, cancelled }: SavedOrder & { cancelled: boolean }) {
  useEffect(() => {
    const rest = parse(raw()).filter((o) => o.id !== id);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(cancelled ? rest : [{ id, code, names }, ...rest].slice(0, 5)));
      window.dispatchEvent(new Event(CHANGED));
    } catch {
      // Private mode or storage blocked: the page still works, it just isn't remembered.
    }
  }, [id, code, names, cancelled]);
  return null;
}

/** A link to the latest order saved on this phone, or `children` when there is none. */
export function MyOrderLink({ className, onClick, children }: { className?: string; onClick?: () => void; children: ReactNode }) {
  const [latest] = useSavedOrders();
  if (!latest) return children;
  return (
    <Link href={`/order/${latest.id}`} onClick={onClick} className={className}>
      Your order {latest.code}
    </Link>
  );
}

/** Every order saved on this phone, for /edit. Nothing when there are none. */
export function SavedOrders({ className }: { className?: string }) {
  const orders = useSavedOrders();
  if (!orders.length) return null;
  return (
    <div className={className}>
      <p className="text-[15px] font-medium">On this phone</p>
      <ul className="mt-2 grid gap-2">
        {orders.map((o) => (
          <li key={o.id}>
            <Link href={`/order/${o.id}`} className="flex items-center justify-between gap-3 rounded-tile border border-line bg-surface px-4 py-3 transition hover:border-ink">
              <span className="min-w-0 truncate text-body">
                <span className="font-semibold">{o.code}</span> · {o.names}
              </span>
              <span className="shrink-0 text-[15px] font-medium">Open →</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
