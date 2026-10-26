"use client";

import { useEffect, useState } from "react";
import type { Invite } from "@/data/invites";
import { InviteRenderer } from "@/invites/InviteRenderer";

export const PREVIEW_READY = "aavjoo:preview-ready";
export const PREVIEW_INVITE = "aavjoo:preview-invite";

/**
 * The full invitation, exactly as guests see it, for the order form's preview popup.
 * Runs in an iframe so the invite gets its own screen; the form sends the couple's details in.
 */
export function FullPreview() {
  const [invite, setInvite] = useState<Invite | null>(null);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.data?.type !== PREVIEW_INVITE) return;
      setInvite(e.data.invite as Invite);
    };
    window.addEventListener("message", onMessage);
    window.parent?.postMessage({ type: PREVIEW_READY }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  if (!invite) return <div className="min-h-svh bg-black" />;
  return <InviteRenderer invite={invite} />;
}
