"use client";

import { useEffect, useState } from "react";
import type { Invite } from "@/data/invites";
import { PREVIEW_INVITE, PREVIEW_READY, PREVIEW_SCROLL } from "@/invites/editing";
import { InviteRenderer } from "@/invites/InviteRenderer";

export { PREVIEW_INVITE, PREVIEW_READY };

/**
 * The full invitation, exactly as guests see it, for the order form's preview popup and the
 * couple's editor (`?edit=1`: no opening, an edit button on each part).
 * Runs in an iframe so the invite gets its own screen; the parent page sends the couple's details in.
 */
export function FullPreview() {
  const [shown, setShown] = useState<{ invite: Invite; editing: boolean } | null>(null);

  useEffect(() => {
    const editing = new URLSearchParams(window.location.search).get("edit") === "1";
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === PREVIEW_INVITE) setShown({ invite: e.data.invite as Invite, editing });
      if (e.data?.type === PREVIEW_SCROLL) {
        const part = document.querySelector(`[data-edit="${String(e.data.id).replace(/[^\w-]/g, "")}"]`);
        if (!part) return;
        // With `text`, the line that shows it (what the couple is typing), a little below the top;
        // otherwise the top of the part.
        const line = typeof e.data.text === "string" ? findText(part, e.data.text) : null;
        const top = line ? line.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.3 : part.getBoundingClientRect().top + window.scrollY + (Number(e.data.offset) || 0);
        window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      }
    };
    window.addEventListener("message", onMessage);
    // The page that opened us may still be loading when we're ready: say so until the invite comes.
    let got = false;
    const hello = () => !got && window.parent?.postMessage({ type: PREVIEW_READY }, window.location.origin);
    const onInvite = (e: MessageEvent) => e.data?.type === PREVIEW_INVITE && (got = true);
    window.addEventListener("message", onInvite);
    hello();
    const timer = window.setInterval(() => (got ? window.clearInterval(timer) : hello()), 400);
    return () => {
      window.removeEventListener("message", onMessage);
      window.removeEventListener("message", onInvite);
      window.clearInterval(timer);
    };
  }, []);

  if (!shown) return <div className="min-h-svh bg-black" />;
  return <InviteRenderer invite={shown.invite} editing={shown.editing} />;
}

/** The element inside `root` whose own text contains `text` (spaces and case ignored), if any. */
function findText(root: Element, text: string): Element | null {
  const want = text.replace(/\s+/g, " ").trim().toLowerCase().slice(0, 40);
  if (want.length < 2) return null;
  const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let full = "";
  const nodes: { node: Text; at: number }[] = [];
  for (let n = walk.nextNode(); n; n = walk.nextNode()) {
    nodes.push({ node: n as Text, at: full.length });
    full += (n.textContent ?? "").replace(/\s+/g, " ").toLowerCase();
  }
  const i = full.indexOf(want);
  if (i < 0) return null;
  const hit = nodes.filter((x) => x.at <= i).pop();
  return hit?.node.parentElement ?? null;
}
