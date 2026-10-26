import type { Metadata } from "next";
import { FullPreview } from "./FullPreview";

export const metadata: Metadata = { title: "Invite preview", robots: { index: false, follow: false } };

/** Opened inside the order form's preview popup. On its own it shows nothing. */
export default function PreviewPage() {
  return <FullPreview />;
}
