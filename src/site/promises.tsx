"use client";

import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { site } from "@/config/site";
import { Container, Heading, Reveal, Section, ease } from "@/ui";

/* Each promise is shown as a small, true-to-life piece of the experience rather than an icon. */

function useSeen() {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.5 });
  return [ref, seen] as const;
}

/* ───────── 1 · A real person on WhatsApp ───────── */

function ChatScene() {
  const [ref, seen] = useSeen();
  const pop = (d: number) => ({ initial: { opacity: 0, y: 8, scale: 0.96 }, animate: seen ? { opacity: 1, y: 0, scale: 1 } : {}, transition: { delay: d, duration: 0.45, ease } });
  return (
    <div ref={ref} className="flex h-full flex-col overflow-hidden rounded-[18px] bg-[#efe7dd]">
      <div className="flex items-center gap-2.5 bg-[#075e54] px-3.5 py-2.5 text-white">
        <span className="grid size-8 place-items-center rounded-full bg-white">
          <Image src="/icon.png" alt="" width={32} height={32} className="size-8 rounded-full" />
        </span>
        <div className="leading-tight">
          <p className="text-[13px] font-semibold">{site.name}</p>
          <p className="text-[11px] text-white/75">online</p>
        </div>
      </div>
      <div className="flex flex-1 flex-col justify-end gap-1.5 p-3 text-[12.5px]">
        <motion.p {...pop(0.2)} className="ml-auto max-w-[85%] rounded-xl rounded-tr-sm bg-[#d9fdd3] px-3 py-1.5">
          Can we add my nani&rsquo;s name under the blessings? 🙏
        </motion.p>
        <motion.span
          initial={{ opacity: 0, height: 0 }}
          animate={seen ? { opacity: [0, 1, 1, 0], height: ["0px", "28px", "28px", "0px"] } : {}}
          transition={{ delay: 0.9, duration: 1.5, times: [0, 0.15, 0.85, 1] }}
          className="flex w-fit items-center gap-1 overflow-hidden rounded-xl rounded-tl-sm bg-white px-3"
        >
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="size-1.5 rounded-full bg-[#8a8a8a]"
              animate={seen ? { opacity: [0.3, 1, 0.3] } : {}}
              transition={{ duration: 1, repeat: 2, delay: i * 0.15 }}
            />
          ))}
        </motion.span>
        <motion.p {...pop(2.4)} className="max-w-[85%] rounded-xl rounded-tl-sm bg-white px-3 py-1.5">
          Of course! Done, it&rsquo;s live on your link now ✨<span className="ml-2 text-[10px] text-[#8a8a8a]">9:41 pm</span>
        </motion.p>
      </div>
    </div>
  );
}

/* ───────── 2 · Live within 24 hours ───────── */

const track = ["Ordered", "Paid", "Designing", "Live"];

