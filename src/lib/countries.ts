/**
 * Shipping countries, in the order the checkout has always listed them:
 * Belgium first as the home market, then the neighbours, then the rest.
 *
 * Extracted from checkout.index.tsx in BR-9b so the account address form and
 * the checkout offer exactly the same list — two hand-maintained copies would
 * drift the first time a country is added.
 */
export const COUNTRIES: Array<{ code: string; name: string }> = [
  { code: "BE", name: "Belgium" },
  { code: "NL", name: "Netherlands" },
  { code: "LU", name: "Luxembourg" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "AT", name: "Austria" },
  { code: "PT", name: "Portugal" },
  { code: "IE", name: "Ireland" },
  { code: "DK", name: "Denmark" },
  { code: "SE", name: "Sweden" },
  { code: "FI", name: "Finland" },
  { code: "GB", name: "United Kingdom" },
];

/** Default for a new address form — the home market. */
export const DEFAULT_COUNTRY = "BE";

export function countryName(code: string | undefined | null): string {
  if (!code) return "";
  return COUNTRIES.find((c) => c.code === code)?.name ?? code;
}
