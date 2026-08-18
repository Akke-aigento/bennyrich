import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useCart } from "@/lib/cart-context";
import {
  checkoutSetAddress,
  checkoutSetCustomer,
  checkoutStart,
} from "@/lib/checkout";
import {
  EmptyCartRedirect,
  FieldError,
  FormField,
  PrimaryButton,
} from "@/components/site/CheckoutForm";

export const Route = createFileRoute("/checkout/")({
  head: () => ({
    meta: [
      { title: "Checkout · Details — Zona Dorata" },
      { name: "robots", content: "noindex" },
    ],
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
  country: "BE",
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
          <input className="zd-input" value={contact.first_name} onChange={(e) => setC("first_name", e.target.value)} autoComplete="given-name" />
          <FieldError message={errors.first_name} />
        </FormField>
        <FormField label="Last name" required>
          <input className="zd-input" value={contact.last_name} onChange={(e) => setC("last_name", e.target.value)} autoComplete="family-name" />
          <FieldError message={errors.last_name} />
        </FormField>
        <FormField label="Email" required className="sm:col-span-2">
          <input type="email" className="zd-input" value={contact.email} onChange={(e) => setC("email", e.target.value)} autoComplete="email" />
          <FieldError message={errors.email} />
        </FormField>
        <FormField label="Phone (optional)" className="sm:col-span-2">
          <input className="zd-input" value={contact.phone} onChange={(e) => setC("phone", e.target.value)} autoComplete="tel" />
        </FormField>
        <label className="sm:col-span-2 flex items-start gap-3 text-[0.85rem]" style={{ color: "var(--ink)" }}>
          <input
            type="checkbox"
            checked={contact.accepts_marketing}
            onChange={(e) => setC("accepts_marketing", e.target.checked)}
            className="mt-1"
          />
          Email me about new drops and stories from Zona Dorata.
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
          <h2 className="mt-10 text-[1.4rem]" style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}>
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
        <input className="zd-input" value={values.address_line_1} onChange={(e) => upd("address_line_1", e.target.value)} autoComplete="address-line1" />
        <FieldError message={errors[`${prefix}_address_line_1`]} />
      </FormField>
      <FormField label="Apartment, suite (optional)" className="sm:col-span-2">
        <input className="zd-input" value={values.address_line_2} onChange={(e) => upd("address_line_2", e.target.value)} autoComplete="address-line2" />
      </FormField>
      <FormField label="Postal code" required>
        <input className="zd-input" value={values.postal_code} onChange={(e) => upd("postal_code", e.target.value)} autoComplete="postal-code" />
        <FieldError message={errors[`${prefix}_postal_code`]} />
      </FormField>
      <FormField label="City" required>
        <input className="zd-input" value={values.city} onChange={(e) => upd("city", e.target.value)} autoComplete="address-level2" />
        <FieldError message={errors[`${prefix}_city`]} />
      </FormField>
      <FormField label="Country" required className="sm:col-span-2">
        <select
          className="zd-input"
          value={values.country}
          onChange={(e) => upd("country", e.target.value)}
          autoComplete="country"
        >
          <option value="BE">Belgium</option>
          <option value="NL">Netherlands</option>
          <option value="LU">Luxembourg</option>
          <option value="FR">France</option>
          <option value="DE">Germany</option>
          <option value="IT">Italy</option>
          <option value="ES">Spain</option>
          <option value="AT">Austria</option>
          <option value="PT">Portugal</option>
          <option value="IE">Ireland</option>
          <option value="DK">Denmark</option>
          <option value="SE">Sweden</option>
          <option value="FI">Finland</option>
          <option value="GB">United Kingdom</option>
        </select>
        <FieldError message={errors[`${prefix}_country`]} />
      </FormField>
    </div>
  );
}