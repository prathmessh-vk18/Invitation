import type { Metadata } from "next";
import { Container, Heading, Lead, Panel } from "@/ui";
import { EditLookup } from "./EditLookup";

export const metadata: Metadata = {
  title: "Edit your order",
  description: "Change the details on your Aavjoo wedding invite.",
  alternates: { canonical: "/edit" },
  robots: { index: false },
};

export default function EditOrderPage() {
  return (
    <Container className="max-w-[560px] py-14 sm:py-20">
      <Heading as="h2" muted="Find your order to change your details.">
        Edit your order.
      </Heading>
      <Lead className="mt-3">Changes to a live invite go to us for a quick check, then update the same link.</Lead>
      <Panel tone="surface" className="mt-8 border border-line p-6 sm:p-7">
        <EditLookup />
      </Panel>
    </Container>
  );
}
