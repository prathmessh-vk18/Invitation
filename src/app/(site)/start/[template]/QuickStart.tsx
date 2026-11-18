"use client";

import { unstable_isUnrecognizedActionError, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition, type ReactNode } from "react";
import { formatINR } from "@/config/site";
import { cleanPartnerCode, readRefCookie } from "@/config/partners";
import { getInvite } from "@/data/invites";
import type { TemplateMeta } from "@/data/templates";
import { checkPartnerCode, createOrder } from "@/lib/order-actions";
import { mainCeremonies, initialState, toDetails, validate, waNumber, type FormState } from "./form-model";

/**
 * A new order in three short steps, made for phones: names; date, time, city and venue; the
 * couple's contact. Everything else (wording, functions, photos, song, font…) they do afterwards
 * on the invite itself in the editor, before paying.
 */
const STEPS = [
  { title: "Whose wedding is it?", note: "Names appear on the invite exactly as you type them.", keys: ["bride.first", "groom.first"] },
  { title: "When and where?", note: "Add Haldi, Mehndi and your other functions in the next step, on the invite itself.", keys: ["weddingDate", "weddingTime", "city", "events.0.venue"] },
  { title: "Your details", note: "We send your invite link and edit link here. Nobody else sees them.", keys: ["customer.name", "customer.phone", "customer.email"] },
] as const;

