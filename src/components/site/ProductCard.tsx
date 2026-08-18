import { Link } from "@tanstack/react-router";
import { formatEUR, productCover, type SellqoProduct } from "@/lib/sellqo";

function ProductBadge({ product }: { product: SellqoProduct }) {
  if (product.coming_soon) {
    return (
      <span
        className="absolute right-3 top-3 ui-label text-[0.6rem]"
        style={{
          color: "var(--gold)",
          background: "var(--black)",
          border: "1px solid var(--gold)",
          padding: "5px 10px",
          letterSpacing: "0.28em",
        }}
      >
        COMING SOON
      </span>
    );
  }
  if (product.in_stock === false) {
    return (
      <span
        className="absolute right-3 top-3 ui-label text-[0.6rem]"
        style={{
          color: "var(--gold)",
          background: "var(--black)",
          border: "1px solid var(--gold)",
          padding: "5px 10px",
          letterSpacing: "0.28em",
        }}
      >
        SOLD OUT
      </span>
    );
  }
  return null;
}

export function ProductCard({ product }: { product: SellqoProduct }) {
  const cover = productCover(product);
  const hasSale = product.compare_at_price && product.compare_at_price > product.price;
  return (
    <Link
      to="/product/$slug"
      params={{ slug: product.slug }}
      className="group block"
    >
      <div
        className="relative overflow-hidden"
        style={{ background: "var(--bone)", aspectRatio: "3 / 4" }}
      >
        {cover ? (
          <img
            src={cover}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 motion-reduce:transition-none group-hover:scale-[1.03]"
          />
        ) : null}
        <ProductBadge product={product} />
      </div>
      <h3
        className="mt-3 truncate text-[1.05rem] transition-colors duration-300 group-hover:text-[var(--gold)]"
        style={{ fontFamily: "var(--font-display)", color: "var(--ink)", fontWeight: 400 }}
      >
        {product.name}
      </h3>
      <div className="mt-1 flex items-baseline gap-2 text-[0.9rem]" style={{ fontFamily: "var(--font-body)" }}>
        {hasSale && (
          <span style={{ color: "var(--muted-tone)", textDecoration: "line-through" }}>
            {formatEUR(product.compare_at_price as number)}
          </span>
        )}
        <span style={{ color: "var(--ink)", fontWeight: 500 }}>
          {formatEUR(product.price)}
        </span>
      </div>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <div>
      <div
        className="animate-pulse"
        style={{ background: "var(--bone)", aspectRatio: "3 / 4" }}
      />
      <div className="mt-3 h-4 w-3/4 animate-pulse" style={{ background: "var(--bone)" }} />
      <div className="mt-2 h-3 w-1/3 animate-pulse" style={{ background: "var(--bone)" }} />
    </div>
  );
}