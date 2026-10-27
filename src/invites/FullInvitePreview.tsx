"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { PREVIEW_INVITE, PREVIEW_READY } from "@/app/preview/FullPreview";
import type { Invite } from "@/data/invites";

/**
 * The whole invitation, exactly as guests see it, in a phone-sized popup (full screen on phones).
 * It runs the real invite page in an iframe and hands it `invite` once that page has loaded.
 */
export function FullInvitePreview({ invite, open, onClose }: { invite: Invite; open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!open) return;
    const onMessage = (e: MessageEvent) => {
      const frame = ref.current?.contentWindow;
      if (!frame || e.source !== frame || e.data?.type !== PREVIEW_READY) return;
      frame.postMessage({ type: PREVIEW_INVITE, invite }, window.location.origin);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("message", onMessage);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("message", onMessage);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, invite, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Your full invite"
        >
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative h-full w-full sm:h-[min(860px,92svh)] sm:w-[400px]" onClick={(e) => e.stopPropagation()}>
            <iframe ref={ref} src="/preview" title="Your full invite" className="h-full w-full bg-black sm:rounded-[32px] sm:shadow-phone" allow="autoplay" />
            <button
              type="button"
              onClick={onClose}
              className="absolute top-3 right-3 z-10 rounded-full bg-white px-4 py-2 text-[14px] font-medium text-ink shadow-lg sm:-top-2 sm:-right-24"
            >
              Close ✕
            </button>
          </motion.div>
          <p className="pointer-events-none absolute bottom-4 left-1/2 hidden -translate-x-1/2 text-caption text-white/70 sm:block">This is exactly what guests will see. Press Esc to close.</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
