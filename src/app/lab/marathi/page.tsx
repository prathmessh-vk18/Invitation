import type { Metadata } from "next";
import { MarathiIntros } from "./MarathiIntros";

// A private test page for the Marathi design's opening (branch marathi-template). Not linked anywhere.
export const metadata: Metadata = { title: "Marathi intro concepts", robots: { index: false, follow: false } };

export default function Page() {
  return <MarathiIntros />;
}
