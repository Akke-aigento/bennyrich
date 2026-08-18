const eur = new Intl.NumberFormat("nl-BE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Prices are rendered exactly as the API returns them, formatted nl-BE with a
 * comma decimal and the symbol tight against the number: "€69,99".
 *
 * (src/lib/sellqo.ts also exports a formatEUR, but it is frozen and formats
 * it-IT — "69,99 €". Use this one.)
 */
export function formatEUR(value: number): string {
  return `€${eur.format(value)}`;
}
