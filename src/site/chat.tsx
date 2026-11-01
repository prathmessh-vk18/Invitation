"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { formatINR, site, whatsappLink } from "@/config/site";
import { templates, type CategoryId } from "@/data/templates";
import { WaIcon } from "@/invites/shared";
import { saveLead, setLeadOutcome, submitTicket } from "@/lib/lead-actions";

/**
 * "Let's talk", in place of a bare WhatsApp link. Two tabs:
 * - Choose a design: a few quick questions, then the designs for their tradition. "Make it mine"
 *   opens that design's form. Not sure yet? Two more questions, then WhatsApp with their answers
 *   already written.
 * - Questions: answers to what people ask most, and a form to ask anything else (a ticket).
 * Every chat that gets to a design or to WhatsApp is saved for the Leads page in admin.
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

/** What people ask us most, by topic. */
const FAQS: { q: string; a: string }[] = [
  { q: "How it works", a: "Pick a design, fill in your names, functions and song with a live preview, and pay online. Your invite link goes live within minutes, ready to share on WhatsApp." },
  { q: "Price & what's included", a: `${priceRange}, everything included: every function with Google Maps directions, a countdown, RSVP on WhatsApp, your song, photos and ${site.revisionRounds} rounds of changes.` },
  { q: "How fast", a: "Usually within minutes of payment. You get the link on WhatsApp." },
  { q: "Payment", a: "Securely online by UPI, card or netbanking, right after you fill in your details." },
  { q: "Changing details later", a: "Message us with your order code and we'll update the same link, so nobody needs a new invite." },
  { q: "Hindi & other languages", a: "Invocations, blessings and function names can be in Hindi, Marathi, Punjabi, Tamil or Urdu alongside English." },
  { q: "Sharing with guests", a: "It's a normal link. Share it on WhatsApp and it opens in the phone's browser in seconds. No app, no login." },
  { q: "How long it stays live", a: `Until ${site.inviteDaysAfterWedding} days after your wedding, so guests can look back at it.` },
];

