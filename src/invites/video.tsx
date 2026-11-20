"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import type { Invite } from "@/data/invites";
import { couple } from "@/invites/people";

/**
 * A couple's own finished video, played full screen. Phones only start a video with sound after a
 * tap, so it opens on the poster with a tap to play; tapping again pauses, and it offers a replay
 * at the end.
 */
export function VideoInvite({
  invite,
}: {
  invite: Invite & { video: NonNullable<Invite["video"]> };
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<"ready" | "playing" | "paused" | "ended">(
    "ready",
  );
  const [a, b] = couple(invite);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused || v.ended) {
      if (v.ended) v.currentTime = 0;
      void v.play();
    } else v.pause();
  };

  return (
    <main className="relative h-svh overflow-hidden bg-[#2a0a0e]">
      {/* The poster, blurred, fills the space around the 9:16 video on screens of other shapes. */}
      <div
        aria-hidden
        className="absolute inset-0 scale-110 bg-cover bg-center opacity-50 blur-2xl"
        style={{ backgroundImage: `url(${invite.video.poster})` }}
      />
      <video
        ref={ref}
        src={invite.video.src}
        poster={invite.video.poster}
        playsInline
        // Starts downloading while the guest is still on the poster, so the tap plays without waiting.
        preload="auto"
        onPlay={() => setState("playing")}
        onPause={() => setState((s) => (s === "ended" ? s : "paused"))}
        onEnded={() => setState("ended")}
        onClick={toggle}
        className="absolute inset-0 size-full object-contain"
        aria-label={`${a.first} & ${b.first}'s wedding invitation`}
      />
      {state !== "playing" && (
        <button
          type="button"
          onClick={toggle}
          className="absolute inset-0 grid place-items-center bg-black/25"
          aria-label={state === "ended" ? "Watch again" : "Play invitation"}
        >
          <span className="flex items-center gap-2 rounded-full bg-[#fdf3dc] px-6 py-3 text-[16px] font-medium text-[#5a1520] shadow-lg">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              aria-hidden
              fill="currentColor"
            >
              <path d="M4 2.5v11l9-5.5z" />
            </svg>
            {state === "ended"
              ? "Watch again"
              : state === "paused"
                ? "Continue"
                : "Tap to open"}
          </span>
        </button>
      )}
      {!invite.noBranding && state === "ended" && (
        <Link
          href="/"
          className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[12px] text-white/60 underline underline-offset-4"
        >
          Made with Aavjoo
        </Link>
      )}
    </main>
  );
}
