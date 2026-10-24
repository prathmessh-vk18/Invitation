import { Footer, Header, WhatsAppFab } from "@/site/chrome";
import { OfferBar } from "@/site/offer";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <OfferBar />
      <Header />
      <main className="overflow-x-clip">{children}</main>
      <Footer />
      <WhatsAppFab />
    </>
  );
}
