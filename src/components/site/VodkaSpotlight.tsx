import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ProductImage } from "@/components/site/ProductImage";
import { isPurchasable } from "@/lib/categories";
import { formatEUR } from "@/lib/format";
import { productCover, sellqoFetch, type SellqoProduct } from "@/lib/sellqo";

const SLUG = "br-vodka-700ml";

type ProductResponse = SellqoProduct | { product: SellqoProduct };

function unwrap(r: ProductResponse | undefined): SellqoProduct | null {
  if (!r) return null;
  return (r as { product?: SellqoProduct }).product ?? (r as SellqoProduct);
}

/**
 * The bottle of the house, on the homepage.
 *
 * Blue is the one accent, per the design system — the bottle is a beverage, not
 * a sale, so nothing here is pink.
 *
 * The copy is Sander's own claim and nothing more. "Belgian by origin" is what
 * he said; there is deliberately no distillery, no "craft" and no
 * "triple-distilled", because nobody has told us any of that is true.
 *
 * The section renders in full whether or not the product query succeeds: the
 * image falls through to the committed `/products/vodka-blue.jpg` and every
 * word is static. The only thing the API contributes is the price, and that is
 * only rendered once the bottle is actually purchasable.
 */
export function VodkaSpotlight() {
  const { data } = useQuery({
    queryKey: ["sellqo", "product", SLUG],
    queryFn: () => sellqoFetch<ProductResponse>(`/products/${SLUG}`),
    staleTime: 60_000,
  });

  const product = unwrap(data);
  // Held behind NOT_PURCHASABLE pending the excise decision. Deleting the slug
  // from that set flips this section along with the product page — no edit here.
  const purchasable = isPurchasable(SLUG);
  const price = product?.price_range?.min ?? product?.price;

  return (
    <section className="br-shell br-section-b">
      <div
        className="quiet-frame grid items-center gap-12 border px-8 py-16 md:grid-cols-[minmax(0,42%)_1fr] md:gap-16 md:px-20 md:py-20"
        style={{ borderRadius: "var(--radius)" }}
      >
        {/* Contain, not cover: a bottle cropped at the shoulders is not a
            bottle. This is the second `.br-media-contain` on the site after the
            large product-detail image, and for the same reason. */}
        <div
          className="br-media br-media-contain br-media-frame border"
          style={{ borderRadius: "var(--radius)", aspectRatio: "4 / 5" }}
        >
          <ProductImage
            apiUrl={product ? productCover(product) : null}
            slug={SLUG}
            colour="blue"
            alt="Benny Rich Vodka, 700 ml"
            className="h-full w-full"
          />
        </div>

        <div>
          <p className="br-section-label neon-text-blue-sm">Beverages · 18+</p>
          <h2
            className="br-display mt-5"
            style={{
              fontSize: "clamp(20px, 2.7vw, 29px)",
              letterSpacing: "0.09em",
              lineHeight: 1.45,
            }}
          >
            <span className="block" style={{ color: "var(--br-white)" }}>
              Born in Belgium.
            </span>
            <span className="neon-text-blue block">Poured worldwide.</span>
          </h2>

          <p
            className="mt-7 max-w-[46ch] text-[15px]"
            style={{ color: "var(--br-white)", lineHeight: 1.8 }}
          >
            Benny Rich Vodka, 700 ml — the bottle of the house. Belgian by origin, unmistakably
            BennyRich.
          </p>

          {purchasable ? (
            <>
              {price != null && (
                <p className="br-price mt-7" style={{ color: "var(--br-white)" }}>
                  {formatEUR(price)}
                </p>
              )}
              <Link to="/product/$slug" params={{ slug: SLUG }} className="neon-btn mt-8">
                Shop the bottle <span aria-hidden>→</span>
              </Link>
            </>
          ) : (
            <>
              {/* No price while it cannot be bought — the excise decision may
                  move it, and a number here would be a promise we cannot keep. */}
              <p
                className="br-label mt-7 inline-block border px-3 py-1.5"
                style={{
                  color: "var(--br-mute)",
                  borderColor: "var(--br-line)",
                  borderRadius: "var(--radius)",
                }}
              >
                Coming soon
              </p>
              <div>
                <Link to="/product/$slug" params={{ slug: SLUG }} className="neon-btn mt-8">
                  Discover the bottle <span aria-hidden>→</span>
                </Link>
              </div>
            </>
          )}

          <p className="br-label mt-8" style={{ color: "var(--br-mute)" }}>
            18+ · Enjoy responsibly.
          </p>
        </div>
      </div>
    </section>
  );
}
