import type { ReactNode } from "react";
import { EventGlyph } from "@/art/glyphs";
import { Mandala } from "@/art/ornaments";
import { formatINR, site, whatsappLink } from "@/config/site";
import { testimonials } from "@/data/social-proof";
import { getTemplate, templates } from "@/data/templates";
import { InvitePreview } from "@/invites/InvitePreview";
import { WaIcon } from "@/invites/shared";
import { Accordion, ButtonLink, ChatBubble, Container, Heading, Lead, Panel, PhoneFrame, Reveal, Section } from "@/ui";

/* ───────── Features ───────── */

const features: { t: string; b: string; v: ReactNode }[] = [
  {
    t: "Grand openings",
    b: "Doors, envelopes, screens and seals your guests tap to open.",
    v: (
      <div className="relative grid h-full place-items-center">
        <Mandala color="#d9a441" className="absolute w-48 animate-spin-slow opacity-30" />
        <span className="relative grid size-24 place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#fff1b8,#e0ae4c_45%,#9c6d22)] text-3xl font-semibold text-[#4f0c1d] shadow-xl">
          AM
        </span>
      </div>
    ),
  },
  {
    t: "Every ceremony",
    b: "Each function with its time, venue, dress code and notes.",
    v: (
      <div className="grid h-full grid-cols-3 content-center gap-2 px-4">
        {(["haldi", "mehndi", "sangeet", "nikah", "anandkaraj", "muhurtham"] as const).map((k) => (
          <div key={k} className="flex flex-col items-center gap-1 rounded-2xl bg-surface py-3">
            <EventGlyph kind={k} className="size-7" />
            <span className="text-[11px] font-medium">{{ haldi: "Haldi", mehndi: "Mehndi", sangeet: "Sangeet", nikah: "Nikah", anandkaraj: "Anand Karaj", muhurtham: "Muhurtham" }[k]}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    t: "RSVP on WhatsApp",
    b: "Guests reply in two taps. Answers land in your chat.",
    v: (
      <div className="flex h-full flex-col justify-center gap-2 px-5">
        <ChatBubble>RSVP · Sharma family · 4 guests</ChatBubble>
        <ChatBubble>Sangeet, Pheras, Reception 🌸</ChatBubble>
        <ChatBubble from="me">See you there! 🙏</ChatBubble>
      </div>
    ),
  },
  {
    t: "Directions to every venue",
    b: "One tap opens Google Maps, so nobody has to call and ask.",
    v: (
      <div className="relative h-full overflow-hidden rounded-2xl bg-[#ece6da]">
        <svg viewBox="0 0 300 200" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
          <path d="M-10 150 C60 120 110 160 170 110 S270 60 320 80" stroke="#fff" strokeWidth={16} fill="none" />
          <path d="M110 -10 C116 60 96 120 140 210" stroke="#fff" strokeWidth={9} fill="none" />
          <path d="M40 170 C90 140 130 150 168 112" stroke="#141414" strokeWidth={2.5} strokeDasharray="5 5" fill="none" />
        </svg>
        <svg viewBox="0 0 24 32" className="absolute top-[30%] left-[52%] h-10 w-8" aria-hidden>
          <path d="M12 0C5.4 0 0 5.2 0 11.7 0 20 12 32 12 32s12-12 12-20.3C24 5.2 18.6 0 12 0Z" fill="#141414" />
          <circle cx={12} cy={11.5} r={4.5} fill="#f4a81d" />
        </svg>
      </div>
    ),
  },
  {
    t: "Your song plays",
    b: "Shehnai, your sangeet track, or a soft tanpura as they open it.",
    v: (
      <div className="flex h-full items-end justify-center gap-1.5 px-6 pb-8">
        {[40, 70, 52, 90, 64, 80, 46, 72, 58, 86, 50, 66].map((h, i) => (
          <span key={i} className="w-3 rounded-full bg-ink" style={{ height: `${h}%`, opacity: 0.35 + (i % 4) * 0.2 }} />
        ))}
      </div>
    ),
  },
  {
    t: "Easy for elders",
    b: "Large text, one tap and no app. Nani can open it herself.",
    v: (
      <div className="grid h-full place-items-center">
        <span className="rounded-2xl bg-surface px-6 py-4 text-6xl font-semibold tracking-tight">Aa</span>
      </div>
    ),
  },
];

export function Features() {
  return (
    <Section center>
      <Container>
        <Reveal>
          <Heading>
            One link.
            <br />
            Every function.
          </Heading>
        </Reveal>
        <div className="mt-14 grid gap-4 text-left md:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.t} delay={(i % 3) * 0.08}>
              <Panel className="flex h-full flex-col p-6">
                <div className="h-[200px]">{f.v}</div>
                <p className="mt-4 text-title">{f.t}</p>
                <p className="mt-1 text-body text-muted">{f.b}</p>
              </Panel>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}

/* ───────── How it works ───────── */

export function HowItWorks() {
  const [a, b, c] = [templates[1], templates[0], templates[3]];
  const steps: { n: string; b: string; v: ReactNode }[] = [
    {
      n: "Choose a design",
      b: "Browse the live demos and pick the one that feels like your wedding.",
      v: (
        <div className="flex h-full items-end justify-center gap-3 overflow-hidden px-6 pt-6">
          {[a, b, c].map((t, i) => (
            <div key={t.id} className={`w-[30%] ${i === 1 ? "translate-y-2" : "translate-y-10 opacity-60"}`}>
              <PhoneFrame>
                <InvitePreview slug={t.demoSlug} stage="open" loop={false} />
              </PhoneFrame>
            </div>
          ))}
        </div>
      ),
    },
    {
      n: "Fill in your details",
      b: "Names, functions, venues and your song. Watch the invite update as you type.",
      v: (
        <div className="flex h-full items-center justify-center p-6">
          <div className="w-full max-w-[240px] rounded-2xl bg-panel p-4 text-caption">
            <p className="font-semibold">Your names</p>
            <p className="mt-3 text-[11px] text-subtle uppercase">Bride</p>
            <p className="mt-1 rounded-lg bg-surface px-3 py-2">Meera</p>
            <p className="mt-3 text-[11px] text-subtle uppercase">Groom</p>
            <p className="mt-1 rounded-lg border border-ink bg-surface px-3 py-2">
              Aarav<span className="animate-pulse">|</span>
            </p>
          </div>
        </div>
      ),
    },
    {
      n: "Pay, then get your link",
      b: `We send payment details on WhatsApp. Your invite goes live within ${site.publishWithin} of payment.`,
      v: (
        <div className="flex h-full flex-col justify-center gap-2 bg-whatsapp-wash px-5">
          <ChatBubble>Is the invite ready? 👀</ChatBubble>
          <ChatBubble from="me">Here it is! 💌</ChatBubble>
          <ChatBubble>Beautiful! Sending it to the family group 😍</ChatBubble>
        </div>
      ),
    },
  ];
  return (
    <Section id="how" tone="panel" center>
      <Container>
        <Reveal>
          <Heading>
            Your invite, ready
            <br />
            in three steps.
          </Heading>
        </Reveal>
        <div className="mt-14 grid gap-4 text-left md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.08}>
              <Panel tone="surface" className="h-full overflow-hidden">
                <div className="h-[230px] overflow-hidden">{s.v}</div>
                <div className="p-6">
                  <p className="text-caption font-medium text-subtle">Step {i + 1}</p>
                  <p className="mt-1 text-title">{s.n}</p>
                  <p className="mt-1 text-body text-muted">{s.b}</p>
                </div>
              </Panel>
            </Reveal>
          ))}
        </div>
        <ButtonLink href="/designs" className="mt-12">
          Choose a design
        </ButtonLink>
      </Container>
    </Section>
  );
}

/* ───────── Comparison ───────── */

export function Comparison() {
  const rows = [
    ["Cost", "High", "Medium", "Low"],
    ["Change a venue", "Reprint", "Re-edit", "Instant"],
    ["Maps & RSVP", "No", "No", "Built in"],
    ["Readable for elders", "Yes", "Tiny text", "Yes"],
  ];
  return (
    <Section center>
      <Container className="max-w-[900px]">
        <Reveal>
          <Heading muted="Better than a video.">Better than a card.</Heading>
        </Reveal>
        <Reveal className="mt-12 overflow-x-auto rounded-card bg-panel p-2 text-left">
          <div className="grid min-w-[560px] grid-cols-[1.3fr_1fr_1fr_1fr] text-[15px]">
            <div />
            <div className="px-3 py-4 text-center text-subtle">Printed card</div>
            <div className="px-3 py-4 text-center text-subtle">WhatsApp video</div>
            <div className="rounded-t-tile bg-ink px-3 py-4 text-center font-semibold text-white">{site.name}</div>
            {rows.map((row, r) => (
              <div key={row[0]} className="contents">
                <div className="border-t border-surface px-4 py-4 font-medium">{row[0]}</div>
                <div className="border-t border-surface px-3 py-4 text-center text-subtle">{row[1]}</div>
                <div className="border-t border-surface px-3 py-4 text-center text-subtle">{row[2]}</div>
                <div className={`bg-ink px-3 py-4 text-center font-medium text-white ${r === rows.length - 1 ? "rounded-b-tile" : "border-t border-white/10"}`}>✓ {row[3]}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}

/* ───────── Testimonials (placeholders until real) ───────── */

export function Testimonials() {
  return (
    <Section tone="panel" center>
      <Container>
        <Heading>
          Loved by couples
          <br />
          across India.
        </Heading>
        <div className="mt-14 grid gap-4 text-left md:grid-cols-3">
          {testimonials.map((r, i) => (
            <Reveal key={r.couple} delay={(i % 3) * 0.08}>
              <Panel tone="surface" className="flex h-full flex-col p-7">
                <p className="text-[15px] tracking-[2px] text-[#f4a81d]" aria-label="5 out of 5 stars">
                  ★★★★★
                </p>
                <p className="mt-3 flex-1 text-[16px] leading-relaxed text-ink">&ldquo;{r.quote}&rdquo;</p>
                <div className="mt-6 flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-full text-[14px] font-semibold text-white" style={{ background: r.tint }}>
                    {r.couple.split(" & ").map((n) => n[0]).join("")}
                  </span>
                  <div>
                    <p className="text-[14px] font-semibold">{r.couple}</p>
                    <p className="text-caption text-subtle">
                      {r.city} · {getTemplate(r.design)?.name}
                    </p>
                  </div>
                </div>
              </Panel>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}

/* ───────── FAQ ───────── */

export const generalFaqs = [
  { q: "How do guests open it?", a: "It's a normal link. Share it on WhatsApp and it opens in the phone's browser in seconds. No app, no login." },
  { q: "What do you need from us?", a: "Just the form on your design's page: names, functions with dates, times and venues, dress codes, and your song if you'd like one. You'll see the invite update as you fill it in." },
  { q: "What if a venue or time changes?", a: "Message us with your order code and we'll update the same link, so nobody needs a new invite." },
  { q: "Can it include Hindi, Urdu, Punjabi or Tamil?", a: "Yes. Invocations, blessings and event names can be set in their own script alongside English." },
  { q: "How long does the link stay live?", a: `Until ${site.inviteDaysAfterWedding} days after your wedding, so guests can look back at it after the celebrations.` },
  { q: "How do we pay?", a: `Submit your details first, no payment needed. We then message you on WhatsApp with a UPI QR code, and publish your invite within ${site.publishWithin} of payment.` },
];

export function Faq({ items = generalFaqs, title = "Questions, answered." }: { items?: { q: string; a: string }[]; title?: string }) {
  return (
    <Section id="faq">
      <Container className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <Heading>{title}</Heading>
          <Lead className="mt-5">
            Something else on your mind? Message us on WhatsApp. We reply every day, {site.hours}.
          </Lead>
        </div>
        <Accordion items={items} />
      </Container>
    </Section>
  );
}

/* ───────── Closing CTA ───────── */

export function ClosingCta() {
  const from = Math.min(...templates.map((t) => t.price));
  return (
    <section className="pb-20">
      <Container>
        <div className="rounded-card bg-ink px-6 py-20 text-center text-white">
          <h2 className="text-heading text-balance">Ready when you are.</h2>
          <p className="mx-auto mt-4 max-w-md text-lead text-white/60">
            🪔 Diwali offer: every design from {formatINR(from)}, up to 75% off. Pick one and make it yours in minutes.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            <ButtonLink href={whatsappLink(`Hi ${site.name}! We're getting married and would love an invitation website.`)} variant="inverse">
              <WaIcon /> Chat on WhatsApp
            </ButtonLink>
            <ButtonLink href="/designs" variant="secondary" className="bg-white/10 text-white hover:bg-white/15">
              See all designs
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
