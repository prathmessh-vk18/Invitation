import type { Metadata } from "next";
import { TeluguInvite } from "./TeluguInvite";

// A private preview of the Telugu design for one client (branch telugu-template). Not linked anywhere.
export const metadata: Metadata = { title: "Telugu design preview", robots: { index: false, follow: false } };

export default function Page() {
  return <TeluguInvite />;
}
