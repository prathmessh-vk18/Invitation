"use client";

import { useEffect, useState } from "react";
import type { Invite } from "@/data/invites";
import { EDIT_SECTION, PREVIEW_INVITE, PREVIEW_READY, PREVIEW_SCROLL, PREVIEW_SELECT } from "@/invites/editing";
import { InviteRenderer } from "@/invites/InviteRenderer";

export { PREVIEW_INVITE, PREVIEW_READY };

/**
 * The full invitation, exactly as guests see it, for the order form's preview popup and the
 * couple's editor (`?edit=1`: no opening; every part outlined, and tapping one opens its settings).
 * Runs in an iframe so the invite gets its own screen; the parent page sends the couple's details in.
 */
export function FullPreview() {
  const [shown, setShown] = useState<{ invite: Invite; editing: boolean } | null>(null);

  useEffect(() => {
    const editing = new URLSearchParams(window.location.search).get("edit") === "1";
    const select = (id: string | null) => {
      document.querySelectorAll("[data-edit][data-selected]").forEach((el) => el.removeAttribute("data-selected"));
      if (id) document.querySelector(`[data-edit="${id.replace(/[^\w-]/g, "")}"]`)?.setAttribute("data-selected", "");
    };
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === PREVIEW_INVITE) setShown({ invite: e.data.invite as Invite, editing });
      if (e.data?.type === PREVIEW_SELECT) select(e.data.id ?? null);
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

    // Editing: a tap on a part selects it and tells the editor which part and which words were
    // tapped. Links and buttons inside the invite don't act while editing.
    const onTap = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const part = target?.closest<HTMLElement>("[data-edit]");
      if (!part || !target) return;
      e.preventDefault();
      e.stopPropagation();
      const id = part.dataset.edit!;
      select(id);
      const words = (target.innerText || target.textContent || "").replace(/\s+/g, " ").trim();
      window.parent?.postMessage({ type: EDIT_SECTION, id, text: words.length <= 200 ? words : "" }, window.location.origin);
      // The settings panel covers the lower half: bring what was tapped above it.
      const r = target.getBoundingClientRect();
      if (r.top > window.innerHeight * 0.38) window.scrollBy({ top: r.top - window.innerHeight * 0.2, behavior: "smooth" });
    };
    if (editing) document.addEventListener("click", onTap, true);

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
      document.removeEventListener("click", onTap, true);
      window.clearInterval(timer);
    };
  }, []);

  if (!shown) return <div className="min-h-svh bg-black" />;
  return (
    <>
      {shown.editing && <style>{EDIT_STYLE}</style>}
      <InviteRenderer invite={shown.invite} editing={shown.editing} />
    </>
  );
}

// Every part outlined faintly so it reads as something to tap; the tapped one outlined strongly,
// with its name on a tag.
const EDIT_STYLE = `
[data-edit] { position: relative; cursor: pointer; -webkit-tap-highlight-color: transparent; }
[data-edit]::after { content: ""; position: absolute; inset: 8px; border: 1.5px dashed rgba(124, 58, 237, .45); border-radius: 16px; pointer-events: none; z-index: 44; transition: border-color .2s, box-shadow .2s; }
[data-edit][data-selected]::after { border: 2.5px solid #7c3aed; box-shadow: 0 0 0 5px rgba(124, 58, 237, .18); }
[data-edit][data-selected]::before { content: attr(data-label); position: absolute; top: 18px; left: 18px; z-index: 46; background: #7c3aed; color: #fff; font: 600 12px/1 system-ui, sans-serif; padding: 7px 10px; border-radius: 999px; letter-spacing: .01em; pointer-events: none; }
@media (hover: hover) { [data-edit]:hover::after { border-color: #7c3aed; } }
`;

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
