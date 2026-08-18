import { useEffect, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useCart } from "@/lib/cart-context";

export function FormField({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={"block " + (className ?? "")}>
      <span
        className="ui-label text-[0.65rem] block mb-1.5"
        style={{ color: "var(--muted-tone)" }}
      >
        {label}
        {required && <span style={{ color: "var(--destructive)" }}> *</span>}
      </span>
      {children}
    </label>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1 text-[0.75rem]" style={{ color: "var(--destructive)" }}>
      {message}
    </p>
  );
}

export function PrimaryButton({
  children,
  disabled,
  type = "submit",
}: {
  children: ReactNode;
  disabled?: boolean;
  type?: "submit" | "button";
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className="mt-8 ui-label w-full py-4 text-[0.8rem] transition-opacity disabled:opacity-50"
      style={{ background: "var(--ink)", color: "var(--paper)" }}
    >
      {children}
    </button>
  );
}

export function EmptyCartRedirect() {
  const navigate = useNavigate();
  const { hydrated, count } = useCart();
  useEffect(() => {
    if (!hydrated || count > 0) return;
    const t = setTimeout(() => navigate({ to: "/perfumes" }), 1500);
    return () => clearTimeout(t);
  }, [navigate, hydrated, count]);
  if (!hydrated) {
    return (
      <div className="py-16 text-center">
        <p className="text-[0.9rem]" style={{ color: "var(--muted-tone)" }}>
          Loading your bag…
        </p>
      </div>
    );
  }
  return (
    <div className="py-16 text-center">
      <p
        className="text-[1.25rem]"
        style={{ fontFamily: "var(--font-display)", color: "var(--ink)" }}
      >
        Your bag is empty
      </p>
      <p className="mt-2 text-[0.9rem]" style={{ color: "var(--muted-tone)" }}>
        Redirecting you to the collection…
      </p>
      <Link
        to="/perfumes"
        className="mt-6 inline-block ui-label text-[0.7rem] px-6 py-3"
        style={{ border: "1px solid var(--ink)", color: "var(--ink)" }}
      >
        Shop Perfumes
      </Link>
    </div>
  );
}