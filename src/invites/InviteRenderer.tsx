"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { fontVars, isScriptFont, shows } from "@/config/customise";
import type { Invite } from "@/data/invites";
import { withMapLinks } from "@/lib/format";
import { useFitScript } from "./fit";
import { useInviteMusic } from "./music";
import { LangContext, WordsContext, langOf, langVars, wordsOf } from "./i18n";
import { OpenedContext } from "./opened";
import { themes } from "./registry";
import { ScrollHint, TapHint } from "./hints";
import { maroonDoors as MaroonDoors } from "./mandir";
import { ScratchDate } from "./scratch";
import { Contacts, Countdown, Gallery, MusicToggle, Rsvp, Story } from "./shared";

/** `editing`: the couple's editor, which skips the opening and puts an edit button on each section. */
export function InviteRenderer({ invite: given, editing }: { invite: Invite; editing?: boolean }) {
  const invite = useMemo(() => withMapLinks(given), [given]);
  const theme = themes[invite.template];
  const [opened, setOpened] = useState(!!editing);
  const [gone, setGone] = useState(!!editing);
  const music = useInviteMusic(invite.music);
  const rootRef = useRef<HTMLDivElement>(null);
  useFitScript(rootRef, [invite, opened]);

  useEffect(() => {
    document.documentElement.style.overflow = opened ? "" : "hidden";
    if (!opened) return;
    const t = window.setTimeout(() => setGone(true), theme.openingMs ?? 1900);
    return () => window.clearTimeout(t);
  }, [opened, theme.openingMs]);

  const open = () => {
    setOpened(true);
    music.play();
  };

  // Everything after the cover, in order.
  // In the editor each part sits in a slot with its edit button; guests get the parts alone.
  const slot = (id: string, node: ReactNode) =>
    editing ? (
      <EditSlot key={id} id={id}>
        {node}
      </EditSlot>
    ) : (
      node
    );
  const sections = [
    slot("blessing", <theme.Blessing key="blessing" invite={invite} />),
    <theme.Divider key="divider" />,
    shows(invite, "scratch") && slot("scratch", theme.ScratchSection ? <theme.ScratchSection key="scratch" invite={invite} /> : <ScratchDate key="scratch" invite={invite} theme={theme} />),
    shows(invite, "countdown") && slot("countdown", theme.CountdownSection ? <theme.CountdownSection key="countdown" invite={invite} /> : <Countdown key="countdown" invite={invite} theme={theme} />),
    slot("events", <theme.Events key="events" invite={invite} />),
    <Story key="story" invite={invite} theme={theme} />,
    shows(invite, "gallery") && slot("gallery", theme.GallerySection ? <theme.GallerySection key="gallery" invite={invite} /> : <Gallery key="gallery" invite={invite} theme={theme} />),
    invite.contacts?.length ? slot("contacts", <Contacts key="contacts" invite={invite} theme={theme} />) : null,
    shows(invite, "rsvp") && slot("rsvp", <Rsvp key="rsvp" invite={invite} theme={theme} />),
    slot("closing", <theme.Closing key="closing" invite={invite} />),
  ].filter(Boolean);

  return (
    <LangContext.Provider value={langOf(invite)}>
    <WordsContext.Provider value={wordsOf(invite)}>
    <OpenedContext.Provider value={opened}>
      <div ref={rootRef} lang={langOf(invite)} data-large-text={invite.largeText ?? theme.largeText ? "" : undefined} data-bold-text={invite.boldText ?? theme.boldText ? "" : undefined} data-readable={invite.readable ?? theme.readable ? "" : undefined} data-text-scale={invite.textScale && invite.textScale !== 1 ? "" : undefined} style={{ ...theme.vars, ...(invite.textScale && invite.textScale !== 1 ? { "--text-scale": String(invite.textScale) } : {}), ...(isScriptFont(invite.scriptFont) ? { "--inv-script": `var(--font-${invite.scriptFont}), cursive` } : {}), ...fontVars(invite.font, (theme.vars as Record<string, unknown>)["--inv-script"]), ...langVars(langOf(invite)) }} className={`${theme.root} min-h-svh`}>
        <main className="@container relative mx-auto w-full max-w-[480px] overflow-x-clip shadow-[0_0_80px_rgba(0,0,0,.25)]">
          <theme.Backdrop />
          <div className="relative">
            {slot("cover", <theme.Hero invite={invite} />)}
            {sections}
            {/* In the editor, room after the end so the last lines can scroll up above its panel. */}
            {editing && <div aria-hidden style={{ height: "55vh" }} />}
          </div>
        </main>

        {opened && theme.Frame && (
          <div className="pointer-events-none fixed inset-0 z-30 flex justify-center">
            {/* A size container, so a frame drawn in cqw scales with the invite (≤480px), not the window. */}
            <div className="@container relative h-full w-full max-w-[480px] overflow-hidden">
              <theme.Frame />
            </div>
          </div>
        )}

        {/* The scroll hint and music button; the editor has its own buttons in these corners. */}
        {opened && !editing && (
          <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center">
            <div className="relative w-full max-w-[480px]">
              <ScrollHint theme={theme} ready={gone} />
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
              {invite.doors === "maroon" ? <MaroonDoors invite={invite} opened={opened} onOpen={open} /> : <theme.Opening invite={invite} opened={opened} onOpen={open} />}
              <TapHint theme={invite.doors === "maroon" ? { ...theme, tapHint: "tapDoors" } : theme} text={invite.openHint} opened={opened} onOpen={open} />
            </div>
          </div>
        )}
      </div>
    </OpenedContext.Provider>
    </WordsContext.Provider>
    </LangContext.Provider>
  );
}

/** Names of the parts, shown on the one the couple has tapped. */
const PART_NAMES: Record<string, string> = {
  cover: "Cover", blessing: "Families & message", scratch: "Save the date", countdown: "Countdown", events: "Functions",
  gallery: "Photos", contacts: "Contacts", rsvp: "RSVP", closing: "Ending",
};

/** A part of the invite in the editor: tapping anywhere on it opens its settings (see FullPreview). */
function EditSlot({ id, children }: { id: string; children: ReactNode }) {
  return (
    <div data-edit={id} data-label={PART_NAMES[id] ?? id}>
      {children}
    </div>
  );
}
