import { createFileRoute } from "@tanstack/react-router";
import { ArticlePage, Section, P, List, Signature } from "@/components/site/PageShell";

export const Route = createFileRoute("/shipping-returns")({
  head: () => ({
    meta: [
      { title: "Shipping & Returns — BennyRich" },
      { name: "description", content: "Shipping times, returns within 14 days, beverage policy and refunds at BennyRich." },
      { property: "og:title", content: "Shipping & Returns — BennyRich" },
      { property: "og:description", content: "How we ship your order and how returns work." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ShippingReturnsPage,
});

function ShippingReturnsPage() {
  return (
    <ArticlePage title="Shipping & Returns">
      <Section heading="Shipping">
        <P>We are committed to delivering your order as quickly and securely as possible.</P>
        <P>Orders are processed within 1–3 business days.</P>
        <P>
          Once your order has been shipped, you will receive a confirmation email with tracking
          information.
        </P>
        <P>
          Delivery times vary depending on your location and shipping method selected at checkout.
        </P>
        <P>
          Please note that delivery times may be affected by holidays, customs processing, or
          unforeseen carrier delays.
        </P>
      </Section>

      <Section heading="Returns">
        <P>Your satisfaction is important to us.</P>
        <P>Returns are accepted within 14 days of receiving your order.</P>
        <P>
          Items must be unused, in their original condition, and returned with all original packaging.
        </P>
        <P>Products that have been worn, damaged, or altered cannot be returned.</P>
      </Section>

      <Section heading="Beverages">
        <P>
          For safety and legal reasons, bottled products can only be returned if unopened with the
          original seal intact, unless the item arrives damaged or defective. Alcohol is sold to
          customers aged 18 and over only.
        </P>
      </Section>

      <Section heading="Refunds">
        <P>
          Once your return has been received and inspected, we will notify you of the outcome. If
          approved, your refund will be processed to your original payment method.
        </P>
      </Section>

      <Section heading="Need Help?">
        <P>
          If you have any questions about your order, shipping, or returns, our support team is here to
          help. Contact us anytime, and we'll be happy to assist you.
        </P>
      </Section>
    </ArticlePage>
  );
}