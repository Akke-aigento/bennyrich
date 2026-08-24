import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { sellqoFetch } from "@/lib/sellqo";
import { useAuth } from "@/lib/auth";
import { AuthCard, FormError } from "@/components/site/AccountShell";

type VerifySearch = { token?: string; email?: string };

export const Route = createFileRoute("/account/verify")({
  validateSearch: (search: Record<string, unknown>): VerifySearch => ({
    token: typeof search.token === "string" ? search.token : undefined,
    email: typeof search.email === "string" ? search.email : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Verify your email — BennyRich" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: VerifyPage,
});

type State = "idle" | "working" | "done" | "failed";

function VerifyPage() {
  const { token, email } = Route.useSearch();
  const { status, refresh } = useAuth();
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);

  // The customer arrived by clicking a link — asking them to click a second
  // button to make it count would be pointless friction. Fire once on mount.
  // A ref guards against React 19 running effects twice in development, which
  // would burn the single-use token on the first render.
  const fired = useRef(false);
  const usable = Boolean(token && email);

  useEffect(() => {
    if (!usable || fired.current) return;
    fired.current = true;
    setState("working");
    void (async () => {
      try {
        await sellqoFetch("/auth/verify", { method: "POST", body: { token, email } });
        setState("done");
        // Flip email_verified in app state so the order pages open immediately
        // for anyone who was already signed in on this browser.
        if (status === "authed") await refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not verify this link");
        setState("failed");
      }
    })();
  }, [usable, token, email, status, refresh]);

  async function onResend() {
    setError(null);
    try {
      await sellqoFetch("/account/resend-verification", { method: "POST" });
      setResent(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not send a new link";
      setError(
        message === "NOT_AUTHENTICATED"
          ? "Sign in first, then ask for a new link from your account."
          : message,
      );
    }
  }

  return (
    <AuthCard
      eyebrow="Account"
      title={state === "done" ? "Email verified" : "Verify your email"}
      lede={
        state === "done"
          ? "Your email address is confirmed. Your order history is open."
          : undefined
      }
      footer={
        <Link
          to="/account"
          className="underline underline-offset-4"
          style={{ color: "var(--br-blue-text)" }}
        >
          Back to your account
        </Link>
      }
    >
      {!usable ? (
        <p className="text-[14px]" style={{ color: "var(--br-white)", lineHeight: 1.75 }}>
          This link is incomplete. Open the most recent verification email and use the button in it.
        </p>
      ) : state === "working" || state === "idle" ? (
        <p className="text-[14px]" style={{ color: "var(--br-mute)", lineHeight: 1.75 }}>
          Checking your link…
        </p>
      ) : state === "done" ? (
        <Link to="/account" className="neon-btn w-full justify-center">
          Go to your account <span aria-hidden>→</span>
        </Link>
      ) : (
        <div>
          <p className="text-[14px]" style={{ color: "var(--br-white)", lineHeight: 1.75 }}>
            This link is no longer valid. Verification links expire after 48 hours, and each one
            works only once.
          </p>
          <FormError message={error} />
          {resent ? (
            <p className="mt-5 text-[13px]" style={{ color: "var(--br-mute)", lineHeight: 1.6 }}>
              A new link is on its way. Check your inbox, and your spam folder.
            </p>
          ) : (
            <button
              type="button"
              onClick={onResend}
              className="neon-btn mt-8 w-full justify-center"
            >
              Send me a new link
            </button>
          )}
        </div>
      )}
    </AuthCard>
  );
}
