import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { RequireAuth } from "@/components/site/RequireAuth";
import { FieldLabel, FormError } from "@/components/site/AccountShell";
import { FieldError } from "@/components/site/CheckoutForm";
import { useAuth } from "@/lib/auth";
import { sellqoFetch } from "@/lib/sellqo";
import { COUNTRIES, DEFAULT_COUNTRY, countryName } from "@/lib/countries";
import {
  addressId,
  formatAddressLines,
  hasDefaultFlag,
  isDefaultAddress,
  unwrapAddresses,
  type CustomerAddress,
} from "@/lib/account";

export const Route = createFileRoute("/account/addresses")({
  head: () => ({
    meta: [
      { title: "Your addresses — BennyRich" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <AddressesPage />
    </RequireAuth>
  ),
});

const schema = z.object({
  first_name: z.string().min(1, "Required"),
  last_name: z.string().min(1, "Required"),
  address_line_1: z.string().min(1, "Required"),
  address_line_2: z.string().optional(),
  postal_code: z.string().min(1, "Required"),
  city: z.string().min(1, "Required"),
  country: z.string().min(2, "Required"),
});

const emptyForm = {
  first_name: "",
  last_name: "",
  address_line_1: "",
  address_line_2: "",
  postal_code: "",
  city: "",
  country: DEFAULT_COUNTRY,
};

function AddressesPage() {
  const { customer } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ["customer", "addresses", customer?.id ?? "none"];

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => sellqoFetch("/account/addresses"),
  });

  const addresses = unwrapAddresses(data);
  const showDefaults = hasDefaultFlag(addresses);

  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  // Every mutation reseeds from the array the API returns rather than patching
  // local state, so the list can never drift from the server's view.
  const applyResult = (result: unknown) => {
    const next = unwrapAddresses(result);
    if (next.length > 0 || Array.isArray(result)) queryClient.setQueryData(queryKey, result);
    else void queryClient.invalidateQueries({ queryKey });
    setEditing(null);
    setAdding(false);
  };

  const save = useMutation({
    mutationFn: async ({ id, values }: { id?: string; values: typeof emptyForm }) =>
      id
        ? sellqoFetch(`/account/addresses/${id}`, { method: "PATCH", body: values })
        : sellqoFetch("/account/addresses", { method: "POST", body: values }),
    onSuccess: applyResult,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => sellqoFetch(`/account/addresses/${id}`, { method: "DELETE" }),
    onSuccess: applyResult,
  });

  return (
    <div className="br-shell br-section">
      <p className="br-section-label" style={{ color: "var(--br-mute)" }}>
        <Link to="/account" style={{ color: "var(--br-mute)" }}>
          Account
        </Link>{" "}
        / Addresses
      </p>
      <h1
        className="br-display neon-hero-white mt-5"
        style={{ fontSize: "clamp(26px, 4.2vw, 46px)", letterSpacing: "0.06em" }}
      >
        Addresses
      </h1>

      {isLoading ? (
        <p className="mt-10 text-[14px]" style={{ color: "var(--br-mute)" }}>
          Loading your addresses…
        </p>
      ) : error ? (
        <FormError message={(error as Error).message || "Could not load your addresses."} />
      ) : (
        <>
          {addresses.length === 0 && !adding && (
            <p className="mt-10 text-[14px]" style={{ color: "var(--br-mute)", lineHeight: 1.8 }}>
              No saved addresses yet. Add one and it will be waiting at checkout.
            </p>
          )}

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {addresses.map((address) => {
              const id = addressId(address);
              return editing && editing === id ? (
                <AddressForm
                  key={id}
                  initial={address}
                  busy={save.isPending}
                  error={save.error instanceof Error ? save.error.message : null}
                  onCancel={() => setEditing(null)}
                  onSubmit={(values) => save.mutate({ id, values })}
                />
              ) : (
                <AddressCard
                  key={id ?? JSON.stringify(address)}
                  address={address}
                  showDefault={showDefaults}
                  busy={remove.isPending}
                  onEdit={() => id && setEditing(id)}
                  onDelete={() => id && remove.mutate(id)}
                />
              );
            })}

            {adding && (
              <AddressForm
                initial={undefined}
                busy={save.isPending}
                error={save.error instanceof Error ? save.error.message : null}
                onCancel={() => setAdding(false)}
                onSubmit={(values) => save.mutate({ values })}
              />
            )}
          </div>

          {!adding && (
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setAdding(true);
              }}
              className="neon-btn mt-10"
            >
              Add an address
            </button>
          )}
        </>
      )}
    </div>
  );
}

