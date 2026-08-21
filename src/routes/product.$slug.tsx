import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { EmptyState, BackToShop } from "@/components/site/PageShell";
import { ProductCard, isSoldOut } from "@/components/site/ProductCard";
import { ProductImage } from "@/components/site/ProductImage";
import { AgeGate, useAgeRestricted, useAgeVerification } from "@/components/site/AgeGate";
import { imageUrl, type SellqoProduct } from "@/lib/sellqo";
import { formatEUR } from "@/lib/format";
import { colourFromLabel } from "@/lib/product-image";
import { sellqoFetch } from "@/lib/sellqo";
import { useCart } from "@/lib/cart-context";

export const Route = createFileRoute("/product/$slug")({
  head: () => ({
    meta: [
      { title: "Product — BennyRich" },
      { name: "description", content: "Discover this piece at BennyRich." },
    ],
  }),
  component: ProductPage,
});

type ProductResponse = SellqoProduct | { product: SellqoProduct };

function unwrap(r: ProductResponse | undefined): SellqoProduct | null {
  if (!r) return null;
  return (r as { product?: SellqoProduct }).product ?? (r as SellqoProduct);
}

function ProductPage() {
  const { slug } = Route.useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ["sellqo", "product", slug],
    queryFn: () => sellqoFetch<ProductResponse>(`/products/${slug}`),
    staleTime: 60_000,
  });

  const product = unwrap(data);
  const restricted = useAgeRestricted(product);
  const { verified, markVerified } = useAgeVerification();
  const gated = restricted && !verified;

  return (
    <SiteLayout>
      <AgeGate active={gated} onVerified={markVerified} />

      <nav className="br-shell pt-8">
        <ol
          className="br-nav flex flex-wrap items-center gap-2 text-[11px]"
          style={{ color: "var(--br-mute)" }}
        >
          <li>
            <Link to="/" className="transition-colors duration-200 hover:text-[var(--br-blue)]">
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link to="/shop" className="transition-colors duration-200 hover:text-[var(--br-blue)]">
              Shop
            </Link>
          </li>
          {product && (
            <>
              <li aria-hidden>/</li>
              <li style={{ color: "var(--br-white)" }}>{product.name}</li>
            </>
          )}
        </ol>
      </nav>

      {isLoading ? (
        <ProductSkeleton />
      ) : error || !product ? (
        <EmptyState
          message={(error as Error)?.message || "This piece could not be found."}
          action={<BackToShop />}
        />
      ) : gated ? (
        // Body withheld until the interstitial is cleared.
        <div className="min-h-[60vh]" aria-hidden />
      ) : (
        <ProductBody product={product} />
      )}
    </SiteLayout>
  );
}

function ProductSkeleton() {
  return (
    <div className="br-shell grid gap-10 py-10 md:grid-cols-2">
      <div
        style={{ background: "var(--br-ink)", aspectRatio: "1 / 1", borderRadius: "var(--radius)" }}
      />
      <div className="space-y-4 pt-4">
        <div className="h-7 w-2/3" style={{ background: "var(--br-ink)" }} />
        <div className="h-5 w-1/4" style={{ background: "var(--br-ink)" }} />
        <div className="h-24 w-full" style={{ background: "var(--br-ink)" }} />
      </div>
    </div>
  );
}

