import { createFileRoute, Link } from "@tanstack/react-router";
import { RequireAuth } from "@/components/site/RequireAuth";
import { ProductImage } from "@/components/site/ProductImage";
import { useWishlist, entryProductId } from "@/lib/wishlist";
import { formatEUR } from "@/lib/format";
import { productCover, type SellqoProduct } from "@/lib/sellqo";
import type { WishlistEntry } from "@/lib/account";

export const Route = createFileRoute("/account/wishlist")({
  head: () => ({
    meta: [
      { title: "Your wishlist — BennyRich" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <WishlistPage />
    </RequireAuth>
  ),
});

/**
 * wishlist_get is enriched with product data server-side, but the envelope is
 * not documented — the product may be nested or spread onto the entry. Read
 * both rather than guessing one.
 */
function productOf(entry: WishlistEntry): SellqoProduct | null {
  const nested = entry.product as SellqoProduct | undefined;
  const candidate = nested ?? (entry as unknown as SellqoProduct);
  return candidate && typeof candidate.name === "string" ? candidate : null;
}

function WishlistPage() {
  const { entries, isLoading, removeItem, isPending } = useWishlist();

  return (
    <div className="br-shell br-section">
      <p className="br-section-label" style={{ color: "var(--br-mute)" }}>
        <Link to="/account" style={{ color: "var(--br-mute)" }}>
          Account
        </Link>{" "}
        / Wishlist
      </p>
      <h1
        className="br-display neon-hero-white mt-5"
        style={{ fontSize: "clamp(26px, 4.2vw, 46px)", letterSpacing: "0.06em" }}
      >
        Wishlist
      </h1>

      {isLoading ? (
        <p className="mt-10 text-[14px]" style={{ color: "var(--br-mute)" }}>
          Loading your wishlist…
        </p>
      ) : entries.length === 0 ? (
        <div className="mt-10">
          <p className="text-[15px]" style={{ color: "var(--br-white)", lineHeight: 1.8 }}>
            Nothing saved yet.
          </p>
          <p className="mt-3 max-w-[46ch] text-[14px]" style={{ color: "var(--br-mute)" }}>
            Tap the heart on any piece and it will be waiting for you here.
          </p>
          <Link to="/shop" className="neon-btn mt-9">
            Shop the collection <span aria-hidden>→</span>
          </Link>
        </div>
      ) : (
        <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4 md:gap-8">
          {entries.map((entry) => {
            const id = entryProductId(entry);
            const product = productOf(entry);
            if (!product || !id) return null;
            const price = product.price_range?.min ?? product.price;
            return (
              <div key={id}>
                <Link to="/product/$slug" params={{ slug: product.slug }} className="group block">
                  <div
                    className="br-media br-media-frame group-hover:neon-line-blue border transition-[border-color,box-shadow] duration-200"
                    style={{ borderRadius: "var(--radius)", aspectRatio: "1 / 1" }}
                  >
                    <ProductImage
                      apiUrl={productCover(product)}
                      slug={product.slug}
                      alt={product.name}
                    />
                  </div>
                  <h2
                    className="br-label mt-5 line-clamp-2"
                    style={{
                      color: "var(--br-white)",
                      letterSpacing: "0.18em",
                      lineHeight: 1.35,
                      minHeight: "2.7em",
                    }}
                  >
                    {product.name}
                  </h2>
                  <p className="br-price mt-2 text-[15px]" style={{ color: "var(--br-mute)" }}>
                    {price != null ? formatEUR(price) : ""}
                  </p>
                </Link>
                <button
                  type="button"
                  onClick={() => void removeItem(id)}
                  disabled={isPending}
                  className="br-label mt-3 underline underline-offset-4 transition-colors duration-200 hover:text-[var(--br-pink)]"
                  style={{ color: "var(--br-mute)" }}
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
