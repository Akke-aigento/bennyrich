import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/SiteLayout";
import { ProductCard } from "@/components/site/ProductCard";
import {
  formatEUR,
  imageUrl,
  sellqoFetch,
  type SellqoProduct,
} from "@/lib/sellqo";
import { useCart } from "@/lib/cart-context";
import { toast } from "sonner";

export const Route = createFileRoute("/product/$slug")({
  head: () => ({
    meta: [
      { title: "Product — Zona Dorata" },
      { name: "description", content: "Discover this piece at Zona Dorata." },
    ],
  }),
  component: ProductPage,
});

type ProductResponse = SellqoProduct | { product: SellqoProduct };
function unwrap(r: ProductResponse | undefined): SellqoProduct | null {
  if (!r) return null;
  return (r as any).product ?? (r as SellqoProduct);
}

function ProductPage() {
  const { slug } = Route.useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ["sellqo", "product", slug],
    queryFn: () => sellqoFetch<ProductResponse>(`/products/${slug}`),
    staleTime: 60_000,
  });

  const product = unwrap(data);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-[1280px] px-6 pt-8">
        <nav className="ui-label text-[0.7rem]" style={{ color: "var(--muted-tone)" }}>
          <Link to="/">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/perfumes">Perfumes</Link>
          {product && (
            <>
              <span className="mx-2">/</span>
              <span style={{ color: "var(--ink)" }}>{product.name}</span>
            </>
          )}
        </nav>
      </div>

      {isLoading ? (
        <div className="mx-auto max-w-[1280px] px-6 py-12">Loading…</div>
      ) : error || !product ? (
        <div className="mx-auto max-w-[1280px] px-6 py-24 text-center">
          <p style={{ color: "var(--muted-tone)" }}>
            {(error as Error)?.message || "Product not found."}
          </p>
        </div>
      ) : (
        <ProductBody product={product} />
      )}
    </SiteLayout>
  );
}

