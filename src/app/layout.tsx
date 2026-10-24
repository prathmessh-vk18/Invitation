import type { Metadata, Viewport } from "next";
import { fontVars } from "@/lib/fonts";
import { site } from "@/config/site";
import "./globals.css";

export const metadata: Metadata = {
  // Absolute URLs for link previews (WhatsApp, Instagram) use the live domain.
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Designer Wedding Invitation Websites`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: ["digital wedding invitation", "wedding invitation website", "e-invite", "Indian wedding invitation", "WhatsApp wedding invitation"],
  openGraph: { type: "website", siteName: site.name, locale: "en_IN" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#fbf5ec",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fontVars} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