function ProductBody({ product }: { product: SellqoProduct }) {
  const { addItem, openCart } = useCart();
  const [activeIdx, setActiveIdx] = useState(0);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [added, setAdded] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const images = useMemo(() => {
    const list = (product.images ?? []).map(imageUrl).filter(Boolean) as string[];
    if (list.length === 0) {
      const cover = imageUrl(product.featured_image);
      if (cover) list.push(cover);
    }
    return list;
  }, [product]);

  const variant = useMemo(() => {
    if (!product.has_variants || !product.variants?.length) return null;
    return (
      product.variants.find((v) =>
        v.option_values
          ? Object.entries(v.option_values).every(([k, val]) => selected[k] === val)
          : false,
      ) ?? null
    );
  }, [product, selected]);

  const soldOut = isSoldOut(product);
  const needsVariant = Boolean(product.has_variants) && !variant;
  // Never recompute: render exactly the price the API gave us.
  const price = variant?.price ?? product.price;
  const colour =
    colourFromLabel(Object.values(selected).join(" ")) ?? colourFromLabel(variant?.name) ?? null;

  async function handleAdd() {
    if (busy || needsVariant || soldOut) return;
    setBusy(true);
    setErr(null);
    try {
      await addItem(product.id, variant?.id, 1);
      setAdded(true);
      toast.success("Added to your bag", {
        action: { label: "View bag", onClick: () => openCart() },
      });
      setTimeout(() => setAdded(false), 2000);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Could not add to bag";
      setErr(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="br-shell grid gap-12 py-14 md:grid-cols-2 md:gap-16 md:py-20">
        {/* Gallery */}
        <div className="md:sticky md:top-[92px] md:self-start">
          <div
            className="br-media br-media-frame border"
            style={{ borderRadius: "var(--radius)", aspectRatio: "1 / 1" }}
          >
            <ProductImage
              apiUrl={images[activeIdx] ?? null}
              slug={product.slug}
              colour={colour}
              alt={product.name}
              loading="eager"
              className={soldOut ? "opacity-40" : ""}
            />
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {images.slice(0, 5).map((src, i) => (
                <button
                  key={src + i}
                  type="button"
                  onClick={() => setActiveIdx(i)}
                  aria-label={`View image ${i + 1}`}
                  className={`br-media h-16 w-16 border transition-[border-color,box-shadow] duration-200 ${
                    i === activeIdx ? "neon-line-blue" : ""
                  }`}
                  style={{ borderColor: i === activeIdx ? undefined : "var(--br-line)" }}
                >
                  <ProductImage apiUrl={src} slug={product.slug} colour={colour} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <h1
            className="br-display"
            style={{
              fontSize: "clamp(26px, 3.6vw, 40px)",
              letterSpacing: "0.06em",
              color: "var(--br-white)",
              lineHeight: 1.2,
            }}
          >
            {product.name}
          </h1>

          <p className="br-price mt-5 text-[22px]" style={{ color: "var(--br-white)" }}>
            {formatEUR(price)}
          </p>

          {product.description && <ProductDescription html={product.description} />}

          {product.has_variants && product.options?.length ? (
            <div className="mt-9 space-y-6">
              {product.options.map((opt) => (
                <div key={opt.name}>
                  <p className="br-label" style={{ color: "var(--br-mute)" }}>
                    {opt.name}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {opt.values.map((val) => {
                      const active = selected[opt.name] === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setSelected((s) => ({ ...s, [opt.name]: val }))}
                          aria-pressed={active}
                          className={`br-label border px-4 py-2.5 transition-[color,border-color,box-shadow] duration-200 ${
                            active ? "neon-line-blue" : ""
                          }`}
                          style={{
                            borderRadius: "var(--radius)",
                            borderColor: active ? undefined : "var(--br-line)",
                            color: active ? "var(--br-blue)" : "var(--br-mute)",
                          }}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              <p className="text-[12px]" style={{ color: "var(--br-mute)" }}>
                Full variant picker arrives in the next drop.
              </p>
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleAdd}
            disabled={busy || needsVariant || soldOut}
            className="neon-btn mt-9 w-full justify-center"
          >
            {soldOut
              ? "Sold out"
              : needsVariant
                ? "Select options"
                : added
                  ? "✓ Added"
                  : busy
                    ? "Adding…"
                    : "Add to bag"}
          </button>
          {err && (
            <p className="mt-3 text-[13px]" style={{ color: "var(--br-pink)" }}>
              {err}
            </p>
          )}

          {(variant?.sku ?? product.sku) && (
            <p className="br-label mt-7" style={{ color: "var(--br-mute)" }}>
              SKU: {variant?.sku ?? product.sku}
            </p>
          )}
        </div>
      </div>

      {product.related_products && product.related_products.length > 0 && (
        <section className="br-shell br-section-b">
          <h2 className="br-section-label neon-text-blue">You may also like</h2>
          <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4 md:gap-8">
            {product.related_products.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function ProductDescription({ html }: { html: string }) {
  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(html);
  const [safe, setSafe] = useState<string | null>(null);

  useEffect(() => {
    if (!looksLikeHtml) return;
    let cancelled = false;
    import("dompurify").then(({ default: DOMPurify }) => {
      if (cancelled) return;
      setSafe(
        DOMPurify.sanitize(html, {
          ALLOWED_TAGS: [
            "p",
            "br",
            "strong",
            "b",
            "em",
            "i",
            "u",
            "ul",
            "ol",
            "li",
            "a",
            "h2",
            "h3",
            "h4",
            "blockquote",
            "span",
          ],
          ALLOWED_ATTR: ["href", "target", "rel"],
        }),
      );
    });
    return () => {
      cancelled = true;
    };
  }, [html, looksLikeHtml]);

  if (looksLikeHtml && safe) {
    return <div className="br-prose mt-7 text-[15px]" dangerouslySetInnerHTML={{ __html: safe }} />;
  }

  const plain = looksLikeHtml
    ? html
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
    : html;

  return (
    <p
      className="mt-7 whitespace-pre-line text-[15px]"
      style={{ color: "var(--br-white)", lineHeight: 1.75 }}
    >
      {plain}
    </p>
  );
}