function AddressCard({
  address,
  showDefault,
  busy,
  onEdit,
  onDelete,
}: {
  address: CustomerAddress;
  showDefault: boolean;
  busy: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="quiet-frame border p-6" style={{ borderRadius: "var(--radius)" }}>
      {/* Only shown when the API actually speaks about defaults. */}
      {showDefault && isDefaultAddress(address) && (
        <span className="br-label text-[10px]" style={{ color: "var(--br-blue-text)" }}>
          Default
        </span>
      )}
      <div className="mt-2 space-y-1 text-[14px]" style={{ color: "var(--br-white)" }}>
        {formatAddressLines(address).map((line) => (
          <p key={line}>{line}</p>
        ))}
        <p style={{ color: "var(--br-mute)" }}>{countryName(address.country)}</p>
      </div>
      <div className="mt-6 flex gap-5">
        <button
          type="button"
          onClick={onEdit}
          className="br-label underline underline-offset-4"
          style={{ color: "var(--br-blue-text)" }}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={busy}
          className="br-label underline underline-offset-4 transition-colors duration-200 hover:text-[var(--br-pink)]"
          style={{ color: "var(--br-mute)" }}
        >
          {busy ? "Removing…" : "Remove"}
        </button>
      </div>
    </div>
  );
}

function AddressForm({
  initial,
  busy,
  error,
  onCancel,
  onSubmit,
}: {
  initial?: CustomerAddress;
  busy: boolean;
  error: string | null;
  onCancel: () => void;
  onSubmit: (values: typeof emptyForm) => void;
}) {
  const [values, setValues] = useState({
    ...emptyForm,
    ...Object.fromEntries(
      Object.keys(emptyForm).map((k) => [k, (initial as Record<string, unknown>)?.[k] ?? ""]),
    ),
    country: initial?.country || DEFAULT_COUNTRY,
  } as typeof emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => setValues((s) => ({ ...s, [k]: v }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [i.path[0], i.message])));
      return;
    }
    setErrors({});
    onSubmit(values);
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className="quiet-frame border p-6 sm:col-span-2"
      style={{ borderRadius: "var(--radius)" }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        {(
          [
            ["first_name", "First name", "given-name"],
            ["last_name", "Last name", "family-name"],
          ] as const
        ).map(([key, label, ac]) => (
          <label key={key} className="block">
            <FieldLabel>{label}</FieldLabel>
            <input
              className="zd-input"
              value={values[key]}
              onChange={(e) => set(key, e.target.value)}
              autoComplete={ac}
            />
            <FieldError message={errors[key]} />
          </label>
        ))}
      </div>

      <label className="mt-5 block">
        <FieldLabel>Address</FieldLabel>
        <input
          className="zd-input"
          value={values.address_line_1}
          onChange={(e) => set("address_line_1", e.target.value)}
          autoComplete="address-line1"
        />
        <FieldError message={errors.address_line_1} />
      </label>

      <label className="mt-5 block">
        <FieldLabel>Apartment, suite (optional)</FieldLabel>
        <input
          className="zd-input"
          value={values.address_line_2}
          onChange={(e) => set("address_line_2", e.target.value)}
          autoComplete="address-line2"
        />
      </label>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <label className="block">
          <FieldLabel>Postal code</FieldLabel>
          <input
            className="zd-input"
            value={values.postal_code}
            onChange={(e) => set("postal_code", e.target.value)}
            autoComplete="postal-code"
          />
          <FieldError message={errors.postal_code} />
        </label>
        <label className="block">
          <FieldLabel>City</FieldLabel>
          <input
            className="zd-input"
            value={values.city}
            onChange={(e) => set("city", e.target.value)}
            autoComplete="address-level2"
          />
          <FieldError message={errors.city} />
        </label>
      </div>

      <label className="mt-5 block">
        <FieldLabel>Country</FieldLabel>
        <select
          className="zd-input"
          value={values.country}
          onChange={(e) => set("country", e.target.value)}
          autoComplete="country"
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <FormError message={error} />

      <div className="mt-8 flex flex-wrap gap-4">
        <button type="submit" disabled={busy} className="neon-btn">
          {busy ? "Saving…" : "Save address"}
        </button>
        <button type="button" onClick={onCancel} className="neon-btn neon-btn-quiet">
          Cancel
        </button>
      </div>
    </form>
  );
}
