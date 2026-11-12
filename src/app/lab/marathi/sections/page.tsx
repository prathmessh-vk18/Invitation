import type { Metadata } from "next";
import { MarathiSections } from "./MarathiSections";

// A private look at the whole Marathi design, section by section (branch marathi-template).
export const metadata: Metadata = { title: "Marathi design mock", robots: { index: false, follow: false } };

export default function Page() {
  return <MarathiSections />;
}
