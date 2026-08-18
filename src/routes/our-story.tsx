import { createFileRoute } from "@tanstack/react-router";
import { EditorialPage, Section, P, GoldStatement } from "@/components/site/EditorialPage";

export const Route = createFileRoute("/our-story")({
  head: () => ({
    meta: [
      { title: "Our Story — Zona Dorata" },
      { name: "description", content: "Zona Dorata began with a simple belief: no one is born to live an average life." },
      { property: "og:title", content: "Our Story — Zona Dorata" },
      { property: "og:description", content: "The story behind the Golden Zone." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://zona-dorata.lovable.app/our-story" },
    ],
    links: [{ rel: "canonical", href: "https://zona-dorata.lovable.app/our-story" }],
  }),
  component: OurStoryPage,
});

function OurStoryPage() {
  return (
    <EditorialPage title="Our Story">
      <Section>
        <P>Zona Dorata began with a simple belief: no one is born to live an average life.</P>
        <P>
          What started as an idea quickly became a mission—to create a brand that represents ambition,
          confidence, and the pursuit of something greater. We wanted more than products; we wanted
          every item to carry meaning and remind people to keep moving toward their goals.
        </P>
        <P>
          From fragrances to clothing and accessories, every collection is created with the same
          purpose: to combine premium quality with a mindset that inspires growth, discipline, and
          individuality.
        </P>
        <P>
          The name Zona Dorata, meaning "Golden Zone," represents the place where vision meets action.
          It's the mindset of stepping beyond comfort, embracing challenges, and building the life you
          truly want.
        </P>
        <P>
          Today, Zona Dorata is more than a lifestyle brand. It is a community of entrepreneurs,
          creators, athletes, and dreamers who refuse to settle for ordinary.
        </P>
        <P>This is only the beginning.</P>
      </Section>
      <GoldStatement>Welcome to the Golden Zone.</GoldStatement>
    </EditorialPage>
  );
}