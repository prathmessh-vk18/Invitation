import { site } from "@/config/site";
import { LegalPage } from "@/site/legal";

export const metadata = { title: "Privacy policy", description: "How Aavjoo handles the details and photos you share for your wedding invitation.", alternates: { canonical: "/privacy" } };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy policy" updated="28 October 2026">
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
        <h2>Analytics and cookies</h2>
        <p>
          To understand how people find and use {site.name}, we use Google Analytics, which sets cookies in your browser and records things like the pages
          you visit, the device and browser you use, and roughly where you are (city or country). It doesn&rsquo;t receive your name, phone number or the
          details of your invitation. We also use Vercel Analytics, which counts visits without cookies. You can block or delete cookies in your browser
          settings, or use Google&rsquo;s{" "}
          <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noreferrer">
            opt-out add-on
          </a>
          .
        </p>
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
