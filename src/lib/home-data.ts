/**
 * The homepage's per-category product fan-out, in one place.
 *
 * Three BR-12 sections need the same thing — the category tiles need a cover
 * image per category, and both product rows need `pickSpread` over the same
 * groups. Fetching it three times would be three copies of a query key that
 * have to stay in step forever.
 *
 * The key here is deliberately IDENTICAL to the one `FeaturedCollection`
 * inlines in `src/routes/index.tsx`, so React Query serves all of them from one
 * cache entry per category and the page still makes exactly five requests.
 *
 * `FeaturedCollection` keeps its own inlined copy rather than importing this.
 * That is not an oversight: it is one of the four components the `HOME_V2=false`
 * escape hatch restores, and it must not be edited by the batch it is meant to
 * escape from. If the keys ever drift, the symptom is a doubled request count
 * on the homepage, not a wrong render.
 */
import { useQueries } from "@tanstack/react-query";
import { CATEGORIES } from "./categories";
import { sellqoFetch, type SellqoProduct } from "./sellqo";
import type { ProductsResponse } from "./use-sellqo";
import type { CategoryGroup } from "./featured";

export function useCategoryProducts() {
  const results = useQueries({
    queries: CATEGORIES.map((c) => ({
      queryKey: ["sellqo", "products", { categorySlug: c.slug, per_page: 20 }],
      queryFn: () =>
        sellqoFetch<ProductsResponse>("/products", {
          query: { category_slug: c.slug, per_page: 20 },
        }),
      staleTime: 60_000,
    })),
  });

  const groups: CategoryGroup[] = CATEGORIES.map((c, i) => ({
    slug: c.slug,
    products: (results[i]?.data?.products ?? []) as SellqoProduct[],
  }));

  return {
    groups,
    isLoading: results.some((r) => r.isLoading),
    error: (results.find((r) => r.error)?.error ?? null) as Error | null,
  };
}