function ProductBody({ product }: { product: SellqoProduct }) {
  const images = useMemo(() => {
    const list = (product.images ?? []).map(imageUrl).filter(Boolean) as string[];
    if (list.length === 0) {
      const cover = imageUrl(product.featured_image);
      if (cover) list.push(cover);
    }
    return list;
  }, [product]);

  const [activeIdx, setActiveIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [added, setAdded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const { addItem, openCart } = useCart();

  const variant = useMemo(() => {
    if (!product.has_variants || !product.variants?.length) return null;
    return (
      product.variants.find((v) => {
        if (!v.option_values) return false;
        return Object.entries(v.option_values).every(([k, val]) => selected[k] === val);
      }) ?? null
    );
  }, [product, selected]);

  const needsVariant = !!product.has_variants && !variant;
  const price = variant?.price ?? product.price;
  const hasSale =
    product.compare_at_price && product.compare_at_price > price;

  async function handleAdd() {
    if (busy || needsVariant) return;
    setBusy(true);
    setErr(null);
    try {
      await addItem(product.id, variant?.id, 1);
      setAdded(true);
      toast.success("Added to your bag", {
        action: { label: "View bag", onClick: () => openCart() },
      });
      setTimeout(() => setAdded(false), 2000);
    } catch (e: any) {
      setErr(e?.message ?? "Could not add to bag");
      toast.error(e?.message ?? "Could not add to bag");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="mx-auto grid max-w-[1280px] gap-8 px-6 py-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12 lg:px-8 lg:py-12 xl:grid-cols-[minmax(0,1.12fr)_minmax(360px,0.88fr)]">
        {/* Gallery */}
        <div className="min-w-0 md:sticky md:top-24 md:self-start">
          <button
            type="button"
            onClick={() => images.length && setLightbox(true)}
            className="block w-full overflow-hidden"
            style={{ background: "var(--bone)", aspectRatio: "3 / 4" }}
          >
            {images[activeIdx] ? (
              <img
                src={images[activeIdx]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : null}
          </button>
          {images.length > 1 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {images.slice(0, 5).map((src, i) => (
                <button
                  key={src + i}
                  onClick={() => setActiveIdx(i)}
                  className="h-16 w-16 overflow-hidden"
                  style={{
                    border: `1px solid ${i === activeIdx ? "var(--gold)" : "var(--line)"}`,
                  }}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0">
          <h1
            className="text-[2rem]"
            style={{ fontFamily: "var(--font-display)", color: "var(--ink)", fontWeight: 500 }}
          >
            {product.name}
          </h1>
          <div className="mt-4 flex items-center gap-3">
            {hasSale && (
              <span style={{ color: "var(--muted-tone)", textDecoration: "line-through" }}>
                {formatEUR(product.compare_at_price as number)}
              </span>
            )}
            <span className="text-[1.25rem]" style={{ color: "var(--ink)", fontWeight: 500 }}>
              {formatEUR(price)}
            </span>
            {hasSale && (
              <span
                className="ui-label text-[0.7rem] px-2 py-1"
                style={{ border: "1px solid var(--gold)", color: "var(--gold)" }}
              >
                Sale
              </span>
            )}
          </div>

          {product.description && (
            <ProductDescription html={product.description} />
          )}

          {product.has_variants && product.options?.length ? (
            <div className="mt-8 space-y-5">
              {product.options.map((opt) => (
                <div key={opt.name}>
                  <p
                    className="ui-label text-[0.7rem] mb-2"
                    style={{ color: "var(--muted-tone)" }}
                  >
                    {opt.name}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {opt.values.map((val) => {
                      const active = selected[opt.name] === val;
                      return (
                        <button
                          key={val}
                          onClick={() =>
                            setSelected((s) => ({ ...s, [opt.name]: val }))
                          }
                          className="px-4 py-2 text-[0.85rem] transition-colors"
                          style={{
                            border: `1px solid ${active ? "var(--ink)" : "var(--line)"}`,
                            background: active ? "var(--ink)" : "transparent",
                            color: active ? "var(--paper)" : "var(--ink)",
                          }}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          <button
            onClick={handleAdd}
            disabled={busy || needsVariant || product.in_stock === false}
            className="mt-8 ui-label w-full py-4 text-[0.8rem] transition-colors disabled:opacity-50"
            style={{
              border: "1px solid var(--ink)",
              color: added ? "var(--paper)" : "var(--ink)",
              background: added ? "var(--ink)" : "transparent",
            }}
          >
            {product.in_stock === false
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
            <p className="mt-3 text-[0.8rem]" style={{ color: "var(--destructive)" }}>
              {err}
            </p>
          )}

          {(variant?.sku ?? product.sku) && (
            <p className="mt-6 ui-label text-[0.7rem]" style={{ color: "var(--muted-tone)" }}>
              SKU: {variant?.sku ?? product.sku}
            </p>
          )}
        </div>
      </div>

      {product.related_products && product.related_products.length > 0 && (
        <section className="mx-auto max-w-[1280px] px-6 py-20">
          <h2
            className="text-center text-[1.5rem]"
            style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
          >
            You may also like
          </h2>
          <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {product.related_products.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {lightbox && images[activeIdx] && (
        <button
          type="button"
          onClick={() => setLightbox(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-8"
          style={{ background: "rgba(20,16,11,0.92)" }}
          aria-label="Close"
        >
          <span
            className="absolute right-6 top-6 ui-label text-[1.5rem]"
            style={{ color: "var(--bone)" }}
          >
            ✕
          </span>
          <img
            src={images[activeIdx]}
            alt={product.name}
            className="max-h-full max-w-full object-contain"
          />
        </button>
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
            "p", "br", "strong", "b", "em", "i", "u", "ul", "ol", "li",
            "a", "h2", "h3", "h4", "blockquote", "span",
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
    return (
      <div
        className="prose-zd mt-6 text-[0.95rem]"
        style={{ color: "var(--ink)", lineHeight: 1.7 }}
        dangerouslySetInnerHTML={{ __html: safe }}
      />
    );
  }
  // SSR / pre-hydration fallback: strip tags so it reads as plain text.
  const plain = looksLikeHtml
    ? html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
    : html;
  return (
    <p
      className="mt-6 text-[0.95rem] whitespace-pre-line"
      style={{ color: "var(--ink)", lineHeight: 1.7 }}
    >
      {plain}
    </p>
  );
}