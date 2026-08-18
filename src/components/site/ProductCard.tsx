import { Link } from "@tanstack/react-router";
import { productCover, type SellqoProduct } from "@/lib/sellqo";
import { formatEUR } from "@/lib/format";
import { colourFromLabel } from "@/lib/product-image";
import { ProductImage } from "./ProductImage";

/**
 * A product is sold out when the API says so outright, or when it has variants
 * and none of them is available.
 */
export function isSoldOut(product: SellqoProduct): boolean {
  if (product.in_stock === false) return true;
  const variants = product.variants ?? [];
  if (product.has_variants && variants.length > 0) {
    return variants.every((v) => v.in_stock === false);
  }
  return false;
}

/** Colour of the first available variant — drives the local image fallback. */
function coverColour(product: SellqoProduct): string | null {
  const variants = product.variants ?? [];
  const preferred = variants.find((v) => v.in_stock !== false) ?? variants[0];
  if (!preferred) return null;
  const fromValues = preferred.option_values
    ? colourFromLabel(Object.values(preferred.option_values).join(" "))
    : null;
  return fromValues ?? colourFromLabel(preferred.name);
}

export function ProductCard({ product }: { product: SellqoProduct }) {
  const soldOut = isSoldOut(product);
  const price = product.price_range?.min ?? product.price;

  return (
    <Link to="/product/$slug" params={{ slug: product.slug }} className="group block">
      <div
        className="br-media group-hover:neon-line-blue border border-br-line transition-[border-color,box-shadow] duration-200"
        style={{ borderRadius: "var(--radius)", aspectRatio: "1 / 1" }}
      >
        <ProductImage
          apiUrl={productCover(product)}
          slug={product.slug}
          colour={coverColour(product)}
          alt={product.name}
          showPlaceholder={!soldOut}
          className={`transition-opacity duration-200 ${soldOut ? "opacity-40" : ""}`}
        />
        {soldOut && (
          <>
            <span
              className="br-label absolute inset-x-0 top-1/2 -translate-y-1/2 text-center"
              style={{ color: "var(--br-mute)" }}
            >
              Sold out
            </span>
          </>
        )}
        {product.coming_soon && !soldOut && (
          <span
            className="br-label absolute left-3 top-3 border px-2 py-1 text-[10px]"
            style={{
              color: "var(--br-mute)",
              borderColor: "var(--br-line)",
              background: "var(--br-black)",
            }}
          >
            Coming soon
          </span>
        )}
      </div>

      <div className="mt-5 flex items-baseline justify-between gap-3">
        <h3 className="br-label truncate" style={{ color: "var(--br-white)" }}>
          {product.name}
        </h3>
        <span
          aria-hidden
          className="shrink-0 text-[14px] leading-none transition-colors duration-200 group-hover:text-[var(--br-blue)]"
          style={{ color: "var(--br-mute)" }}
        >
          →
        </span>
      </div>
      <p className="br-price mt-2 text-[15px]" style={{ color: "var(--br-mute)" }}>
        {product.price_range && product.price_range.min !== product.price_range.max
          ? `From ${formatEUR(price)}`
          : formatEUR(price)}
      </p>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <div aria-hidden>
      <div
        className="border"
        style={{
          background: "var(--br-ink)",
          borderRadius: "var(--radius)",
          aspectRatio: "1 / 1",
        }}
      />
      <div className="mt-5 h-3 w-3/5" style={{ background: "var(--br-ink)" }} />
      <div className="mt-3 h-3 w-1/4" style={{ background: "var(--br-ink)" }} />
    </div>
  );
}
