import type { Metadata } from "next";
import { Suspense } from "react";
import { MarathiInvite } from "./MarathiInvite";

// A private preview of the Marathi design while it is built (branch marathi-template). Not linked anywhere.
export const metadata: Metadata = { title: "Marathi design preview", robots: { index: false, follow: false } };

async function Preview({ searchParams }: { searchParams: Promise<{ font?: string }> }) {
  return <MarathiInvite font={(await searchParams).font} />;
}

export default function Page({ searchParams }: PageProps<"/lab/marathi">) {
  return (
    <Suspense>
      <Preview searchParams={searchParams as Promise<{ font?: string }>} />
    </Suspense>
  );
}
