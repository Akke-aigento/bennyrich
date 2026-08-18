import { useEffect, useState } from "react";
import { imageSources } from "@/lib/product-image";

/**
 * Product image that walks a candidate list: the SellQo URL first, then the
 * committed copies under `public/products/`. See src/lib/product-image.ts.
 */
export function ProductImage({
  apiUrl,
  slug,
  colour,
  alt,
  className = "",
  loading = "lazy",
  showPlaceholder = true,
}: {
  apiUrl?: string | null;
  slug?: string;
  colour?: string | null;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
  /** Set false when the caller draws its own state (e.g. a SOLD OUT overlay). */
  showPlaceholder?: boolean;
}) {
  const sources = imageSources(apiUrl, slug, colour);
  const [idx, setIdx] = useState(0);

  // A new product in the same slot restarts the walk.
  useEffect(() => {
    setIdx(0);
  }, [apiUrl, slug, colour]);

  const src = sources[idx];
  if (!src) {
    if (!showPlaceholder) return null;
    return (
      <div
        className="flex h-full w-full items-center justify-center"
        style={{ background: "var(--br-ink)" }}
        aria-hidden
      >
        <span className="br-label" style={{ color: "var(--br-mute)" }}>
          No image
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      onError={() => setIdx((i) => i + 1)}
      className={className}
    />
  );
}
