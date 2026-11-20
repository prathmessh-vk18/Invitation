import type { Metadata } from "next";
import { Ideas } from "./Ideas";

// Temporary: three scratch-to-reveal ideas for the Marathi design, to pick from. Not linked anywhere.
export const metadata: Metadata = { title: "Marathi scratch ideas", robots: { index: false, follow: false } };

export default function Page() {
  return <Ideas />;
}
