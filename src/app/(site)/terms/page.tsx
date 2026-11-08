import { formatINR, site } from "@/config/site";
import { LegalPage } from "@/site/legal";

export const metadata = { title: "Terms", description: "Terms of service for Aavjoo digital wedding invitations.", alternates: { canonical: "/terms" } };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of service" updated="18 October 2026">
      <div>
        <h2>The service</h2>
        <p>
          {site.name} designs and hosts invitation websites. Each order includes delivery within {site.deliveryDays} days of receiving your complete details and{" "}
          {site.revisionRounds} free edits after your invite is published. After those, you can buy {site.editPack.edits} more edits for {formatINR(site.editPack.price)}{" "}
          at a time from your order page. Edits that replace both names or move the wedding by months are checked by us before they go live.
        </p>
      </div>
      <div>
        <h2>Your content</h2>
        <p>You confirm you have the right to use the names, photos and music you send us. You keep ownership of your content; we use it only to make your invitation.</p>
      </div>
      <div>
        <h2>Our designs</h2>
        <p>Template designs, artwork and code remain ours. Your invitation is licensed for your personal use.</p>
      </div>
      <div>
        <h2>Availability</h2>
        <p>We keep invitation links live for life on a best-effort basis and will tell you in advance if anything changes.</p>
      </div>
    </LegalPage>
  );
}