export function QuickStart({ t }: { t: TemplateMeta }) {
  const demo = getInvite(t.demoSlug)!;
  const router = useRouter();
  const engagement = t.occasion === "engagement";
  // The design's wording, and its main ceremony as the one function to start with.
  const [s, setS] = useState<FormState>(() => {
    const base = initialState(demo);
    const main = base.events.find((e) => mainCeremonies.includes(e.kind)) ?? base.events[base.events.length - 1];
    return { ...base, events: main ? [{ ...main }] : base.events.slice(0, 1) };
  });
  const [step, setStep] = useState(0);
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  const [pending, start] = useTransition();
  const [today, setToday] = useState("");
  useEffect(() => {
    const t0 = window.setTimeout(() => setToday(new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" })), 0);
    return () => window.clearTimeout(t0);
  }, []);

  // The one function follows the wedding's date and time.
  const state = useMemo(() => ({ ...s, events: s.events.map((e, i) => (i === 0 ? { ...e, date: s.weddingDate, time: s.weddingTime } : e)) }), [s]);
  const errors = useMemo(() => validate(state, today, engagement ? "engagement" : "wedding", true), [state, today, engagement]);
  const stepErrors = (i: number) => STEPS[i].keys.filter((k) => errors[k]);
  const shown = (k: string) => (touched.has(k) ? errors[k] : undefined);

  const set = (patch: Partial<FormState>) => setS((x) => ({ ...x, ...patch }));
  const setPerson = (who: "bride" | "groom", first: string) => setS((x) => ({ ...x, [who]: { ...x[who], first } }));
  const setVenue = (venue: string) => setS((x) => ({ ...x, events: x.events.map((e, i) => (i === 0 ? { ...e, venue } : e)) }));
  const setCustomer = (k: keyof FormState["customer"], v: string) => setS((x) => ({ ...x, customer: { ...x.customer, [k]: v } }));

  const next = () => {
    setTouched((x) => new Set([...x, ...STEPS[step].keys]));
    if (stepErrors(step).length) return;
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    submit();
  };

  function submit() {
    setServerErrors([]);
    start(async () => {
      try {
        // A partner's link applies their code, if it's still a partner's.
        const code = cleanPartnerCode(readRefCookie());
        const partner = code ? await checkPartnerCode(code).catch(() => null) : null;
        const res = await createOrder({
          template: t.id,
          details: toDetails(state, t.id),
          songPath: null,
          photoPaths: [],
          customer: { ...state.customer, phone: `+${waNumber(state.customer.phone)}` },
          ...(partner ? { partnerCode: partner.code } : {}),
        });
        if ("errors" in res) {
          setServerErrors(res.errors);
          return;
        }
        router.push(`/customise/${res.id}`);
      } catch (e) {
        setServerErrors([unstable_isUnrecognizedActionError(e) ? "Aavjoo was just updated. Please refresh this page and try again." : "We couldn't save. Check your internet and try again."]);
      }
    });
  }

  const current = STEPS[step];
  return (
    <div className="mx-auto max-w-[520px] pb-28">
      <div className="flex items-center gap-2" aria-label={`Step ${step + 1} of ${STEPS.length + 1}`}>
        {[...STEPS, { title: "Make it yours" }].map((x, i) => (
          <span key={x.title} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-ink" : "bg-line"}`} />
        ))}
      </div>
      <p className="mt-5 text-[13px] font-medium text-subtle">
        Step {step + 1} of {STEPS.length + 1}
      </p>
      <h3 className="mt-1 text-[26px] leading-tight font-semibold tracking-tight text-ink">{current.title}</h3>
      <p className="mt-1.5 text-[15px] leading-snug text-muted">{current.note}</p>

      <div className="mt-7 space-y-5">
        {step === 0 && (
          <>
            <Box label={engagement ? "Bride-to-be's name" : "Bride's name"} error={shown("bride.first")}>
              <input value={s.bride.first} onChange={(e) => setPerson("bride", e.target.value)} onBlur={() => setTouched((x) => new Set(x).add("bride.first"))} placeholder="e.g. Meera" autoComplete="off" maxLength={40} className={input} />
            </Box>
            <Box label={engagement ? "Groom-to-be's name" : "Groom's name"} error={shown("groom.first")}>
              <input value={s.groom.first} onChange={(e) => setPerson("groom", e.target.value)} onBlur={() => setTouched((x) => new Set(x).add("groom.first"))} placeholder="e.g. Aarav" autoComplete="off" maxLength={40} className={input} />
            </Box>
          </>
        )}
        {step === 1 && (
          <>
            <div className="grid grid-cols-[1.3fr_1fr] gap-3">
              <Box label={engagement ? "Engagement date" : "Wedding date"} error={shown("weddingDate")}>
                <input type="date" value={s.weddingDate} min={today || undefined} onChange={(e) => set({ weddingDate: e.target.value })} className={input} />
              </Box>
              <Box label="Time" error={shown("weddingTime")}>
                <input type="time" value={s.weddingTime} onChange={(e) => set({ weddingTime: e.target.value })} className={input} />
              </Box>
            </div>
            <Box label="City" error={shown("city")}>
              <input value={s.city} onChange={(e) => set({ city: e.target.value })} placeholder="e.g. Jaipur, Rajasthan" maxLength={80} className={input} />
            </Box>
            <Box label="Venue" hint={`Where the ${state.events[0]?.name || "ceremony"} is`} error={shown("events.0.venue")}>
              <input value={s.events[0]?.venue ?? ""} onChange={(e) => setVenue(e.target.value)} placeholder="e.g. Hotel Clarks Amer" maxLength={120} className={input} />
            </Box>
          </>
        )}
        {step === 2 && (
          <>
            <Box label="Your name" error={shown("customer.name")}>
              <input value={s.customer.name} onChange={(e) => setCustomer("name", e.target.value)} autoComplete="name" maxLength={80} className={input} />
            </Box>
            <Box label="WhatsApp number" hint="Guests' RSVPs come here too. You can change that later." error={shown("customer.phone")}>
              <input type="tel" inputMode="tel" value={s.customer.phone} onChange={(e) => setCustomer("phone", e.target.value)} autoComplete="tel" placeholder="10-digit mobile number" className={input} />
            </Box>
            <Box label="Email" error={shown("customer.email")}>
              <input type="email" inputMode="email" value={s.customer.email} onChange={(e) => setCustomer("email", e.target.value)} autoComplete="email" placeholder="name@gmail.com" className={input} />
            </Box>
            <p className="rounded-2xl bg-panel p-4 text-[14px] leading-snug text-ink-soft">
              Next, you&rsquo;ll see your invite with your names. Tap anything on it to change it: wording, functions, photos, song, font. Pay {formatINR(t.price)} when it looks right.
            </p>
          </>
        )}
        {serverErrors.length > 0 && (
          <div role="alert" className="rounded-2xl bg-[#fdecec] p-4 text-[14px] text-[#8a1c1c]">
            {serverErrors.map((x) => (
              <p key={x}>{x}</p>
            ))}
          </div>
        )}
      </div>

      {/* The step's button stays at the bottom of the screen, under the thumb. */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] backdrop-blur">
        <div className="mx-auto flex max-w-[520px] gap-2">
          {step > 0 && (
            <button type="button" onClick={() => setStep(step - 1)} className="h-13 rounded-full bg-panel px-5 text-[16px] font-medium text-ink">
              Back
            </button>
          )}
          <button type="button" onClick={next} disabled={pending} className="h-13 flex-1 rounded-full bg-ink text-[17px] font-semibold text-white disabled:opacity-60">
            {pending ? "Creating your invite…" : step < STEPS.length - 1 ? "Continue" : "See my invite →"}
          </button>
        </div>
      </div>
    </div>
  );
}

const input = "h-13 w-full rounded-xl border border-[#d4d4d4] bg-white px-4 text-[17px] text-ink outline-none focus:border-ink";

function Box({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[15px] font-semibold text-ink">{label}</span>
      {hint && <span className="mt-0.5 block text-[13px] text-subtle">{hint}</span>}
      <span className="mt-2 block">{children}</span>
      {error && <span className="mt-1.5 block text-[14px] text-[#b42318]">{error}</span>}
    </label>
  );
}
