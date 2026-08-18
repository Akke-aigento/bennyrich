import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CategoryProductsPage } from "@/components/site/CategoryProductsPage";

type ShopSearch = { category?: string; q?: string };

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => ({
    category: typeof search.category === "string" ? search.category : undefined,
    q: typeof search.q === "string" ? search.q : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Shop — BennyRich" },
      {
        name: "description",
        content: "Every BennyRich piece: apparel, accessories, home, lighting and beverages.",
      },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  const { category, q } = Route.useSearch();
  const navigate = useNavigate();

  return (
    <CategoryProductsPage
      eyebrow="All pieces"
      title="Shop"
      lede="Built for people who stand out. Every drop, in one place."
      category={category}
      search={q}
      onSelectCategory={(slug) =>
        navigate({
          to: "/shop",
          search: { ...(slug ? { category: slug } : {}), ...(q ? { q } : {}) },
        })
      }
    />
  );
}
