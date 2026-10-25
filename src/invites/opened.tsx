"use client";

import { createContext, useContext } from "react";

// Whether the invitation's opening animation has completed — heroes wait for this before animating in.
export const OpenedContext = createContext(true);
export const useOpened = () => useContext(OpenedContext);