type Answers = { planner: string; month: string; tradition: string; design?: string; price: string; need: string };
type Step = "planner" | "month" | "tradition" | "design" | "price" | "need" | "done";
type Tab = "design" | "questions";

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
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("design");
  const [step, setStep] = useState<Step>("planner");
  const [a, setA] = useState<Partial<Answers>>({});
  const [log, setLog] = useState<{ from: "bot" | "me"; text: ReactNode }[]>([]);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [going, setGoing] = useState<string | null>(null);
  const [asked, setAsked] = useState<string[]>([]);
  const [form, setForm] = useState<"closed" | "open" | "sent">("closed");
  const [question, setQuestion] = useState("");
  const [contact, setContact] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [log, step, tab, asked, form]);

  const say = (from: "bot" | "me", text: ReactNode) => setLog((l) => [...l, { from, text }]);

  const matching = (tradition: string) => {
    const id = TRADITIONS.find((t) => t.label === tradition)?.id;
    return id ? templates.filter((t) => t.category === id) : templates;
  };

  const answer = (key: keyof Answers, value: string, shown: string, next: Step) => {
    setA((p) => ({ ...p, [key]: value }));
    say("me", shown);
    setStep(next);
  };

  /** "Make it mine": saves what they told us, then opens that design's form. */
  async function makeItMine(id: string) {
    setGoing(id);
    await saveLead({ ...(a as Answers), design: id, page: window.location.pathname }, "order");
    router.push(`/start/${id}`);
    setOpen(false);
    setGoing(null);
  }

  async function finish(need: string) {
    const all = { ...a, need } as Answers;
    setA(all);
    say("me", need);
    setStep("done");
    setLeadId(await saveLead({ ...all, page: window.location.pathname }));
  }

  const waText = [
    `Hi ${site.name}!`,
    [a.planner, a.month && `Wedding ${monthLabel(a.month)}`, a.tradition, a.price === "Yes" ? `${priceRange} works` : a.price].filter(Boolean).join(" · "),
    a.need && `I need help with: ${a.need.toLowerCase()}.`,
  ]
    .filter(Boolean)
    .join("\n");

  async function sendTicket() {
    setError("");
    setSending(true);
    const res = await submitTicket(leadId, question, contact);
    setSending(false);
    if ("error" in res) return setError(res.error);
    setForm("sent");
  }

  const prompt: Record<Step, ReactNode> = {
    planner: "Hi! 👋 Congratulations on the wedding. Who's planning the invite?",
    month: "Lovely. When is the wedding?",
    tradition: "Which tradition are you celebrating?",
    design: "Here are our designs for that. Tap View to see one live, or Make it mine to start yours.",
    price: (
      <>
        No problem, we&rsquo;ll help. Our designs are <b>{priceRange}</b>, everything included: functions with maps, countdown, RSVP, music and photos. Does that work for you?
      </>
    ),
    need: "Last one: what would you like help with?",
    done: "Thank you! Chat with us on WhatsApp with your answers ready, or browse all the designs.",
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
            <div className="border-b border-line px-5 pt-3.5 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[16px] font-semibold">{site.name}</p>
                  <p className="text-caption text-subtle">We reply {site.hours}</p>
                </div>
                <button type="button" onClick={() => setOpen(false)} aria-label="Close chat" className="grid size-9 place-items-center rounded-full bg-panel text-[20px] leading-none">
                  ×
                </button>
              </div>
              <div role="tablist" className="mt-3 grid grid-cols-2 gap-1 rounded-full bg-panel p-1">
                {(
                  [
                    ["design", "Choose a design"],
                    ["questions", "Questions"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={tab === id}
                    onClick={() => setTab(id)}
                    className={`rounded-full py-2 text-[14px] font-medium transition ${tab === id ? "bg-surface text-ink shadow-[0_1px_3px_rgb(0_0_0/.12)]" : "text-muted hover:text-ink"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div ref={scroller} className="flex flex-1 flex-col gap-2.5 overflow-y-auto px-4 py-4">
              {tab === "design" ? (
                <>
                  {log.map((m, i) => (
                    <Bubble key={i} from={m.from}>
                      {m.text}
                    </Bubble>
                  ))}
                  <Bubble key={step} from="bot">
                    {prompt[step]}
                  </Bubble>

                  {step === "planner" && <Chips options={["Bride", "Groom", "Family", "Wedding planner"].map((v) => ({ v, l: v }))} onPick={(v) => answer("planner", v, v, "month")} />}
                  {step === "month" && <MonthChips onPick={(v, l) => answer("month", v, l, "tradition")} />}
                  {step === "tradition" && <Chips options={TRADITIONS.map((t) => ({ v: t.label, l: t.label }))} onPick={(v) => answer("tradition", v, v, "design")} />}
                  {step === "design" && (
                    <div className="grid gap-2 pt-1">
                      {matching(a.tradition ?? "").map((t) => (
                        <div key={t.id} className="flex items-center justify-between gap-2 rounded-2xl border border-line p-3">
                          <div className="min-w-0">
                            <p className="text-[15px] font-semibold">
                              {t.name} <span className="font-normal text-subtle">{formatINR(t.price)}</span>
                            </p>
                            <p className="truncate text-caption text-subtle">{t.mood.replace(/^[^·]*·\s*/, "")}</p>
                          </div>
                          <div className="flex shrink-0 gap-1.5">
                            <a href={`/templates/${t.id}`} target="_blank" rel="noreferrer" className="rounded-full bg-panel px-3 py-1.5 text-[13px] font-medium">
                              View
                            </a>
                            <button type="button" disabled={!!going} onClick={() => makeItMine(t.id)} className="rounded-full bg-ink px-3 py-1.5 text-[13px] font-medium text-white disabled:opacity-60">
                              {going === t.id ? "Opening…" : "Make it mine"}
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
                      <a
                        href={whatsappLink(waText)}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => leadId && setLeadOutcome(leadId, "whatsapp")}
                        className="flex items-center justify-center gap-2 rounded-full bg-whatsapp py-3 text-[15px] font-medium text-white"
                      >
                        <WaIcon /> Chat on WhatsApp
                      </a>
                      <Link href="/designs" onClick={() => setOpen(false)} className="flex items-center justify-center rounded-full bg-panel py-3 text-[15px] font-medium">
                        See all designs →
                      </Link>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <Bubble from="bot">What do you need help with?</Bubble>
                  {asked.map((q) => (
                    <div key={q} className="contents">
                      <Bubble from="me">{q}</Bubble>
                      <Bubble from="bot">{FAQS.find((f) => f.q === q)!.a}</Bubble>
                    </div>
                  ))}
                  {FAQS.length > asked.length && <Chips options={FAQS.filter((f) => !asked.includes(f.q)).map((f) => ({ v: f.q, l: f.q }))} onPick={(q) => setAsked((x) => [...x, q])} />}

                  {form === "closed" && (
                    <div className="mt-3 border-t border-line pt-3">
                      <p className="text-[14px] text-muted">Didn&rsquo;t find your answer?</p>
                      <button type="button" onClick={() => setForm("open")} className="mt-2 w-full rounded-full bg-ink py-3 text-[15px] font-medium text-white">
                        Ask us a question
                      </button>
                    </div>
                  )}
                  {form === "open" && (
                    <div className="mt-3 grid gap-2 border-t border-line pt-3">
                      <p className="text-[14px] text-muted">Tell us how to reach you and we&rsquo;ll reply {site.hours}.</p>
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
                    </div>
                  )}
                  {form === "sent" && (
                    <>
                      <Bubble from="me">{question}</Bubble>
                      <Bubble from="bot">Got it, thank you! We&rsquo;ll get back to you soon.</Bubble>
                    </>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
