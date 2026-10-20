"use client";

import { useState, useTransition } from "react";
import { site } from "@/config/site";
import { Button } from "@/ui";
import type { OrderStatus } from "@/lib/orders";
import { cancelOrder, publishInvite, saveDetails, saveNotes, setInvitePublished, setPaymentVerified } from "../../actions";

type Props = {
  id: string;
  code: string;
  status: OrderStatus;
  utr: string | null;
  slug: string | null;
  suggestedSlug: string;
  published: boolean | null;
  customerPhone: string;
  coupleNames: string;
  detailsJson: string;
  notes: string;
  siteUrl: string;
};

export function PaymentActions({ id, status, amount, code, customerPhone }: Pick<Props, "id" | "status" | "code" | "customerPhone"> & { amount: string }) {
  const [pending, start] = useTransition();
  const ask = `Hi! Thank you for your order ${code} with ${site.name} 🌸\n\nThe total is ${amount}. I'm sending the payment QR code here. Once you've paid, please share the screenshot and we'll publish your invite.`;
  if (status === "live" || status === "cancelled") return <p className="text-body text-muted">{status === "live" ? "Paid." : "Cancelled."}</p>;
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {status !== "paid" && (
          <a href={`https://wa.me/${customerPhone}?text=${encodeURIComponent(ask)}`} target="_blank" rel="noreferrer" className="rounded-full bg-whatsapp px-4 py-2.5 text-[15px] font-medium text-white">
            Message for payment
          </a>
        )}
        {status !== "paid" ? (
          <Button size="md" disabled={pending} onClick={() => start(() => setPaymentVerified(id, true))}>
            Mark as paid ✓
          </Button>
        ) : (
          <Button size="md" variant="secondary" disabled={pending} onClick={() => start(() => setPaymentVerified(id, false))}>
            Undo paid
          </Button>
        )}
      </div>
      <p className="text-caption text-subtle">Send your QR code in the chat, check the payment in your bank app, then mark it paid.</p>
    </div>
  );
}

export function PublishActions(p: Props) {
  const [slug, setSlug] = useState(p.slug ?? p.suggestedSlug);
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();
  const live = p.status === "live" && p.slug;
  const url = `${p.siteUrl}/i/${p.slug ?? slug}`;
  const sendText = `Hi! Your wedding invitation for ${p.coupleNames} is ready 🎉\n\n${url}\n\nShare this link with your guests on WhatsApp. It stays live until ${site.inviteDaysAfterWedding} days after the wedding.`;

  const publish = () =>
    start(async () => {
      setMsg("");
      const res = await publishInvite(p.id, slug);
      setMsg("error" in res ? res.error : live ? "Invite updated with the latest details." : "Invite is live.");
    });

  if (p.status === "awaiting_payment" || p.status === "payment_submitted")
    return <p className="text-body text-muted">Mark the order as paid first. Then you can create the invite here.</p>;
  if (p.status === "cancelled") return <p className="text-body text-muted">This order is cancelled.</p>;

  return (
    <div className="space-y-4">
      {!live && (
        <label className="block">
          <span className="text-[14px] font-semibold">Invite address</span>
          <div className="mt-1.5 flex items-center rounded-field border border-line bg-surface focus-within:border-ink">
            <span className="pl-3.5 text-[15px] text-subtle">/i/</span>
            <input id="slug" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase())} className="min-w-0 flex-1 bg-transparent px-1 py-2.5 text-[15px] outline-none" />
          </div>
        </label>
      )}
      {live && <p className="break-all text-lead font-medium">{url}</p>}
      <div className="flex flex-wrap gap-2">
        <Button size="md" disabled={pending} onClick={publish}>
          {pending ? "Working…" : live ? "Update invite from details" : "Create invite"}
        </Button>
        {live && (
          <>
            <a href={`/i/${p.slug}`} target="_blank" rel="noreferrer" className="rounded-full bg-panel px-4 py-2.5 text-[15px] font-medium hover:bg-panel-strong">
              Open ↗
            </a>
            <a
              href={`https://wa.me/${p.customerPhone}?text=${encodeURIComponent(sendText)}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-whatsapp px-4 py-2.5 text-[15px] font-medium text-white"
            >
              Send link on WhatsApp
            </a>
            <Button size="md" variant="ghost" disabled={pending} onClick={() => start(() => setInvitePublished(p.id, p.slug!, !p.published))}>
              {p.published ? "Take offline" : "Put back online"}
            </Button>
          </>
        )}
      </div>
      {msg && <p className="text-body text-muted">{msg}</p>}
    </div>
  );
}

export function DetailsEditor({ id, detailsJson }: Pick<Props, "id" | "detailsJson">) {
  const [json, setJson] = useState(detailsJson);
  const [msg, setMsg] = useState<string[]>([]);
  const [pending, start] = useTransition();
  return (
    <div className="space-y-3">
      <textarea
        id="details-json"
        value={json}
        onChange={(e) => setJson(e.target.value)}
        spellCheck={false}
        rows={18}
        className="w-full rounded-field border border-line bg-surface p-4 font-mono text-[12.5px] leading-relaxed outline-none focus:border-ink"
      />
      <div className="flex items-center gap-3">
        <Button
          size="md"
          variant="secondary"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const res = await saveDetails(id, json);
              setMsg("errors" in res ? res.errors : ["Saved. If the invite is live, press “Update invite from details”."]);
            })
          }
        >
          Save details
        </Button>
        <button type="button" onClick={() => setJson(detailsJson)} className="text-caption text-subtle underline underline-offset-4">
          Reset
        </button>
      </div>
      {msg.length > 0 && (
        <ul className="list-disc space-y-1 pl-5 text-body text-muted">
          {msg.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function NotesAndCancel({ id, notes, status }: Pick<Props, "id" | "notes" | "status">) {
  const [text, setText] = useState(notes);
  const [pending, start] = useTransition();
  const [confirm, setConfirm] = useState(false);
  return (
    <div className="space-y-3">
      <textarea
        id="admin-notes"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder="Private notes, e.g. asked for Hindi wording on the Haldi card"
        className="w-full rounded-field border border-line bg-surface p-3.5 text-[15px] outline-none focus:border-ink"
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button size="md" variant="secondary" disabled={pending} onClick={() => start(() => saveNotes(id, text))}>
          Save notes
        </Button>
        {status !== "cancelled" && status !== "live" && (
          <>
            {!confirm ? (
              <Button size="md" variant="ghost" onClick={() => setConfirm(true)}>
                Cancel order
              </Button>
            ) : (
              <>
                <span className="text-body text-muted">Cancel this order?</span>
                <Button size="md" variant="ghost" className="text-[#8a1c1c]" disabled={pending} onClick={() => start(() => cancelOrder(id))}>
                  Yes, cancel
                </Button>
                <Button size="md" variant="ghost" onClick={() => setConfirm(false)}>
                  Keep it
                </Button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
