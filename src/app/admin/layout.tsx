import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="min-h-svh bg-surface">
      <Suspense fallback={<div className="min-h-svh bg-surface" />}>{children}</Suspense>
    </div>
  );
}
