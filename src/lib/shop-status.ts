/**
 * BILLING-LOCK-2 — SellQo decides centrally whether this shop is open.
 *
 * The status comes from the storefront-api action `get_shop_status`, reached
 * through the existing `sellqoProxy` (its fallback maps `/get_shop_status` onto
 * that action, so the proxy itself is unchanged).
 *
 * FAIL-OPEN, always: an error, a timeout, a non-200, an unknown action or a
 * missing field all mean OPEN. Only an explicit `open === false` closes the
 * shop — it must never close because SellQo is unreachable.
 *
 * Pure helpers only in this file (no imports), so they can be tested alone.
 */

export const SHOP_STATUS_TIMEOUT_MS = 3000;
export const SHOP_STATUS_CACHE_MS = 30_000;

/** The proxy unwraps `{ success, data }`, so `raw` is `data` (or the whole body). */
export function readShopOpen(raw: unknown): boolean {
  if (raw && typeof raw === "object" && (raw as { open?: unknown }).open === false) {
    return false;
  }
  return true;
}

/** Resolve the status from a fetcher, open on any failure or after `timeoutMs`. */
export async function resolveShopOpen(
  fetcher: () => Promise<unknown>,
  timeoutMs: number = SHOP_STATUS_TIMEOUT_MS,
): Promise<boolean> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const timeout = new Promise<"timeout">((resolve) => {
      timer = setTimeout(() => resolve("timeout"), timeoutMs);
    });
    const raw = await Promise.race([fetcher(), timeout]);
    if (raw === "timeout") return true;
    return readShopOpen(raw);
  } catch {
    return true;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * Checkout: storefront-api answers HTTP 423 with `error.code === 'SHOP_CLOSED'`.
 * The proxy turns an object `error` into `Error(JSON.stringify(error))`, so the
 * code and message arrive inside the error message. Returns that message, or
 * null for any other error.
 */
export function shopClosedMessage(err: unknown): string | null {
  const msg = err instanceof Error ? err.message : typeof err === "string" ? err : null;
  if (!msg || msg[0] !== "{") return null;
  try {
    const parsed = JSON.parse(msg) as { code?: unknown; message?: unknown };
    if (parsed?.code === "SHOP_CLOSED" && typeof parsed.message === "string" && parsed.message) {
      return parsed.message;
    }
  } catch {
    /* not JSON — not ours */
  }
  return null;
}
