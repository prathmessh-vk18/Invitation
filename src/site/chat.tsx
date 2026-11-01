"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { formatINR, site, whatsappLink } from "@/config/site";
import { templates, type CategoryId } from "@/data/templates";
import { WaIcon } from "@/invites/shared";
import { saveLead, setLeadOutcome, submitTicket } from "@/lib/lead-actions";

/**
 * "Let's talk": a short scripted chat in place of a bare WhatsApp link. Five quick questions
 * qualify the enquiry, then the visitor can start their invite straight away or message us on
 * WhatsApp with their answers already written. Anything else goes in as a question (a ticket).
 * Every finished chat is saved for the Leads page in admin.
 */

const OPEN_EVENT = "aavjoo:chat";

/** Opens the chat from anywhere on the site. */
export const openChat = () => window.dispatchEvent(new Event(OPEN_EVENT));

/** A button that opens the chat, for the header, footer and pages. */
export function OpenChat({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <button type="button" onClick={openChat} className={className}>
      {children}
    </button>
  );
}

const prices = templates.map((t) => t.price);
const priceRange = `${formatINR(Math.min(...prices))}–${formatINR(Math.max(...prices))}`;

const TRADITIONS: { label: string; id?: CategoryId }[] = [
  { label: "Hindu", id: "hindu" },
  { label: "South Indian", id: "south-indian" },
  { label: "Sikh", id: "sikh" },
  { label: "Muslim", id: "muslim" },
  { label: "Not sure" },
];

const FAQS: { q: string; a: string }[] = [
  { q: "How does it work?", a: "Pick a design, fill in your names, functions and song with a live preview, and pay online. Your invite link goes live within minutes, ready to share on WhatsApp." },
  { q: "What's included?", a: `Everything, for ${priceRange}: every function with Google Maps directions, a countdown, RSVP on WhatsApp, your song, photos and 2 rounds of changes.` },
  { q: "How fast is it?", a: "Usually within minutes of payment. You get the link on WhatsApp." },
  { q: "How do I pay?", a: "Securely online by UPI, card or netbanking, right after you fill in your details." },
];

type Answers = { planner: string; month: string; tradition: string; design?: string; price: string; need: string };
type Step = "planner" | "month" | "tradition" | "design" | "price" | "need" | "done" | "ticket" | "sent";

const monthOptions = () => {
  const out: { v: string; l: string }[] = [];
  const d = new Date();
  d.setDate(1);
  for (let i = 0; i < 14; i++) {
    out.push({ v: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, l: d.toLocaleString("en-IN", { month: "short", year: "numeric" }) });
    d.setMonth(d.getMonth() + 1);
  }
  out.push({ v: "Later", l: "Later" });
  return out;
};

const monthLabel = (v: string) => (v === "Later" ? "later" : new Date(`${v}-01T12:00:00`).toLocaleString("en-IN", { month: "long", year: "numeric" }));

