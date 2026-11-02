"use client";

import { createContext, useContext } from "react";

// Whether the invitation's opening animation has completed — heroes wait for this before animating in.
export const OpenedContext = createContext(true);
export const useOpened = () => useContext(OpenedContext);

// True inside the small phone previews on the marketing site, where heroes render as one still screen.
export const PreviewContext = createContext(false);
export const usePreview = () => useContext(PreviewContext);

// Image `sizes` for a design's art inside those previews: the phones are at most 230px wide, so
// they needn't fetch the full-screen art a guest's phone gets. Previews also skip `priority`,
// so a gallery of them loads each phone's art as it scrolls into view.
export const PREVIEW_ART_SIZES = "240px";
export const INVITE_ART_SIZES = "(max-width: 480px) 100vw, 480px";
