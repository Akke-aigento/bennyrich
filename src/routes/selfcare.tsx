import { createFileRoute } from "@tanstack/react-router";
import { CategoryProductsPage } from "@/components/site/CategoryProductsPage";

export const Route = createFileRoute("/selfcare")({
  head: () => ({
    meta: [
      { title: "Selfcare — Zona Dorata" },
      { name: "description", content: "Nourish your body. Elevate your routine." },
      { property: "og:title", content: "Selfcare — Zona Dorata" },
      { property: "og:description", content: "Nourish your body. Elevate your routine." },
    ],
  }),
  component: () => (
    <CategoryProductsPage
      title="Selfcare"
      subtitle="Nourish your body. Elevate your routine."
      categorySlug={["selfcare"]}
    />
  ),
});