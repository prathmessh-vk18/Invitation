"use client";

import { useEffect, useRef, useState } from "react";
import { fontVars } from "@/config/customise";
import type { Invite } from "@/data/invites";
import { useFitScript } from "./fit";
import { OpenedContext, PreviewContext } from "./opened";
import { themes } from "./registry";
import { Gallery, Rsvp } from "./shared";

export type PreviewPart = "events" | "wording" | "gallery" | "rsvp";

/**
 * One part of the invitation inside a phone mockup, for the order form: the part the couple
 * is filling in right now. It scrolls inside the phone; `eventIndex` brings that function's card into view.
 */
export function SectionPreview({ invite, part, eventIndex }: { invite: Invite; part: PreviewPart; eventIndex?: number }) {
  const theme = themes[invite.template];
  const ref = useRef<HTMLDivElement>(null);
  useFitScript(ref, [invite, part]);
  // Backdrops fill one screen: here, the phone's, not the browser window's.
  const [screenH, setScreenH] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScreenH(el.clientHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Keep the function being edited in view.
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (part !== "events" || eventIndex === undefined) {
      root.scrollTo({ top: 0 });
      return;
    }
    const card = root.querySelectorAll<HTMLElement>("[data-event-actions]")[eventIndex];
    if (!card) return;
    const top = card.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop;
    root.scrollTo({ top: Math.max(0, top - root.clientHeight * 0.65), behavior: "smooth" });
  }, [part, eventIndex, invite.events.length]);

  const body = {
    events: <theme.Events invite={invite} />,
    wording: (
      <>
        <theme.Blessing invite={invite} />
        <theme.Closing invite={invite} />
      </>
    ),
    gallery: <Gallery invite={invite} theme={theme} />,
    rsvp: (
      <>
        <Rsvp invite={invite} theme={theme} />
        <theme.Closing invite={invite} />
      </>
    ),
  }[part];

  return (
    <PreviewContext.Provider value={true}>
    <OpenedContext.Provider value={true}>
      <div
        ref={ref}
        style={{ ...theme.vars, ...fontVars(invite.font), ...(screenH ? { ["--screen-h" as string]: `${screenH}px` } : {}) }}
        className={`@container no-scrollbar relative h-full w-full overflow-x-hidden overflow-y-auto overscroll-contain select-none ${theme.root}`}
        aria-hidden
      >
        <div className="pointer-events-none relative min-h-full">
          <theme.Backdrop />
          {/* Room for the corner art most designs draw at the top of the screen. */}
          <div className="relative pt-[14cqw]">{body}</div>
        </div>
      </div>
    </OpenedContext.Provider>
    </PreviewContext.Provider>
  );
}
