import { Link } from "@tanstack/react-router";
import { ProductImage } from "@/components/site/ProductImage";
import { CATEGORIES } from "@/lib/categories";
import { hasArtwork } from "@/lib/featured";
import { useCategoryProducts } from "@/lib/home-data";
import { productCover, type SellqoProduct } from "@/lib/sellqo";
import { useCategories } from "@/lib/use-sellqo";

type Cover = { apiUrl: string | null; slug: string | undefined };

/**
 * Cover art for a category tile, in order of preference:
 *
 *   1. the category's own `image_url` from GET /categories;
 *   2. the first product in that category that actually has artwork.
 *
 * Today every BennyRich category has `image_url = NULL` in the database, so in
 * practice this always lands on (2) and the tiles are product-derived. (1) is
 * not dead code though — the day someone uploads category art in the admin, the
 * tiles pick it up with no change here.
 *
 * `hasArtwork` is the same predicate `/collections` and `pickSpread` use, so a
 * product with no image (br-sunglasses is the real one) is skipped rather than
 * handed to a tile that would render an empty well.
 */
function coverFor(categoryImage: string | undefined, products: SellqoProduct[]): Cover | null {
  if (categoryImage) {
    const first = products.find(hasArtwork) ?? products[0];
    // Still pass the product slug: it is what ProductImage falls back on when
    // the category URL 404s, which is the state every bucket URL is in today.
    return { apiUrl: categoryImage, slug: first?.slug };
  }
  const first = products.find(hasArtwork);
  if (!first) return null;
  return { apiUrl: productCover(first), slug: first.slug };
}

/**
 * The five categories, straight under the hero.
 *
 * This is the buy motor: the hero says who BennyRich is, this says what you can
 * actually get. They are CATEGORIES and nothing grander — the client was
 * explicit about that; see the copy rules in CLAUDE.md.
 *
 * Blue is the one accent and it lives on the border alone; the name does not
 * glow too. Nothing pulses.
 */
export function CategoryTiles() {
  const { categories } = useCategories();
  const { groups } = useCategoryProducts();

  const nameBySlug = new Map(categories.map((c) => [c.slug, c.name]));
  const imageBySlug = new Map(
    categories.filter((c) => c.image_url).map((c) => [c.slug, c.image_url as string]),
  );
  const productsBySlug = new Map(groups.map((g) => [g.slug, g.products]));

  return (
    <section className="br-shell br-section-t">
      <h2 className="br-section-label neon-text-blue-sm">Shop by category</h2>

      <div className="mt-9 grid grid-cols-2 gap-3 md:grid-cols-5 md:gap-4">
        {CATEGORIES.map((category) => {
          const products = productsBySlug.get(category.slug) ?? [];
          const cover = coverFor(imageBySlug.get(category.slug), products);
          return (
            <Link
              key={category.slug}
              to="/shop"
              search={{ category: category.slug }}
              // Base colour set by CLASS, never inline — an inline colour beats
              // the group-hover utility and the frame silently stops lighting.
              className="group relative block overflow-hidden border border-br-line transition-[border-color,box-shadow] duration-200 hover:neon-line-blue"
              style={{
                background: "var(--br-ink)",
                borderRadius: "var(--radius)",
                aspectRatio: "4 / 5",
              }}
            >
              {/* No cover at all still renders a working link on a plain ink
                  ground — an empty image well is worse than no image. */}
              {cover && (
                <ProductImage
                  apiUrl={cover.apiUrl}
                  slug={cover.slug}
                  alt=""
                  showPlaceholder={false}
                  className="absolute inset-0 h-full w-full object-cover brightness-[1.15] transition-[filter] duration-200 group-hover:brightness-[1.35]"
                />
              )}
              {/* Opaque along the bottom edge, clear by the top third, so the
                  name reads whatever the photography does. */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(5,5,5,0.92) 0%, rgba(5,5,5,0.5) 38%, rgba(5,5,5,0.08) 72%, transparent 100%)",
                }}
                aria-hidden
              />
              <h3
                className="br-display absolute inset-x-0 bottom-0 p-4"
                style={{
                  color: "var(--br-white)",
                  fontSize: "clamp(15px, 2vw, 20px)",
                  letterSpacing: "0.08em",
                  textShadow: "0 1px 12px rgba(5,5,5,0.9)",
                }}
              >
                {nameBySlug.get(category.slug) ?? category.name}
              </h3>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
