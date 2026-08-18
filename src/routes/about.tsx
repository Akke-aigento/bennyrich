import { createFileRoute } from "@tanstack/react-router";
import { EditorialPage, Section, P, GoldStatement, Signature } from "@/components/site/EditorialPage";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Zona Dorata" },
      { name: "description", content: "More than a brand. Zona Dorata is built for people who refuse to settle for an average life." },
      { property: "og:title", content: "About — Zona Dorata" },
      { property: "og:description", content: "More than a brand. Built for people who refuse to settle for an average life." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://zona-dorata.lovable.app/about" },
    ],
    links: [{ rel: "canonical", href: "https://zona-dorata.lovable.app/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <EditorialPage title="About Zona Dorata">
      <Section heading="More Than a Brand">
        <P>Zona Dorata was built for people who refuse to settle for an average life.</P>
        <P>
          We create premium products that represent ambition, discipline, freedom, and the courage to
          follow your own path. Every collection is designed to remind you that success isn't
          given—it's earned.
        </P>
        <P>
          Our mission is simple: inspire a generation to think bigger, work harder, and build a life
          they are proud of.
        </P>
      </Section>

      <Section heading="Our Philosophy">
        <P>We don't believe in following the crowd.</P>
        <P>
          We believe in creating your own rules, taking calculated risks, and becoming the best
          version of yourself.
        </P>
        <P>
          Whether it's our fragrances, clothing, jewelry, or future collections, every product carries
          the same message:
        </P>
        <P>Live with purpose. Build your legacy.</P>
      </Section>

      <Section heading="Quality First">
        <P>
          Every Zona Dorata product is carefully selected and designed with attention to quality,
          detail, and timeless style.
        </P>
        <P>We believe luxury isn't about showing wealth.</P>
        <P>Luxury is about having standards.</P>
      </Section>

      <Section heading="Our Community">
        <P>
          Zona Dorata is for entrepreneurs, dreamers, creators, athletes, and everyone chasing
          something greater.
        </P>
        <P>It doesn't matter where you come from.</P>
        <P>It matters where you're going.</P>
      </Section>

      <Section heading="Our Vision">
        <P>
          Our vision is to become one of the world's most recognizable lifestyle brands, known for
          products that combine premium quality with a powerful mindset.
        </P>
        <P>We are building more than a company.</P>
        <P>We are building a movement.</P>
      </Section>

      <GoldStatement>NO LIMITS. NO AVERAGE. ONLY LEGACY.</GoldStatement>
      <Signature>Zona Dorata</Signature>
    </EditorialPage>
  );
}