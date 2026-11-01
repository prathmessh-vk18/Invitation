import { ChatWidget } from "@/site/chat";
import { Footer, Header } from "@/site/chrome";
import { OfferBar } from "@/site/offer";
import { ReferralWhatsApp } from "@/site/referral";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <OfferBar />
      <Header />
      <main className="overflow-x-clip">{children}</main>
      <Footer />
      <ChatWidget />
      <ReferralWhatsApp />
    </>
  );
}
