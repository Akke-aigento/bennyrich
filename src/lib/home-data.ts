/**
 * The homepage's per-category product fan-out, in one place.
 *
 * `CategoryTiles` is the only caller today — the second product row that also
 * used this was removed in BR-12b — but the file still earns its place, because
 * the point was never the number of callers.
 *
 * The key here is deliberately IDENTICAL to the one `FeaturedCollection`
 * inlines in `src/routes/index.tsx`. That is what makes the tiles and the
 * featured grid share one React Query cache entry per category, so the homepage
 * makes five requests rather than ten.
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
