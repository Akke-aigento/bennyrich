import { createFileRoute } from "@tanstack/react-router";
import { ArticlePage, Section, P, List, Signature } from "@/components/site/PageShell";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — BennyRich" },
      { name: "description", content: "How BennyRich collects, uses and safeguards your personal information." },
      { property: "og:title", content: "Privacy Policy — BennyRich" },
      { property: "og:description", content: "How we collect, use and safeguard your data." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  return (
    <ArticlePage title="Privacy Policy" eyebrow="Last Updated: July 2026">
      <Section>
        <P>
          At BennyRich, we value your privacy and are committed to protecting your personal
          information. This Privacy Policy explains how we collect, use, and safeguard your data when
          you visit our website or make a purchase.
        </P>
      </Section>

      <Section heading="Information We Collect">
        <P>We may collect the following information:</P>
        <List
          items={[
            "Name",
            "Email address",
            "Shipping and billing address",
            "Phone number",
            "Payment information (processed securely by our payment providers)",
            "Order history",
            "Device and browser information",
            "Cookies and website usage data",
          ]}
        />
      </Section>

      <Section heading="How We Use Your Information">
        <P>Your information is used to:</P>
        <List
          items={[
            "Process and deliver your orders",
            "Provide customer support",
            "Send order confirmations and shipping updates",
            "Improve our website and services",
            "Prevent fraud and enhance security",
            "Send marketing emails (only if you have opted in)",
          ]}
        />
      </Section>

      <Section heading="Payment Security">
        <P>
          We do not store your full payment card details. All payments are processed securely through
          trusted third-party payment providers using industry-standard encryption.
        </P>
      </Section>

      <Section heading="Cookies">
        <P>
          Our website uses cookies to improve your browsing experience, analyze website traffic, and
          personalize content. You can manage or disable cookies through your browser settings.
        </P>
      </Section>

      <Section heading="Sharing Your Information">
        <P>We do not sell your personal information.</P>
        <P>
          We only share your information with trusted service providers who help us operate our
          business, including payment processors, shipping partners, and website service providers,
          when necessary to fulfill your order or provide our services.
        </P>
      </Section>

      <Section heading="Your Rights">
        <P>Depending on your location, you may have the right to:</P>
        <List
          items={[
            "Access your personal data",
            "Correct inaccurate information",
            "Request deletion of your data",
            "Object to certain processing activities",
            "Withdraw consent for marketing communications at any time",
          ]}
        />
        <P>To exercise these rights, please contact us.</P>
      </Section>

      <Section heading="Data Security">
        <P>
          We use appropriate technical and organizational measures to protect your personal information
          against unauthorized access, loss, misuse, or disclosure.
        </P>
      </Section>

      <Section heading="Changes to This Policy">
        <P>
          We may update this Privacy Policy from time to time. Any changes will be posted on this page
          with the updated revision date.
        </P>
      </Section>

      <Section heading="Contact Us">
        <P>
          If you have any questions regarding this Privacy Policy or how we handle your personal
          information, please contact our customer support team.
        </P>
      </Section>

      <Signature>BennyRich</Signature>
    </ArticlePage>
  );
}