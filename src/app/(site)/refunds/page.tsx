import { site } from "@/config/site";
import { LegalPage } from "@/site/legal";

export const metadata = {
  title: "Refund policy",
  description:
    "Aavjoo's refund policy for digital wedding invitations: all sales are final, with changes included.",
  alternates: { canonical: "/refunds" },
};

export default function RefundsPage() {
  return (
    <LegalPage title="Refund policy" updated="30 October 2026">
      <div>
        <h2>All sales are final</h2>
        <p>
          Your invite goes live the moment your payment is confirmed, so
          payments can&rsquo;t be refunded or cancelled once made.
        </p>
      </div>
      <div>
        <h2>Changes instead</h2>
        <p>
          Your {site.revisionRounds} rounds of changes are always included. Ask
          for them from your order page and we&rsquo;ll keep working until the
          details are right.
        </p>
      </div>
      <div>
        <h2>If something goes wrong with a payment</h2>
        <p>
          If you&rsquo;re charged twice for the same order, or we can&rsquo;t
          deliver your invite after you&rsquo;ve paid, we return the extra or
          full amount to the original payment method within 7 working days.
        </p>
      </div>
      <div>
        <h2>How to reach us</h2>
        <p>
          Message us on WhatsApp at {site.whatsappDisplay} or email {site.email}
          .
        </p>
      </div>
    </LegalPage>
  );
}
