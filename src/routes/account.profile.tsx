import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { sellqoFetch } from "@/lib/sellqo";
import { useAuth } from "@/lib/auth";
import { RequireAuth } from "@/components/site/RequireAuth";
import { VerifyBanner } from "@/components/site/VerifyBanner";
import { FieldLabel, FormError } from "@/components/site/AccountShell";
import { FieldError } from "@/components/site/CheckoutForm";

export const Route = createFileRoute("/account/profile")({
  head: () => ({
    meta: [{ title: "Your profile — BennyRich" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: () => (
    <RequireAuth>
      <ProfilePage />
    </RequireAuth>
  ),
});

const detailsSchema = z.object({
  first_name: z.string().min(1, "Required"),
  last_name: z.string().min(1, "Required"),
  phone: z.string().optional(),
});

const MIN_PASSWORD = 8;
const passwordSchema = z
  .object({
    current_password: z.string().min(1, "Required"),
    new_password: z.string().min(MIN_PASSWORD, `At least ${MIN_PASSWORD} characters`),
    confirm: z.string(),
  })
  .refine((v) => v.new_password === v.confirm, {
    path: ["confirm"],
    message: "Passwords do not match",
  });

type DetailErrors = Partial<Record<"first_name" | "last_name" | "phone", string>>;
type PasswordErrors = Partial<Record<"current_password" | "new_password" | "confirm", string>>;

function ProfilePage() {
  const { customer, refresh } = useAuth();

  return (
    <div className="br-shell br-section">
      <p className="br-section-label" style={{ color: "var(--br-mute)" }}>
        <Link to="/account" style={{ color: "var(--br-mute)" }}>
          Account
        </Link>{" "}
        / Profile
      </p>
      <h1
        className="br-display neon-hero-white mt-5"
        style={{ fontSize: "clamp(26px, 4.2vw, 46px)", letterSpacing: "0.06em" }}
      >
        Profile
      </h1>
      <p className="mt-5 text-[14px]" style={{ color: "var(--br-mute)" }}>
        {customer?.email}
      </p>

      <VerifyBanner />

      <div className="mt-10 flex max-w-[560px] flex-col gap-4">
        <DetailsCard onSaved={refresh} />
        <PasswordCard />
      </div>
    </div>
  );
}

function DetailsCard({ onSaved }: { onSaved: () => Promise<void> | void }) {
  const { customer } = useAuth();
  const [values, setValues] = useState({ first_name: "", last_name: "", phone: "" });
  const [marketing, setMarketing] = useState(false);
  const [errors, setErrors] = useState<DetailErrors>({});
  const [serverErr, setServerErr] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Seed from the profile once it arrives. The provider fetches /account/me on
  // mount, so on a cold load this component renders before the customer exists.
  useEffect(() => {
    if (!customer) return;
    setValues({
      first_name: customer.first_name ?? "",
      last_name: customer.last_name ?? "",
      phone: customer.phone ?? "",
    });
    setMarketing(customer.accepts_marketing === true);
  }, [customer]);

  const save = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      sellqoFetch("/account/me", { method: "PATCH", body }),
    onSuccess: async () => {
      setSaved(true);
      // The context holds the customer, so it has to re-read after a write or
      // the header keeps greeting you by your old name.
      await onSaved();
    },
    onError: (err: unknown) =>
      setServerErr(err instanceof Error ? err.message : "Could not save your details"),
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerErr(null);
    setSaved(false);
    const parsed = detailsSchema.safeParse(values);
    if (!parsed.success) {
      const next: DetailErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof DetailErrors;
        if (key && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    save.mutate({
      first_name: values.first_name.trim(),
      last_name: values.last_name.trim(),
      phone: values.phone.trim() || null,
      accepts_marketing: marketing,
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="quiet-frame border p-7"
      style={{ borderRadius: "var(--radius)" }}
    >
      <p className="br-section-label" style={{ color: "var(--br-mute)" }}>
        Your details
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <label className="block">
          <FieldLabel>First name</FieldLabel>
          <input
            className="zd-input"
            value={values.first_name}
            onChange={(e) => setValues((v) => ({ ...v, first_name: e.target.value }))}
            autoComplete="given-name"
          />
          <FieldError message={errors.first_name} />
        </label>
        <label className="block">
          <FieldLabel>Last name</FieldLabel>
          <input
            className="zd-input"
            value={values.last_name}
            onChange={(e) => setValues((v) => ({ ...v, last_name: e.target.value }))}
            autoComplete="family-name"
          />
          <FieldError message={errors.last_name} />
        </label>
      </div>

      <label className="mt-5 block">
        <FieldLabel>Phone</FieldLabel>
        <input
          className="zd-input"
          value={values.phone}
          onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
          autoComplete="tel"
        />
        <span className="mt-2 block text-[12px]" style={{ color: "var(--br-mute)" }}>
          Optional. Used only for delivery questions.
        </span>
      </label>

      <label className="mt-6 flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={marketing}
          onChange={(e) => setMarketing(e.target.checked)}
          className="mt-[3px]"
        />
        <span className="text-[13px]" style={{ color: "var(--br-mute)", lineHeight: 1.6 }}>
          Email me about new drops and restocks.
        </span>
      </label>

      <FormError message={serverErr} />
      {saved && !serverErr && (
        <p className="mt-5 text-[13px]" style={{ color: "var(--br-mute)" }}>
          Saved.
        </p>
      )}

      <button type="submit" disabled={save.isPending} className="neon-btn mt-7">
        {save.isPending ? "Saving…" : "Save details"}
      </button>
    </form>
  );
}

function PasswordCard() {
  const empty = { current_password: "", new_password: "", confirm: "" };
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState<PasswordErrors>({});
  const [serverErr, setServerErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const change = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      sellqoFetch("/account/password", { method: "POST", body }),
    onSuccess: () => {
      setDone(true);
      setValues(empty);
    },
    onError: (err: unknown) =>
      setServerErr(err instanceof Error ? err.message : "Could not change your password"),
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerErr(null);
    setDone(false);
    const parsed = passwordSchema.safeParse(values);
    if (!parsed.success) {
      const next: PasswordErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof PasswordErrors;
        if (key && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    // `confirm` never leaves the browser — core only wants the two passwords.
    change.mutate({
      current_password: values.current_password,
      new_password: values.new_password,
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="quiet-frame border p-7"
      style={{ borderRadius: "var(--radius)" }}
    >
      <p className="br-section-label" style={{ color: "var(--br-mute)" }}>
        Password
      </p>

      <label className="mt-6 block">
        <FieldLabel>Current password</FieldLabel>
        <input
          type="password"
          className="zd-input"
          value={values.current_password}
          onChange={(e) => setValues((v) => ({ ...v, current_password: e.target.value }))}
          autoComplete="current-password"
        />
        <FieldError message={errors.current_password} />
      </label>

      <label className="mt-5 block">
        <FieldLabel>New password</FieldLabel>
        <input
          type="password"
          className="zd-input"
          value={values.new_password}
          onChange={(e) => setValues((v) => ({ ...v, new_password: e.target.value }))}
          autoComplete="new-password"
        />
        <span className="mt-2 block text-[12px]" style={{ color: "var(--br-mute)" }}>
          At least {MIN_PASSWORD} characters.
        </span>
        <FieldError message={errors.new_password} />
      </label>

      <label className="mt-5 block">
        <FieldLabel>Confirm new password</FieldLabel>
        <input
          type="password"
          className="zd-input"
          value={values.confirm}
          onChange={(e) => setValues((v) => ({ ...v, confirm: e.target.value }))}
          autoComplete="new-password"
        />
        <FieldError message={errors.confirm} />
      </label>

      <FormError message={serverErr} />
      {done && !serverErr && (
        <p className="mt-5 text-[13px]" style={{ color: "var(--br-mute)" }}>
          Password changed.
        </p>
      )}

      <button type="submit" disabled={change.isPending} className="neon-btn mt-7">
        {change.isPending ? "Saving…" : "Change password"}
      </button>
    </form>
  );
}
