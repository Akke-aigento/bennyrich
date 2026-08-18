import { createFileRoute } from "@tanstack/react-router";
import { CategoryProductsPage } from "@/components/site/CategoryProductsPage";

export const Route = createFileRoute("/jewellery")({
  head: () => ({
    meta: [
      { title: "Jewellery — Zona Dorata" },
      { name: "description", content: "Italian fine jewellery — light, detail, timeless beauty." },
      { property: "og:title", content: "Jewellery — Zona Dorata" },
      { property: "og:description", content: "Italian fine jewellery — light, detail, timeless beauty." },
    ],
  }),
  component: () => (
    <CategoryProductsPage
      title="Jewellery"
      subtitle="Light · Detail · Timeless beauty"
      categorySlug="jewellery"
    />
  ),
});