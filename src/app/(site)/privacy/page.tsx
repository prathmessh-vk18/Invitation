import { site } from "@/config/site";
import { LegalPage } from "@/site/legal";

export const metadata = { title: "Privacy policy", description: "How Aavjoo handles the details and photos you share for your wedding invitation.", alternates: { canonical: "/privacy" } };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy" updated="18 October 2026">
      <div>
        <h2>What we collect</h2>
        <p>To make your invitation we collect what you send us: names, family details, event dates, venues, photos and music. When guests RSVP, their reply goes to the WhatsApp number you choose; we do not store it.</p>
      </div>
      <div>
        <h2>How we use it</h2>
        <ul>
          <li>To design, publish and update your invitation.</li>
          <li>To contact you about your order on WhatsApp or email.</li>
          <li>We never sell your information or use your photos in our marketing without written permission.</li>
        </ul>
      </div>
      <div>
        <h2>Who can see your invitation</h2>
        <p>Anyone with the link can open your invitation. We don&rsquo;t list invitations publicly. Tell us if you&rsquo;d like yours taken down at any time.</p>
      </div>
      <div>
        <h2>Contact</h2>
        <p>
          Questions about your data: {site.email} or WhatsApp {site.whatsappDisplay}.
        </p>
      </div>
    </LegalPage>
  );
}
