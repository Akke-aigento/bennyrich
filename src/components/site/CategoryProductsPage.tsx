import { SiteLayout } from "./SiteLayout";
import { PageHeading, EmptyState } from "./PageShell";
import { ProductCard, ProductCardSkeleton } from "./ProductCard";
import { CATEGORIES } from "@/lib/categories";
import { useCategories, useProducts } from "@/lib/use-sellqo";

export type CategoryChoice = { slug: string | null; name: string };

/**
 * The shop grid: category filter chips over a product grid. Products and the
 * category list both come from SellQo through sellqoProxy; the static
 * CATEGORIES list seeds the chips so they render before the API answers.
 */
export function CategoryProductsPage({
  title,
  eyebrow,
  lede,
  category,
  search,
  onSelectCategory,
}: {
  title: string;
  eyebrow?: string;
  lede?: string;
  category?: string;
  search?: string;
  onSelectCategory: (slug: string | null) => void;
}) {
  const { categories } = useCategories();
  const { products, isLoading, error } = useProducts({
    categorySlug: category,
    search,
  });

  // Prefer the live names/order from the API; fall back to the static list.
  const live = categories.filter((c) => !c.parent_id);
  const chips: CategoryChoice[] = [
    { slug: null, name: "All" },
    ...(live.length > 0
      ? live.map((c) => ({ slug: c.slug, name: c.name }))
      : CATEGORIES.map((c) => ({ slug: c.slug, name: c.name }))),
  ];

  return (
    <SiteLayout>
      <PageHeading eyebrow={eyebrow} title={title} lede={lede} />

      <div className="br-shell br-section-b">
        <div className="flex flex-wrap gap-2.5">
          {chips.map((c) => {
            const active = (c.slug ?? null) === (category ?? null);
            return (
              <button
                key={c.slug ?? "all"}
                type="button"
                onClick={() => onSelectCategory(c.slug)}
                aria-pressed={active}
                className={`br-label border px-4 py-2.5 transition-[color,border-color,box-shadow] duration-200 ${
                  active ? "neon-line-blue" : "hover:text-[var(--br-white)]"
                }`}
                style={{
                  borderRadius: "var(--radius)",
                  borderColor: active ? undefined : "var(--br-line)",
                  color: active ? "var(--br-blue)" : "var(--br-mute)",
                  background: "transparent",
                }}
              >
                {c.name}
              </button>
            );
          })}
        </div>

        {search && (
          <p className="mt-6 text-[13px]" style={{ color: "var(--br-mute)" }}>
            Results for “{search}”
          </p>
        )}

        <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 md:gap-8 lg:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
          ) : error ? (
            <div className="col-span-full">
              <EmptyState
                message={(error as Error).message || "Unable to load products right now."}
              />
            </div>
          ) : products.length === 0 ? (
            <div className="col-span-full">
              <EmptyState message="No pieces here yet" />
            </div>
          ) : (
            products.map((p) => <ProductCard key={p.id} product={p} />)
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
