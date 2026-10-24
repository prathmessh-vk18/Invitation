import type { Metadata, Viewport } from "next";
import { fontVars } from "@/lib/fonts";
import { site } from "@/config/site";
import "./globals.css";

export const metadata: Metadata = {
  // Absolute URLs for link previews (WhatsApp, Instagram) use the live domain.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://aavjoo.in"),
  title: {
    default: `${site.name} — Designer Wedding Invitation Websites`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
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
