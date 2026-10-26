"use client";

import { useActionState, useState, useTransition } from "react";
import { partners } from "@/config/partners";
import { formatINR, site } from "@/config/site";
import { Button } from "@/ui";
import { createPartner, recordPayout, setPartnerActive } from "./actions";

const field = "w-full rounded-field border border-line bg-surface px-3.5 py-2.5 text-[15px] outline-none focus:border-ink";

export function AddPartner() {
  const [state, action, pending] = useActionState(createPartner, null);
  return (
    <form action={action} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <input id="partner-name" name="name" required placeholder="Name" className={field} />
        <input id="partner-code" name="code" required placeholder="Code, e.g. PRIYA" className={`${field} uppercase`} maxLength={20} />
        <input id="partner-phone" name="phone" required type="tel" placeholder="WhatsApp, 98765 43210" className={field} />
        <input id="partner-upi" name="upi" placeholder="UPI ID for GPay" className={field} />
        <input id="partner-commission" name="commission" type="number" min={0} defaultValue={partners.commission} aria-label="Commission per sale (₹)" className={field} />
      </div>
      {state?.error && <p className="text-body text-[#8a1c1c]">{state.error}</p>}
      {state?.ok && <p className="text-body text-[#1d6b35]">{state.ok}</p>}
      <Button type="submit" size="md" disabled={pending}>
        {pending ? "Adding…" : "Add partner"}
      </Button>
    </form>
  );
}

type Props = { code: string; name: string; phone: string; upi: string | null; token: string; active: boolean; due: number; siteUrl: string };

export function PartnerActions({ code, name, phone, upi, token, active, due, siteUrl }: Props) {
  const [pending, start] = useTransition();
  const [copied, setCopied] = useState("");
  const shareLink = `${siteUrl}/r/${code}`;
  const pageLink = `${siteUrl}/p/${token}`;
  const welcome = `Hi ${name}! Welcome to the ${site.name} partner programme 🌸\n\nShare this link with couples: ${shareLink}\nYour code is ${code}. You earn on every paid order that comes through it.\n\nSee your sales and earnings any time here (keep this one private): ${pageLink}`;
  const upiPay = upi ? `upi://pay?pa=${upi}&pn=${encodeURIComponent(name)}&am=${due.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`${site.name} commission ${code}`)}` : null;

  const copy = (what: string, text: string) => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(what);
      window.setTimeout(() => setCopied(""), 1500);
    });
  };

  const markPaid = () => {
    if (!window.confirm(`Record ${formatINR(due)} paid to ${name}? Do this after the GPay payment has gone through.`)) return;
    start(() => recordPayout(code, due, "GPay"));
  };

  const link = "rounded-full bg-panel px-3 py-1.5 text-[13px] font-medium hover:bg-panel-strong whitespace-nowrap";
  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      <button type="button" className={link} onClick={() => copy("share", shareLink)}>
        {copied === "share" ? "Copied ✓" : "Copy share link"}
      </button>
      <a className={link} href={pageLink} target="_blank" rel="noreferrer">
        Their page ↗
      </a>
      <a className={link} href={`https://wa.me/${phone}?text=${encodeURIComponent(welcome)}`} target="_blank" rel="noreferrer">
        Send links on WhatsApp
      </a>
      {due > 0 && upiPay && (
        <a className={link} href={upiPay}>
          Pay {formatINR(due)} on UPI
        </a>
      )}
      {due > 0 && (
        <button type="button" disabled={pending} className={`${link} bg-ink text-white hover:bg-ink/85`} onClick={markPaid}>
          Mark {formatINR(due)} paid
        </button>
      )}
      <button type="button" disabled={pending} className={`${link} text-muted`} onClick={() => start(() => setPartnerActive(code, !active))}>
        {active ? "Pause" : "Resume"}
      </button>
    </div>
  );
}
