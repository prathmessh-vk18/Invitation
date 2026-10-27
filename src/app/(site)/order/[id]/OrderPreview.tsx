"use client";

import { useCallback, useState } from "react";
import type { Invite } from "@/data/invites";
import { FullInvitePreview } from "@/invites/FullInvitePreview";
import { InvitePreview } from "@/invites/InvitePreview";
import { PhoneFrame } from "@/ui";

/** The couple's own invite on their order page: a phone that plays the opening, and the full invite on demand. */
export function OrderPreview({ invite, tint }: { invite: Invite; tint: string }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  return (
    <div className="rounded-frame p-6" style={{ background: tint }}>
      <div className="mx-auto w-[200px]">
        <PhoneFrame className="shadow-phone">
          <InvitePreview invite={invite} />
        </PhoneFrame>
      </div>
      <button type="button" onClick={() => setOpen(true)} className="mx-auto mt-4 flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-[14px] font-medium text-white transition hover:bg-ink/85">
        Preview your full invite
        <svg viewBox="0 0 20 20" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
          <path d="M7 4h9v9M16 4 5 15" />
        </svg>
      </button>
      <FullInvitePreview invite={invite} open={open} onClose={close} />
    </div>
  );
}
