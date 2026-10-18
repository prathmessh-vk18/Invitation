import { Footer, Header, WhatsAppFab } from "@/site/chrome";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Header />
      <main className="overflow-x-clip">{children}</main>
      <Footer />
      <WhatsAppFab />
    </>
  );
}
