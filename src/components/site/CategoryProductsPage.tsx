import { useMemo, useState } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { CategoryHero } from "@/components/site/CategoryHero";
import { ProductCard, ProductCardSkeleton } from "@/components/site/ProductCard";
import { Diamond } from "@/components/site/Diamond";
import { sellqoFetch, type SellqoPagination, type SellqoProduct } from "@/lib/sellqo";

type ProductsResponse = {
  products: SellqoProduct[];
  pagination?: SellqoPagination;
};

type SellqoCategory = {
  id: string;
  name: string;
  slug: string;
  parent_id?: string | null;
  product_count?: number;
  image_url?: string | null;
};

type Props = {
  title: string;
  subtitle: string;
  categorySlug: string | string[];
};

export function CategoryProductsPage({ title, subtitle, categorySlug }: Props) {
  const slugs = Array.isArray(categorySlug) ? categorySlug : [categorySlug];
  // null = selector view (only when subcategories exist),
  // "__all__" = all products across the parent slugs,
  // "<slug>" = a specific subcategory.
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  const categoriesQuery = useQuery({
    queryKey: ["sellqo", "categories"],
    queryFn: () => sellqoFetch<SellqoCategory[] | { categories: SellqoCategory[] }>("/categories"),
    staleTime: 5 * 60_000,
  });

  const allCategories: SellqoCategory[] = useMemo(() => {
    const d = categoriesQuery.data as any;
    if (Array.isArray(d)) return d;
    return d?.categories ?? [];
  }, [categoriesQuery.data]);

  const parents = useMemo(
    () => allCategories.filter((c) => slugs.includes(c.slug)),
    [allCategories, slugs],
  );
  const subcategories = useMemo(() => {
    const parentIds = new Set(parents.map((p) => p.id));
    return allCategories.filter(
      (c) => c.parent_id && parentIds.has(c.parent_id),
    );
  }, [allCategories, parents]);

  const hasSubcategories = subcategories.length > 0;
  const categoriesReady = !categoriesQuery.isLoading;
  // When subcategories exist and none is chosen, we're in "selector" view — skip product fetch.
  const showSelector = categoriesReady && hasSubcategories && activeSlug === null;

  const fetchSlugs =
    activeSlug && activeSlug !== "__all__" ? [activeSlug] : slugs;
  const queries = useQueries({
    queries: (showSelector || !categoriesReady ? [] : fetchSlugs).map((slug) => ({
      queryKey: ["sellqo", "products", { category_slug: slug }],
      queryFn: () =>
        sellqoFetch<ProductsResponse>("/products", {
          query: { category_slug: slug, per_page: 100 },
        }),
      staleTime: 60_000,
    })),
  });

  const isLoading = queries.some((q) => q.isLoading);
  const error = queries.find((q) => q.error)?.error as Error | undefined;
  const seen = new Set<string>();
  const products: SellqoProduct[] = [];
  for (const q of queries) {
    for (const p of q.data?.products ?? []) {
      if (seen.has(p.id)) continue;
      seen.add(p.id);
      products.push(p);
    }
  }

  return (
    <SiteLayout>
      <CategoryHero
        title={title}
        subtitle={subtitle}
        breadcrumb={[{ label: "Home", to: "/" }, { label: title }]}
      />

      <section className="mx-auto max-w-[1280px] px-6 py-12">
        {!categoriesReady ? (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : showSelector ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {subcategories.map((sc) => (
              <SubcategoryTile
                key={sc.id}
                name={sc.name}
                count={sc.product_count}
                imageUrl={sc.image_url ?? null}
                onClick={() => setActiveSlug(sc.slug)}
              />
            ))}
          </div>
        ) : (
          <>
            {hasSubcategories && (
              <div className="mb-10 flex flex-wrap items-center justify-center gap-2">
                <SubcategoryChip
                  label="← All subcategories"
                  active={false}
                  onClick={() => setActiveSlug(null)}
                />
                <SubcategoryChip
                  label="All"
                  active={activeSlug === "__all__"}
                  onClick={() => setActiveSlug("__all__")}
                />
                {subcategories.map((sc) => (
                  <SubcategoryChip
                    key={sc.id}
                    label={sc.name}
                    active={activeSlug === sc.slug}
                    onClick={() => setActiveSlug(sc.slug)}
                  />
                ))}
              </div>
            )}
            {isLoading ? (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <EmptyState message={(error as Error).message || "Unable to load products."} />
        ) : products.length === 0 ? (
          <EmptyState message="No pieces available yet" />
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
            )}
          </>
        )}
      </section>
    </SiteLayout>
  );
}

function SubcategoryTile({
  name,
  count,
  imageUrl,
  onClick,
}: {
  name: string;
  count?: number;
  imageUrl?: string | null;
  onClick: () => void;
}) {
  if (imageUrl) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="group relative flex flex-col items-center justify-end overflow-hidden py-16"
        style={{
          border: "1px solid var(--muted-tone)",
          minHeight: 320,
        }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 motion-reduce:transition-none group-hover:scale-[1.06]"
          style={{ backgroundImage: `url(${imageUrl})` }}
          aria-hidden
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.2) 55%, rgba(0,0,0,0.05))",
          }}
          aria-hidden
        />
        <div className="relative flex flex-col items-center">
          <Diamond size={16} />
          <h3
            className="mt-5 text-[1.35rem]"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--bone)",
              fontWeight: 500,
              letterSpacing: "0.08em",
            }}
          >
            {name.toUpperCase()}
          </h3>
          {typeof count === "number" && (
            <span
              className="ui-label mt-3 text-[0.7rem]"
              style={{ color: "rgba(245,238,224,0.75)", letterSpacing: "0.24em" }}
            >
              {count} {count === 1 ? "PIECE" : "PIECES"}
            </span>
          )}
          <span
            className="ui-label mt-4 text-[0.7rem]"
            style={{ color: "var(--gold)", letterSpacing: "0.24em" }}
          >
            EXPLORE →
          </span>
        </div>
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-center justify-center py-16 transition-colors"
      style={{
        border: "1px solid var(--muted-tone)",
        background: "var(--bone)",
      }}
    >
      <Diamond size={16} />
      <h3
        className="mt-5 text-[1.35rem]"
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--ink)",
          fontWeight: 500,
          letterSpacing: "0.08em",
        }}
      >
        {name.toUpperCase()}
      </h3>
      {typeof count === "number" && (
        <span
          className="ui-label mt-3 text-[0.7rem]"
          style={{ color: "var(--muted-tone)", letterSpacing: "0.24em" }}
        >
          {count} {count === 1 ? "PIECE" : "PIECES"}
        </span>
      )}
      <span
        className="ui-label mt-4 text-[0.7rem]"
        style={{ color: "var(--gold)", letterSpacing: "0.24em" }}
      >
        EXPLORE →
      </span>
    </button>
  );
}

function SubcategoryChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="ui-label text-[0.7rem] transition-colors"
      style={{
        letterSpacing: "0.24em",
        padding: "8px 16px",
        border: `1px solid ${active ? "var(--gold)" : "var(--muted-tone)"}`,
        background: active ? "var(--black)" : "transparent",
        color: active ? "var(--gold)" : "var(--ink)",
      }}
    >
      {label.toUpperCase()}
    </button>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-32">
      <Diamond size={20} />
      <p
        className="mt-6 text-[1.5rem]"
        style={{ fontFamily: "var(--font-display)", color: "var(--muted-tone)" }}
      >
        {message}
      </p>
    </div>
  );
}