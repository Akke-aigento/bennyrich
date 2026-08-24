/**
 * Variant labels for cart lines.
 *
 * WHY THIS EXISTS. `normalizeCart` in the frozen `sellqo.ts` derives a line's
 * variant label from:
 *
 *     it.variant_label ?? it.variant?.name ?? it.variant?.option_values
 *
 * This tenant sends neither `variant_label` nor `option_values` — its variants
 * carry **`attribute_values`**, which is exactly why BR-5's `deriveOptions` had
 * to probe both keys on the product page. So the label comes back null, and
 * because `normalizeCart` maps to a fixed shape the raw variant is discarded:
 * by the time the cart reaches a component there is nothing left to recover
 * from. The bag and the checkout summary both render "Panther Tee" with no
 * indication of which one was ordered.
 *
 * The proper fix is in `normalizeCart`, which is frozen. This resolves the
 * label in presentation instead: look the product up, match the variant by id,
 * and build the label with the same helper the product page uses.
 *
 * The API stays the source of truth whenever it actually speaks — a line that
 * already has `variant_label` is passed straight through, so this is inert the
 * moment SellQo starts sending one.
 */
import { useQueries } from "@tanstack/react-query";
import { sellqoFetch, type SellqoCartItem, type SellqoProduct } from "./sellqo";
import { optionValuesOf } from "./variants";

type ProductResponse = SellqoProduct | { product: SellqoProduct };

function unwrap(r: ProductResponse | undefined): SellqoProduct | null {
  if (!r) return null;
  return (r as { product?: SellqoProduct }).product ?? (r as SellqoProduct);
}

/**
 * `normalizeCart` joins option values with " · ". Matching it exactly means a
 * resolved label is indistinguishable from an API-supplied one, so the two
 * paths can never look like different features.
 */
const SEPARATOR = " · ";

function labelFor(product: SellqoProduct | null, variantId: string | null | undefined) {
  if (!product || !variantId) return null;
  const variant = (product.variants ?? []).find((v) => String(v.id) === String(variantId));
  if (!variant) return null;
  const values = Object.values(optionValuesOf(variant)).filter(Boolean);
  if (values.length > 0) return values.join(SEPARATOR);
  return variant.name ?? null;
}

/**
 * Variant label per cart line, keyed by cart item id.
 *
 * Only fetches for lines that have a variant but no label. The query key is
 * byte-identical to the one `product.$slug.tsx` uses, so a shopper who came
 * from the product page pays nothing, and the bag and the checkout summary
 * share one cache entry rather than fetching twice.
 */
export function useCartVariantLabels(items: SellqoCartItem[]): Map<string, string | null> {
  const slugs = [
    ...new Set(
      items
        .filter((it) => !it.variant_label && it.variant_id && it.slug)
        .map((it) => it.slug as string),
    ),
  ];

  const results = useQueries({
    queries: slugs.map((slug) => ({
      queryKey: ["sellqo", "product", slug],
      queryFn: () => sellqoFetch<ProductResponse>(`/products/${slug}`),
      staleTime: 60_000,
    })),
  });

  const bySlug = new Map(slugs.map((slug, i) => [slug, unwrap(results[i]?.data)]));

  const labels = new Map<string, string | null>();
  for (const it of items) {
    if (it.variant_label) {
      labels.set(it.id, it.variant_label);
      continue;
    }
    labels.set(it.id, labelFor(it.slug ? (bySlug.get(it.slug) ?? null) : null, it.variant_id));
  }
  return labels;
}
