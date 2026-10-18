"use client";

import { useEffect, useState } from "react";
import { getInvite } from "@/data/invites";
import { useInviteMusic } from "./music";
import { OpenedContext } from "./opened";
import { themes } from "./registry";
import { Countdown, Gallery, MusicToggle, Rsvp, Story } from "./shared";

export function InviteRenderer({ slug }: { slug: string }) {
  const invite = getInvite(slug)!;
  const theme = themes[invite.template];
  const [opened, setOpened] = useState(false);
  const [gone, setGone] = useState(false);
  const music = useInviteMusic(invite.music);

  useEffect(() => {
    document.documentElement.style.overflow = opened ? "" : "hidden";
    if (!opened) return;
    const t = window.setTimeout(() => setGone(true), 2600);
    return () => window.clearTimeout(t);
  }, [opened]);

  const open = () => {
    setOpened(true);
    music.play();
  };

  return (
    <OpenedContext.Provider value={opened}>
      <div style={theme.vars} className={`${theme.root} min-h-svh`}>
        <main className="@container relative mx-auto w-full max-w-[480px] overflow-x-clip shadow-[0_0_80px_rgba(0,0,0,.25)]">
          <theme.Backdrop />
          <div className="relative">
            <theme.Hero invite={invite} />
            <theme.Blessing invite={invite} />
            <theme.Divider />
            <Countdown invite={invite} theme={theme} />
            <theme.Events invite={invite} />
            <Story invite={invite} theme={theme} />
            <Gallery invite={invite} theme={theme} />
            <Rsvp invite={invite} theme={theme} />
            <theme.Closing invite={invite} />
          </div>
        </main>

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
          <div className="fixed inset-0 z-50 flex justify-center">
            <div className="@container relative h-full w-full max-w-[480px]">
              <theme.Opening invite={invite} opened={opened} onOpen={open} />
            </div>
          </div>
        )}
      </div>
    </OpenedContext.Provider>
  );
}
