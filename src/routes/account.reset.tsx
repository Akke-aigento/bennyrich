import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { sellqoFetch } from "@/lib/sellqo";
import { AuthCard, FieldLabel, FormError } from "@/components/site/AccountShell";
import { FieldError } from "@/components/site/CheckoutForm";

type ResetSearch = { token?: string; email?: string };

export const Route = createFileRoute("/account/reset")({
  validateSearch: (search: Record<string, unknown>): ResetSearch => ({
    token: typeof search.token === "string" ? search.token : undefined,
    email: typeof search.email === "string" ? search.email : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Set a new password — BennyRich" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ResetPage,
});

const MIN_PASSWORD = 8;
const schema = z.object({
  password: z.string().min(MIN_PASSWORD, `At least ${MIN_PASSWORD} characters`),
});

function ResetPage() {
  const navigate = useNavigate();
  const { token, email } = Route.useSearch();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [serverErr, setServerErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // NOTE (open item): the reset email sent by the core edge function links to
  // sellqo.lovable.app/shop/{slug}/reset-password, not here, so today nobody
  // arrives on this page from an email. It works for anyone who does arrive
  // with the right params. Making that URL tenant-aware is a core change —
  // see docs/role-audit.md.
  const usable = Boolean(token && email);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerErr(null);
    const parsed = schema.safeParse({ password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message);
      return;
    }
    setError(undefined);
    setBusy(true);
    try {
      await sellqoFetch("/auth/reset", { method: "POST", body: { token, email, password } });
      navigate({ to: "/account/login" });
    } catch (err) {
      setServerErr(err instanceof Error ? err.message : "Could not reset the password");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthCard
      eyebrow="Account"
      title="New password"
      lede={usable ? "Choose a new password for your account." : undefined}
      footer={
        <Link
          to="/account/login"
          className="underline underline-offset-4"
          style={{ color: "var(--br-blue-text)" }}
        >
          Back to sign in
        </Link>
      }
    >
      {!usable ? (
        <p className="text-[14px]" style={{ color: "var(--br-white)", lineHeight: 1.75 }}>
          This reset link is incomplete or has expired. Request a new one from the{" "}
          <Link
            to="/account/forgot"
            className="underline underline-offset-4"
            style={{ color: "var(--br-blue-text)" }}
          >
            reset password
          </Link>{" "}
          page.
        </p>
      ) : (
        <form onSubmit={onSubmit} noValidate>
          <label className="block">
            <FieldLabel>New password</FieldLabel>
            <input
              type="password"
              className="zd-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <span className="mt-2 block text-[12px]" style={{ color: "var(--br-mute)" }}>
              At least {MIN_PASSWORD} characters.
            </span>
            <FieldError message={error} />
          </label>
          <FormError message={serverErr} />
          <button type="submit" disabled={busy} className="neon-btn mt-8 w-full justify-center">
            {busy ? "Saving…" : "Set new password"}
          </button>
        </form>
      )}
    </AuthCard>
  );
}
