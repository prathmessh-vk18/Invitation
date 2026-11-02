"use client";

import type { ReactNode } from "react";
import { openTicket } from "@/site/chat";

/** Opens a support ticket about this order, with the order code (and their number, when given) filled in. */
export function AskAboutOrder({ code, phone, className, children }: { code: string; phone?: string; className?: string; children: ReactNode }) {
  return (
    <button type="button" onClick={() => openTicket(`Order ${code}: `, phone ? `+${phone}` : "")} className={className}>
      {children}
    </button>
  );
}
