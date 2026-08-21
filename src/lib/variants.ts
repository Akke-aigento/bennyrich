/**
 * Variant option handling for the product page.
 *
 * WHY THIS EXISTS. The page used to render its picker straight from
 * `product.options`, and gate the add button behind `needsVariant`. If SellQo
 * returns variants but no `options` array — which is the shape the tenant's
 * apparel appears to use — then no chips render, no variant can ever be
 * selected, `needsVariant` stays true forever and **the product cannot be
 * bought at all.** Deriving the options from the variants themselves removes
 * that failure mode.
 *
 * The per-variant attribute bag has been seen under two names, so both are
 * probed. Adding a third is a one-line change to KEYS.
 */
import type { SellqoProduct } from "./sellqo";

export type ProductOption = { name: string; values: string[] };
type Variant = NonNullable<SellqoProduct["variants"]>[number];

/** Keys a variant's option map has been seen under. */
const KEYS = ["option_values", "attribute_values"] as const;

/** The option map for one variant, whichever key it arrived under. */
export function optionValuesOf(variant: Variant | null | undefined): Record<string, string> {
  if (!variant) return {};
  const any = variant as unknown as Record<string, unknown>;
  for (const key of KEYS) {
    const v = any[key];
    if (v && typeof v === "object" && !Array.isArray(v)) {
      return v as Record<string, string>;
    }
  }
  return {};
}

/**
 * The option list to render chips from.
 *
 * Prefers what the API declared; falls back to the union of the variants' own
 * option maps, preserving first-seen order for both names and values so the
 * picker reads Colour-then-Size rather than alphabetically.
 */
export function deriveOptions(product: SellqoProduct): ProductOption[] {
  if (product.options?.length) return product.options;

  const order: string[] = [];
  const values = new Map<string, string[]>();

  for (const variant of product.variants ?? []) {
    for (const [name, value] of Object.entries(optionValuesOf(variant))) {
      if (!values.has(name)) {
        values.set(name, []);
        order.push(name);
      }
      const list = values.get(name)!;
      if (value != null && !list.includes(value)) list.push(value);
    }
  }

  return order.map((name) => ({ name, values: values.get(name)! }));
}

/** True when the product genuinely needs a choice before it can be added. */
export function hasSelectableVariants(product: SellqoProduct): boolean {
  return deriveOptions(product).length > 0 && (product.variants?.length ?? 0) > 0;
}

/** The variant matching a full selection, or null while the choice is partial. */
export function variantFor(
  product: SellqoProduct,
  selected: Record<string, string>,
): Variant | null {
  const options = deriveOptions(product);
  if (options.length === 0) return null;
  // Every option must be chosen before a variant is identified.
  if (options.some((o) => !selected[o.name])) return null;

  return (
    (product.variants ?? []).find((v) => {
      const vals = optionValuesOf(v);
      return options.every((o) => vals[o.name] === selected[o.name]);
    }) ?? null
  );
}

/**
 * Can `value` still be picked, given what else is selected?
 *
 * Considers only the OTHER options, so choosing "Blue" greys out the sizes that
 * are out of stock in blue without greying out blue itself. A variant with no
 * explicit `in_stock` is treated as available — absent data should not make a
 * product unbuyable.
 */
export function isValueAvailable(
  product: SellqoProduct,
  optionName: string,
  value: string,
  selected: Record<string, string>,
): boolean {
  const others = Object.entries(selected).filter(([k]) => k !== optionName);

  return (product.variants ?? []).some((v) => {
    const vals = optionValuesOf(v);
    if (vals[optionName] !== value) return false;
    if (!others.every(([k, val]) => vals[k] === val)) return false;
    return v.in_stock !== false;
  });
}

/**
 * Options that have exactly one value can be chosen for the shopper — a
 * single-variant product should not sit behind "Select options".
 */
export function autoSelection(product: SellqoProduct): Record<string, string> {
  const out: Record<string, string> = {};
  for (const o of deriveOptions(product)) {
    if (o.values.length === 1) out[o.name] = o.values[0];
  }
  return out;
}
