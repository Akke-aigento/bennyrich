/**
 * The "confirm your email first" state for order history.
 *
 * Shared by the list and the detail page so the two cannot drift, and used both
 * as a pre-emptive gate (we know the address is unverified) and as a fallback
 * (core refused). Same words either way — the customer does not care which of
 * the two fired.
 */
import { useState } from "react";
import { sellqoFetch } from "@/lib/sellqo";

export function VerifyGate() {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onResend() {
    setBusy(true);
    setError(null);
    try {
      await sellqoFetch("/account/resend-verification", { method: "POST" });
      setSent(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not send a new link";
      setError(
        message === "NOT_AUTHENTICATED"
          ? "Your session expired. Sign in again to request a new link."
          : message,
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="quiet-frame border p-7" style={{ borderRadius: "var(--radius)" }}>
      <p className="text-[15px]" style={{ color: "var(--br-white)", lineHeight: 1.6 }}>
        Verify your email to view your order history
      </p>
      <p
        className="mt-3 max-w-[52ch] text-[14px]"
        style={{ color: "var(--br-mute)", lineHeight: 1.75 }}
      >
        We sent a confirmation link when you created your account. Open it and your orders appear
        here. Everything else in your account works in the meantime.
      </p>

      {error && (
        <p className="mt-5 text-[13px]" style={{ color: "var(--br-pink)", lineHeight: 1.6 }}>
          {error}
        </p>
      )}

      {sent ? (
        <p className="mt-6 text-[13px]" style={{ color: "var(--br-mute)", lineHeight: 1.6 }}>
          A new link is on its way. Check your inbox, and your spam folder.
        </p>
      ) : (
        <button type="button" onClick={onResend} disabled={busy} className="neon-btn mt-7">
          {busy ? "Sending…" : "Send the link again"}
        </button>
      )}
    </div>
  );
}
