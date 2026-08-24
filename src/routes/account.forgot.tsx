import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { sellqoFetch } from "@/lib/sellqo";
import { AuthCard, FieldLabel, FormError } from "@/components/site/AccountShell";
import { FieldError } from "@/components/site/CheckoutForm";

export const Route = createFileRoute("/account/forgot")({
  head: () => ({
    meta: [
      { title: "Reset your password — BennyRich" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ForgotPage,
});

const schema = z.object({ email: z.string().email("Enter a valid email") });

function ForgotPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [serverErr, setServerErr] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerErr(null);
    const parsed = schema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message);
      return;
    }
    setError(undefined);
    setBusy(true);
    try {
      await sellqoFetch("/auth/forgot", { method: "POST", body: { email: email.trim() } });
      setSent(true);
    } catch (err) {
      setServerErr(err instanceof Error ? err.message : "Could not send the reset link");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthCard
      eyebrow="Account"
      title="Reset password"
      lede={
        sent
          ? undefined
          : "Enter the email on your account and we'll send you a link to set a new password."
      }
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
      {sent ? (
        // Deliberately neutral: confirming whether an address has an account
        // would turn this form into an account-enumeration tool.
        <p className="text-[14px]" style={{ color: "var(--br-white)", lineHeight: 1.75 }}>
          If an account exists for that email, a reset link is on its way. Check your inbox and your
          spam folder.
        </p>
      ) : (
        <form onSubmit={onSubmit} noValidate>
          <label className="block">
            <FieldLabel>Email</FieldLabel>
            <input
              type="email"
              className="zd-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <FieldError message={error} />
          </label>
          <FormError message={serverErr} />
          <button type="submit" disabled={busy} className="neon-btn mt-8 w-full justify-center">
            {busy ? "Sending…" : "Send reset link"}
          </button>
        </form>
      )}
    </AuthCard>
  );
}
