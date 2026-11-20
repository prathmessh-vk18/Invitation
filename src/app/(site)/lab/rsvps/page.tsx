import type { Metadata } from "next";
import { RsvpDashboard } from "./RsvpDashboard";

export const metadata: Metadata = { title: "Your RSVPs (preview)", robots: { index: false, follow: false } };

/** A preview of the couple's RSVP page, with sample guests, before it's built for real. */
export default function RsvpPreviewPage() {
  return <RsvpDashboard />;
}
