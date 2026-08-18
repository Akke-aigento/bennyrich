import { createFileRoute } from "@tanstack/react-router";
import { EditorialPage, Section, P, GoldStatement } from "@/components/site/EditorialPage";

export const Route = createFileRoute("/craftsmanship")({
  head: () => ({
    meta: [
      { title: "Craftsmanship — Zona Dorata" },
      { name: "description", content: "Premium materials, refined detail and timeless design — the standard behind everything we create." },
      { property: "og:title", content: "Craftsmanship — Zona Dorata" },
      { property: "og:description", content: "Built with precision. Designed with purpose." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://zona-dorata.lovable.app/craftsmanship" },
    ],
    links: [{ rel: "canonical", href: "https://zona-dorata.lovable.app/craftsmanship" }],
  }),
  component: CraftsmanshipPage,
});

function CraftsmanshipPage() {
  return (
    <EditorialPage title="Craftsmanship">
      <Section>
        <P>
          At Zona Dorata, craftsmanship is more than the way a product is made—it's the standard behind
          everything we create.
        </P>
        <P>
          We carefully select premium materials, refine every detail, and focus on timeless design to
          ensure each product delivers both quality and durability. From the first concept to the final
          finish, every decision is made with precision and purpose.
        </P>
        <P>
          We believe true luxury is found in thoughtful design, exceptional quality, and products that
          stand the test of time—not in excess.
        </P>
        <P>
          Our commitment is simple: create products that look exceptional, feel premium, and are made to
          be part of your journey for years to come.
        </P>
      </Section>
      <GoldStatement>
        Built with precision. Designed with purpose. Made for those who demand more.
      </GoldStatement>
    </EditorialPage>
  );
}