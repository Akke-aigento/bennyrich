import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useAuth } from "@/lib/auth";
import { AuthCard, FieldLabel, FormError } from "@/components/site/AccountShell";
import { FieldError } from "@/components/site/CheckoutForm";

export const Route = createFileRoute("/account/register")({
  head: () => ({
    meta: [
      { title: "Create an account — BennyRich" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: RegisterPage,
});

const MIN_PASSWORD = 8;

const schema = z.object({
  first_name: z.string().min(1, "Required"),
  last_name: z.string().min(1, "Required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(MIN_PASSWORD, `At least ${MIN_PASSWORD} characters`),
  phone: z.string().optional(),
});

function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [values, setValues] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone: "",
    accepts_marketing: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverErr, setServerErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (k: string, v: string | boolean) => setValues((s) => ({ ...s, [k]: v }));

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
      await register({
        email: values.email.trim(),
        password: values.password,
        first_name: values.first_name.trim(),
        last_name: values.last_name.trim(),
        phone: values.phone.trim() || undefined,
        accepts_marketing: values.accepts_marketing,
      });
      navigate({ to: "/account" });
    } catch (err) {
      setServerErr(err instanceof Error ? err.message : "Could not create the account");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthCard
      eyebrow="Account"
      title="Create account"
      lede="Save your details, keep your addresses, and track what you've ordered."
      footer={
        <span style={{ color: "var(--br-mute)" }}>
          Already have an account?{" "}
          <Link
            to="/account/login"
            className="underline underline-offset-4"
            style={{ color: "var(--br-blue-text)" }}
          >
            Sign in
          </Link>
        </span>
      }
    >
      <form onSubmit={onSubmit} noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <FieldLabel>First name</FieldLabel>
            <input
              className="zd-input"
              value={values.first_name}
              onChange={(e) => set("first_name", e.target.value)}
              autoComplete="given-name"
            />
            <FieldError message={errors.first_name} />
          </label>
          <label className="block">
            <FieldLabel>Last name</FieldLabel>
            <input
              className="zd-input"
              value={values.last_name}
              onChange={(e) => set("last_name", e.target.value)}
              autoComplete="family-name"
            />
            <FieldError message={errors.last_name} />
          </label>
        </div>

        <label className="mt-5 block">
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

        <label className="mt-5 block">
          <FieldLabel>Password</FieldLabel>
          <input
            type="password"
            className="zd-input"
            value={values.password}
            onChange={(e) => set("password", e.target.value)}
            autoComplete="new-password"
          />
          {/* State the rule up front rather than only on rejection. */}
          <span className="mt-2 block text-[12px]" style={{ color: "var(--br-mute)" }}>
            At least {MIN_PASSWORD} characters.
          </span>
          <FieldError message={errors.password} />
        </label>

        <label className="mt-5 block">
          <FieldLabel>Phone (optional)</FieldLabel>
          <input
            className="zd-input"
            value={values.phone}
            onChange={(e) => set("phone", e.target.value)}
            autoComplete="tel"
          />
        </label>

        <label
          className="mt-6 flex items-start gap-3 text-[13px]"
          style={{ color: "var(--br-white)" }}
        >
          <input
            type="checkbox"
            checked={values.accepts_marketing}
            onChange={(e) => set("accepts_marketing", e.target.checked)}
            className="mt-1"
          />
          Email me about new drops and stories from BennyRich.
        </label>

        <FormError message={serverErr} />

        <button type="submit" disabled={busy} className="neon-btn mt-8 w-full justify-center">
          {busy ? "Creating…" : "Create account"}
        </button>
      </form>
    </AuthCard>
  );
}
