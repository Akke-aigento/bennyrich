import { createFileRoute } from "@tanstack/react-router";
import { CategoryProductsPage } from "@/components/site/CategoryProductsPage";

export const Route = createFileRoute("/perfumes")({
  head: () => ({
    meta: [
      { title: "Perfumes — Zona Dorata" },
      { name: "description", content: "Italian luxury perfumes — scents that tell your essence." },
      { property: "og:title", content: "Perfumes — Zona Dorata" },
      { property: "og:description", content: "Italian luxury perfumes — scents that tell your essence." },
    ],
  }),
  component: () => (
    <CategoryProductsPage
      title="Perfumes"
      subtitle="Scents that tell your essence"
      categorySlug={["perfumes", "parfums"]}
    />
  ),
});