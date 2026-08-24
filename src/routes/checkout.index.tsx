import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { COUNTRIES, DEFAULT_COUNTRY } from "@/lib/countries";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth";
import { sellqoFetch } from "@/lib/sellqo";
import { unwrapAddresses, isDefaultAddress } from "@/lib/account";
import { checkoutSetAddress, checkoutSetCustomer, checkoutStart } from "@/lib/checkout";
import {
  EmptyCartRedirect,
  FieldError,
  FormField,
  PrimaryButton,
} from "@/components/site/CheckoutForm";

export const Route = createFileRoute("/checkout/")({
  head: () => ({
    meta: [{ title: "Checkout · Details — BennyRich" }, { name: "robots", content: "noindex" }],
  }),
  component: DetailsStep,
});

const contactSchema = z.object({
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  first_name: z.string().min(1, "First name required"),
  last_name: z.string().min(1, "Last name required"),
  accepts_marketing: z.boolean().optional(),
});

const addressSchema = z.object({
  address_line_1: z.string().min(1, "Required"),
  address_line_2: z.string().optional(),
  postal_code: z.string().min(1, "Required"),
  city: z.string().min(1, "Required"),
  country: z.string().min(2, "Required"),
});

const emptyAddress = {
  address_line_1: "",
  address_line_2: "",
  postal_code: "",
  city: "",
  country: DEFAULT_COUNTRY,
};

