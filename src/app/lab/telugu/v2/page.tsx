import type { Metadata } from "next";
import { TeluguInviteV2 } from "./TeluguInviteV2";

// Saved alternative of the Telugu design: the walking-couple opening (concept v2). Not linked anywhere.
export const metadata: Metadata = { title: "Telugu design preview (v2)", robots: { index: false, follow: false } };

export default function Page() {
  return <TeluguInviteV2 />;
}
