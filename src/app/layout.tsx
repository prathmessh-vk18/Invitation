import type { Metadata, Viewport } from "next";
import { fontVars } from "@/lib/fonts";
import { site } from "@/config/site";
import "./globals.css";

export const metadata: Metadata = {
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