function TimelineScene() {
  const [ref, seen] = useSeen();
  return (
    <div ref={ref} className="flex h-full flex-col justify-center rounded-[18px] bg-[#eaf4ec] px-6 py-5">
      <div className="flex items-baseline justify-between">
        <p className="text-[13px] font-semibold">Order AAV-1024</p>
        <motion.p className="text-[12px] font-medium text-[#1d6b35]" initial={{ opacity: 0 }} animate={seen ? { opacity: 1 } : {}} transition={{ delay: 2.4 }}>
          Live in 6 hrs
        </motion.p>
      </div>
      <div className="relative mt-5">
        <div className="absolute top-[9px] right-[9px] left-[9px] h-[3px] rounded-full bg-white" />
        <motion.div
          className="absolute top-[9px] left-[9px] h-[3px] rounded-full bg-[#1d6b35]"
          initial={{ width: 0 }}
          animate={seen ? { width: "calc(100% - 18px)" } : {}}
          transition={{ duration: 2.2, ease: "easeInOut", delay: 0.2 }}
        />
        <div className="relative flex justify-between">
          {track.map((t, i) => (
            <div key={t} className={`flex w-0 flex-col ${i === 0 ? "items-start" : i === track.length - 1 ? "items-end" : "items-center"}`}>
              <motion.span
                className="grid size-[21px] place-items-center rounded-full border-2 bg-surface text-[11px] text-white"
                initial={{ borderColor: "#cfe3d3", backgroundColor: "#ffffff" }}
                animate={seen ? { borderColor: "#1d6b35", backgroundColor: "#1d6b35" } : {}}
                transition={{ delay: 0.2 + (i * 2.2) / 3, duration: 0.3 }}
              >
                ✓
              </motion.span>
              <span className="mt-2 text-[11px] whitespace-nowrap text-ink/60">{t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───────── 3 · Changes until the big day ───────── */

function EditScene() {
  const [ref, seen] = useSeen();
  return (
    <div ref={ref} className="relative flex h-full flex-col justify-center rounded-[18px] bg-[#fbf3e8] p-5">
      <p className="text-[11px] font-semibold tracking-[0.15em] text-[#a8462c] uppercase">Sangeet · 5 Feb · 7:30 pm</p>
      <div className="relative mt-2 text-[20px] leading-tight font-semibold tracking-[-0.01em]" style={{ fontFamily: "var(--font-cormorant), serif" }}>
        <span className="relative text-ink/45">
          Durbar Hall
          <motion.span className="absolute top-1/2 left-0 h-[2px] bg-[#c0392b]" initial={{ width: 0 }} animate={seen ? { width: "100%" } : {}} transition={{ delay: 0.4, duration: 0.5 }} />
        </span>
        <motion.span
          className="block text-ink"
          initial={{ clipPath: "inset(0 100% 0 0)" }}
          animate={seen ? { clipPath: "inset(0 0% 0 0)" } : {}}
          transition={{ delay: 1, duration: 0.9, ease: "easeOut" }}
        >
          The Lakeside Lawns
        </motion.span>
      </div>
      <motion.span
        className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-[12px] font-medium text-white"
        initial={{ opacity: 0, y: 8 }}
        animate={seen ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 2, duration: 0.4, ease }}
      >
        <span className="size-1.5 rounded-full bg-[#4ade80]" /> Same link, updated for every guest
      </motion.span>
    </div>
  );
}

/* ───────── 4 · Easy for every guest ───────── */

function LinkScene() {
  const [ref, seen] = useSeen();
  return (
    <div ref={ref} className="flex h-full flex-col justify-end gap-2 overflow-hidden rounded-[18px] bg-[#efe7dd] p-3">
      <motion.div
        className="w-[88%] shrink-0 overflow-hidden rounded-xl rounded-tl-sm bg-white shadow-sm"
        initial={{ opacity: 0, y: 12 }}
        animate={seen ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease }}
      >
        <div className="relative aspect-[16/5.6]">
          <Image src="/art/illus/mahal-hero.jpg" alt="" fill sizes="320px" className="object-cover object-[50%_62%]" />
        </div>
        <div className="border-l-[3px] border-[#25d366] bg-[#f5f6f6] px-3 py-2">
          <p className="text-[12.5px] font-semibold">Vihaan &amp; Kavya · Wedding Invitation</p>
          <p className="text-[11px] text-muted">Tap to open the invitation</p>
        </div>
        <p className="px-3 py-1.5 text-[12.5px]">
          Nani, here&rsquo;s the invite, just tap it 💛<span className="ml-2 text-[10px] text-[#8a8a8a]">8:02 am</span>
        </p>
      </motion.div>
      <motion.p
        className="ml-auto w-fit shrink-0 rounded-xl rounded-tr-sm bg-[#d9fdd3] px-3 py-1.5 text-[12.5px]"
        initial={{ opacity: 0, y: 8 }}
        animate={seen ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 1.2, duration: 0.45, ease }}
      >
        Opened it! So beautiful beta 😍
      </motion.p>
    </div>
  );
}

/* ───────── 5 · Your details stay private ───────── */

function PrivateScene() {
  const [ref, seen] = useSeen();
  return (
    <div ref={ref} className="flex h-full flex-col justify-center rounded-[18px] bg-[#eeebf8] px-5 py-3">
      {[
        ["Your link", "Only people you send it to"],
        ["Search engines", "Hidden from Google"],
        ["Your photos", "Removed whenever you ask"],
      ].map(([k, v], i) => (
        <div key={k} className="flex items-center justify-between gap-3 border-b border-ink/10 py-2.5 last:border-0">
          <div className="min-w-0">
            <p className="text-[13px] font-semibold">{k}</p>
            <p className="truncate text-[11.5px] text-muted">{v}</p>
          </div>
          <span className="relative h-[22px] w-[38px] shrink-0 rounded-full bg-ink/15">
            <motion.span className="absolute inset-0 rounded-full bg-ink" initial={{ opacity: 0 }} animate={seen ? { opacity: 1 } : {}} transition={{ delay: 0.3 + i * 0.35 }} />
            <motion.span
              className="absolute top-[3px] left-[3px] size-4 rounded-full bg-white shadow"
              initial={{ x: 0 }}
              animate={seen ? { x: 16 } : {}}
              transition={{ delay: 0.3 + i * 0.35, type: "spring", stiffness: 500, damping: 30 }}
            />
          </span>
        </div>
      ))}
    </div>
  );
}

/* ───────── 6 · New designs every season ───────── */

const fan = [
  { src: "/art/illus/gopuram-hero.jpg", r: -14, x: -58 },
  { src: "/art/illus/khat-hero.jpg", r: 0, x: 0 },
  { src: "/art/illus/bagh-hero.jpg", r: 14, x: 58 },
];

function FanScene() {
  const [ref, seen] = useSeen();
  return (
    <div ref={ref} className="relative h-full overflow-hidden rounded-[18px] bg-[linear-gradient(160deg,#fbe6dd,#f6ecd6)]">
      {fan.map((f, i) => (
        <motion.div
          key={f.src}
          className="absolute top-[18%] left-1/2 aspect-[9/16] w-[30%] overflow-hidden rounded-[10px] border-[3px] border-white shadow-[0_14px_30px_-12px_rgba(60,20,10,.5)]"
          style={{ marginLeft: "-15%", zIndex: i === 1 ? 2 : 1 }}
          initial={{ rotate: 0, x: 0, y: 30, opacity: 0 }}
          animate={seen ? { rotate: f.r, x: f.x, y: i === 1 ? -6 : 8, opacity: 1 } : {}}
          transition={{ delay: 0.15 * i, duration: 0.8, ease }}
        >
          <Image src={f.src} alt="" fill sizes="160px" className="object-cover object-[50%_70%]" />
        </motion.div>
      ))}
      <motion.span
        className="absolute top-[12%] left-1/2 z-10 ml-[6%] rounded-full bg-[#e8582a] px-2.5 py-1 text-[11px] font-bold text-white shadow"
        initial={{ scale: 0 }}
        animate={seen ? { scale: 1, rotate: 8 } : {}}
        transition={{ delay: 0.9, type: "spring", stiffness: 300, damping: 14 }}
      >
        New
      </motion.span>
    </div>
  );
}

/* ───────── The section ───────── */

function Card({ title, body, scene, className }: { title: string; body: string; scene: ReactNode; className?: string }) {
  return (
    <div className={`flex h-full flex-col rounded-card bg-surface p-3 ${className ?? ""}`}>
      <div className="h-[210px]">{scene}</div>
      <div className="px-3 pt-5 pb-3">
        <p className="text-title">{title}</p>
        <p className="mt-1.5 text-body text-muted">{body}</p>
      </div>
    </div>
  );
}

export function Promises() {
  const cards = [
    { title: "A real person on WhatsApp", body: `Every order is looked after by us, not a bot. We reply ${site.hours}.`, scene: <ChatScene /> },
    { title: `Live within ${site.publishWithin}`, body: "Once your payment is confirmed, we publish your invite and send you the link.", scene: <TimelineScene /> },
    { title: "Changes until the big day", body: "Venue moved or a name misspelt? We update the same link, so no one needs a new invite.", scene: <EditScene /> },
    { title: "Easy for every guest", body: "One tap from WhatsApp. No app, no login, big clear text for every generation.", scene: <LinkScene /> },
    { title: "Your details stay private", body: "Your photos and details are used only for your invite, and taken down when you ask.", scene: <PrivateScene /> },
    { title: "New designs every season", body: "We keep adding designs for every tradition. Want one we don't have? Just ask.", scene: <FanScene /> },
  ];
  return (
    <Section tone="panel" center>
      <Container>
        <Reveal>
          <Heading muted="for every couple.">Our promise,</Heading>
        </Reveal>
        <div className="mt-14 grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c, i) => (
            <Reveal key={c.title} delay={(i % 3) * 0.08}>
              <Card {...c} />
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
