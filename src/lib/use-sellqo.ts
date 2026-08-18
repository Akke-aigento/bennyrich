import { useQuery } from "@tanstack/react-query";
import { sellqoFetch, type SellqoPagination, type SellqoProduct } from "./sellqo";

export type ProductsResponse = {
  products: SellqoProduct[];
  pagination?: SellqoPagination;
};

export type SellqoCategory = {
  id: string;
  name: string;
  slug: string;
  parent_id?: string | null;
  product_count?: number;
  image_url?: string | null;
};

function unwrapProducts(data: unknown): SellqoProduct[] {
  if (Array.isArray(data)) return data as SellqoProduct[];
  return (data as ProductsResponse | undefined)?.products ?? [];
}

/**
 * All products for the store, or one category. Everything reaches SellQo
 * through sellqoProxy — the client never talks to the API directly.
 */
export function useProducts(opts: { categorySlug?: string; search?: string } = {}) {
  const { categorySlug, search } = opts;
  const query = useQuery({
    queryKey: [
      "sellqo",
      "products",
      { categorySlug: categorySlug ?? null, search: search ?? null },
    ],
    queryFn: () =>
      sellqoFetch<ProductsResponse>("/products", {
        query: {
          per_page: 100,
          ...(categorySlug ? { category_slug: categorySlug } : {}),
          ...(search ? { search } : {}),
        },
      }),
    staleTime: 60_000,
  });

  return { ...query, products: unwrapProducts(query.data) };
}

export function useCategories() {
  const query = useQuery({
    queryKey: ["sellqo", "categories"],
    queryFn: () => sellqoFetch<SellqoCategory[] | { categories: SellqoCategory[] }>("/categories"),
    staleTime: 5 * 60_000,
  });

  const raw = query.data as SellqoCategory[] | { categories: SellqoCategory[] } | undefined;
  const categories: SellqoCategory[] = Array.isArray(raw) ? raw : (raw?.categories ?? []);
  return { ...query, categories };
}

/** True when SellQo flags the product as featured, whatever it calls the flag. */
export function isFeatured(p: SellqoProduct): boolean {
  const any = p as unknown as Record<string, unknown>;
  return Boolean(any.featured ?? any.is_featured);
}

/** The homepage strip: featured products first, topped up to `count`. */
export function pickFeatured(products: SellqoProduct[], count = 4): SellqoProduct[] {
  const featured = products.filter(isFeatured);
  const rest = products.filter((p) => !isFeatured(p));
  return [...featured, ...rest].slice(0, count);
}