function Bubble({ from, children }: { from: "bot" | "me"; children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[15px] leading-snug ${from === "bot" ? "self-start rounded-bl-md bg-panel text-ink" : "self-end rounded-br-md bg-ink text-white"}`}
    >
      {children}
    </motion.div>
  );
}

function Chips({ options, onPick }: { options: { v: string; l: ReactNode }[]; onPick: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2 pt-1">
      {options.map((o) => (
        <button key={o.v} type="button" onClick={() => onPick(o.v)} className="rounded-full border border-line bg-surface px-3.5 py-2 text-[14px] font-medium text-ink transition hover:border-ink">
          {o.l}
        </button>
      ))}
    </div>
  );
}

/** Only rendered once the chat is open, so the date is the visitor's, never the build's. */
function MonthChips({ onPick }: { onPick: (v: string, label: string) => void }) {
  const [months] = useState(monthOptions);
  return <Chips options={months} onPick={(v) => onPick(v, months.find((m) => m.v === v)!.l)} />;
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("planner");
  const [a, setA] = useState<Partial<Answers>>({});
  const [log, setLog] = useState<{ from: "bot" | "me"; text: ReactNode }[]>([]);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [contact, setContact] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [asked, setAsked] = useState<string[]>([]);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [log, step]);

  const say = (from: "bot" | "me", text: ReactNode) => setLog((l) => [...l, { from, text }]);

  const matching = (tradition: string) => {
    const id = TRADITIONS.find((t) => t.label === tradition)?.id;
    return (id ? templates.filter((t) => t.category === id) : templates).slice(0, 3);
  };

  const answer = (key: keyof Answers, value: string, shown: string, next: Step) => {
    setA((p) => ({ ...p, [key]: value }));
    say("me", shown);
    setStep(next);
  };

  async function finish(need: string) {
    const all = { ...a, need } as Answers;
    setA(all);
    say("me", need);
    setStep("done");
    const id = await saveLead({ ...all, page: window.location.pathname });
    setLeadId(id);
  }

  // Offered while they answer the five questions; each one goes once it's asked.
  const faqsLeft = ["planner", "month", "tradition", "design", "price", "need"].includes(step) ? FAQS.filter((f) => !asked.includes(f.q)) : [];

  const chosen = templates.find((t) => t.id === a.design);
  const waText = [
    `Hi ${site.name}!`,
    [a.planner, a.month && `Wedding ${monthLabel(a.month)}`, a.tradition, chosen && `Liked ${chosen.name}`, a.price === "Yes" ? `${priceRange} works` : a.price].filter(Boolean).join(" · "),
    a.need && `I need help with: ${a.need.toLowerCase()}.`,
  ]
    .filter(Boolean)
    .join("\n");
  const startHref = chosen ? `/start/${chosen.id}` : "/designs";

  async function sendTicket() {
    setError("");
    setSending(true);
    const res = await submitTicket(leadId, question, contact);
    setSending(false);
    if ("error" in res) return setError(res.error);
    say("me", question);
    setStep("sent");
  }

  const prompt: Record<Step, ReactNode> = {
    planner: "Hi! 👋 Congratulations on the wedding. Who's planning the invite?",
    month: "Lovely. When is the wedding?",
    tradition: "Which tradition are you celebrating?",
    design: "Here are designs couples love for that. Like any of these?",
    price: (
      <>
        Our designs are <b>{priceRange}</b>, everything included: functions with maps, countdown, RSVP, music and photos. Your link goes live within minutes of paying. Does that work for you?
      </>
    ),
    need: "Last one: what would you like help with?",
    done: "Thank you! You're all set. Start your invite now (it takes about 5 minutes), or chat with us on WhatsApp with your answers ready.",
    ticket: "Ask us anything. Tell us how to reach you and we'll reply between 9 am and 10 pm.",
    sent: "Got it, thank you! We'll get back to you soon.",
  };

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: open ? 0 : 1, y: 0 }}
        transition={{ delay: open ? 0 : 1.2, type: "spring", stiffness: 200, damping: 20 }}
        className={`wa-fab fixed right-4 bottom-4 z-40 flex items-center gap-2 rounded-full bg-surface py-2 pr-4 pl-2 text-[15px] font-medium text-ink shadow-[0_12px_32px_-12px_rgb(0_0_0/.35),0_0_0_1px_rgb(0_0_0/.05)] sm:right-6 sm:bottom-6 ${open ? "pointer-events-none" : ""}`}
        aria-label="Let's talk"
      >
        <span className="grid size-9 place-items-center rounded-full bg-ink text-white">
          <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
            <path d="M4 5h16v11H8l-4 4V5z" strokeLinejoin="round" />
          </svg>
        </span>
        Let&rsquo;s talk
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Chat with Aavjoo"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-0 bottom-0 z-[60] flex h-[min(640px,88svh)] flex-col overflow-hidden rounded-t-3xl bg-surface shadow-[0_-12px_60px_-20px_rgb(0_0_0/.35)] sm:inset-x-auto sm:right-6 sm:bottom-6 sm:h-[600px] sm:w-[380px] sm:rounded-3xl sm:shadow-[0_24px_70px_-20px_rgb(0_0_0/.45),0_0_0_1px_rgb(0_0_0/.05)]"
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
              <div>
                <p className="text-[16px] font-semibold">{site.name}</p>
                <p className="text-caption text-subtle">We reply {site.hours}</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close chat" className="grid size-9 place-items-center rounded-full bg-panel text-[20px] leading-none">
                ×
              </button>
            </div>

            <div ref={scroller} className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-4 py-4">
              {log.map((m, i) => (
                <Bubble key={i} from={m.from}>
                  {m.text}
                </Bubble>
              ))}
              <Bubble key={step} from="bot">
                {prompt[step]}
              </Bubble>

              {step === "planner" && (
                <Chips options={["Bride", "Groom", "Family", "Wedding planner"].map((v) => ({ v, l: v }))} onPick={(v) => answer("planner", v, v, "month")} />
              )}
              {step === "month" && <MonthChips onPick={(v, l) => answer("month", v, l, "tradition")} />}
              {step === "tradition" && <Chips options={TRADITIONS.map((t) => ({ v: t.label, l: t.label }))} onPick={(v) => answer("tradition", v, v, "design")} />}
              {step === "design" && (
                <div className="grid gap-2 pt-1">
                  {matching(a.tradition ?? "").map((t) => (
                    <div key={t.id} className="flex items-center justify-between gap-3 rounded-2xl border border-line p-3">
                      <div className="min-w-0">
                        <p className="text-[15px] font-semibold">
                          {t.name} <span className="font-normal text-subtle">{formatINR(t.price)}</span>
                        </p>
                        <p className="truncate text-caption text-subtle">{t.mood}</p>
                      </div>
                      <div className="flex shrink-0 gap-1.5">
                        <a href={`/templates/${t.id}`} target="_blank" rel="noreferrer" className="rounded-full bg-panel px-3 py-1.5 text-[13px] font-medium">
                          View
                        </a>
                        <button type="button" onClick={() => answer("design", t.id, `I like ${t.name}`, "price")} className="rounded-full bg-ink px-3 py-1.5 text-[13px] font-medium text-white">
                          Pick
                        </button>
                      </div>
                    </div>
                  ))}
                  <Chips options={[{ v: "skip", l: "Not sure yet" }]} onPick={() => answer("design", "", "Not sure yet", "price")} />
                </div>
              )}
              {step === "price" && <Chips options={["Yes", "Need something custom", "Just exploring"].map((v) => ({ v, l: v === "Yes" ? "Yes, works for me" : v }))} onPick={(v) => answer("price", v, v === "Yes" ? "Yes, works for me" : v, "need")} />}
              {step === "need" && <Chips options={["Choosing a design", "Customising my invite", "My existing order", "Something else"].map((v) => ({ v, l: v }))} onPick={finish} />}

              {step === "done" && (
                <div className="grid gap-2 pt-1">
                  <Link href={startHref} onClick={() => leadId && setLeadOutcome(leadId, "order")} className="flex items-center justify-center gap-2 rounded-full bg-ink py-3 text-[15px] font-medium text-white">
                    {chosen ? `Start my ${chosen.name} invite` : "Choose my design"} →
                  </Link>
                  <a
                    href={whatsappLink(waText)}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => leadId && setLeadOutcome(leadId, "whatsapp")}
                    className="flex items-center justify-center gap-2 rounded-full bg-whatsapp py-3 text-[15px] font-medium text-white"
                  >
                    <WaIcon /> Chat on WhatsApp
                  </a>
                  <button type="button" onClick={() => setStep("ticket")} className="py-1.5 text-[14px] font-medium text-muted underline underline-offset-4">
                    Ask a question instead
                  </button>
                </div>
              )}

              {step === "ticket" && (
                <div className="grid gap-2 pt-1">
                  <label htmlFor="chat-question" className="sr-only">
                    Your question
                  </label>
                  <textarea
                    id="chat-question"
                    rows={3}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Your question"
                    className="w-full resize-none rounded-2xl border border-line px-3.5 py-2.5 text-[16px] outline-none focus:border-ink"
                  />
                  <label htmlFor="chat-contact" className="sr-only">
                    Email or phone
                  </label>
                  <input
                    id="chat-contact"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="Email or phone, for our reply"
                    className="w-full rounded-full border border-line px-4 py-2.5 text-[16px] outline-none focus:border-ink"
                  />
                  {error && <p className="text-[13px] text-[#b42318]">{error}</p>}
                  <button type="button" disabled={sending} onClick={sendTicket} className="rounded-full bg-ink py-3 text-[15px] font-medium text-white disabled:opacity-60">
                    {sending ? "Sending…" : "Send question"}
                  </button>
                  <button type="button" onClick={() => setStep(a.need ? "done" : "planner")} className="py-1 text-[13px] text-subtle underline underline-offset-4">
                    Back
                  </button>
                </div>
              )}

              {step === "sent" && (
                <Link href="/designs" className="mt-1 flex items-center justify-center rounded-full bg-panel py-3 text-[15px] font-medium">
                  Browse designs meanwhile →
                </Link>
              )}
            </div>

            {/* Common questions sit apart from the chat, so they don't read as answers to it. */}
            {faqsLeft.length > 0 && (
              <div className="border-t border-line bg-panel/60 px-4 pt-2.5 pb-3">
                <p className="text-[12px] font-medium text-subtle">Common questions</p>
                <div className="no-scrollbar -mx-4 mt-2 flex gap-1.5 overflow-x-auto px-4">
                  {faqsLeft.map((f) => (
                    <button
                      key={f.q}
                      type="button"
                      onClick={() => {
                        setAsked((x) => [...x, f.q]);
                        say("me", f.q);
                        say("bot", f.a);
                      }}
                      className="shrink-0 rounded-full bg-surface px-3 py-1.5 text-[13px] font-medium text-muted shadow-[0_0_0_1px_rgb(0_0_0/.06)] hover:text-ink"
                    >
                      {f.q}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
