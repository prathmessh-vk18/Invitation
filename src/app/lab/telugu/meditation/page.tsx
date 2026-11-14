import type { Metadata } from "next";
import { TeluguInviteMeditation } from "./TeluguInviteMeditation";

// Saved alternative of the Telugu design: the meditation-in-the-halo opening. Not linked anywhere.
export const metadata: Metadata = { title: "Telugu design preview (meditation)", robots: { index: false, follow: false } };

export default function Page() {
  return <TeluguInviteMeditation />;
}
