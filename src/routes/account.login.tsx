import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useAuth } from "@/lib/auth";
import { AuthCard, FieldLabel, FormError } from "@/components/site/AccountShell";
import { FieldError } from "@/components/site/CheckoutForm";

type LoginSearch = { next?: string };

export const Route = createFileRoute("/account/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    next: typeof search.next === "string" ? search.next : undefined,
  }),
  head: () => ({
    meta: [{ title: "Sign in — BennyRich" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: LoginPage,
});

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

function LoginPage() {
  const navigate = useNavigate();
  const { next } = Route.useSearch();
  const { login } = useAuth();
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverErr, setServerErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof values, v: string) => setValues((s) => ({ ...s, [k]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerErr(null);
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [i.path[0], i.message])));
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      await login(values.email.trim(), values.password);
      // `next` only ever comes back to our own paths — never redirect off-site
      // on the strength of a query parameter.
      const target = next && next.startsWith("/") && !next.startsWith("//") ? next : "/account";
      navigate({ to: target });
    } catch (err) {
      setServerErr(err instanceof Error ? err.message : "Could not sign in");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthCard
      eyebrow="Account"
      title="Sign in"
      footer={
        <span style={{ color: "var(--br-mute)" }}>
          New here?{" "}
          <Link
            to="/account/register"
            className="underline underline-offset-4"
            style={{ color: "var(--br-blue-text)" }}
          >
            Create an account
          </Link>
        </span>
      }
    >
      <form onSubmit={onSubmit} noValidate>
        <label className="block">
          <FieldLabel>Email</FieldLabel>
          <input
            type="email"
            className="zd-input"
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
            autoComplete="email"
          />
          <FieldError message={errors.email} />
        </label>

        <label className="mt-6 block">
          <FieldLabel>Password</FieldLabel>
          <input
            type="password"
            className="zd-input"
            value={values.password}
            onChange={(e) => set("password", e.target.value)}
            autoComplete="current-password"
          />
          <FieldError message={errors.password} />
        </label>

        <div className="mt-4 text-right">
          <Link
            to="/account/forgot"
            className="text-[12px] underline underline-offset-4"
            style={{ color: "var(--br-mute)" }}
          >
            Forgot your password?
          </Link>
        </div>

        <FormError message={serverErr} />

        <button type="submit" disabled={busy} className="neon-btn mt-8 w-full justify-center">
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AuthCard>
  );
}
