import { site } from "@/config/site";
import { LegalPage } from "@/site/legal";

export const metadata = { title: "Refund policy" };

export default function RefundsPage() {
  return (
    <LegalPage title="Refund policy" updated="18 October 2026">
      <div>
        <h2>Before work starts</h2>
        <p>If you cancel before we begin designing, we refund your payment in full.</p>
      </div>
      <div>
        <h2>After work starts</h2>
        <p>
          Once your first draft has been shared, the order can&rsquo;t be refunded, but your {site.revisionRounds} rounds of changes are always included and we&rsquo;ll keep
          working until the details are right.
        </p>
      </div>
      <div>
        <h2>Custom designs</h2>
        <p>Custom invitations follow the payment schedule agreed in your quote.</p>
      </div>
      <div>
        <h2>How to ask</h2>
        <p>
          Message us on WhatsApp at {site.whatsappDisplay} or email {site.email}. Approved refunds are returned to the original payment method within 7 working days.
        </p>
      </div>
    </LegalPage>
  );
}
