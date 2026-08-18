import { createFileRoute } from "@tanstack/react-router";
import { CategoryProductsPage } from "@/components/site/CategoryProductsPage";

export const Route = createFileRoute("/artworks")({
  head: () => ({
    meta: [
      { title: "Artworks — Zona Dorata" },
      { name: "description", content: "Curated artworks — pieces that inspire timeless emotion." },
      { property: "og:title", content: "Artworks — Zona Dorata" },
      { property: "og:description", content: "Curated artworks — pieces that inspire timeless emotion." },
    ],
  }),
  component: () => (
    <CategoryProductsPage
      title="Artworks"
      subtitle="Pieces that inspire timeless emotion"
      categorySlug="artworks"
    />
  ),
});