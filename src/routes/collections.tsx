import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueries } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHeading } from "@/components/site/PageShell";
import { ProductImage } from "@/components/site/ProductImage";
import { CATEGORIES, type BrCategory } from "@/lib/categories";
import { productCover, sellqoFetch, type SellqoProduct } from "@/lib/sellqo";
import { useCategories, type ProductsResponse } from "@/lib/use-sellqo";

export const Route = createFileRoute("/collections")({
  head: () => ({
    meta: [
      { title: "Collections — BennyRich" },
      {
        name: "description",
        content:
          "Apparel, accessories, home, lighting and beverages — the five BennyRich collections.",
      },
    ],
  }),
  component: CollectionsPage,
});

function CollectionsPage() {
  const { categories } = useCategories();

  // One query per collection so each tile can show its own first product.
  const results = useQueries({
    queries: CATEGORIES.map((c) => ({
      queryKey: ["sellqo", "products", { categorySlug: c.slug, per_page: 1 }],
      queryFn: () =>
        sellqoFetch<ProductsResponse>("/products", {
          query: { category_slug: c.slug, per_page: 4 },
        }),
      staleTime: 60_000,
    })),
  });

  const nameBySlug = new Map(categories.map((c) => [c.slug, c.name]));
  const imageBySlug = new Map(
    categories.filter((c) => c.image_url).map((c) => [c.slug, c.image_url as string]),
  );

  return (
    <SiteLayout>
      <PageHeading
        eyebrow="Five worlds"
        title="Collections"
        lede="One lifestyle, five ways to live it."
      />

      <div className="br-shell br-section-b grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {CATEGORIES.map((category, i) => {
          const products = (results[i]?.data?.products ?? []) as SellqoProduct[];
          // Skip products with no artwork (e.g. br-sunglasses) so the tile
          // never falls back to an empty well.
          const first =
            products.find((p) => (p.images?.length ?? 0) > 0 || p.featured_image) ?? products[0];
          return (
            <CollectionTile
              key={category.slug}
              category={category}
              name={nameBySlug.get(category.slug) ?? category.name}
              apiImage={
                imageBySlug.get(category.slug) ?? productCover(first ?? ({} as SellqoProduct))
              }
              productSlug={first?.slug}
              loading={results[i]?.isLoading ?? false}
            />
          );
        })}
      </div>
    </SiteLayout>
  );
}

function CollectionTile({
  category,
  name,
  apiImage,
  productSlug,
  loading,
}: {
  category: BrCategory;
  name: string;
  apiImage?: string | null;
  productSlug?: string;
  loading: boolean;
}) {
  return (
    <Link
      to="/shop"
      search={{ category: category.slug }}
      className="group relative block overflow-hidden border border-br-line transition-[border-color,box-shadow] duration-200 hover:neon-line-blue"
      style={{
        background: "var(--br-ink)",
        borderRadius: "var(--radius)",
        aspectRatio: "4 / 5",
      }}
    >
      {!loading && (
        <ProductImage
          apiUrl={apiImage}
          slug={productSlug}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-45 transition-opacity duration-200 group-hover:opacity-65"
        />
      )}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(5,5,5,0.94) 12%, rgba(5,5,5,0.55) 55%, rgba(5,5,5,0.25))",
        }}
        aria-hidden
      />
      <div className="absolute inset-x-0 bottom-0 p-6">
        <h2 className="br-display neon-text-blue text-[19px]" style={{ letterSpacing: "0.08em" }}>
          {name}
        </h2>
        <p className="mt-2.5 text-[13px]" style={{ color: "var(--br-mute)" }}>
          {category.blurb}
        </p>
        <span className="br-label mt-5 inline-block" style={{ color: "var(--br-blue)" }}>
          Explore <span aria-hidden>→</span>
        </span>
      </div>
    </Link>
  );
}
