/**
 * Cookie consent banner.
 *
 * Shows once, remembers the answer, and gates nothing today because nothing is
 * tracked yet — see src/lib/consent.tsx for how a script plugs in later.
 *
 * Renders nothing until the provider has read the cookie, so it cannot flash on
 * a return visit or produce a hydration mismatch.
 */
import { Link } from "@tanstack/react-router";
import { useConsent } from "@/lib/consent";

export function CookieBanner() {
  const { ready, choice, accept, decline } = useConsent();

  if (!ready || choice !== null) return null;

  return (
    <div
      role="region"
      aria-label="Cookie notice"
      className="br-shell fixed inset-x-0 bottom-0 z-[55] pb-5"
    >
      {/* Opacity-only entrance, 200ms, and the global prefers-reduced-motion
          block in tokens.css switches it off. Nothing pulses. */}
      <div
        className="quiet-frame flex flex-col gap-5 border px-6 py-5 md:flex-row md:items-center md:justify-between md:gap-8"
        style={{
          background: "var(--br-black)",
          borderRadius: "var(--radius)",
          animation: "br-consent-in 200ms ease both",
        }}
      >
        <p className="text-[13px]" style={{ color: "var(--br-white)", lineHeight: 1.7 }}>
          We use cookies to improve your experience.{" "}
          <Link
            to="/privacy-policy"
            className="underline underline-offset-4 transition-opacity duration-200 hover:opacity-70"
            style={{ color: "var(--br-blue-text)" }}
          >
            Privacy policy
          </Link>
        </p>

        <div className="flex shrink-0 gap-3">
          <button type="button" onClick={decline} className="neon-btn neon-btn-quiet">
            Decline
          </button>
          <button type="button" onClick={accept} className="neon-btn">
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
