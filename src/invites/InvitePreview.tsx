"use client";

import { useInView } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { fontVars } from "@/config/customise";
import { getInvite, type Invite } from "@/data/invites";
import { useFitScript } from "./fit";
import { OpenedContext, PreviewContext } from "./opened";
import { themes } from "./registry";

/**
 * A miniature, non-interactive invitation for phone mockups on the marketing site.
 * With `loop`, it cycles: sealed → opening → hero, and repeats while on screen.
 */
export function InvitePreview({
  slug,
  invite: given,
  loop = true,
  offset = 0,
  stage = "closed",
  names,
}: {
  slug?: string;
  // Render this invite instead of looking up a demo by slug (used by the order form's live preview).
  invite?: Invite;
  loop?: boolean;
  offset?: number;
  stage?: "closed" | "open";
  // Swap in a visitor's own names, in display order.
  names?: [string, string];
}) {
  const base = given ?? getInvite(slug ?? "")!;
  const invite = useMemo(() => {
    if (!names) return base;
    const [first, second] = names;
    const lead = base.lead === "groom" ? "groom" : "bride";
    const other = lead === "groom" ? "bride" : "groom";
    return { ...base, [lead]: { ...base[lead], first }, [other]: { ...base[other], first: second } };
  }, [base, names]);
  const theme = themes[invite.template];
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const [cycle, setCycle] = useState(0);
  const [opened, setOpened] = useState(stage === "open");
  const [gone, setGone] = useState(stage === "open");
  useFitScript(ref, [invite, cycle, opened]);

  useEffect(() => {
    if (!loop || !inView) return;
    const timers = [
      window.setTimeout(() => setOpened(true), 2200 + offset),
      window.setTimeout(() => setGone(true), 4800 + offset),
      window.setTimeout(() => {
        setOpened(false);
        setGone(false);
        setCycle((c) => c + 1);
      }, 10500 + offset),
    ];
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [loop, inView, cycle, offset]);

  return (
    <PreviewContext.Provider value={true}>
    <OpenedContext.Provider value={opened}>
      <div
        ref={ref}
        style={{ ...theme.vars, ...fontVars(invite.font), ["--screen-h" as string]: "100%" }}
        className={`@container pointer-events-none relative h-full w-full overflow-hidden select-none ${theme.root}`}
        aria-hidden
      >
        <theme.Backdrop />
        <div key={cycle} className="relative h-full">
          <theme.Hero invite={invite} />
        </div>
        {!gone && (
          <div className="absolute inset-0">
            <theme.Opening invite={invite} opened={opened} onOpen={() => {}} />
          </div>
        )}
      </div>
    </OpenedContext.Provider>
    </PreviewContext.Provider>
  );
}
