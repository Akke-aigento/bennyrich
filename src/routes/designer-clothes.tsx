import { createFileRoute } from "@tanstack/react-router";
import { CategoryProductsPage } from "@/components/site/CategoryProductsPage";

export const Route = createFileRoute("/designer-clothes")({
  head: () => ({
    meta: [
      { title: "Designer Clothes — Zona Dorata" },
      { name: "description", content: "Designer clothes — elegance, style, identity." },
      { property: "og:title", content: "Designer Clothes — Zona Dorata" },
      { property: "og:description", content: "Designer clothes — elegance, style, identity." },
    ],
  }),
  component: () => (
    <CategoryProductsPage
      title="Designer Clothes"
      subtitle="Elegance · Style · Identity"
      categorySlug="designer-clothes"
    />
  ),
});