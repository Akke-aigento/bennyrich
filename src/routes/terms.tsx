import { createFileRoute } from "@tanstack/react-router";
import { EditorialPage, Section, P, Signature } from "@/components/site/EditorialPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Zona Dorata" },
      { name: "description", content: "The terms governing your use of the Zona Dorata website and all purchases made through our online store." },
      { property: "og:title", content: "Terms & Conditions — Zona Dorata" },
      { property: "og:description", content: "Terms governing the Zona Dorata website and online store." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://zona-dorata.lovable.app/terms" },
    ],
    links: [{ rel: "canonical", href: "https://zona-dorata.lovable.app/terms" }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <EditorialPage title="Terms & Conditions" subtitle="Last Updated: July 2026">
      <Section>
        <P>
          Welcome to Zona Dorata. By accessing our website or purchasing our products, you agree to the
          following Terms & Conditions.
        </P>
      </Section>

      <Section heading="1. General">
        <P>
          These Terms & Conditions govern your use of the Zona Dorata website and all purchases made
          through our online store. If you do not agree with these terms, please do not use our website.
        </P>
      </Section>

      <Section heading="2. Products">
        <P>
          We strive to ensure that all product descriptions, images, and pricing are accurate. However,
          we reserve the right to correct errors, update information, or discontinue products at any
          time without prior notice.
        </P>
      </Section>

      <Section heading="3. Orders">
        <P>By placing an order, you confirm that:</P>
        <P>You are at least 18 years old or have permission from a parent or legal guardian.</P>
        <P>The information you provide is accurate and complete.</P>
        <P>
          We reserve the right to refuse or cancel any order in cases of suspected fraud, pricing
          errors, or product availability issues.
        </P>
      </Section>

      <Section heading="4. Pricing & Payment">
        <P>
          All prices are displayed in the applicable currency and include taxes where required by law
          unless stated otherwise. Payments are processed securely through trusted third-party payment
          providers.
        </P>
      </Section>

      <Section heading="5. Shipping">
        <P>
          Shipping times are estimates and may vary depending on destination, customs processing, and
          carrier delays. Zona Dorata is not responsible for delays caused by shipping carriers or
          circumstances beyond our control.
        </P>
      </Section>

      <Section heading="6. Returns & Refunds">
        <P>
          Returns are accepted in accordance with our Shipping & Returns Policy. Returned items must be
          unused, in their original condition, and include all original packaging. Certain products,
          such as opened fragrances, may not be eligible for return for hygiene reasons unless
          defective.
        </P>
      </Section>

      <Section heading="7. Intellectual Property">
        <P>
          All content on the Zona Dorata website—including logos, designs, images, product names, text,
          graphics, and branding—is the property of Zona Dorata and may not be copied, reproduced,
          distributed, or used without prior written permission.
        </P>
      </Section>

      <Section heading="8. Limitation of Liability">
        <P>
          Zona Dorata shall not be liable for any indirect, incidental, or consequential damages arising
          from the use of our website or products, except where liability cannot be excluded under
          applicable law.
        </P>
      </Section>

      <Section heading="9. Privacy">
        <P>
          Your use of our website is also governed by our Privacy Policy, which explains how we collect,
          use, and protect your personal information.
        </P>
      </Section>

      <Section heading="10. Changes to These Terms">
        <P>
          We reserve the right to update or modify these Terms & Conditions at any time. Changes become
          effective once published on this website.
        </P>
      </Section>

      <Section heading="11. Contact">
        <P>
          If you have any questions regarding these Terms & Conditions, please contact our customer
          support team.
        </P>
      </Section>

      <Signature>Zona Dorata</Signature>
    </EditorialPage>
  );
}