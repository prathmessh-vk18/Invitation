"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { site } from "@/config/site";
import { Button } from "@/ui";
import { approveChange, declineChange } from "../../actions";

type Props = { id: string; status: "pending" | "approved" | "declined"; reply: string | null; code: string; phone: string; inviteUrl: string; undoCount?: number };

export function ChangeActions({ id, status, reply, code, phone, inviteUrl, undoCount = 0 }: Props) {
  // Approving a request that undoes later edits takes a deliberate tick first.
  const [confirmed, setConfirmed] = useState(false);
  const blocked = undoCount > 0 && !confirmed;
  const router = useRouter();
  const [pending, start] = useTransition();
  const [errors, setErrors] = useState<string[]>([]);
  const [declining, setDeclining] = useState(false);
  const [why, setWhy] = useState("");

  const wa = (text: string) => `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  const done = `Hi! Your changes for order ${code} are live 🎉${inviteUrl ? `\n\n${inviteUrl}` : ""}\n\nThank you for choosing ${site.name}.`;
  const no = `Hi! About the changes you sent for order ${code}: we couldn't make them${reply ? ` because ${reply}` : ""}. Happy to talk it through here.`;

  if (status !== "pending")
    return (
      <div className="space-y-3">
        <p className="text-title">{status === "approved" ? "Approved ✓" : "Declined"}</p>
        <p className="text-body text-muted">{status === "approved" ? "The order has the new details, and a live invite is already updated." : reply ? `Reason: ${reply}` : "No reason given."}</p>
        <a href={wa(status === "approved" ? done : no)} target="_blank" rel="noreferrer" className="inline-flex rounded-full bg-whatsapp px-4 py-2.5 text-[15px] font-medium text-white">
          Tell them on WhatsApp
        </a>
      </div>
    );

  return (
    <div className="space-y-4">
      <p className="text-title">Decide</p>
      <p className="text-body text-muted">Approving saves these details to the order. If the invite is live, it updates straight away.</p>
      {undoCount > 0 && (
        <label className="flex items-start gap-2.5 rounded-tile bg-[#fdecec] p-3 text-body text-[#8a1c1c]">
          <input id="approve-anyway" type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-1 size-4 accent-[#8a1c1c]" />
          <span>
            I&rsquo;ve checked the {undoCount} line{undoCount === 1 ? "" : "s"} above. Approve anyway and undo the newer edit{undoCount === 1 ? "" : "s"}.
          </span>
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        <Button
          size="md"
          disabled={pending || blocked}
          onClick={() =>
            start(async () => {
              const res = await approveChange(id);
              if ("errors" in res) return setErrors(res.errors);
              router.refresh();
            })
          }
        >
          {pending ? "Working…" : "Approve ✓"}
        </Button>
        <Link href={`/admin/changes/${id}/edit`} className="rounded-full bg-panel-strong px-4 py-2.5 text-[15px] font-medium hover:bg-line">
          Edit, then approve
        </Link>
        <Button size="md" variant="ghost" disabled={pending} onClick={() => setDeclining((x) => !x)}>
          Decline
        </Button>
      </div>
      {declining && (
        <div className="space-y-2">
          <textarea
            id="decline-reason"
            value={why}
            onChange={(e) => setWhy(e.target.value)}
            rows={3}
            placeholder="Why, in a line the couple will see, e.g. the design can't fit a fifth function"
            className="w-full rounded-field border border-line bg-surface p-3.5 text-[15px] outline-none focus:border-ink"
          />
          <Button size="md" variant="secondary" disabled={pending} onClick={() => start(async () => (await declineChange(id, why), router.refresh()))}>
            Decline request
          </Button>
        </div>
      )}
      {errors.length > 0 && (
        <ul className="list-disc space-y-1 pl-5 text-body text-[#8a1c1c]">
          {errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
