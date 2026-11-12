import type { Metadata } from "next";
import { MarathiInvite } from "./MarathiInvite";

// A private preview of the Marathi design while it is built (branch marathi-template). Not linked anywhere.
export const metadata: Metadata = { title: "Marathi design preview", robots: { index: false, follow: false } };

export default function Page() {
  return <MarathiInvite />;
}
