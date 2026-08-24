/**
 * A nudge, not a wall.
 *
 * An unverified customer can sign in, edit their profile, manage addresses and
 * use the wishlist. Only order history is gated, because only order history
 * exposes data that predates the account. So this says what is missing and how
 * to fix it, and then gets out of the way — it renders nothing at all once the
 * address is confirmed.
 *
 * Shape and motion follow CookieBanner: quiet frame, hard edge, opacity-only
 * entrance. Nothing here pulses.
 */
import { useState } from "react";
import { sellqoFetch } from "@/lib/sellqo";
import { useAuth } from "@/lib/auth";

export function VerifyBanner() {
  const { customer, status } = useAuth();
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only for a signed-in customer we KNOW is unverified. `email_verified` is
  // optional on the type, so an older core that omits it must not produce a
  // banner telling people to check an inbox for an email that never went out.
  if (status !== "authed" || customer?.email_verified !== false) return null;

  async function onResend() {
    setBusy(true);
    setError(null);
    try {
      await sellqoFetch("/account/resend-verification", { method: "POST" });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send a new link");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      role="region"
      aria-label="Email verification"
      className="quiet-frame mt-10 border px-6 py-5"
      style={{
        borderRadius: "var(--radius)",
        background: "var(--br-black)",
        animation: "br-consent-in 200ms ease both",
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
        <div className="max-w-[56ch]">
          <p className="text-[14px]" style={{ color: "var(--br-white)", lineHeight: 1.6 }}>
            Please verify your email — check your inbox
          </p>
          <p className="mt-2 text-[13px]" style={{ color: "var(--br-mute)", lineHeight: 1.6 }}>
            Your order history opens once you confirm the address. Everything else works now.
          </p>
          {error && (
            <p className="mt-3 text-[13px]" style={{ color: "var(--br-pink)", lineHeight: 1.6 }}>
              {error}
            </p>
          )}
        </div>

        {sent ? (
          <p className="text-[13px]" style={{ color: "var(--br-mute)" }}>
            Link sent — check your spam folder too.
          </p>
        ) : (
          <button
            type="button"
            onClick={onResend}
            disabled={busy}
            className="neon-btn neon-btn-quiet shrink-0"
          >
            {busy ? "Sending…" : "Send it again"}
          </button>
        )}
      </div>
    </div>
  );
}
