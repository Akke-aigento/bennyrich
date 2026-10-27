import { Wordmark } from "../../assets/brand/Wordmark";

/**
 * BILLING-LOCK-2 — full-page screen shown when SellQo reports the shop closed.
 * No navigation, cart or checkout. `noindex` is set in the root head().
 */
export function ShopClosed() {
  return (
    <main
      className="br-shell flex min-h-screen flex-col items-center justify-center py-24 text-center"
      style={{ background: "var(--br-black)" }}
    >
      <Wordmark tone="blue" className="h-24 w-auto" />
      <h1
        className="br-display neon-hero-white mt-14"
        style={{ fontSize: "clamp(26px, 4.2vw, 46px)", letterSpacing: "0.06em" }}
      >
        Temporarily closed
      </h1>
      <p
        className="mt-6 max-w-[42ch] text-[15px]"
        style={{ color: "var(--br-mute)", lineHeight: 1.8 }}
      >
        We&rsquo;re back soon.
      </p>
    </main>
  );
}