function DetailsStep() {
  const navigate = useNavigate();
  const { count, hydrated } = useCart();

  const [contact, setContact] = useState({
    email: "",
    phone: "",
    first_name: "",
    last_name: "",
    accepts_marketing: false,
  });
  const [shipping, setShipping] = useState({ ...emptyAddress });
  const [billing, setBilling] = useState({ ...emptyAddress });
  const [billingSame, setBillingSame] = useState(true);

  // --- Prefill for signed-in shoppers -------------------------------------
  // Initial values ONLY. No checkout logic, no totals, nothing in checkout.ts
  // or CheckoutForm.tsx is touched, and for a guest this whole block is inert.
  const { customer, status } = useAuth();
  const { data: addressData } = useQuery({
    queryKey: ["customer", "addresses", customer?.id ?? "none"],
    queryFn: () => sellqoFetch("/account/addresses"),
    enabled: status === "authed",
    staleTime: 60_000,
  });
  // Two flags, not one: the profile is available as soon as auth resolves, but
  // the addresses arrive on their own schedule. A single flag would mark the
  // job done on the first pass and the shipping fields would never fill.
  const contactPrefilled = useRef(false);
  const shippingPrefilled = useRef(false);

  useEffect(() => {
    if (status !== "authed" || !customer) return;

    // Fill only what is still empty, so anything already typed survives, and
    // only what the profile actually has, so partial data does not blank
    // fields out.
    const fill = <T extends Record<string, unknown>>(current: T, incoming: Partial<T>): T => {
      const next = { ...current };
      for (const [key, value] of Object.entries(incoming)) {
        if (value == null || value === "") continue;
        if ((next as Record<string, unknown>)[key]) continue;
        (next as Record<string, unknown>)[key] = value;
      }
      return next;
    };

    if (!contactPrefilled.current) {
      contactPrefilled.current = true;
      setContact((c) =>
        fill(c, {
          email: customer.email,
          first_name: customer.first_name ?? "",
          last_name: customer.last_name ?? "",
          phone: customer.phone ?? "",
        }),
      );
    }

    const addresses = unwrapAddresses(addressData);
    const preferred = addresses.find(isDefaultAddress) ?? addresses[0];
    if (preferred && !shippingPrefilled.current) {
      shippingPrefilled.current = true;
      setShipping((a) =>
        fill(a, {
          address_line_1: preferred.address_line_1 ?? "",
          address_line_2: preferred.address_line_2 ?? "",
          postal_code: preferred.postal_code ?? "",
          city: preferred.city ?? "",
          country: preferred.country ?? "",
        }),
      );
    }
  }, [status, customer, addressData]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [serverErr, setServerErr] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated && count > 0) checkoutStart().catch(() => {});
  }, [hydrated, count]);

  if (!hydrated || count === 0) return <EmptyCartRedirect />;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const c = contactSchema.safeParse(contact);
    const s = addressSchema.safeParse(shipping);
    const b = billingSame ? null : addressSchema.safeParse(billing);
    const errs: Record<string, string> = {};
    if (!c.success) for (const i of c.error.issues) errs[i.path[0] as string] = i.message;
    if (!s.success) for (const i of s.error.issues) errs[`s_${i.path[0] as string}`] = i.message;
    if (b && !b.success)
      for (const i of b.error.issues) errs[`b_${i.path[0] as string}`] = i.message;
    if (Object.keys(errs).length) return setErrors(errs);
    setErrors({});
    setBusy(true);
    setServerErr(null);
    try {
      await checkoutSetCustomer(c.data!);
      const shippingPayload = {
        first_name: contact.first_name,
        last_name: contact.last_name,
        ...s.data!,
      };
      const billingPayload = billingSame
        ? undefined
        : { first_name: contact.first_name, last_name: contact.last_name, ...(b as any).data };
      await checkoutSetAddress({
        shipping_address: shippingPayload,
        billing_address: billingPayload,
        billing_same_as_shipping: billingSame,
      });
      navigate({ to: "/checkout/payment" });
    } catch (err: any) {
      setServerErr(err?.message ?? "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  const setC = (k: keyof typeof contact, v: any) => setContact((p) => ({ ...p, [k]: v }));

  return (
    <form onSubmit={onSubmit} noValidate>
      <h2
        className="text-[1.4rem]"
        style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
      >
        Contact
      </h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <FormField label="First name" required>
          <input
            className="zd-input"
            value={contact.first_name}
            onChange={(e) => setC("first_name", e.target.value)}
            autoComplete="given-name"
          />
          <FieldError message={errors.first_name} />
        </FormField>
        <FormField label="Last name" required>
          <input
            className="zd-input"
            value={contact.last_name}
            onChange={(e) => setC("last_name", e.target.value)}
            autoComplete="family-name"
          />
          <FieldError message={errors.last_name} />
        </FormField>
        <FormField label="Email" required className="sm:col-span-2">
          <input
            type="email"
            className="zd-input"
            value={contact.email}
            onChange={(e) => setC("email", e.target.value)}
            autoComplete="email"
          />
          <FieldError message={errors.email} />
        </FormField>
        <FormField label="Phone (optional)" className="sm:col-span-2">
          <input
            className="zd-input"
            value={contact.phone}
            onChange={(e) => setC("phone", e.target.value)}
            autoComplete="tel"
          />
        </FormField>
        <label
          className="sm:col-span-2 flex items-start gap-3 text-[0.85rem]"
          style={{ color: "var(--ink)" }}
        >
          <input
            type="checkbox"
            checked={contact.accepts_marketing}
            onChange={(e) => setC("accepts_marketing", e.target.checked)}
            className="mt-1"
          />
          Email me about new drops and stories from BennyRich.
        </label>
      </div>

      <h2
        className="mt-10 text-[1.4rem]"
        style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
      >
        Shipping address
      </h2>
      <AddressFields values={shipping} onChange={setShipping} prefix="s" errors={errors} />

      <label className="mt-6 flex items-start gap-3 text-[0.85rem]" style={{ color: "var(--ink)" }}>
        <input
          type="checkbox"
          checked={billingSame}
          onChange={(e) => setBillingSame(e.target.checked)}
          className="mt-1"
        />
        Billing address is the same as shipping.
      </label>

      {!billingSame && (
        <>
          <h2
            className="mt-10 text-[1.4rem]"
            style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
          >
            Billing address
          </h2>
          <AddressFields values={billing} onChange={setBilling} prefix="b" errors={errors} />
        </>
      )}

      {serverErr && (
        <p className="mt-4 text-[0.85rem]" style={{ color: "var(--destructive)" }}>
          {serverErr}
        </p>
      )}
      <PrimaryButton disabled={busy}>{busy ? "Saving…" : "Continue to Payment"}</PrimaryButton>
    </form>
  );
}

function AddressFields({
  values,
  onChange,
  prefix,
  errors,
}: {
  values: typeof emptyAddress;
  onChange: (v: typeof emptyAddress) => void;
  prefix: "s" | "b";
  errors: Record<string, string>;
}) {
  const upd = (k: keyof typeof emptyAddress, v: string) => onChange({ ...values, [k]: v });
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      <FormField label="Address" required className="sm:col-span-2">
        <input
          className="zd-input"
          value={values.address_line_1}
          onChange={(e) => upd("address_line_1", e.target.value)}
          autoComplete="address-line1"
        />
        <FieldError message={errors[`${prefix}_address_line_1`]} />
      </FormField>
      <FormField label="Apartment, suite (optional)" className="sm:col-span-2">
        <input
          className="zd-input"
          value={values.address_line_2}
          onChange={(e) => upd("address_line_2", e.target.value)}
          autoComplete="address-line2"
        />
      </FormField>
      <FormField label="Postal code" required>
        <input
          className="zd-input"
          value={values.postal_code}
          onChange={(e) => upd("postal_code", e.target.value)}
          autoComplete="postal-code"
        />
        <FieldError message={errors[`${prefix}_postal_code`]} />
      </FormField>
      <FormField label="City" required>
        <input
          className="zd-input"
          value={values.city}
          onChange={(e) => upd("city", e.target.value)}
          autoComplete="address-level2"
        />
        <FieldError message={errors[`${prefix}_city`]} />
      </FormField>
      <FormField label="Country" required className="sm:col-span-2">
        <select
          className="zd-input"
          value={values.country}
          onChange={(e) => upd("country", e.target.value)}
          autoComplete="country"
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
        <FieldError message={errors[`${prefix}_country`]} />
      </FormField>
    </div>
  );
}
