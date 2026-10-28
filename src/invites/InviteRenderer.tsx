"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { fontVars, shows } from "@/config/customise";
import type { Invite } from "@/data/invites";
import { withMapLinks } from "@/lib/format";
import { useFitScript } from "./fit";
import { useInviteMusic } from "./music";
import { LangContext, langOf, langVars } from "./i18n";
import { OpenedContext } from "./opened";
import { themes } from "./registry";
import { ScratchDate } from "./scratch";
import { Countdown, Gallery, MusicToggle, Rsvp, Story } from "./shared";

export function InviteRenderer({ invite: given }: { invite: Invite }) {
  const invite = useMemo(() => withMapLinks(given), [given]);
  const theme = themes[invite.template];
  const [opened, setOpened] = useState(false);
  const [gone, setGone] = useState(false);
  const music = useInviteMusic(invite.music);
  const rootRef = useRef<HTMLDivElement>(null);
  useFitScript(rootRef, [invite, opened]);

  useEffect(() => {
    document.documentElement.style.overflow = opened ? "" : "hidden";
    if (!opened) return;
    const t = window.setTimeout(() => setGone(true), 1900);
    return () => window.clearTimeout(t);
  }, [opened]);

  const open = () => {
    setOpened(true);
    music.play();
  };

  // Everything after the cover, in order.
  const sections = [
    <theme.Blessing key="blessing" invite={invite} />,
    <theme.Divider key="divider" />,
    shows(invite, "scratch") && <ScratchDate key="scratch" invite={invite} theme={theme} />,
    shows(invite, "countdown") && <Countdown key="countdown" invite={invite} theme={theme} />,
    <theme.Events key="events" invite={invite} />,
    <Story key="story" invite={invite} theme={theme} />,
    shows(invite, "gallery") && <Gallery key="gallery" invite={invite} theme={theme} />,
    shows(invite, "rsvp") && <Rsvp key="rsvp" invite={invite} theme={theme} />,
    <theme.Closing key="closing" invite={invite} />,
  ].filter(Boolean);

  return (
    <LangContext.Provider value={langOf(invite)}>
    <OpenedContext.Provider value={opened}>
      <div ref={rootRef} lang={langOf(invite)} style={{ ...theme.vars, ...fontVars(invite.font), ...langVars(langOf(invite)) }} className={`${theme.root} min-h-svh`}>
        <main className="@container relative mx-auto w-full max-w-[480px] overflow-x-clip shadow-[0_0_80px_rgba(0,0,0,.25)]">
          <theme.Backdrop />
          <div className="relative">
            <theme.Hero invite={invite} />
            {sections}
          </div>
        </main>

        {opened && theme.Frame && (
          <div className="pointer-events-none fixed inset-0 z-30 flex justify-center">
            <div className="relative h-full w-full max-w-[480px]">
              <theme.Frame />
            </div>
          </div>
        )}

        {opened && (
          <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center">
            <div className="relative w-full max-w-[480px]">
              <MusicToggle
                playing={music.playing}
                onToggle={music.toggle}
                className={`pointer-events-auto absolute right-4 bottom-4 grid size-11 place-items-center rounded-full shadow-lg backdrop-blur ${theme.ui.tile}`}
              />
            </div>
          </div>
        )}

        {!gone && (
          <div className={`fixed inset-0 z-50 flex justify-center ${opened ? "pointer-events-none" : ""}`}>
            <div className="@container relative h-full w-full max-w-[480px]">
              <theme.Opening invite={invite} opened={opened} onOpen={open} />
            </div>
          </div>
        )}
      </div>
    </OpenedContext.Provider>
    </LangContext.Provider>
  );
}
